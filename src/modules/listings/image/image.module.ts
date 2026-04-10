import { Module } from '@nestjs/common'
import { ImageService } from './image.service'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
    providers: [ImageService, PrismaService],
    exports: [ImageService],
})
export class ImageModule { }