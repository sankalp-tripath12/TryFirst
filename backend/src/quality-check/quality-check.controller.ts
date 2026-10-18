import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { QualityCheckService } from './quality-check.service';
import { CreateQualityCheckDto } from './dto/create-quality-check.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class QualityCheckController {
  constructor(private service: QualityCheckService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reservations/:id/quality-check')
  create(
    @Param('id') id: string,
    @Body() dto: CreateQualityCheckDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.service.create(id, user.userId, dto);
  }

  @Get('variants/:id/ratings')
  summary(@Param('id') id: string) {
    return this.service.summary(id);
  }
}
