import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

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
}
