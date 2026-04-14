export class ListingDetailResponseDto {
    id: string
    title: string
    description: string
    price: number

    thumbnail: string
    gallery: string[]

    category: {
        id: string
        name: string
    } | null

    location: {
        province: string
        city: string
        district?: string | null
    } | null

    user: {
        id: string
        name: string
        phone: string | null
    }

    viewsCount: number
    createdAt: Date
}