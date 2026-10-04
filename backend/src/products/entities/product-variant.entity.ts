import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  productId!: string;

  @Column()
  size!: string;

  @Column()
  color!: string;

  @Column('decimal')
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
