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

@Injectable()
export class ImageService {
    constructor(private prisma: PrismaService) { }

    async validateOwnership(listingId: string, userId: string) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
        })

        if (!listing || listing.userId !== userId) {
            throw new Error('Unauthorized')
        }

        return listing
    }

    async uploadImages(listingId: string, files: Express.Multer.File[], userId: string) {
        await this.validateOwnership(listingId, userId)

        const existingCount = await this.prisma.image.count({
            where: { listingId },
        })

        if (existingCount + files.length > 10) {
            throw new Error('Max 10 images per listing')
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

        return this.prisma.image.createMany({
            data: imageData,
        })
    }

    async deleteImage(imageId: string, userId: string) {
        const image = await this.prisma.image.findUnique({
            where: { id: imageId },
            include: { listing: true },
        })

        if (!image || image.listing.userId !== userId) {
            throw new Error('Unauthorized')
        }

        // hapus file
        const filename = image.url.split('/').pop()

        if (!filename) {
            throw new Error('Invalid filename')
        }

        const filepath = join(process.cwd(), 'uploads', filename)

        await fs.unlink(filepath).catch(() => { })

        return this.prisma.image.delete({
            where: { id: imageId },
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