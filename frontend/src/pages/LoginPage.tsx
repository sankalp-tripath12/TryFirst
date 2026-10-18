import { useState } from 'react';
import { api, setToken } from '../services/api';

export default function LoginPage({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signup') {
        await api('/auth/signup', { method: 'POST', body: { email, password } });
      }
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      setToken(data.token);
      onLoggedIn();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-sm space-y-3 p-4">
      <h1 className="text-2xl font-bold">{mode === 'login' ? 'Log in' : 'Sign up'}</h1>
      <input className="w-full rounded border p-2" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-2" type="password" placeholder="Password (6+ chars)"
        value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="w-full rounded bg-black p-2 text-white">
        {mode === 'login' ? 'Log in' : 'Create account'}
      </button>
      <button type="button" className="text-sm underline"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
      </button>
    </form>
  );
}
