import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationExpiryService } from './reservation-expiry.service';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationExpiryService],
})
export class ReservationsModule {}
