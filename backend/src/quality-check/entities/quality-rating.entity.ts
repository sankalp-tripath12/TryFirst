import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('quality_checks')
export class QualityRating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  reservationId!: string;

  @Column()
  customerId!: string;

  @Column()
  variantId!: string;

  // checklist done in the shop
  @Column({ default: false })
  sizeMatchesLabel!: boolean;

  @Column({ default: false })
  noDefects!: boolean;

  @Column({ default: false })
  colorAsListed!: boolean;

  // ratings, 1 to 5
  @Column()
  fabric!: number;

  @Column()
  fit!: number;

  @Column()
  appearance!: number;

  @Column()
  value!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
