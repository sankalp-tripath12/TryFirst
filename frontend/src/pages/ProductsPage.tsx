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

export default function ProductsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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
    setMessage('');
    try {
      await api('/reservations', { method: 'POST', body: { variantId } });
      setMessage('Reserved! You have 30 minutes to visit the shop.');
      load();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <form
        onSubmit={(e) => { e.preventDefault(); load(); }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <input className="rounded border p-2" placeholder="Search name" value={q}
          onChange={(e) => setQ(e.target.value)} />
        <select className="rounded border p-2" value={category}
          onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option>shirts</option>
          <option>jeans</option>
          <option>trousers</option>
          <option>kurtas</option>
          <option>tshirts</option>
        </select>
        <select className="rounded border p-2" value={size}
          onChange={(e) => setSize(e.target.value)}>
          <option value="">Any size</option>
          <option>S</option>
          <option>M</option>
          <option>L</option>
          <option>XL</option>
        </select>
        <input className="w-32 rounded border p-2" placeholder="Max price" value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)} />
        <button className="rounded bg-black px-4 text-white">Search</button>
      </form>

      {message && <p className="mb-3 rounded bg-gray-100 p-2">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && items.length === 0 && <p>No products match your search.</p>}

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.variantId} className="rounded border p-3">
            <h2 className="font-semibold">{it.name}</h2>
            <p className="text-sm text-gray-600">{it.shopName}, {it.shopAddress}</p>
            <p className="mt-1">Size {it.size}, {it.color}</p>
            <p className="font-bold">₹{it.price}</p>
            <p className="text-sm">{it.stock} in stock</p>
            <button onClick={() => reserve(it.variantId)}
              className="mt-2 w-full rounded bg-black p-2 text-white">
              Reserve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
