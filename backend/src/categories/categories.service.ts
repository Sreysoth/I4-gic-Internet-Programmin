import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id }, include: { products: true } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(name: string) {
    const existing = await this.prisma.category.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Category name already exists');
    return this.prisma.category.create({ data: { name } });
  }

  async update(id: number, name: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.update({ where: { id }, data: { name } });
  }

  async remove(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.delete({ where: { id } });
  }
}
