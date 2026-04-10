import { IsOptional, IsString } from 'class-validator';

export class QueryListingDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  categoryId?: string;

  @IsOptional()
  minPrice?: number;

  @IsOptional()
  maxPrice?: number;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
