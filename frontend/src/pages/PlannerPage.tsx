import { useState } from 'react';
import { api } from '../services/api';

type Item = {
  variantId: string;
  name: string;
  size: string;
  color: string;
  price: number;
  shopName: string;
  address: string;
};

type Plan = {
  kind: string;
  shops: number;
  totalCost: number;
  timeMinutes: number;
  baselineMinutes: number;
  savedMinutes: number;
  fitsTimeLimit: boolean;
  items: Item[];
};

export default function PlannerPage() {
  const [budget, setBudget] = useState('4000');
  const [minutes, setMinutes] = useState('90');
  const [occasion, setOccasion] = useState('casual');
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const url = '/planner?budget=' + budget + '&minutes=' + minutes + '&occasion=' + occasion;
      const data = await api(url);
      setPlans(data.plans || []);
      if (data.error) setError(data.error);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function reservePlan(plan: Plan) {
    let done = 0;
    const failed: string[] = [];
    for (const it of plan.items) {
      try {
        await api('/reservations', { method: 'POST', body: { variantId: it.variantId } });
        done++;
      } catch (err) {
        failed.push(it.name + ' (' + (err as Error).message + ')');
      }
    }
    let text = 'Reserved ' + done + ' of ' + plan.items.length + ' items.';
    text += failed.length ? ' Could not reserve: ' + failed.join(', ') : ' See My reservations.';
    setMessage(text);
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="mb-3 text-xl font-bold">Plan my shopping</h2>
      <form onSubmit={search} className="mb-4 flex flex-wrap items-end gap-2">
        <label className="text-sm">Budget
          <input className="block w-28 rounded border p-2" value={budget}
            onChange={(e) => setBudget(e.target.value)} />
        </label>
        <label className="text-sm">Minutes
          <input className="block w-28 rounded border p-2" value={minutes}
            onChange={(e) => setMinutes(e.target.value)} />
        </label>
        <label className="text-sm">Occasion
          <select className="block rounded border p-2" value={occasion}
            onChange={(e) => setOccasion(e.target.value)}>
            <option>casual</option>
            <option>formal</option>
            <option>ethnic</option>
            <option>party</option>
          </select>
        </label>
        <button className="rounded bg-black px-4 py-2 text-white">Make a plan</button>
      </form>
      {message && <p className="mb-3 rounded bg-gray-100 p-2">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {plans && plans.length === 0 && !error && <p>No plan fits that budget.</p>}

      {plans && plans.map((plan, i) => (
        <div key={i} className="mb-4 rounded border p-3">
          <p className="font-semibold capitalize">
            {plan.kind} plan · ₹{plan.totalCost} · {plan.shops} shop(s)
          </p>
          <p className="text-sm">
            About {plan.timeMinutes} min vs about {plan.baselineMinutes} min the usual way.{' '}
            <b>You save {plan.savedMinutes} min.</b>
            {!plan.fitsTimeLimit && <span className="text-red-600"> Over your time limit.</span>}
          </p>
          <ul className="my-2 text-sm">
            {plan.items.map((it) => (
              <li key={it.variantId}>
                {it.name} ({it.size}, {it.color}) ₹{it.price}, {it.shopName}, {it.address}
              </li>
            ))}
          </ul>
          <button onClick={() => reservePlan(plan)}
            className="rounded bg-black px-3 py-1 text-white">Reserve all items</button>
        </div>
      ))}
    </div>
  );
}
