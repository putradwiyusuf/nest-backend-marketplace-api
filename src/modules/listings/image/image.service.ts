/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import * as fs from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { Prisma } from '@prisma/client'
import { checkListingAccess } from 'src/common/helpers/ownership.helper'
import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common'

@Injectable()
export class ImageService {
    constructor(private prisma: PrismaService) { }

    async uploadImages(
        listingId: string,
        files: Express.Multer.File[],
        user: any,
    ) {
        if (files.length === 0) {
            throw new BadRequestException('No files uploaded')
        }

        await checkListingAccess(this.prisma, listingId, user)

        const count = await this.prisma.image.count({
            where: { listingId },
        })

        if (count + files.length > 10) {
            throw new BadRequestException('Max 10 images per listing')
        }

        const hasPrimary = await this.prisma.image.findFirst({
            where: { listingId, isPrimary: true },
        })

        const imageData: Prisma.ImageCreateManyInput[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (!file.mimetype.startsWith('image/')) {
                throw new BadRequestException('Invalid file type')
            }
            const filename = `${randomUUID()}.webp`
            const filepath = join(process.cwd(), 'uploads', filename)

            await sharp(file.buffer)
                .resize({ width: 1280 })
                .webp({ quality: 75 })
                .toFile(filepath)

            imageData.push({
                url: `/uploads/${filename}`,
                listingId,
                isPrimary: !hasPrimary && i === 0,
            })
        }

        await this.prisma.image.createMany({ data: imageData })

        const images = await this.prisma.image.findMany({
            where: { listingId },
            orderBy: { isPrimary: 'desc' },
        })

        return images.map((img) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.isPrimary,
        }))
    }

    async deleteImage(imageId: string, user: any) {
        return this.prisma.$transaction(async (tx) => {
            const image = await tx.image.findUnique({
                where: { id: imageId },
                include: { listing: true },
            })

            if (!image) {
                throw new NotFoundException('Image not found')
            }

            await checkListingAccess(this.prisma, image.listingId, user)

            // hapus file
            const filename = image.url.split('/').pop()
            if (filename) {
                const filepath = join(process.cwd(), 'uploads', filename)
                await fs.unlink(filepath).catch(() => { })
            }

            // hapus dari DB
            const deleted = await tx.image.delete({
                where: { id: imageId },
            })

            // 🔥 kalau dia primary → assign baru
            const remaining = await this.prisma.image.findMany({
                where: { listingId: image.listing.id },
            })

            if (remaining.length > 0 && !remaining.some(i => i.isPrimary)) {
                await this.prisma.image.update({
                    where: { id: remaining[0].id },
                    data: { isPrimary: true },
                })
            }

            return { message: 'Image deleted' }
        })
    }

    async setPrimary(imageId: string, user: any) {
        const image = await this.prisma.image.findUnique({
            where: { id: imageId },
            include: { listing: true },
        })

        if (!image) {
            throw new NotFoundException('Image not found')
        }

        const listingId = image.listingId

        await checkListingAccess(this.prisma, listingId, user)

        await this.prisma.image.updateMany({
            where: { listingId },
            data: { isPrimary: false },
        })

        const updatePrimary = this.prisma.image.update({
            where: { id: imageId },
            data: { isPrimary: true },
        })

        return updatePrimary

    }
}