import { spawnSync } from 'node:child_process';
const BASE = 'http://localhost:4000';

async function call(path, body, token) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

const shops = [
  { name: 'Urban Threads', address: 'Connaught Place, New Delhi' },
  { name: 'Fabric Lane', address: 'Sector 17, Chandigarh' },
  { name: 'The Style Loft', address: 'Linking Road, Mumbai' },
  { name: 'Khadi & Co', address: 'MG Road, Bengaluru' },
  { name: 'Denim Depot', address: 'Park Street, Kolkata' },
  { name: 'Ethnic Edit', address: 'Banjara Hills, Hyderabad' },
];

const catalog = [
  ['Formal Shirt', 'shirts', 1199],
  ['Casual Shirt', 'shirts', 899],
  ['Linen Shirt', 'shirts', 1499],
  ['Slim Fit Jeans', 'jeans', 1799],
  ['Straight Jeans', 'jeans', 1599],
  ['Chino Trousers', 'trousers', 1399],
  ['Cotton Kurta', 'kurtas', 1099],
  ['Silk Kurta', 'kurtas', 2499],
  ['Polo T-Shirt', 'tshirts', 699],
  ['Graphic T-Shirt', 'tshirts', 549],
];
const colors = ['black', 'white', 'blue', 'grey', 'navy'];
const sizes = ['S', 'M', 'L', 'XL'];

const pick = (arr, i) => arr[i % arr.length];
const rand = (n) => Math.floor(Math.random() * n);

function promote(email) {
  const sql = "UPDATE users SET role = 'shopkeeper' WHERE email = '" + email + "';";
  const r = spawnSync('docker', ['exec', 'tryfirst-postgres', 'psql', '-U', 'tryfirst', '-d', 'tryfirst', '-c', sql]);
  if (r.status !== 0) throw new Error('promote failed: ' + r.stderr);
}

async function main() {
  const stamp = Date.now();
  let products = 0;

  for (let i = 0; i < shops.length; i++) {
    const email = 'seed' + i + '-' + stamp + '@tryfirst.dev';
    await call('/auth/signup', { email, password: 'password123' });
    promote(email);
    const login = await call('/auth/login', { email, password: 'password123' });
    const token = login.token;

    const shop = await call('/shops', shops[i], token);

    // each shop stocks 5 of the 10 catalog items, so shops differ
    for (let j = 0; j < 5; j++) {
      const [name, category, basePrice] = catalog[(i * 3 + j) % catalog.length];
      const variants = [];
      for (let v = 0; v < 4; v++) {
        variants.push({
          size: pick(sizes, v + j),
          color: pick(colors, i + v + j),
          price: basePrice + rand(5) * 50,
          stock: rand(6),
        });
      }
      await call('/products', {
        name, description: name + ' from ' + shops[i].name, category, shopId: shop.id, variants,
      }, token);
      products++;
    }
    console.log('Seeded', shops[i].name);
  }
  console.log('Done:', shops.length, 'shops,', products, 'products');
}

main();
