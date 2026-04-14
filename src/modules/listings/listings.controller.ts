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
    UseInterceptors,
    Patch,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';

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
    findAll(@Query() query: QueryListingDto) {
        return this.listingsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.listingsService.findOne(id);
    }

    // PROTECTED
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Req() req, @Body() dto: CreateListingDto) {
        return this.listingsService.create(req.user.userId, dto)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id') id: string,
        @Req() req,
        @Body() dto: UpdateListingDto,
    ) {
        return this.listingsService.update(id, dto, req.user.userId)
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
        @Req() req: any
    ) {
        return this.listingsService.uploadImages(listingId, files, req.user.userId)
    }

}
