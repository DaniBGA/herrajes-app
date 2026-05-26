import React, { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import { apiRequest, resolveMediaUrl } from '../lib/apiClient';
import { ProductGlyph } from './Icons';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load categories
        const categoriesPayload = await apiRequest('/categories');
        const allCategories = categoriesPayload.categories || [];
        setCategories(allCategories);

        // Load featured products - they come sorted by featuredPosition from backend
        const productsPayload = await apiRequest('/products?featured=true&limit=20');
        // Filter only products with featuredPosition defined
        const featuredProducts = (productsPayload.products || []).filter(p => p.featuredPosition != null);
        setProducts(featuredProducts);
      } catch (err) {
        console.error('Error loading featured products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredProducts = activeFilter === ''
    ? products
    : products.filter((product) => product.category?.slug === activeFilter);

  const productFilters = [
    { value: '', label: 'Todos' },
    ...categories.map((cat) => ({ value: cat.slug, label: cat.name }))
  ];

  return (
    <section id="productos" className="section section-dark">
      <SectionHeading
        eyebrow="Selección"
        title="Productos destacados"
        titleClassName="section-title-inverse"
        action={
          <a href="/productos" className="section-link">
            Ver todos los productos →
          </a>
        }
      />

      {loading ? (
        <p style={{ textAlign: 'center', color: '#ccc' }}>Cargando productos...</p>
      ) : filteredProducts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#ccc' }}>No hay productos destacados.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.slice(0, 4).map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-card-media">
                {product.images && product.images.length > 0 ? (
                  <img src={resolveMediaUrl(product.images[0].url)} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                ) : (
                  <ProductGlyph name="product" />
                )}
              </div>
              <p className="product-sku">SKU · {product.sku}</p>
              <h3 className="product-title">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-material">{product.material || 'N/A'}</span>
                <a href="#contacto" className="product-link">
                  Consultar →
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}