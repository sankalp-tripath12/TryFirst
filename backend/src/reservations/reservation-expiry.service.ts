import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { InventoryEvent } from '../inventory/entities/inventory-event.entity';

@Injectable()
export class ReservationExpiryService {
  private logger = new Logger('ReservationExpiry');

  constructor(private dataSource: DataSource) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpired() {
    const count = await this.expireOldReservations();
    if (count > 0) this.logger.log(`Released ${count} expired reservation(s)`);
  }

  async expireOldReservations(): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      // Lock the expired rows; skip any another run is already handling
      const expired = await manager
        .createQueryBuilder(Reservation, 'r')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where('r.status = :status', { status: 'pending' })
        .andWhere('r.expiresAt < now()')
        .getMany();

      for (const reservation of expired) {
        const variant = await manager.findOne(ProductVariant, {
          where: { id: reservation.variantId },
          lock: { mode: 'pessimistic_write' },
        });
        if (variant) {
          const previousStock = variant.stock;
          variant.stock = previousStock + 1;
          await manager.save(variant);

          await manager.save(
            manager.create(InventoryEvent, {
              variantId: variant.id,
              eventType: 'RELEASED',
              quantityChange: 1,
              previousStock,
              newStock: variant.stock,
              reservationId: reservation.id,
            }),
          );
        }
        reservation.status = 'expired';
        await manager.save(reservation);
      }

      return expired.length;
    });
  }
}
