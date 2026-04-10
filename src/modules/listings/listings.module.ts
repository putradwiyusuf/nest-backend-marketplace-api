import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ImageModule } from './image/image.module';

@Module({
    imports: [ImageModule, PrismaModule],
    controllers: [ListingsController],
    providers: [ListingsService],
})
export class ListingsModule { }
