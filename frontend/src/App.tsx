import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import { getToken, setToken } from './services/api';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  if (!loggedIn) return <LoginPage onLoggedIn={() => setLoggedIn(true)} />;

  return (
    <div>
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-bold">TryFirst</h1>
        <button className="underline"
          onClick={() => { setToken(null); setLoggedIn(false); }}>
          Log out
        </button>
      </header>
      <ProductsPage />
    </div>
  );
}
