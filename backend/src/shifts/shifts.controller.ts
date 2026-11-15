import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe, Request, Query } from '@nestjs/common';
import { ShiftsService } from './shifts.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('shifts')
export class ShiftsController {
  constructor(private shiftsService: ShiftsService) {}

  @Get()
  findAll(@Query('cashierId') cashierId?: string) {
    return this.shiftsService.findAll(cashierId ? parseInt(cashierId) : undefined);
  }

  @Get('open')
  getOpenShift(@Request() req: { user: { id: number } }) {
    return this.shiftsService.getOpenShift(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.findOne(id);
  }

  @Post('open')
  open(@Body('openingCash') openingCash: number, @Request() req: { user: { id: number } }) {
    return this.shiftsService.open(req.user.id, openingCash);
  }

  @Post(':id/close')
  close(@Param('id', ParseIntPipe) id: number, @Body('closingCash') closingCash: number) {
    return this.shiftsService.close(id, closingCash);
  }
}
