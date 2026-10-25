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
  confidence: string;
  distanceKm?: number | null;
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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [maxKm, setMaxKm] = useState('');
  const [similar, setSimilar] = useState<any[] | null>(null);
  const [similarFor, setSimilarFor] = useState('');

  async function showSimilar(variantId: string, name: string) {
    try {
      setSimilar(await api('/recommendations/' + variantId));
      setSimilarFor(name);
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function load() {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (size) params.set('size', size);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (coords) {
      params.set('lat', String(coords.lat));
      params.set('lng', String(coords.lng));
      if (maxKm) params.set('maxKm', maxKm);
    }
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
                <button type="button"
          onClick={() => navigator.geolocation.getCurrentPosition(
            (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setMessage('Location set. Click Search.'); },
            () => setMessage('Could not get your location.'))}
          className="rounded-xl border border-indigo-300 bg-white px-4 text-indigo-700 hover:bg-indigo-50">
          {coords ? 'Location on' : 'Use my location'}
        </button>
        <select className="rounded-xl border border-slate-300 bg-white p-2.5" value={maxKm}
          onChange={(e) => setMaxKm(e.target.value)}>
          <option value="">Any distance</option>
          <option value="10">Within 10 km</option>
          <option value="50">Within 50 km</option>
          <option value="300">Within 300 km</option>
        </select>
        <button className="rounded-xl bg-indigo-600 px-5 font-medium text-white hover:bg-indigo-700">Search</button>
      </form>

      {message && <p className="mb-4 rounded-xl bg-indigo-50 p-3 text-indigo-800">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && items.length === 0 && <p>No products match your search.</p>}

      {similar && (
        <div className="mb-4 rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-200">
          <div className="mb-2 flex justify-between">
            <b className="text-indigo-800">You might also like (similar to {similarFor})</b>
            <button className="text-sm underline" onClick={() => setSimilar(null)}>Close</button>
          </div>
          {similar.map((r) => (
            <div key={r.variantId} className="mb-2 rounded-xl bg-white p-3 text-sm">
              <b>{r.name}</b> · size {r.size}, {r.color} · ₹{r.price} · {r.shopName}
              <p className="text-slate-500">{r.why}</p>
            </div>
          ))}
        </div>
      )}

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
              <span title="How recently this stock was confirmed"
                className={'ml-1 inline-block h-3 w-3 rounded-full ' +
                  (it.confidence === 'green' ? 'bg-green-500' : it.confidence === 'yellow' ? 'bg-amber-400' : 'bg-red-500')} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{it.name}</h2>
            <p className="text-sm text-slate-500">{it.shopName} · {it.shopAddress}</p>
            <p className="mt-2 text-sm text-slate-600">Size {it.size} · {it.color}{it.distanceKm != null && ' · ' + it.distanceKm + ' km away'}</p>
            <p className="mt-1 text-xl font-bold text-indigo-600">₹{it.price}</p>
            <button onClick={() => reserve(it.variantId)} disabled={busy}
              className="mt-3 w-full rounded-xl bg-indigo-600 p-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50">
              Reserve
            </button>
            <button onClick={() => showSimilar(it.variantId, it.name)}
              className="mt-2 w-full text-sm text-indigo-600 underline">
              Show similar items
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
