/* eslint-disable prettier/prettier */
import { IsString, IsNumber, IsOptional } from 'class-validator'

export class CreateListingDto {
  @IsString()
  title!: string

  @IsString()
  description!: string

  @IsNumber()
  price!: number

  @IsString()
  categoryId!: string

  @IsOptional()
  locationId?: string
}