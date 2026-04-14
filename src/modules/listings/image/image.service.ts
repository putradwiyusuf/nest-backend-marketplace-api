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
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common'

@Injectable()
export class ImageService {
    constructor(private prisma: PrismaService) { }

    async validateOwnership(listingId: string, userId: string) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
        })

        if (!listing || listing.userId !== userId) {
            throw new ForbiddenException('Unauthorized')
        }

        return listing
    }

    async uploadImages(
        listingId: string,
        files: Express.Multer.File[],
        userId: string,
    ) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
        })

        if (!listing) {
            throw new NotFoundException('Listing not found')
        }

        if (listing.userId !== userId) {
            throw new ForbiddenException('Unauthorized')
        }

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

        return this.prisma.image.findMany({
            where: { listingId },
            orderBy: { isPrimary: 'desc' },
        })
    }

    async deleteImage(imageId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const image = await tx.image.findUnique({
                where: { id: imageId },
                include: { listing: true },
            })

            if (!image) {
                throw new NotFoundException('Image not found')
            }

            if (image.listing.userId !== userId) {
                throw new ForbiddenException('Unauthorized')
            }

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
            if (image.isPrimary) {
                const nextImage = await tx.image.findFirst({
                    where: { listingId: image.listingId },
                    orderBy: { createdAt: 'asc' },
                })

                if (nextImage) {
                    await tx.image.update({
                        where: { id: nextImage.id },
                        data: { isPrimary: true },
                    })
                }
            }

            return { message: 'Image deleted' }
        })
    }

    async setPrimary(imageId: string, userId: string) {
        const image = await this.prisma.image.findUnique({
            where: { id: imageId },
            include: { listing: true },
        })

        if (!image || image.listing.userId !== userId) {
            throw new Error('Unauthorized')
        }

        const listingId = image.listingId

        await this.prisma.image.updateMany({
            where: { listingId },
            data: { isPrimary: false },
        })

        return this.prisma.image.update({
            where: { id: imageId },
            data: { isPrimary: true },
        })
    }
}