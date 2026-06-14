import React, { useEffect, useState } from 'react';
import { apiRequest, resolveMediaUrl } from '../lib/apiClient';
import '../styles/admin-products.css';

const emptyProduct = {
  categoryId: '',
  sku: '',
  name: '',
  slug: '',
  description: '',
  material: '',
  price: '',
  compareAtPrice: '',
  stock: 0,
  featured: false,
  featuredPosition: '',
  status: 'DRAFT'
};

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
}

export default function AdminProductsPage({ token }) {
  const ITEMS_PER_PAGE = 20;
  const MOBILE_PAGINATION_BREAKPOINT = 520;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [productForm, setProductForm] = useState(emptyProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageAlts, setImageAlts] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isMobilePagination, setIsMobilePagination] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_PAGINATION_BREAKPOINT : false
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const categoriesPayload = await apiRequest('/categories');
      setCategories(categoriesPayload.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchQuery, filterCategory, filterFeatured]);

  useEffect(() => {
    function updateViewportState() {
      setIsMobilePagination(window.innerWidth <= MOBILE_PAGINATION_BREAKPOINT);
    }

    updateViewportState();
    window.addEventListener('resize', updateViewportState);
    return () => window.removeEventListener('resize', updateViewportState);
  }, []);

  async function loadProducts() {
    try {
      setListLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString()
      });

      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory) params.append('category', filterCategory);
      if (filterFeatured) params.append('featured', filterFeatured);

      const payload = await apiRequest(`/products?${params.toString()}`);
      setProducts(payload.products || []);
      setTotal(payload.total || 0);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setListLoading(false);
    }
  }

  const handleImageChange = (event, index) => {
    const files = Array.from(event.target.files || []);
    const newImageFiles = [...imageFiles];
    newImageFiles[index] = files[0];
    setImageFiles(newImageFiles);
  };

  const handleAddImageField = () => {
    setImageFiles([...imageFiles, null]);
    setImageAlts([...imageAlts, '']);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Validate featured position
      if (productForm.featured && !productForm.featuredPosition) {
        throw new Error('Debes especificar una posición para un producto destacado (1-4).');
      }

      if (productForm.featured) {
        const position = parseInt(productForm.featuredPosition);
        if (isNaN(position) || position < 1 || position > 4) {
          throw new Error('La posición debe estar entre 1 y 4.');
        }

        // Check for duplicate positions in other products
        const duplicatePosition = products.find(
          (p) => p.id !== editingProductId && p.featured && p.featuredPosition === position
        );
        if (duplicatePosition) {
          throw new Error(`La posición ${position} ya está asignada a otro producto destacado.`);
        }
      }

      const formData = new FormData();
      Object.keys(productForm).forEach((key) => {
        let value = productForm[key];
        // Convert booleans to strings for FormData
        if (typeof value === 'boolean') {
          value = value ? 'true' : 'false';
        }
        formData.append(key, value);
      });

      const imageAltsToSend = [];
      imageFiles.forEach((file, index) => {
        if (file) {
          formData.append(`images`, file);
          imageAltsToSend.push(imageAlts[index] || '');
        }
      });

      // Send imageAlts as JSON string (required by backend)
      if (imageAltsToSend.length > 0) {
        formData.append('imageAlts', JSON.stringify(imageAltsToSend));
      }

      const endpoint = editingProductId ? `/products/${editingProductId}` : '/products';
      const method = editingProductId ? 'PUT' : 'POST';

      await apiRequest(endpoint, {
        method,
        body: formData
      });

      setProductForm(emptyProduct);
      setImageFiles([]);
      setImageAlts(['']);
      setExistingImages([]);
      setShowForm(false);
      setEditingProductId(null);
      setMessage(editingProductId ? 'Producto actualizado exitosamente.' : 'Producto creado exitosamente.');
      setCurrentPage(1);
      await loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  async function handleDeleteProduct(productId) {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
      setDeleting(productId);
      await apiRequest(`/products/${productId}`, { method: 'DELETE' });
      setMessage('Producto eliminado exitosamente.');
      setCurrentPage(1);
      await loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  }

  function handleEditProduct(product) {
    setProductForm({
      categoryId: product.categoryId,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      material: product.material || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice || '',
      stock: product.stock,
      featured: Boolean(product.featured),
      featuredPosition: product.featuredPosition || '',
      status: product.status
    });
    setEditingProductId(product.id);
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImageAlts(['']);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setProductForm(emptyProduct);
    setImageFiles([]);
    setImageAlts(['']);
    setExistingImages([]);
    setDeletingImageId(null);
    setEditingProductId(null);
    setShowForm(false);
  }

  async function handleDeleteExistingImage(imageId) {
    if (!editingProductId || !imageId) return;
    if (!window.confirm('¿Eliminar esta imagen del producto?')) return;

    try {
      setDeletingImageId(imageId);
      await apiRequest(`/products/${editingProductId}/images/${imageId}`, {
        method: 'DELETE'
      });

      setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
      setMessage('Imagen eliminada exitosamente.');
      await loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingImageId(null);
    }
  }

  function getPaginationPages() {
    const maxVisible = isMobilePagination ? 4 : 10;
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterFeatured('');
    setCurrentPage(1);
  };

  return (
    <div className="admin-products">
      <h1>Gestionar Productos</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="products-header">
        <button
          className="btn btn-primary"
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <h2>{editingProductId ? 'Editar Producto' : 'Nuevo Producto'}</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                required
              >
                <option value="">Seleccionar...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>SKU *</label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Slug (URL)</label>
              <input
                type="text"
                value={productForm.slug}
                onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                placeholder="Auto-generado desde nombre"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Material</label>
              <input
                type="text"
                value={productForm.material}
                onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio (ARS) *</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Precio Comparativo</label>
              <input
                type="number"
                value={productForm.compareAtPrice}
                onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked, featuredPosition: e.target.checked ? productForm.featuredPosition : '' })}
                />
                {' '}Producto Destacado
              </label>
            </div>

            {productForm.featured && (
              <div className="form-group">
                <label>Posición en Inicio (1-4) *</label>
                <input
                  type="number"
                  value={productForm.featuredPosition}
                  onChange={(e) => setProductForm({ ...productForm, featuredPosition: e.target.value })}
                  min="1"
                  max="4"
                  placeholder="Ej: 1, 2, 3, 4"
                  required={productForm.featured}
                />
                <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                  Máximo 4 productos destacados. No se permiten posiciones duplicadas.
                </small>
              </div>
            )}

            <div className="form-group">
              <label>Estado</label>
              <select
                value={productForm.status}
                onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>
          </div>

          <div className="images-section">
            <h3>Imágenes del Producto</h3>

            {editingProductId && (
              <div className="existing-images-section">
                <p className="existing-images-title">Imágenes actuales</p>
                {existingImages.length === 0 ? (
                  <p className="existing-images-empty">Este producto no tiene imágenes cargadas.</p>
                ) : (
                  <div className="existing-images-grid">
                    {existingImages.map((image) => (
                      <div key={image.id} className="existing-image-card">
                        <img src={resolveMediaUrl(image.url)} alt={image.alt || productForm.name} />
                        <button
                          type="button"
                          className="btn btn-small btn-delete"
                          onClick={() => handleDeleteExistingImage(image.id)}
                          disabled={deletingImageId === image.id}
                        >
                          {deletingImageId === image.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {imageFiles.map((file, index) => (
              <div key={index} className="image-input-group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                />
                <input
                  type="text"
                  placeholder="Texto alternativo (alt)"
                  value={imageAlts[index]}
                  onChange={(e) => {
                    const newAlts = [...imageAlts];
                    newAlts[index] = e.target.value;
                    setImageAlts(newAlts);
                  }}
                />
                {file && <span className="file-name">{file.name}</span>}
              </div>
            ))}
            <button type="button" onClick={handleAddImageField} className="btn btn-secondary">
              + Agregar Imagen
            </button>
            {editingProductId && imageFiles.some(Boolean) && (
              <p className="images-replace-note">
                Al guardar con nuevas imágenes, se reemplazarán las imágenes actuales.
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-submit">
            {loading ? (editingProductId ? 'Actualizando...' : 'Guardando...') : (editingProductId ? 'Guardar Cambios' : 'Crear Producto')}
          </button>
        </form>
      )}

      <div className="products-filters-section">
        <div className="products-filters">
          <div className="filter-group">
            <label>Búsqueda</label>
            <input
              type="search"
              placeholder="Buscar por nombre, SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-group">
            <label>Categoría</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Destacados</label>
            <select
              value={filterFeatured}
              onChange={(e) => {
                setFilterFeatured(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value="true">Solo Destacados</option>
              <option value="false">Solo No Destacados</option>
            </select>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleClearFilters}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="products-list">
        <div className="list-header">
          <h2>Productos {total > 0 && `(${total})`}</h2>
          <p className="page-info">
            {listLoading ? 'Cargando...' : `Página ${currentPage} de ${totalPages}`}
          </p>
        </div>

        {listLoading ? (
          <p className="loading-state">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p className="empty-state">No hay productos en esta categoría.</p>
        ) : (
          <>
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>SKU</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className={`product-row ${product.status.toLowerCase()}`}>
                      <td className="product-image-cell">
                        {product.images && product.images.length > 0 ? (
                          <img src={resolveMediaUrl(product.images[0].url)} alt={product.name} />
                        ) : (
                          <span className="no-image">Sin imagen</span>
                        )}
                      </td>
                      <td className="product-sku">{product.sku}</td>
                      <td className="product-name">
                        <div className="product-name-main">
                          <strong>{product.name}</strong>
                          {product.featured && <span className="featured-badge featured-highlight">Destacado</span>}
                        </div>
                        <small>{product.category?.name}</small>
                      </td>
                      <td className="product-price">{formatCurrency(product.price)}</td>
                      <td className={`product-stock ${product.stock <= 10 ? 'critical' : ''}`}>
                        {product.stock}
                      </td>
                      <td className="product-status">
                        <span className={`status-badge ${product.status.toLowerCase()}`}>
                          {product.status === 'DRAFT' && 'Borrador'}
                          {product.status === 'PUBLISHED' && 'Publicado'}
                          {product.status === 'ARCHIVED' && 'Archivado'}
                        </span>
                      </td>
                      <td className="product-actions">
                        <div className="product-actions-inner">
                          <button
                            className="btn btn-small btn-edit"
                            title="Editar producto"
                            onClick={() => handleEditProduct(product)}
                          >
                            ✎
                          </button>
                          <button
                            className="btn btn-small btn-delete"
                            title="Eliminar producto"
                            disabled={deleting === product.id}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            {deleting === product.id ? '...' : '🗑'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {!isMobilePagination && (
                  <button
                    className="btn btn-secondary btn-pagination"
                    disabled={currentPage === 1 || listLoading}
                    onClick={() => setCurrentPage(1)}
                    title="Primera página"
                  >
                    «
                  </button>
                )}
                <button
                  className="btn btn-secondary btn-pagination"
                  disabled={currentPage === 1 || listLoading}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  title="Página anterior"
                >
                  ‹
                </button>

                {(() => {
                  const { pages, startPage } = getPaginationPages();
                  const shouldShowLeadingFirst = startPage > 1;
                  const shouldShowLeadingEllipsis = startPage > 2;
                  const { endPage } = getPaginationPages();
                  const shouldShowTrailingLast = endPage < totalPages;
                  const shouldShowTrailingEllipsis = endPage < totalPages - 1;

                  return (
                    <>
                      {shouldShowLeadingFirst && (
                        <>
                          <button
                            className={`btn btn-secondary btn-pagination ${currentPage === 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(1)}
                            disabled={listLoading}
                          >
                            1
                          </button>
                          {shouldShowLeadingEllipsis && <span className="pagination-ellipsis">...</span>}
                        </>
                      )}
                      {pages.map((page) => (
                        <button
                          key={page}
                          className={`btn btn-secondary btn-pagination ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                          disabled={listLoading}
                        >
                          {page}
                        </button>
                      ))}
                      {shouldShowTrailingLast && (
                        <>
                          {shouldShowTrailingEllipsis && <span className="pagination-ellipsis">...</span>}
                          <button
                            className={`btn btn-secondary btn-pagination ${currentPage === totalPages ? 'active' : ''}`}
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={listLoading}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}

                <button
                  className="btn btn-secondary btn-pagination"
                  disabled={currentPage === totalPages || listLoading}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  title="Página siguiente"
                >
                  ›
                </button>
                {!isMobilePagination && (
                  <button
                    className="btn btn-secondary btn-pagination"
                    disabled={currentPage === totalPages || listLoading}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Última página"
                  >
                    »
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
