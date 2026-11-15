import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsPositive, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../../common/enums.js';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  season?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoryId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  supplierId?: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  season?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  supplierId?: number;
}

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minimumStock?: number;
}
