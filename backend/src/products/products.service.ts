import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private products: Repository<Product>,
    @InjectRepository(ProductVariant) private variants: Repository<ProductVariant>,
    @InjectRepository(Shop) private shops: Repository<Shop>,
  ) {}

  async create(dto: CreateProductDto, userId: string) {
    const shop = await this.shops.findOne({ where: { id: dto.shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You can only add products to your own shop');
    }

    const product = this.products.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      shopId: dto.shopId,
    });
    await this.products.save(product);

    const variantRows = dto.variants.map((v) =>
      this.variants.create({
        productId: product.id,
        size: v.size,
        color: v.color,
        price: v.price,
        stock: v.stock,
      }),
    );
    await this.variants.save(variantRows);

    return { ...product, variants: variantRows };
  }
}
