import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from './SectionHeading';
import { apiRequest, resolveMediaUrl } from '../lib/apiClient';
import { ProductGlyph } from './Icons';
import ConsultAvailabilityModal from './ConsultAvailabilityModal';

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [consultProduct, setConsultProduct] = useState(null);

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

  const handleOpenConsultModal = (product) => {
    setConsultProduct(product);
  };

  const handleCloseConsultModal = () => {
    setConsultProduct(null);
  };

  const handleConsultByEmail = () => {
    setConsultProduct(null);
    navigate('/#contacto');
  };

  const handleConsultByWhatsApp = (whatsappUrl) => {
    setConsultProduct(null);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

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
                  <img src={resolveMediaUrl(product.images[0].url)} alt={product.name} />
                ) : (
                  <ProductGlyph name="product" />
                )}
              </div>
              <h3 className="product-title">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-material">{product.material || 'N/A'}</span>
                <button
                  type="button"
                  className="product-link product-link-button"
                  onClick={() => handleOpenConsultModal(product)}
                >
                  Consultar →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConsultAvailabilityModal
        open={Boolean(consultProduct)}
        productName={consultProduct?.name}
        onClose={handleCloseConsultModal}
        onEmail={handleConsultByEmail}
        onWhatsApp={handleConsultByWhatsApp}
      />
    </section>
  );
}