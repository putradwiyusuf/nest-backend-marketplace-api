import {
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

export async function checkListingAccess(
    prisma: PrismaService,
    listingId: string,
    user: { userId: string; role: string },
) {
    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
    })

    if (!listing || listing.deletedAt) {
        throw new NotFoundException('Listing not found')
    }

    // 🔥 ADMIN BYPASS
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
        return listing
    }

    if (listing.userId !== user.userId) {
        throw new ForbiddenException('Access denied')
    }

    return listing
}