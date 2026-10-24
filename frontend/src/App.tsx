import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import ReservationsPage from './pages/ReservationsPage';
import DashboardPage from './pages/DashboardPage';
import PlannerPage from './pages/PlannerPage';
import { getToken, getRole, setToken } from './services/api';

type Page = 'shop' | 'plan' | 'mine' | 'dash';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [page, setPage] = useState<Page>('shop');

  if (!loggedIn) return <LoginPage onLoggedIn={() => { setPage('shop'); setLoggedIn(true); }} />;

  const isShopkeeper = getRole() === 'shopkeeper';
  const tab = (p: Page, label: string) => (
    <button
      onClick={() => setPage(p)}
      className={'rounded-full px-4 py-1.5 text-sm font-medium transition ' +
        (page === p ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-indigo-500')}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-indigo-600 shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white">TryFirst</h1>
          <nav className="flex items-center gap-2">
            {tab('shop', 'Shop')}
            {tab('plan', 'Planner')}
            {tab('mine', 'My reservations')}
            {isShopkeeper && tab('dash', 'Dashboard')}
            <button className="ml-2 text-sm text-indigo-200 underline"
              onClick={() => { setToken(null); setLoggedIn(false); }}>Log out</button>
          </nav>
        </div>
      </header>
      {page === 'shop' && <ProductsPage />}
      {page === 'plan' && <PlannerPage />}
      {page === 'mine' && <ReservationsPage />}
      {page === 'dash' && isShopkeeper && <DashboardPage />}
    </div>
  );
}
