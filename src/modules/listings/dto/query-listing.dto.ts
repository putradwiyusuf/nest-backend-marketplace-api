/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer'
import { IsOptional, IsNumber, IsString, IsUUID } from 'class-validator'

export class QueryListingDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsUUID()
  categoryId?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number
}