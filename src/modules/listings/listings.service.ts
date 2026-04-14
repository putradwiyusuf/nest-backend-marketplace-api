/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageService } from './image/image.service';
import { QueryListingDto } from './dto/query-listing.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Prisma } from '@prisma/client';
import { checkListingOwnership } from 'src/common/helpers/ownership.helper'
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common'


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
        const listing = await this.prisma.listing.create({
            data: {
                title: dto.title,
                description: dto.description,
                price: dto.price,
                categoryId: dto.categoryId,
                locationId: dto.locationId,
                userId,
            },
        })

        return listing
    }

    async findAll(query: QueryListingDto) {
        const page = query.page || 1
        const limit = query.limit || 10
        const skip = (page - 1) * limit

        const where: Prisma.ListingWhereInput = {
            deletedAt: null,
        }

        // 🔍 SEARCH
        if (query.search) {
            where.OR = [
                {
                    title: {
                        contains: query.search,
                        mode: Prisma.QueryMode.insensitive,
                    },
                },
                {
                    description: {
                        contains: query.search,
                        mode: Prisma.QueryMode.insensitive,
                    },
                },
            ]
        }

        // 🏷️ CATEGORY
        if (query.categoryId) {
            where.categoryId = query.categoryId
        }

        // 💰 PRICE
        if (query.minPrice || query.maxPrice) {
            where.price = {}
            if (query.minPrice) {
                where.price.gte = query.minPrice
            }
            if (query.maxPrice) {
                where.price.lte = query.maxPrice
            }
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
                thumbnail: primary?.url || '/uploads/default.webp',
                location: item.location
                    ? `${item.location.city}, ${item.location.province}`
                    : null,
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
        const existing = await this.prisma.listing.findUnique({
            where: { id },
        })

        if (!existing || existing.deletedAt) {
            throw new NotFoundException('Listing not found')
        }

        const listing = await this.prisma.listing.update({
            where: { id },
            data: {
                viewsCount: { increment: 1 },
            },
            include: {
                images: {
                    orderBy: { isPrimary: 'desc' },
                },
                user: true,
                location: true,
                category: true,
            },
        })


        if (!listing || listing.deletedAt) {
            throw new NotFoundException('Listing not found')
        }

        const primary = listing.images[0]


        return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: listing.price,

            thumbnail: primary?.url || '/uploads/default.webp',
            gallery: listing.images.map((img) => img.url),

            user: {
                id: listing.user.id,
                name: listing.user.name,
                phone: listing.user.isShownPhone
                    ? listing.user.phone
                    : null,
            },
            location: listing.location
                ? `${listing.location.city}, ${listing.location.province}`
                : null,
            category: listing.category?.name || null,

            viewsCount: listing.viewsCount,
            createdAt: listing.createdAt,
        }
    }

    // UPDATE
    async update(id: string, dto: UpdateListingDto, userId: string) {
        await checkListingOwnership(this.prisma, id, userId)

        return this.prisma.listing.update({
            where: { id },
            data: dto,
        })
    }

    // DELETE (soft delete)
    async remove(id: string, userId: string) {
        await checkListingOwnership(this.prisma, id, userId)

        await this.prisma.listing.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        })

        return { message: 'Listing deleted' }
    }
}