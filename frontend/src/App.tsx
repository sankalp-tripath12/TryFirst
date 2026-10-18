import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import { getToken, setToken } from './services/api';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  if (!loggedIn) return <LoginPage onLoggedIn={() => setLoggedIn(true)} />;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">TryFirst</h1>
      <p>You are logged in.</p>
      <button className="mt-4 underline"
        onClick={() => { setToken(null); setLoggedIn(false); }}>
        Log out
      </button>
    </div>
  );
}
