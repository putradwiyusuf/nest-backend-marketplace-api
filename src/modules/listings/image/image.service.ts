import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

@Injectable()
export class ImageService {
    constructor(private prisma: PrismaService) { }

    async uploadImages(listingId: string, files: Express.Multer.File[]) {
        const imageUrls: string[] = []

        for (const file of files) {
            const filename = randomUUID() + '-' + file.originalname
            const filepath = join(process.cwd(), 'uploads', filename)

            writeFileSync(filepath, file.buffer)

            imageUrls.push(`/uploads/${filename}`)
        }

        const data = imageUrls.map((url) => ({
            url,
            listingId,
        }))

        return this.prisma.image.createMany({
            data,
        })
    }
}