import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

const COLORS = ['black', 'white', 'blue', 'grey', 'navy'];
// t-shirt is checked before shirt, because "t-shirt" contains "shirt"
const CATS: [string, string][] = [
  ['t-shirt', 'tshirts'],
  ['tshirt', 'tshirts'],
  ['jeans', 'jeans'],
  ['trouser', 'trousers'],
  ['kurta', 'kurtas'],
  ['shirt', 'shirts'],
];

function parse(q: string) {
  const text = q.toLowerCase();
  const filters: Record<string, any> = {};
  const color = COLORS.find((c) => text.includes(c));
  if (color) filters.color = color;
  const cat = CATS.find(([word]) => text.includes(word));
  if (cat) filters.category = cat[1];
  const size = text.match(/\bsize\s*(xl|s|m|l)\b/);
  if (size) filters.size = size[1].toUpperCase();
  const price = text.match(/(?:under|below|less than|upto|up to|within)\s*(?:rs\.?|inr|₹)?\s*(\d+)/);
  if (price) filters.maxPrice = Number(price[1]);
  return filters;
}

@Injectable()
export class AssistantService {
  constructor(private products: ProductsService) {}

  async ask(q: string) {
    const filters = parse(q || '');
    const found = Object.keys(filters).length > 0;
    const results = found ? await this.products.search(filters as any) : [];
    const parts = Object.entries(filters).map(([k, v]) => k + ' = ' + v);
    const reply = found
      ? 'I searched for ' + parts.join(', ') + ' and found ' + results.length + ' item(s).'
      : 'I could not find a color, category, size or price in that. Try: black shirt under 1500.';
    return { question: q, understood: filters, reply, results: results.slice(0, 6) };
  }
}
