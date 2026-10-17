import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Reservation } from './entities/reservation.entity';
import { InventoryEvent } from '../inventory/entities/inventory-event.entity';

@Injectable()
export class ReservationsService {
  constructor(private dataSource: DataSource) {}

  async create(variantId: string, customerId: string) {
    return this.dataSource.transaction(async (manager) => {
      const variant = await manager.findOne(ProductVariant, { where: { id: variantId }, lock: { mode: 'pessimistic_write' } });
      if (!variant) {
        throw new NotFoundException('Variant not found');
      }
      if (variant.stock < 1) {
        throw new ConflictException('Out of stock');
      }

      const previousStock = variant.stock;
      variant.stock = previousStock - 1;
      await manager.save(variant);

      const reservation = manager.create(Reservation, {
        variantId,
        customerId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
      await manager.save(reservation);

      await manager.save(
        manager.create(InventoryEvent, {
          variantId,
          eventType: 'RESERVED',
          quantityChange: -1,
          previousStock,
          newStock: variant.stock,
          reservationId: reservation.id,
        }),
      );

      return reservation;
    });
  }
}
