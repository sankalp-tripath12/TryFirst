import { useEffect, useState } from 'react';
import { api } from '../services/api';

type Reservation = {
  id: string;
  variantId: string;
  status: string;
  expiresAt: string;
  createdAt: string;
};

export default function ReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reviewing, setReviewing] = useState('');
  const [ratings, setRatings] = useState({ fabric: 5, fit: 5, appearance: 5, value: 5 });
  const [checks, setChecks] = useState({ sizeMatchesLabel: true, noDefects: true, colorAsListed: true });

  async function load() {
    setLoading(true);
    try {
      setItems(await api('/reservations/mine'));
    } catch (err) {
      setMessage((err as Error).message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id: string) {
    setMessage('');
    try {
      await api('/reservations/' + id + '/cancel', { method: 'POST' });
      setMessage('Reservation cancelled.');
      load();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function submitReview(id: string) {
    setMessage('');
    try {
      await api('/reservations/' + id + '/quality-check', {
        method: 'POST',
        body: { ...checks, ...ratings },
      });
      setMessage('Thanks for your review!');
      setReviewing('');
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="mb-3 text-xl font-bold">My reservations</h2>
      {message && <p className="mb-3 rounded bg-gray-100 p-2">{message}</p>}
      {loading && <p>Loading...</p>}
      {!loading && items.length === 0 && <p>No reservations yet.</p>}

      {items.map((r) => (
        <div key={r.id} className="mb-3 rounded border p-3">
          <p className="font-semibold capitalize">{r.status}</p>
          <p className="text-sm text-gray-600">
            Reserved {new Date(r.createdAt).toLocaleString()}
            {r.status === 'pending' && ', hold ends ' + new Date(r.expiresAt).toLocaleTimeString()}
          </p>

          {r.status === 'pending' && (
            <div className="mt-2 flex gap-2">
              <button onClick={() => cancel(r.id)} className="rounded border px-3 py-1">
                Cancel
              </button>
              <button onClick={() => setReviewing(reviewing === r.id ? '' : r.id)}
                className="rounded bg-black px-3 py-1 text-white">
                Quality check
              </button>
            </div>
          )}
          {r.status === 'purchased' && (
            <button onClick={() => setReviewing(reviewing === r.id ? '' : r.id)}
              className="mt-2 rounded bg-black px-3 py-1 text-white">
              Rate this item
            </button>
          )}

          {reviewing === r.id && (
            <div className="mt-3 space-y-2 rounded bg-gray-50 p-3">
              {(['sizeMatchesLabel', 'noDefects', 'colorAsListed'] as const).map((k) => (
                <label key={k} className="block">
                  <input type="checkbox" checked={checks[k]}
                    onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })} />{' '}
                  {k === 'sizeMatchesLabel' ? 'Size matches the label'
                    : k === 'noDefects' ? 'No defects' : 'Color as listed'}
                </label>
              ))}
              {(['fabric', 'fit', 'appearance', 'value'] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 capitalize">
                  {k}
                  <select className="rounded border p-1" value={ratings[k]}
                    onChange={(e) => setRatings({ ...ratings, [k]: Number(e.target.value) })}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
                  </select>
                </label>
              ))}
              <button onClick={() => submitReview(r.id)}
                className="rounded bg-black px-3 py-1 text-white">
                Submit review
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
