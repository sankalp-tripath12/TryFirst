const BASE = 'http://localhost:4000';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export async function api(path: string, options: { method?: string; body?: unknown } = {}) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401 && token) {
    setToken(null);
    window.location.reload();
  }
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    throw new Error(msg || 'Request failed');
  }
  return data;
}

export function getRole(): string {
  const token = getToken();
  if (!token) return '';
  try {
    return JSON.parse(atob(token.split('.')[1])).role;
  } catch {
    return '';
  }
}
