import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe, ValidationPipe, Query, Request } from '@nestjs/common';
import { SalesService } from './sales.service.js';
import { CreateSaleDto, VoidSaleDto } from './dto/sale.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../common/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get()
  findAll(
    @Query('cashierId') cashierId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.salesService.findAll(cashierId ? parseInt(cashierId) : undefined, from, to);
  }

  @Get('summary/daily')
  getDailySummary(@Query('date') date?: string) {
    return this.salesService.getDailySummary(date);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @Post()
  create(
    @Body(new ValidationPipe({ transform: true })) dto: CreateSaleDto,
    @Request() req: { user: { id: number } },
  ) {
    return this.salesService.create(dto, req.user.id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/void')
  void(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: VoidSaleDto) {
    return this.salesService.void(id, dto);
  }
}
