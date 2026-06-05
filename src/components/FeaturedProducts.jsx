import React, { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import { apiRequest } from '../lib/apiClient';
import { ProductGlyph } from './Icons';
import ProductImageCarousel from './ProductImageCarousel';
import ImageLightbox from './ImageLightbox';
import ProductInquiryModal from './ProductInquiryModal';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [inquiryProduct, setInquiryProduct] = useState(null);

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

  const closeLightbox = () => setActiveLightbox(null);

  const moveLightboxPrevious = () => {
    if (!activeLightbox) return;
    setActiveLightbox((current) => ({
      ...current,
      index: (current.index - 1 + current.images.length) % current.images.length
    }));
  };

  const moveLightboxNext = () => {
    if (!activeLightbox) return;
    setActiveLightbox((current) => ({
      ...current,
      index: (current.index + 1) % current.images.length
    }));
  };

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
              <ProductImageCarousel
                className="product-card-media"
                images={product.images || []}
                title={product.name}
                fallback={<ProductGlyph name="product" />}
                onOpenImage={(index) => setActiveLightbox({ product, index })}
              />
              <h3 className="product-title">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-material">{product.material || 'N/A'}</span>
                <button type="button" className="product-link" onClick={() => setInquiryProduct(product)}>
                  Consultar →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeLightbox && (
        <ImageLightbox
          open
          images={activeLightbox.product.images || []}
          index={activeLightbox.index}
          title={activeLightbox.product.name}
          onClose={closeLightbox}
          onPrev={moveLightboxPrevious}
          onNext={moveLightboxNext}
        />
      )}

      <ProductInquiryModal
        open={Boolean(inquiryProduct)}
        productName={inquiryProduct?.name || ''}
        onClose={() => setInquiryProduct(null)}
      />
    </section>
  );
}