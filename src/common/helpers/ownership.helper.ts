import {
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

export async function checkListingOwnership(
    prisma: PrismaService,
    listingId: string,
    userId: string,
) {
    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
    })

    if (!listing || listing.deletedAt) {
        throw new NotFoundException('Listing not found')
    }

    if (listing.userId !== userId) {
        throw new ForbiddenException('Access denied')
    }

    return listing
}