// Resolve API URL gracefully for both local Docker and Vercel cloud deployments
const getBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (!envUrl) return '/api';
  // Ensure it has /api prefix
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const BASE = getBaseUrl();

export const TOKEN_KEY = 'sg_token';

// Small fetch wrapper: adds the JWT, parses JSON and throws readable errors.
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
