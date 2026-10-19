import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import ReservationsPage from './pages/ReservationsPage';
import DashboardPage from './pages/DashboardPage';
import { getToken, getRole, setToken } from './services/api';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [page, setPage] = useState<'shop' | 'mine' | 'dash'>('shop');

  if (!loggedIn) return <LoginPage onLoggedIn={() => { setPage('shop'); setLoggedIn(true); }} />;

  const isShopkeeper = getRole() === 'shopkeeper';

  return (
    <div>
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-bold">TryFirst</h1>
        <nav className="flex gap-4">
          <button className={page === 'shop' ? 'font-bold underline' : ''}
            onClick={() => setPage('shop')}>Shop</button>
          <button className={page === 'mine' ? 'font-bold underline' : ''}
            onClick={() => setPage('mine')}>My reservations</button>
          {isShopkeeper && (
            <button className={page === 'dash' ? 'font-bold underline' : ''}
              onClick={() => setPage('dash')}>Dashboard</button>
          )}
          <button className="underline"
            onClick={() => { setToken(null); setLoggedIn(false); }}>Log out</button>
        </nav>
      </header>
      {page === 'shop' && <ProductsPage />}
      {page === 'mine' && <ReservationsPage />}
      {page === 'dash' && isShopkeeper && <DashboardPage />}
    </div>
  );
}
