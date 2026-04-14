import {
    Controller,
    Delete,
    Param,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { ImageService } from './image.service'

@Controller('images')
@UseGuards(JwtAuthGuard)
export class ImageController {
    constructor(private imageService: ImageService) { }

    @Delete(':id')
    delete(@Param('id') id: string, @Req() req) {
        return this.imageService.deleteImage(id, req.user.userId)
    }

    @Patch(':id/primary')
    setPrimary(@Param('id') id: string, @Req() req) {
        return this.imageService.setPrimary(id, req.user.userId)
    }
}