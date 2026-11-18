const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// One place for every fetch call: adds the token, parses JSON, turns failures into Errors.
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && path !== '/users/login') {
      window.dispatchEvent(new Event('auth:expired'));
    }
    const err = new Error(data?.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}
