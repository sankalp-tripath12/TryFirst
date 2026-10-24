import { useEffect, useState } from 'react';
import { api } from '../services/api';

type Item = {
  variantId: string;
  name: string;
  category: string;
  shopName: string;
  shopAddress: string;
  size: string;
  color: string;
  price: string;
  stock: number;
};


const BADGE: Record<string, string> = {
  shirts: 'bg-sky-100 text-sky-700',
  jeans: 'bg-indigo-100 text-indigo-700',
  trousers: 'bg-amber-100 text-amber-700',
  kurtas: 'bg-rose-100 text-rose-700',
  tshirts: 'bg-emerald-100 text-emerald-700',
};

function stockPill(n: number) {
  if (n <= 1) return 'bg-red-100 text-red-700';
  if (n <= 3) return 'bg-amber-100 text-amber-700';
  return 'bg-green-100 text-green-700';
}

export default function ProductsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (size) params.set('size', size);
    if (maxPrice) params.set('maxPrice', maxPrice);
    try {
      setItems(await api('/products?' + params.toString()));
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function reserve(variantId: string) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await api('/reservations', { method: 'POST', body: { variantId } });
      setMessage('Reserved! You have 30 minutes to visit the shop.');
      load();
    } catch (err) {
      setMessage((err as Error).message);
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <form
        onSubmit={(e) => { e.preventDefault(); load(); }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <input className="rounded-xl border border-slate-300 bg-white p-2.5" placeholder="Search name" value={q}
          onChange={(e) => setQ(e.target.value)} />
        <select className="rounded-xl border border-slate-300 bg-white p-2.5" value={category}
          onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option>shirts</option>
          <option>jeans</option>
          <option>trousers</option>
          <option>kurtas</option>
          <option>tshirts</option>
        </select>
        <select className="rounded-xl border border-slate-300 bg-white p-2.5" value={size}
          onChange={(e) => setSize(e.target.value)}>
          <option value="">Any size</option>
          <option>S</option>
          <option>M</option>
          <option>L</option>
          <option>XL</option>
        </select>
        <input className="w-32 rounded-xl border border-slate-300 bg-white p-2.5" placeholder="Max price" value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)} />
        <button className="rounded-xl bg-indigo-600 px-5 font-medium text-white hover:bg-indigo-700">Search</button>
      </form>

      {message && <p className="mb-4 rounded-xl bg-indigo-50 p-3 text-indigo-800">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && items.length === 0 && <p>No products match your search.</p>}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.variantId}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <span className={'rounded-full px-2.5 py-0.5 text-xs font-medium ' + (BADGE[it.category] || 'bg-slate-100 text-slate-700')}>
                {it.category}
              </span>
              <span className={'rounded-full px-2.5 py-0.5 text-xs font-medium ' + stockPill(it.stock)}>
                {it.stock} left
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{it.name}</h2>
            <p className="text-sm text-slate-500">{it.shopName} · {it.shopAddress}</p>
            <p className="mt-2 text-sm text-slate-600">Size {it.size} · {it.color}</p>
            <p className="mt-1 text-xl font-bold text-indigo-600">₹{it.price}</p>
            <button onClick={() => reserve(it.variantId)} disabled={busy}
              className="mt-3 w-full rounded-xl bg-indigo-600 p-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50">
              Reserve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
