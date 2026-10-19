import { Controller, Post, Get, Param, Body, UseGuards, Headers } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: { userId: string; role: string },
    @Headers('idempotency-key') key?: string,
  ) {
    return this.reservationsService.create(dto.variantId, user.userId, key);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: { userId: string; role: string }) {
    return this.reservationsService.mine(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: { userId: string; role: string }) {
    return this.reservationsService.cancel(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shopkeeper')
  @Post(':id/purchase')
  purchase(@Param('id') id: string, @CurrentUser() user: { userId: string; role: string }) {
    return this.reservationsService.purchase(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shopkeeper')
  @Get('shop')
  shop(@CurrentUser() user: { userId: string; role: string }) {
    return this.reservationsService.shopReservations(user.userId);
  }
}
