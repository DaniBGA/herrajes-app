import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiClient';
import '../styles/admin-categories.css';

const emptyCategory = {
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
  featuredPosition: '',
  imageAlt: ''
};

export default function AdminCategoriesPage({ token }) {
  const ITEMS_PER_PAGE = 10;

  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [categories.length]);

  async function loadCategories() {
    try {
      setLoading(true);
      const payload = await apiRequest('/categories');
      setCategories(payload.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Validate featured position
      if (categoryForm.featuredPosition) {
        const position = parseInt(categoryForm.featuredPosition);
        if (isNaN(position) || position < 1 || position > 8) {
          throw new Error('La posición debe estar entre 1 y 8.');
        }

        // Check for duplicate positions in other categories
        const duplicatePosition = categories.find(
          (c) => c.id !== editingId && c.featuredPosition === position
        );
        if (duplicatePosition) {
          throw new Error(`La posición ${position} ya está asignada a otra categoría destacada.`);
        }
      }

      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('slug', categoryForm.slug);
      formData.append('description', categoryForm.description || '');
      formData.append('sortOrder', categoryForm.sortOrder || 0);
      formData.append('featuredPosition', categoryForm.featuredPosition ? parseInt(categoryForm.featuredPosition) : '');
      formData.append('imageAlt', categoryForm.imageAlt || '');
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      if (editingId) {
        const payload = await apiRequest(`/categories/${editingId}`, {
          method: 'PUT',
          body: formData
        });
        setCategories((current) => current.map((category) => (category.id === editingId ? payload.category : category)));
        setEditingId(null);
        setCategoryForm(emptyCategory);
        setSelectedImage(null);
        setCurrentImage(null);
        setMessage('Categoría actualizada exitosamente.');
      } else {
        const payload = await apiRequest('/categories', {
          method: 'POST',
          body: formData
        });
        setCategories((current) => [...current, payload.category]);
        setCategoryForm(emptyCategory);
        setSelectedImage(null);
        setCurrentImage(null);
        setMessage('Categoría creada exitosamente.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingId(category.id);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sortOrder: category.sortOrder || 0,
      featuredPosition: category.featuredPosition || '',
      imageAlt: category.imageAlt || ''
    });
    setCurrentImage(category.image || null);
    setSelectedImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCategoryForm(emptyCategory);
    setSelectedImage(null);
    setCurrentImage(null);
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;

    try {
      setLoading(true);
      setError('');
      setMessage('');
      await apiRequest(`/categories/${category.id}`, { method: 'DELETE' });
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setMessage('Categoría eliminada exitosamente.');
      setEditingId((current) => (current === category.id ? null : current));
      if (currentPage > Math.ceil(Math.max(categories.length - 1, 1) / ITEMS_PER_PAGE)) {
        setCurrentPage(Math.max(1, Math.ceil(Math.max(categories.length - 1, 1) / ITEMS_PER_PAGE)));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const paginatedCategories = categories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="admin-categories">
      <h1>Gestionar Categorías</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="categories-container">
        <div className="form-section">
          <h2>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Slug (URL)</label>
              <input
                type="text"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                placeholder="Auto-generado desde nombre"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Orden</label>
              <input
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: Number(e.target.value) })}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Posición en Inicio (Destacada)</label>
              <input
                type="number"
                value={categoryForm.featuredPosition}
                onChange={(e) => setCategoryForm({ ...categoryForm, featuredPosition: e.target.value })}
                min="1"
                max="8"
                placeholder="Déjalo vacío si no deseas destacarla (1-8)"
              />
              <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                Máximo 8 categorías destacadas. No se permiten posiciones duplicadas. Déjalo vacío para no destacar.
              </small>
            </div>

            <div className="form-group">
              <label>Imagen de la Categoría</label>
              {(currentImage || selectedImage) && (
                <div style={{ marginBottom: '10px' }}>
                  <img 
                    src={selectedImage ? URL.createObjectURL(selectedImage) : currentImage} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setSelectedImage(e.target.files[0] || null);
                }}
              />
              <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                Sube una imagen para esta categoría (JPG, PNG, etc.)
              </small>
            </div>

            <div className="form-group">
              <label>Texto Alternativo de la Imagen</label>
              <input
                type="text"
                value={categoryForm.imageAlt}
                onChange={(e) => setCategoryForm({ ...categoryForm, imageAlt: e.target.value })}
                placeholder="Describe la imagen (para accesibilidad)"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary btn-cancel-edit" onClick={handleCancelEdit}>
                Cancelar edición
              </button>
            )}
          </form>
        </div>

        <div className="list-section">
          <h2>Categorías Existentes ({categories.length})</h2>
          {categories.length === 0 ? (
            <p className="empty-state">No hay categorías creadas aún.</p>
          ) : (
            <>
              <div className="categories-list">
              {paginatedCategories.map((cat) => (
                <div key={cat.id} className="category-item">
                  {cat.image && (
                    <div className="category-image-preview">
                      <img src={cat.image} alt={cat.imageAlt || cat.name} />
                    </div>
                  )}
                  <div className="category-info" style={{ flex: 1 }}>
                    <h3>{cat.name}</h3>
                    <p className="category-slug">/{cat.slug}</p>
                    {cat.description && <p className="category-description">{cat.description}</p>}
                    <p className="category-meta">{cat._count?.products || 0} productos</p>
                  </div>
                  <div className="category-actions">
                    <button type="button" className="btn btn-small btn-edit" onClick={() => handleEditCategory(cat)}>
                      Editar
                    </button>
                    <button type="button" className="btn btn-small btn-delete" onClick={() => handleDeleteCategory(cat)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              </div>

              {totalPages > 1 && (
                <div className="categories-pagination">
                  <button className="btn btn-secondary" disabled={currentPage === 1 || loading} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                    ‹ Anterior
                  </button>
                  <span className="categories-page-indicator">Página {currentPage} de {totalPages}</span>
                  <button className="btn btn-secondary" disabled={currentPage === totalPages || loading} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                    Siguiente ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
