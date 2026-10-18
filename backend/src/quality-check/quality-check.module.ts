import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityRating } from './entities/quality-rating.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { QualityCheckController } from './quality-check.controller';
import { QualityCheckService } from './quality-check.service';

@Module({
  imports: [TypeOrmModule.forFeature([QualityRating, Reservation])],
  controllers: [QualityCheckController],
  providers: [QualityCheckService],
})
export class QualityCheckModule {}
