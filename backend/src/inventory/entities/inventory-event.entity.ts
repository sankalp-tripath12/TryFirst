import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('inventory_events')
export class InventoryEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  variantId!: string;

  @Column()
  eventType!: string;

  @Column()
  quantityChange!: number;

  @Column()
  previousStock!: number;

  @Column()
  newStock!: number;

  @Column({ nullable: true })
  reservationId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
