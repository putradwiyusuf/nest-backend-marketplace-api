import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageService } from './image/image.service';
import { QueryListingDto } from './dto/query-listing.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

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
    async create(userId: string, dto: CreateListingDto) {
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
    async findAll(query: QueryListingDto) {
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const skip = (page - 1) * limit

        const where = {
            AND: [
                query.search
                    ? {
                        OR: [
                            { title: { contains: query.search, mode: 'insensitive' } },
                            { description: { contains: query.search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
                query.categoryId ? { categoryId: query.categoryId } : {},
                query.minPrice ? { price: { gte: Number(query.minPrice) } } : {},
                query.maxPrice ? { price: { lte: Number(query.maxPrice) } } : {},
                { deletedAt: null },
            ],
        }

        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                include: {
                    images: true,
                    location: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.listing.count({ where }),
        ])

        const data = listings.map((item) => {
            const primary = item.images.find((img) => img.isPrimary)

            return {
                id: item.id,
                title: item.title,
                price: item.price,
                thumbnail: primary?.url || null,
                location: item.location?.name || null,
                createdAt: item.createdAt,
                viewsCount: item.viewsCount,
            }
        })

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
        const listing = await this.prisma.listing.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                images: true,
                user: true,
                location: true,
                category: true,
            },
        })

        if (!listing) {
            throw new NotFoundException('Listing not found')
        }

        // 🔥 increment view
        await this.prisma.listing.update({
            where: { id },
            data: {
                viewsCount: { increment: 1 },
            },
        })

        const primary = listing.images.find((img) => img.isPrimary)

        return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: listing.price,

            thumbnail: primary?.url || null,
            gallery: listing.images.map((img) => img.url),

            user: {
                id: listing.user.id,
                name: listing.user.name,
                phone: listing.user.isShownPhone
                    ? listing.user.phone
                    : null,
            },

            location: listing.location?.name || null,
            category: listing.category?.name || null,

            viewsCount: listing.viewsCount + 1,
            createdAt: listing.createdAt,
        }
    }

    // UPDATE
    async update(id: string, dto: UpdateListingDto, userId: string) {
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
