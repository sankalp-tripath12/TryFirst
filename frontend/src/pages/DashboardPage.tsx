import { useEffect, useState } from 'react';
import { api } from '../services/api';

type Row = {
  id: string;
  status: string;
  productName: string;
  size: string;
  color: string;
  customerEmail: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopId, setShopId] = useState('');
  const [p, setP] = useState({ name: '', description: '', category: 'shirts', size: 'M', color: '', price: '', stock: '' });

  async function load() {
    try {
      setRows(await api('/reservations/shop'));
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createShop(e: React.FormEvent) {
    e.preventDefault();
    try {
      const shop = await api('/shops', { method: 'POST', body: { name: shopName, address: shopAddress } });
      setShopId(shop.id);
      setMessage('Shop created. Its id is filled in below, so you can add products.');
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/products', {
        method: 'POST',
        body: {
          name: p.name,
          description: p.description,
          category: p.category,
          shopId,
          variants: [{ size: p.size, color: p.color, price: Number(p.price), stock: Number(p.stock) }],
        },
      });
      setMessage('Product added.');
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function markPurchased(id: string) {
    try {
      await api('/reservations/' + id + '/purchase', { method: 'POST' });
      setMessage('Marked as purchased.');
      load();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h2 className="text-xl font-bold">Shop dashboard</h2>
      {message && <p className="rounded-xl bg-indigo-50 p-3 text-indigo-800">{message}</p>}

      <form onSubmit={createShop} className="space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="font-semibold">Create a shop</h3>
        <input className="w-full rounded-xl border border-slate-300 p-2.5" placeholder="Shop name" value={shopName}
          onChange={(e) => setShopName(e.target.value)} />
        <input className="w-full rounded-xl border border-slate-300 p-2.5" placeholder="Address" value={shopAddress}
          onChange={(e) => setShopAddress(e.target.value)} />
        <button className="rounded-xl bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700">Create shop</button>
      </form>

      <form onSubmit={createProduct} className="space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="font-semibold">Add a product</h3>
        <input className="w-full rounded-xl border border-slate-300 p-2.5" placeholder="Shop id" value={shopId}
          onChange={(e) => setShopId(e.target.value)} />
        <input className="w-full rounded-xl border border-slate-300 p-2.5" placeholder="Product name" value={p.name}
          onChange={(e) => setP({ ...p, name: e.target.value })} />
        <input className="w-full rounded-xl border border-slate-300 p-2.5" placeholder="Description" value={p.description}
          onChange={(e) => setP({ ...p, description: e.target.value })} />
        <div className="flex flex-wrap gap-2">
          <select className="rounded-xl border border-slate-300 p-2.5" value={p.category}
            onChange={(e) => setP({ ...p, category: e.target.value })}>
            <option>shirts</option><option>jeans</option><option>trousers</option>
            <option>kurtas</option><option>tshirts</option>
          </select>
          <select className="rounded-xl border border-slate-300 p-2.5" value={p.size}
            onChange={(e) => setP({ ...p, size: e.target.value })}>
            <option>S</option><option>M</option><option>L</option><option>XL</option>
          </select>
          <input className="w-28 rounded-xl border border-slate-300 p-2.5" placeholder="Color" value={p.color}
            onChange={(e) => setP({ ...p, color: e.target.value })} />
          <input className="w-28 rounded-xl border border-slate-300 p-2.5" placeholder="Price" value={p.price}
            onChange={(e) => setP({ ...p, price: e.target.value })} />
          <input className="w-28 rounded-xl border border-slate-300 p-2.5" placeholder="Stock" value={p.stock}
            onChange={(e) => setP({ ...p, stock: e.target.value })} />
        </div>
        <button className="rounded-xl bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700">Add product</button>
      </form>

      <div>
        <h3 className="mb-2 font-semibold">Reservations on your shops</h3>
        {rows.length === 0 && <p>No reservations yet.</p>}
        {rows.map((r) => (
          <div key={r.id} className="mb-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="font-semibold">{r.productName} ({r.size}, {r.color})</p>
            <p className="text-sm text-gray-600">
              {r.customerEmail} · <span className="capitalize">{r.status}</span> ·{' '}
              {new Date(r.createdAt).toLocaleString()}
            </p>
            {r.status === 'pending' && (
              <button onClick={() => markPurchased(r.id)}
                className="mt-2 rounded-xl bg-indigo-600 px-4 py-1.5 font-medium text-white hover:bg-indigo-700">
                Mark purchased
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
