import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private products: Repository<Product>,
    @InjectRepository(ProductVariant) private variants: Repository<ProductVariant>,
  ) {}

  async create(dto: CreateProductDto) {
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
