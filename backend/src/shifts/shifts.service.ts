import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ShiftStatus } from '../common/enums.js';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async findAll(cashierId?: number) {
    return this.prisma.shift.findMany({
      where: cashierId ? { cashierId } : {},
      include: {
        cashier: { select: { id: true, fullName: true } },
        _count: { select: { sales: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        cashier: { select: { id: true, fullName: true } },
        sales: { include: { items: true, payments: true } },
      },
    });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async open(cashierId: number, openingCash: number) {
    const existing = await this.prisma.shift.findFirst({
      where: { cashierId, status: ShiftStatus.OPEN },
    });
    if (existing) throw new BadRequestException('You already have an open shift');
    return this.prisma.shift.create({ data: { cashierId, openingCash } });
  }

  async close(id: number, closingCash: number) {
    const shift = await this.prisma.shift.findUnique({ where: { id }, include: { sales: { include: { payments: true } } } });
    if (!shift) throw new NotFoundException('Shift not found');
    if (shift.status === ShiftStatus.CLOSED) throw new BadRequestException('Shift already closed');

    const cashSales = (shift.sales as any[])
      .filter((s: any) => s.status === 'COMPLETED')
      .flatMap((s: any) => s.payments as any[])
      .filter((p: any) => p.method === 'CASH')
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const expectedCash = Number(shift.openingCash) + cashSales;
    const difference = closingCash - expectedCash;

    return this.prisma.shift.update({
      where: { id },
      data: {
        status: ShiftStatus.CLOSED,
        closingCash,
        expectedCash,
        difference,
        endedAt: new Date(),
      },
    });
  }

  async getOpenShift(cashierId: number) {
    return this.prisma.shift.findFirst({ where: { cashierId, status: ShiftStatus.OPEN } });
  }
}
