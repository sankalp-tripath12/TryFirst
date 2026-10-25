import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column()
  ownerId!: string;

  @Column({ type: 'float', nullable: true })
  latitude!: number | null;

  @Column({ type: 'float', nullable: true })
  longitude!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
