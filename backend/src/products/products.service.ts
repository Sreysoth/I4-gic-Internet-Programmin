import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto, UpdateProductDto, CreateVariantDto } from './dto/product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: number, status?: string) {
    return this.prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        variants: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        variants: {
          include: { stockMovements: { take: 10, orderBy: { createdAt: 'desc' } } },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
      include: { category: true, supplier: true, variants: true },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true, supplier: true, variants: true },
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.delete({ where: { id } });
  }

  async addVariant(productId: number, dto: CreateVariantDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    const existing = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
    if (existing) throw new ConflictException('SKU already exists');
    return this.prisma.productVariant.create({ data: { ...dto, productId } });
  }

  async getLowStock() {
    // Find variants where quantity <= minimumStock using raw SQL approach
    return this.prisma.$queryRaw`
      SELECT pv.*, p.name as product_name, p.brand
      FROM "ProductVariant" pv
      JOIN "Product" p ON pv."productId" = p.id
      WHERE pv.quantity <= pv."minimumStock"
      ORDER BY pv.quantity ASC
    `;
  }
}
