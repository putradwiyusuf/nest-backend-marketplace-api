import { Prisma } from '@prisma/client'
import { DEFAULT_IMAGE } from 'src/common/constants/app.constant'
import { ListingDetailResponseDto } from 'src/modules/listings/dto/responses/listing-detail.response'
import { ListingItemResponseDto } from 'src/modules/listings/dto/responses/listing-item.response'

type ListingWithRelations = Prisma.ListingGetPayload<{
    include: {
        images: true
        location: true
        category: true
    }
}>

type ListingDetail = Prisma.ListingGetPayload<{
    include: {
        images: true
        user: true
        location: true
        category: true
    }
}>

export function mapListing(item: ListingWithRelations): ListingItemResponseDto {
    const primary = item.images.find((img) => img.isPrimary)

    return {
        id: item.id,
        title: item.title,
        price: item.price,
        thumbnail: primary?.url || DEFAULT_IMAGE,

        category: item.category
            ? {
                id: item.category.id,
                name: item.category.name,
            }
            : null,

        location: item.location
            ? {
                city: item.location.city,
                province: item.location.province,
            }
            : null,

        viewsCount: item.viewsCount,
        createdAt: item.createdAt,
    }
}

export function mapListingDetail(listing: ListingDetail): ListingDetailResponseDto {
    return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,

        thumbnail: listing.images[0]?.url || DEFAULT_IMAGE,
        gallery: listing.images.map((img) => img.url),

        category: listing.category
            ? {
                id: listing.category.id,
                name: listing.category.name,
            }
            : null,

        location: listing.location
            ? {
                province: listing.location.province,
                city: listing.location.city,
                district: listing.location.district,
            }
            : null,

        user: {
            id: listing.user.id,
            name: listing.user.name,
            phone: listing.user.isShownPhone
                ? listing.user.phone
                : null,
        },

        viewsCount: listing.viewsCount,
        createdAt: listing.createdAt,
    }
}