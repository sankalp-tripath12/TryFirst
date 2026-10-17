import { test, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE = 'http://localhost:4000';
let token;
let shopId;

async function post(path, body, headers = {}) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

// Creates a product with one variant and returns the variant id
async function makeVariant(stock) {
  const { data } = await post(
    '/products',
    {
      name: 'Test Shirt',
      description: 'for tests',
      category: 'shirts',
      shopId,
      variants: [{ size: 'L', color: 'red', price: 500, stock }],
    },
    { Authorization: `Bearer ${token}` },
  );
  return data.variants[0].id;
}

before(async () => {
  const email = `test-${Date.now()}@test.com`;
  await post('/auth/signup', { email, password: 'password123' });
  const login = await post('/auth/login', { email, password: 'password123' });
  token = login.data.token;

  const shop = await post(
    '/shops',
    { name: 'Test Shop', address: '123 Test Street' },
    { Authorization: `Bearer ${token}` },
  );
  shopId = shop.data.id;
});

test('5 simultaneous requests for the last unit: only 1 succeeds', async () => {
  const variantId = await makeVariant(1);

  const results = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      post('/reservations', { variantId }, { Authorization: `Bearer ${token}` }),
    ),
  );

  const ok = results.filter((r) => r.status === 201).length;
  const conflicts = results.filter((r) => r.status === 409).length;

  assert.equal(ok, 1, 'exactly one reservation should succeed');
  assert.equal(conflicts, 19, 'the other four should get 409 Out of stock');
});

test('same Idempotency-Key twice: one reservation, same id', async () => {
  const variantId = await makeVariant(5);
  const headers = { Authorization: `Bearer ${token}`, 'Idempotency-Key': `key-${Date.now()}` };

  const first = await post('/reservations', { variantId }, headers);
  const second = await post('/reservations', { variantId }, headers);

  assert.equal(first.status, 201);
  assert.equal(first.data.id, second.data.id, 'retry should return the same reservation');
});

test('same key sent at the same instant: still one reservation', async () => {
  const variantId = await makeVariant(5);
  const headers = { Authorization: `Bearer ${token}`, 'Idempotency-Key': `race-${Date.now()}` };

  const results = await Promise.all(
    [1, 2, 3].map(() => post('/reservations', { variantId }, headers)),
  );

  const ids = new Set(results.map((r) => r.data.id));
  assert.equal(ids.size, 1, 'all three should resolve to the same reservation');
});
