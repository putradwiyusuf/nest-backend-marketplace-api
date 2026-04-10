import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  // 🔥 CREATE LISTING
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

  // 🔥 GET ALL LISTINGS (OLX STYLE FILTER)
  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    return this.prisma.listing.findMany({
      where: {
        AND: [
          query.search
            ? {
                title: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              }
            : {},
          query.categoryId ? { categoryId: query.categoryId } : {},
          query.minPrice ? { price: { gte: Number(query.minPrice) } } : {},
          query.maxPrice ? { price: { lte: Number(query.maxPrice) } } : {},
        ],
        deletedAt: null,
      },
      include: {
        images: true,
        user: true,
        category: true,
        location: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 🔥 DETAIL LISTING
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

  // 🔥 UPDATE
  async update(id: string, dto: any) {
    return this.prisma.listing.update({
      where: { id },
      data: dto,
    });
  }

  // 🔥 DELETE (soft delete recommended)
  async remove(id: string) {
    return this.prisma.listing.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
