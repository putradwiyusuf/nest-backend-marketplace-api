export class ListingItemResponseDto {
    id: string
    title: string
    price: number
    thumbnail: string

    category: {
        id: string
        name: string
    } | null

    location: {
        city: string
        province: string
    } | null

    viewsCount: number
    createdAt: Date
}