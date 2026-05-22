import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiClient';
import '../styles/admin-dashboard.css';

export default function AdminDashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const LOW_STOCK_PAGE_SIZE = 10;

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const payload = await apiRequest('/stats?lowStockThreshold=10', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setStats(payload.stats);
        setLowStockProducts(payload.lowStockProducts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadStats();
    }
  }, [token]);

  if (loading) {
    return <div className="admin-dashboard-loading">Cargando estadísticas...</div>;
  }

  if (error) {
    return <div className="admin-dashboard-error">Error: {error}</div>;
  }

  if (!stats) {
    return <div className="admin-dashboard-error">Sin datos disponibles</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard de Administración</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Categorías</h3>
          <p className="stat-value">{stats.categoriesCount}</p>
        </div>

        <div className="stat-card">
          <h3>Productos Totales</h3>
          <p className="stat-value">{stats.productsCount}</p>
        </div>

        <div className="stat-card">
          <h3>Productos Publicados</h3>
          <p className="stat-value">{stats.publishedCount}</p>
        </div>

        <div className="stat-card warning">
          <h3>Bajo Stock</h3>
          <p className="stat-value">{stats.lowStockCount}</p>
          <p className="stat-hint">≤ {stats.lowStockThreshold} unidades</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="low-stock-section">
          <h2>Productos Bajos de Stock</h2>
          <table className="low-stock-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts
                .slice((lowStockPage - 1) * LOW_STOCK_PAGE_SIZE, lowStockPage * LOW_STOCK_PAGE_SIZE)
                .map((product) => (
                  <tr key={product.id} className="low-stock-row">
                    <td className="low-stock-cell">{product.sku}</td>
                    <td className="low-stock-cell low-stock-name">{product.name}</td>
                    <td className="stock-critical">{product.stock}</td>
                    <td className="low-stock-cell">ARS ${product.price}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {lowStockProducts.length > LOW_STOCK_PAGE_SIZE && (
            <div className="low-stock-pagination">
              <button
                className="btn btn-secondary"
                disabled={lowStockPage === 1}
                onClick={() => setLowStockPage((p) => Math.max(1, p - 1))}
              >
                ‹ Anterior
              </button>
              <span className="low-stock-page-indicator">
                Página {lowStockPage} de {Math.ceil(lowStockProducts.length / LOW_STOCK_PAGE_SIZE)}
              </span>
              <button
                className="btn btn-secondary"
                disabled={lowStockPage === Math.ceil(lowStockProducts.length / LOW_STOCK_PAGE_SIZE)}
                onClick={() => setLowStockPage((p) => Math.min(Math.ceil(lowStockProducts.length / LOW_STOCK_PAGE_SIZE), p + 1))}
              >
                Siguiente ›
              </button>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-actions">
        <a href="/admin/categorias" className="btn btn-primary">
          Gestionar Categorías
        </a>
        <a href="/admin/productos" className="btn btn-primary">
          Gestionar Productos
        </a>
      </div>
    </div>
  );
}
