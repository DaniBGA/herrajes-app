import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/apiClient';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const [token, setToken] = useState(() => window.localStorage.getItem('herrajes-admin-token') || '');
  const [admin, setAdmin] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const hasSession = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem('herrajes-admin-token', token);
    } else {
      window.localStorage.removeItem('herrajes-admin-token');
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAdmin(null);
      return undefined;
    }

    let active = true;

    async function bootstrap() {
      try {
        const payload = await apiRequest('/auth/me');
        if (active) {
          setAdmin(payload.admin);
        }
      } catch {
        if (active) {
          setToken('');
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      setToken(payload.token);
      setAdmin(payload.admin);
      setMessage('Sesión iniciada correctamente.');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasSession) {

    return (
      <section className="section section-dark admin-page">
        <div className="admin-shell admin-login-panel">
          <p className="section-eyebrow">Administrador</p>
          <h1 className="products-page-title">Acceso privado</h1>
          <p className="products-page-subtitle">Ingresá con tu usuario para administrar categorías, productos e imágenes del catálogo.</p>

          <form className="admin-form" onSubmit={handleLogin}>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="admin@herrajes.com"
              />
            </label>
            <label>
              <span>Contraseña</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="••••••••"
              />
            </label>
            <button type="submit" className="button button-primary button-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Entrar al panel'}
            </button>
          </form>

          {error ? <p className="admin-feedback admin-feedback-error">{error}</p> : null}
          {message ? <p className="admin-feedback admin-feedback-success">{message}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="section section-dark admin-page">
      <div className="admin-shell">
        <div className="admin-head">
          <div>
            <p className="section-eyebrow">Panel de administración</p>
            <h1 className="products-page-title">Hola, {admin?.name || 'Administrador'}</h1>
            <p className="products-page-subtitle">Gestioná el catálogo desde el dashboard.</p>
          </div>
          <button
            type="button"
            className="products-clear-button"
            onClick={() => {
              setToken('');
              setAdmin(null);
            }}
          >
            Cerrar sesión
          </button>
        </div>

        <AdminDashboard token={token} />
      </div>
    </section>
  );
}
