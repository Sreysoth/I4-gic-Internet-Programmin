import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, SaleType } from '../../common/enums.js';

export class SaleItemDto {
  @IsInt()
  @IsPositive()
  variantId: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountAmount?: number;
}

export class PaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  changeGiven?: number;
}

export class CreateSaleDto {
  @IsInt()
  @IsPositive()
  shiftId: number;

  @IsEnum(SaleType)
  @IsOptional()
  type?: SaleType;

  @IsInt()
  @IsOptional()
  originalSaleId?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments: PaymentDto[];
}

export class VoidSaleDto {
  @IsString()
  reason: string;

  @IsInt()
  @IsPositive()
  voidedById: number;
}
