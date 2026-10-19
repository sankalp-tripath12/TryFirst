import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import ReservationsPage from './pages/ReservationsPage';
import { getToken, setToken } from './services/api';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [page, setPage] = useState<'shop' | 'mine'>('shop');

  if (!loggedIn) return <LoginPage onLoggedIn={() => setLoggedIn(true)} />;

  return (
    <div>
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-bold">TryFirst</h1>
        <nav className="flex gap-4">
          <button className={page === 'shop' ? 'font-bold underline' : ''}
            onClick={() => setPage('shop')}>Shop</button>
          <button className={page === 'mine' ? 'font-bold underline' : ''}
            onClick={() => setPage('mine')}>My reservations</button>
          <button className="underline"
            onClick={() => { setToken(null); setLoggedIn(false); }}>Log out</button>
        </nav>
      </header>
      {page === 'shop' ? <ProductsPage /> : <ReservationsPage />}
    </div>
  );
}
