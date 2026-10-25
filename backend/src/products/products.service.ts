import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';

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

  async search(f: SearchProductsDto) {
    const qb = this.variants
      .createQueryBuilder('v')
      .innerJoin(Product, 'p', 'p.id::text = v."productId"')
      .innerJoin(Shop, 's', 's.id::text = p."shopId"')
      .select([
        'p.id AS "productId"',
        'p.name AS name',
        'p.description AS description',
        'p.category AS category',
        's.id AS "shopId"',
        's.name AS "shopName"',
        's.address AS "shopAddress"',
        'v.id AS "variantId"',
        'v.size AS size',
        'v.color AS color',
        'v.price AS price',
        'v.stock AS stock',
        `GREATEST(v."createdAt", COALESCE((SELECT MAX(e."createdAt") FROM inventory_events e WHERE e."variantId" = v.id::text), v."createdAt")) AS "lastSync"`,
      ])
      .where('v.stock > 0');

    if (f.q) qb.andWhere('p.name ILIKE :q', { q: '%' + f.q + '%' });
    if (f.category) qb.andWhere('p.category = :category', { category: f.category });
    if (f.size) qb.andWhere('v.size = :size', { size: f.size });
    if (f.color) qb.andWhere('v.color = :color', { color: f.color });
    if (f.minPrice !== undefined) qb.andWhere('v.price >= :minPrice', { minPrice: f.minPrice });
    if (f.maxPrice !== undefined) qb.andWhere('v.price <= :maxPrice', { maxPrice: f.maxPrice });

    const rows = await qb.orderBy('v.price', 'ASC').getRawMany();
    return rows.map((r) => {
      const hours = (Date.now() - new Date(r.lastSync).getTime()) / 3600000;
      const confidence = hours < 24 ? 'green' : hours < 24 * 7 ? 'yellow' : 'red';
      return { ...r, confidence };
    });
  }
}
