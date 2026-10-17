import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('reservations')
@Index(['customerId', 'idempotencyKey'], { unique: true })
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  variantId!: string;

  @Column()
  customerId!: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  idempotencyKey!: string | null;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
