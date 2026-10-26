import { useState } from 'react';
import { api } from '../services/api';

export default function AssistantPage() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      setData(await api('/assistant?q=' + encodeURIComponent(q)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="mb-3 text-xl font-bold">Ask the assistant</h2>
      <form onSubmit={ask} className="mb-4 flex gap-2">
        <input className="flex-1 rounded-xl border border-slate-300 bg-white p-2.5"
          placeholder="e.g. black shirt under 1500" value={q}
          onChange={(e) => setQ(e.target.value)} />
        <button className="rounded-xl bg-indigo-600 px-5 font-medium text-white">Ask</button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
      {data && <p className="mb-3 rounded-xl bg-indigo-50 p-3 text-indigo-800">{data.reply}</p>}
      {data && data.results.map((r: any) => (
        <div key={r.variantId} className="mb-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <b>{r.name}</b> · size {r.size}, {r.color} · <span className="text-indigo-600">₹{r.price}</span>
          <p className="text-sm text-slate-500">{r.shopName}, {r.shopAddress} · {r.stock} left</p>
        </div>
      ))}
    </div>
  );
}
