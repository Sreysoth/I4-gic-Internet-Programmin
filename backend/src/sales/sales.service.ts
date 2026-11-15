import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSaleDto, VoidSaleDto } from './dto/sale.dto.js';
import { SaleStatus, StockMovementType } from '../common/enums.js';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  private generateReceiptNo(): string {
    const now = new Date();
    return `REC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
  }

  async findAll(cashierId?: number, fromDate?: string, toDate?: string) {
    return this.prisma.sale.findMany({
      where: {
        ...(cashierId ? { cashierId } : {}),
        ...(fromDate || toDate ? {
          createdAt: {
            ...(fromDate ? { gte: new Date(fromDate) } : {}),
            ...(toDate ? { lte: new Date(toDate) } : {}),
          },
        } : {}),
      },
      include: {
        cashier: { select: { id: true, fullName: true } },
        items: { include: { variant: { include: { product: true } } } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        cashier: { select: { id: true, fullName: true } },
        shift: true,
        items: { include: { variant: { include: { product: true } } } },
        payments: true,
      },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async create(dto: CreateSaleDto, cashierId: number) {
    // Validate variants and stock
    for (const item of dto.items) {
      const variant = await this.prisma.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);
      if (variant.quantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for variant ${item.variantId}`);
      }
    }

    const subtotal = dto.items.reduce((sum, item) => {
      const lineTotal = item.unitPrice * item.quantity - (item.discountAmount ?? 0);
      return sum + lineTotal;
    }, 0);
    const total = subtotal - (dto.discount ?? 0);

    return this.prisma.$transaction(async (tx: typeof this.prisma) => {
      const sale = await tx.sale.create({
        data: {
          receiptNo: this.generateReceiptNo(),
          cashierId,
          shiftId: dto.shiftId,
          type: dto.type ?? 'SALE',
          originalSaleId: dto.originalSaleId,
          subtotal,
          discount: dto.discount ?? 0,
          total,
          items: {
            create: dto.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: item.discountAmount ?? 0,
              lineTotal: item.unitPrice * item.quantity - (item.discountAmount ?? 0),
            })),
          },
          payments: {
            create: dto.payments.map((p) => ({
              method: p.method,
              amount: p.amount,
              changeGiven: p.changeGiven ?? 0,
            })),
          },
        },
        include: { items: true, payments: true },
      });

      // Update stock and log movements
      for (const item of dto.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { decrement: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId: cashierId,
            saleId: sale.id,
            type: StockMovementType.SALE,
            quantity: -item.quantity,
          },
        });
      }

      return sale;
    });
  }

  async void(id: number, dto: VoidSaleDto) {
    const sale = await this.prisma.sale.findUnique({ where: { id }, include: { items: true } });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.status === SaleStatus.VOIDED) throw new BadRequestException('Sale already voided');

    return this.prisma.$transaction(async (tx: typeof this.prisma) => {
      const voided = await tx.sale.update({
        where: { id },
        data: { status: SaleStatus.VOIDED, voidReason: dto.reason, voidedById: dto.voidedById },
      });

      // Restore stock
      for (const item of sale.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId: dto.voidedById,
            saleId: id,
            type: StockMovementType.RETURN,
            quantity: item.quantity,
            reason: `Void: ${dto.reason}`,
          },
        });
      }
      return voided;
    });
  }

  async getDailySummary(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const sales = await this.prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end }, status: SaleStatus.COMPLETED },
      include: { payments: true },
    });

    const totalRevenue = sales.reduce((s: number, sale: any) => s + Number(sale.total), 0);
    const byMethod: Record<string, number> = {};
    (sales as any[]).forEach((sale: any) => {
      (sale.payments as any[]).forEach((p: any) => {
        byMethod[p.method] = (byMethod[p.method] ?? 0) + Number(p.amount);
      });
    });
    return { date: start.toISOString().split('T')[0], totalSales: sales.length, totalRevenue, byPaymentMethod: byMethod };
  }
}
