import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

const CATS = ['shirts', 'jeans', 'trousers', 'kurtas', 'tshirts'];
const COLORS = ['black', 'white', 'blue', 'grey', 'navy'];
const SIZES = ['S', 'M', 'L', 'XL'];

type Row = {
  variantId: string;
  name: string;
  category: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  shopName: string;
  address: string;
};

// category counts most, then color and size, price is scaled down
function vec(r: Row) {
  return [
    ...CATS.map((c) => (c === r.category ? 3 : 0)),
    ...COLORS.map((c) => (c === r.color ? 1 : 0)),
    ...SIZES.map((s) => (s === r.size ? 1 : 0)),
    r.price / 1000,
  ];
}

function cosine(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

@Injectable()
export class RecommendationsService {
  constructor(private dataSource: DataSource) {}

  async similarTo(variantId: string) {
    const sql =
      'SELECT v.id AS "variantId", p.name, p.category, v.size, v.color, ' +
      'v.price::float AS price, v.stock, s.name AS "shopName", s.address ' +
      'FROM product_variants v ' +
      'JOIN products p ON p.id::text = v."productId" ' +
      'JOIN shops s ON s.id::text = p."shopId" ' +
      'WHERE v.stock > 0 OR v.id::text = $1';
    const rows: Row[] = await this.dataSource.query(sql, [variantId]);
    const target = rows.find((r) => r.variantId === variantId);
    if (!target) throw new NotFoundException('Item not found');
    const tv = vec(target);

    return rows
      .filter((r) => r.variantId !== variantId && r.stock > 0)
      .map((r) => {
        const reasons: string[] = [];
        if (r.category === target.category) reasons.push('the same category (' + r.category + ')');
        if (r.color === target.color) reasons.push('the same color (' + r.color + ')');
        if (Math.abs(r.price - target.price) <= 200) reasons.push('within ₹200 of the price');
        reasons.push('available at ' + r.shopName);
        return {
          ...r,
          score: Number(cosine(tv, vec(r)).toFixed(3)),
          why: 'Recommended because it is ' + reasons.join(', ') + '.',
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }
}
