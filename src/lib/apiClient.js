const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export async function apiRequest(path, options = {}) {
  const token = window.localStorage.getItem('herrajes-admin-token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If the body is FormData, do not set or override Content-Type header
  const body = options.body;
  if (body instanceof FormData && headers.has('Content-Type')) {
    headers.delete('Content-Type');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || 'La solicitud falló');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
