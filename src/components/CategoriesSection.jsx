import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from './SectionHeading';
import { apiRequest, resolveMediaUrl } from '../lib/apiClient';

export default function CategoriesSection() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const payload = await apiRequest('/categories');
        const allCategories = payload.categories || [];
        // Filter only categories with featuredPosition defined and sort by position
        const featuredCategories = allCategories
          .filter(cat => cat.featuredPosition != null)
          .sort((a, b) => a.featuredPosition - b.featuredPosition);
        setCategories(featuredCategories);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const handleCategoryClick = (categorySlug) => {
    // Navigate to products page with category filter
    navigate('/productos');
    // Store the filter in sessionStorage so ProductsPage can read it
    sessionStorage.setItem('categoryFilter', categorySlug);
  };

  return (
    <section id="categorias" className="section section-light">
      <SectionHeading
        eyebrow="Catálogo"
        title="Todo para el amoblamiento de interiores"
        action={
          <a href="/productos" className="section-link">
            Ver catálogo completo →
          </a>
        }
      />

      {loading ? (
        <p style={{ textAlign: 'center', color: '#999' }}>Cargando categorías...</p>
      ) : (
        <div className="category-grid">
          {categories.slice(0, 8).map((category) => (
            <article
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCategoryClick(category.slug);
                }
              }}
            >
              {category.image && (
                <div className="category-card-image">
                  <img src={resolveMediaUrl(category.image)} alt={category.imageAlt || category.name} />
                </div>
              )}
              <div className="category-card-ornament" aria-hidden="true" />
              <div className="category-card-content">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}