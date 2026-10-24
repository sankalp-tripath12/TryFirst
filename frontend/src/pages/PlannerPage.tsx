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
          <input className="block w-28 rounded-xl border border-slate-300 bg-white p-2.5" value={budget}
            onChange={(e) => setBudget(e.target.value)} />
        </label>
        <label className="text-sm">Minutes
          <input className="block w-28 rounded-xl border border-slate-300 bg-white p-2.5" value={minutes}
            onChange={(e) => setMinutes(e.target.value)} />
        </label>
        <label className="text-sm">Occasion
          <select className="block rounded-xl border border-slate-300 bg-white p-2.5" value={occasion}
            onChange={(e) => setOccasion(e.target.value)}>
            <option>casual</option>
            <option>formal</option>
            <option>ethnic</option>
            <option>party</option>
          </select>
        </label>
        <button className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700">Make a plan</button>
      </form>
      {message && <p className="mb-4 rounded-xl bg-indigo-50 p-3 text-indigo-800">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {plans && plans.length === 0 && !error && <p>No plan fits that budget.</p>}

      {plans && plans.map((plan, i) => (
        <div key={i} className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="font-semibold capitalize">
            {plan.kind} plan · ₹{plan.totalCost} · {plan.shops} shop(s)
          </p>
          <p className="text-sm">
            About {plan.timeMinutes} min vs about {plan.baselineMinutes} min the usual way.{' '}
            <b className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">You save {plan.savedMinutes} min</b>
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
            className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">Reserve all items</button>
        </div>
      ))}
    </div>
  );
}
