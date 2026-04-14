import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageService } from './image/image.service';

@Injectable()
export class ListingsService {
    constructor(
        private prisma: PrismaService,
        private imageService: ImageService
    ) { }

    async uploadImages(listingId: string, files: Express.Multer.File[], userId: string) {
        return this.imageService.uploadImages(listingId, files, userId)
    }
    // CREATE LISTING
    async create(userId: string, dto: any) {
        return this.prisma.listing.create({
            data: {
                title: dto.title,
                description: dto.description,
                price: dto.price,
                categoryId: dto.categoryId,
                locationId: dto.locationId,
                userId,
            },
        });
    }

    // GET ALL LISTINGS 
    async findAll(query: any) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.listing.findMany({
                where: {
                    deletedAt: null,
                },
                include: {
                    images: true,
                    category: true,
                    location: true,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.listing.count({
                where: {
                    deletedAt: null,
                },
            }),
        ])

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    // GET MY LISTINGS
    async findMyListings(userId: string, query: any) {
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const skip = (page - 1) * limit

        const [data, total] = await Promise.all([
            this.prisma.listing.findMany({
                where: {
                    userId,
                    deletedAt: null,
                },
                include: {
                    images: true,
                    category: true,
                    location: true,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.listing.count({
                where: {
                    userId,
                    deletedAt: null,
                },
            }),
        ])

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    // DETAIL LISTING
    async findOne(id: string) {
        return this.prisma.listing.findUnique({
            where: { id },
            include: {
                images: true,
                user: true,
                category: true,
                location: true,
            },
        });
    }

    // UPDATE
    async update(id: string, dto: any) {
        return this.prisma.listing.update({
            where: { id },
            data: dto,
        });
    }

    // DELETE (soft delete)
    async remove(id: string) {
        return this.prisma.listing.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }
}
