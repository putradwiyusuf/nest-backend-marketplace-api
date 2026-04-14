import {
    Controller,
    Delete,
    Param,
    Patch,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { ImageService } from './image.service'
import { FilesInterceptor } from '@nestjs/platform-express'

@Controller('images')
@UseInterceptors(
    FilesInterceptor('images', 10, {
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
)
@UseGuards(JwtAuthGuard)
export class ImageController {
    constructor(private imageService: ImageService) { }

    @Delete(':id')
    delete(@Param('id') id: string, @Req() req) {
        return this.imageService.deleteImage(id, req.user)
    }

    @Patch(':id/primary')
    setPrimary(@Param('id') id: string, @Req() req) {
        return this.imageService.setPrimary(id, req.user)
    }
}