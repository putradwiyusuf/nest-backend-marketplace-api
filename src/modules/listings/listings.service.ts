/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ImageService } from './image/image.service'
import { QueryListingDto } from './dto/query-listing.dto'
import { CreateListingDto } from './dto/create-listing.dto'
import { UpdateListingDto } from './dto/update-listing.dto'
import { Prisma } from '@prisma/client'
import { checkListingAccess } from 'src/common/helpers/ownership.helper'
import { JwtUser } from 'src/common/types/jwt-user.type'
import { mapListing, mapListingDetail } from 'src/common/mappers/listing.mapper'
import { PaginatedListingResponseDto } from './dto/responses/paginated-listing.response'
import { ListingDetailResponseDto } from './dto/responses/listing-detail.response'

@Injectable()
export class ListingsService {
    constructor(
        private prisma: PrismaService,
        private imageService: ImageService,
    ) { }

    //CREATE
    async create(userId: string, dto: CreateListingDto) {
        return this.prisma.listing.create({
            data: {
                ...dto,
                userId,
            },
        })
    }

    //UPLOAD IMAGE
    async uploadImages(
        listingId: string,
        files: Express.Multer.File[],
        user: JwtUser,
    ) {
        return this.imageService.uploadImages(listingId, files, user)
    }

    //FIND ALL
    async findAll(query: QueryListingDto): Promise<PaginatedListingResponseDto> {
        const {
            page = 1,
            limit = 10,
            search,
            categoryId,
            minPrice,
            maxPrice,
        } = query

        const skip = (page - 1) * limit

        const where: Prisma.ListingWhereInput = {
            deletedAt: null,

            ...(search && {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    },
                ],
            }),

            ...(categoryId && { categoryId }),

            ...(minPrice || maxPrice
                ? {
                    price: {
                        ...(minPrice && { gte: minPrice }),
                        ...(maxPrice && { lte: maxPrice }),
                    },
                }
                : {}),
        }

        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                include: {
                    images: true,
                    location: true,
                    category: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.listing.count({ where }),
        ])

        return {
            data: listings.map((item) => mapListing(item)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    //MY LISTINGS
    async findMyListings(
        userId: string,
        query: QueryListingDto,
    ): Promise<PaginatedListingResponseDto> {
        const { page = 1, limit = 10 } = query
        const skip = (page - 1) * limit

        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where: {
                    userId,
                    deletedAt: null,
                },
                include: {
                    images: true,
                    location: true,
                    category: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.listing.count({
                where: {
                    userId,
                    deletedAt: null,
                },
            }),
        ])

        return {
            data: listings.map((item) => mapListing(item)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    //DETAIL LISTING
    async findOne(id: string): Promise<ListingDetailResponseDto> {

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
                images: { orderBy: { isPrimary: 'desc' } },
                user: true,
                location: true,
                category: true,
            },
        })

        return mapListingDetail(listing)
    }

    //UPDATE
    async update(id: string, dto: UpdateListingDto, user: JwtUser) {
        await checkListingAccess(this.prisma, id, user)

        return this.prisma.listing.update({
            where: { id },
            data: dto,
        })
    }

    //DELETE (SOFT)
    async remove(id: string, user: JwtUser) {
        await checkListingAccess(this.prisma, id, user)

        await this.prisma.listing.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        })

        return { message: 'Listing deleted' }
    }

    //DELETE PERMANENT (ADMIN)
    async forceDelete(id: string) {
        await this.prisma.listing.delete({
            where: { id },
        })

        return {
            message: 'Listing permanently deleted',
        }
    }
}