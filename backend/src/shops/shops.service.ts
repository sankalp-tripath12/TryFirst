import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop) private shops: Repository<Shop>,
  ) {}

  async create(dto: CreateShopDto, ownerId: string) {
    const shop = this.shops.create({
      name: dto.name,
      address: dto.address,
      ownerId,
    });

    return this.shops.save(shop);
  }
}
