import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.reservationsService.create(dto.variantId, user.userId);
  }
}
