import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImageService } from './image/image.service';

@Controller('listings')
export class ListingsController {
    constructor(private listingsService: ListingsService) { }

    @UseGuards(JwtAuthGuard)
    @Get('user/me')
    getMyListings(@Req() req, @Query() query: any) {
        let userId = req.user.userId;

        if (query.userId) {
            userId = query.userId;
        }

        if (userId !== req.user.userId) {
            throw new ForbiddenException('You are not allowed to access this resource');
        }

        return this.listingsService.findMyListings(req.user.userId, query)
    }

    // PUBLIC
    @Get()
    findAll(@Query() query: any) {
        return this.listingsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.listingsService.findOne(id);
    }

    // PROTECTED
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req, @Body() dto: any) {
        return this.listingsService.create(req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id')
    update(@Param('id') id: string, @Body() dto: any) {
        return this.listingsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/delete')
    remove(@Param('id') id: string) {
        return this.listingsService.remove(id);
    }

    // UPLOAD IMAGES
    @UseGuards(JwtAuthGuard)
    @Post(':id/images')
    @UseInterceptors(FilesInterceptor('images', 5))
    uploadImages(
        @Param('id') listingId: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.listingsService.uploadImages(listingId, files)
    }

}
