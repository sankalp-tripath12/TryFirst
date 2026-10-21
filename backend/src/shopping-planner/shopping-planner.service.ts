import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

const OCCASIONS: Record<string, string[]> = {
  formal: ['shirts', 'trousers'],
  casual: ['tshirts', 'jeans'],
  ethnic: ['kurtas'],
  party: ['shirts', 'jeans'],
};

const A = {
  travelPerShopMin: 20,
  tryOnPerItemMin: 8,
  baselineShopsPerItem: 2,
  baselineBrowsePerShopMin: 15,
};

type Pick = {
  shopId: string;
  shopName: string;
  address: string;
  category: string;
  name: string;
  variantId: string;
  size: string;
  color: string;
  price: number;
};

@Injectable()
export class ShoppingPlannerService {
  constructor(private dataSource: DataSource) {}

  private buildPlan(kind: string, items: Pick[], minutes: number) {
    const shops = new Set(items.map((i) => i.shopId)).size;
    const total = items.reduce((sum, i) => sum + i.price, 0);
    const trip = shops * A.travelPerShopMin;
    const tryOn = items.length * A.tryOnPerItemMin;
    const planMin = trip + tryOn;
    const perItem = A.baselineShopsPerItem * (A.travelPerShopMin + A.baselineBrowsePerShopMin);
    const baselineMin = items.length * perItem;
    return {
      kind,
      shops,
      totalCost: total,
      timeMinutes: planMin,
      baselineMinutes: baselineMin,
      savedMinutes: baselineMin - planMin,
      fitsTimeLimit: planMin <= minutes,
      items,
    };
  }

  async plan(budget: number, minutes: number, occasion: string) {
    const categories = OCCASIONS[occasion];
    if (!categories) {
      return { error: 'Unknown occasion. Use: ' + Object.keys(OCCASIONS).join(', ') };
    }
    const sql =
      'SELECT DISTINCT ON (s.id, p.category) ' +
      's.id AS "shopId", s.name AS "shopName", s.address, p.category, p.name, ' +
      'v.id AS "variantId", v.size, v.color, v.price::float AS price ' +
      'FROM product_variants v ' +
      'JOIN products p ON p.id::text = v."productId" ' +
      'JOIN shops s ON s.id::text = p."shopId" ' +
      'WHERE v.stock > 0 AND p.category = ANY($1) ' +
      'ORDER BY s.id, p.category, v.price ASC';
    const rows: Pick[] = await this.dataSource.query(sql, [categories]);

    const byShop: Record<string, Pick[]> = {};
    for (const r of rows) (byShop[r.shopId] ??= []).push(r);
    const plans = Object.values(byShop)
      .filter((items) => items.length === categories.length)
      .map((items) => this.buildPlan('single-store', items, minutes))
      .filter((p) => p.totalCost <= budget)
      .sort((a, b) => a.totalCost - b.totalCost)
      .slice(0, 3);

    const cheapest: Pick[] = [];
    for (const cat of categories) {
      const list = rows.filter((r) => r.category === cat);
      const best = list.sort((a, b) => a.price - b.price)[0];
      if (best) cheapest.push(best);
    }
    if (cheapest.length === categories.length) {
      const multi = this.buildPlan('multi-store', cheapest, minutes);
      if (multi.shops > 1 && multi.totalCost <= budget) plans.push(multi);
    }

    return { occasion, budget, minutes, assumptions: A, plans };
  }
}
