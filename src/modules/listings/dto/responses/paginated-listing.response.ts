import { ListingItemResponseDto } from './listing-item.response'

export class PaginatedListingResponseDto {
    data: ListingItemResponseDto[]

    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}