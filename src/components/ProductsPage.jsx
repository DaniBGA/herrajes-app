import React, { useEffect, useState } from 'react';
import { apiRequest, resolveMediaUrl } from '../lib/apiClient';

function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
}

export default function ProductsPage() {
  const ITEMS_PER_PAGE = 20;

  const [query, setQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar categorías y verificar filtro del sessionStorage
  useEffect(() => {
    async function loadCategories() {
      try {
        const payload = await apiRequest('/categories');
        setCategories(payload.categories || []);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    }

    loadCategories();

    // Check if category filter is in sessionStorage (from CategoriesSection click)
    const storedCategoryFilter = sessionStorage.getItem('categoryFilter');
    if (storedCategoryFilter) {
      setCategorySlug(storedCategoryFilter);
      sessionStorage.removeItem('categoryFilter'); // Clear it so it doesn't persist
    }
  }, []);

  // Cargar productos
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString()
        });

        if (query) params.append('search', query);
        if (categorySlug) params.append('category', categorySlug);
        if (featuredFilter) params.append('featured', featuredFilter);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);

        const payload = await apiRequest(`/products?${params.toString()}`);
        setProducts(payload.products || []);
        setTotal(payload.total || 0);
        setTotalPages(payload.totalPages || 1);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [currentPage, query, categorySlug, featuredFilter, minPrice, maxPrice]);

  // Reset a página 1 cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [query, categorySlug, featuredFilter, minPrice, maxPrice]);

  const handleClearFilters = () => {
    setQuery('');
    setCategorySlug('');
    setFeaturedFilter('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  function getPaginationPages() {
    const maxVisible = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return { pages, startPage, endPage };
  }

  const categoryOptions = [
    { slug: '', name: 'Todas las categorías' },
    ...categories
  ];

  return (
    <section id="productos-page" className="section section-dark products-page">
      <div className="products-page-head">
        <p className="section-eyebrow">Catálogo completo</p>
        <h1 className="products-page-title">Todos los productos</h1>
        <p className="products-page-subtitle">
          Explorá el catálogo por categoría, precio y búsqueda específica para encontrar el herraje que necesitás.
        </p>
      </div>

      <div className="products-filters" aria-label="Filtros de productos">
        <label className="products-filter-field products-filter-search">
          <span>Buscar producto</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej: bisagra oculta, riel, tirador..."
          />
        </label>

        <label className="products-filter-field">
          <span>Categoría</span>
          <select value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)}>
            {categoryOptions.map((cat) => (
              <option key={cat.slug || 'all'} value={cat.slug || ''}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        <label className="products-filter-field">
          <span>Destacados</span>
          <select value={featuredFilter} onChange={(event) => setFeaturedFilter(event.target.value)}>
            <option value="">Todos</option>
            <option value="true">Solo destacados</option>
            <option value="false">Solo no destacados</option>
          </select>
        </label>

        <label className="products-filter-field">
          <span>Precio mínimo</span>
          <input
            type="number"
            min="0"
            step="100"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Desde..."
          />
        </label>

        <label className="products-filter-field">
          <span>Precio máximo</span>
          <input
            type="number"
            min="0"
            step="100"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Hasta..."
          />
        </label>

        <button type="button" className="products-clear-button" onClick={handleClearFilters}>
          Limpiar filtros
        </button>
      </div>

      <p className="products-result-count">
        {loading ? 'Cargando...' : `${total} producto${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`}
      </p>

      {error && <div className="products-error">{error}</div>}

      {!loading && products.length === 0 ? (
        <div className="products-empty">
          <h2>Sin resultados para esos filtros</h2>
          <p>Probá ajustar el rango de precios, cambiar la categoría o usar otra búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="products-catalog-grid">
            {products.map((product) => (
              <article key={product.id} className="catalog-card">
                {product.images && product.images.length > 0 && (
                  <div className="catalog-card-media">
                    <img src={resolveMediaUrl(product.images[0].url)} alt={product.name} />
                  </div>
                )}
                {product.featured && <span className="catalog-card-badge">Destacado</span>}
                <p className="catalog-card-sku">SKU · {product.sku}</p>
                <h3>{product.name}</h3>
                <p className="catalog-card-description">{product.description}</p>
                <div className="catalog-card-meta">
                  <span className={!product.material ? 'catalog-card-material-empty' : ''}>
                    {product.material || 'Sin material'}
                  </span>
                  <strong>{formatPrice(product.price)}</strong>
                </div>
                <a href="#contacto" className="catalog-card-link">
                  Consultar disponibilidad →
                </a>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="products-pagination" aria-label="Paginación de productos">
              <button
                type="button"
                className="products-page-button products-page-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="Primera página"
              >
                «
              </button>
              <button
                type="button"
                className="products-page-button products-page-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                title="Página anterior"
              >
                ‹
              </button>

              {(() => {
                const { pages, startPage } = getPaginationPages();
                return (
                  <>
                    {startPage > 1 && (
                      <>
                        <button
                          type="button"
                          className={`products-page-button ${currentPage === 1 ? 'active' : ''}`}
                          onClick={() => setCurrentPage(1)}
                          disabled={loading}
                        >
                          1
                        </button>
                        {startPage > 2 && <span className="products-page-ellipsis">...</span>}
                      </>
                    )}
                    {pages.map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`products-page-button ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    ))}
                    {getPaginationPages().endPage < totalPages && (
                      <>
                        {getPaginationPages().endPage < totalPages - 1 && <span className="products-page-ellipsis">...</span>}
                        <button
                          type="button"
                          className={`products-page-button ${currentPage === totalPages ? 'active' : ''}`}
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={loading}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </>
                );
              })()}

              <button
                type="button"
                className="products-page-button products-page-nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                title="Página siguiente"
              >
                ›
              </button>
              <button
                type="button"
                className="products-page-button products-page-nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Última página"
              >
                »
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
