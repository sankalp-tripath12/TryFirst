import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Reservation } from './entities/reservation.entity';
import { InventoryEvent } from '../inventory/entities/inventory-event.entity';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';

@Injectable()
export class ReservationsService {
  constructor(private dataSource: DataSource) {}

  private findByKey(customerId: string, key: string) {
    return this.dataSource
      .getRepository(Reservation)
      .findOne({ where: { customerId, idempotencyKey: key } });
  }

  async create(variantId: string, customerId: string, key?: string) {
    // Retry of a request we already handled: return the same reservation
    if (key) {
      const existing = await this.findByKey(customerId, key);
      if (existing) return existing;
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const variant = await manager.findOne(ProductVariant, {
          where: { id: variantId },
          lock: { mode: 'pessimistic_write' },
        });
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
          idempotencyKey: key ?? null,
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
    } catch (err: any) {
      // Two identical requests at the same instant: the unique rule rejected
      // the second one and rolled back its stock change. Return the first.
      const code = err?.driverError?.code ?? err?.code;
      if (key && code === '23505') {
        const existing = await this.findByKey(customerId, key);
        if (existing) return existing;
      }
      throw err;
    }
  }

  mine(customerId: string) {
    return this.dataSource.getRepository(Reservation).find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(id: string, customerId: string) {
    return this.dataSource.transaction(async (manager) => {
      const reservation = await manager.findOne(Reservation, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!reservation) throw new NotFoundException('Reservation not found');
      if (reservation.customerId !== customerId) {
        throw new ForbiddenException('This is not your reservation');
      }
      if (reservation.status !== 'pending') {
        throw new ConflictException('Only pending reservations can be cancelled');
      }

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

      reservation.status = 'cancelled';
      return manager.save(reservation);
    });
  }

  async purchase(id: string, shopkeeperId: string) {
    return this.dataSource.transaction(async (manager) => {
      const reservation = await manager.findOne(Reservation, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!reservation) throw new NotFoundException('Reservation not found');
      if (reservation.status !== 'pending') {
        throw new ConflictException('Only pending reservations can be purchased');
      }

      const variant = await manager.findOne(ProductVariant, { where: { id: reservation.variantId } });
      const product = variant
        ? await manager.findOne(Product, { where: { id: variant.productId } })
        : null;
      const shop = product ? await manager.findOne(Shop, { where: { id: product.shopId } }) : null;
      if (!shop || shop.ownerId !== shopkeeperId) {
        throw new ForbiddenException('This reservation is not for your shop');
      }

      reservation.status = 'purchased';
      await manager.save(reservation);
      await manager.save(
        manager.create(InventoryEvent, {
          variantId: reservation.variantId,
          eventType: 'PURCHASED',
          quantityChange: 0,
          previousStock: variant!.stock,
          newStock: variant!.stock,
          reservationId: reservation.id,
        }),
      );
      return reservation;
    });
  }
}
