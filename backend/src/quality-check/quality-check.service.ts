import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QualityRating } from './entities/quality-rating.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { CreateQualityCheckDto } from './dto/create-quality-check.dto';

@Injectable()
export class QualityCheckService {
  constructor(
    @InjectRepository(QualityRating) private checks: Repository<QualityRating>,
    @InjectRepository(Reservation) private reservations: Repository<Reservation>,
  ) {}

  async create(reservationId: string, customerId: string, dto: CreateQualityCheckDto) {
    const reservation = await this.reservations.findOne({ where: { id: reservationId } });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.customerId !== customerId) {
      throw new ForbiddenException('This is not your reservation');
    }
    if (reservation.status === 'cancelled' || reservation.status === 'expired') {
      throw new ConflictException('Cannot review a cancelled or expired reservation');
    }
    if (await this.checks.findOne({ where: { reservationId } })) {
      throw new ConflictException('You already reviewed this reservation');
    }

    const check = this.checks.create({
      ...dto,
      reservationId,
      customerId,
      variantId: reservation.variantId,
    });
    return this.checks.save(check);
  }

  // average ratings for one variant's product listing
  async summary(variantId: string) {
    const rows = await this.checks
      .createQueryBuilder('q')
      .select('COUNT(*)', 'reviews')
      .addSelect('ROUND(AVG(q.fabric), 1)', 'fabric')
      .addSelect('ROUND(AVG(q.fit), 1)', 'fit')
      .addSelect('ROUND(AVG(q.appearance), 1)', 'appearance')
      .addSelect('ROUND(AVG(q.value), 1)', 'value')
      .where('q.variantId = :variantId', { variantId })
      .getRawOne();
    return rows;
  }
}
