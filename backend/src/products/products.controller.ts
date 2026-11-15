import {
  Controller, Get, Post, Put, Delete, Param, Body,
  UseGuards, ParseIntPipe, ValidationPipe, Query,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto, UpdateProductDto, CreateVariantDto } from './dto/product.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../common/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('status') status?: string) {
    return this.productsService.findAll(categoryId ? parseInt(categoryId) : undefined, status);
  }

  @Get('low-stock')
  getLowStock() {
    return this.productsService.getLowStock();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body(ValidationPipe) dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/variants')
  addVariant(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: CreateVariantDto) {
    return this.productsService.addVariant(id, dto);
  }
}
