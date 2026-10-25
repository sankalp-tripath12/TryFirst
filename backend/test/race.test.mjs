import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';

const BASE = 'http://localhost:4000';

async function post(path, body, token) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

function curlReserve(token, variantId) {
  return new Promise((resolve) => {
    const c = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST',
      BASE + '/reservations', '-H', 'Content-Type: application/json',
      '-H', 'Authorization: Bearer ' + token, '-d', JSON.stringify({ variantId })]);
    let out = '';
    c.stdout.on('data', (d) => (out += d));
    c.on('close', () => resolve(Number(out)));
  });
}

function promote(email) {
  const sql = "UPDATE users SET role = 'shopkeeper' WHERE email = '" + email + "';";
  spawnSync('docker', ['exec', 'tryfirst-postgres', 'psql', '-U', 'tryfirst', '-d', 'tryfirst', '-c', sql]);
}

async function makeUser(prefix, shopkeeper) {
  const email = prefix + '-' + Date.now() + '@test.com';
  await post('/auth/signup', { email, password: 'password123' });
  if (shopkeeper) promote(email);
  const login = await post('/auth/login', { email, password: 'password123' });
  return login.data.token;
}

test('60 parallel requests for the last unit: exactly 1 succeeds', async () => {
  const owner = await makeUser('owner', true);
  const customer = await makeUser('cust', false);
  const shop = await post('/shops', { name: 'Race Shop', address: '1 Race Road' }, owner);
  const product = await post('/products', {
    name: 'Race Shirt', description: 'race', category: 'shirts', shopId: shop.data.id,
    variants: [{ size: 'M', color: 'red', price: 100, stock: 1 }],
  }, owner);
  const variantId = product.data.variants[0].id;

  const codes = await Promise.all(Array.from({ length: 60 }, () => curlReserve(customer, variantId)));
  const ok = codes.filter((c) => c === 201).length;
  assert.equal(ok, 1, 'expected exactly 1 success, got ' + ok);
});
