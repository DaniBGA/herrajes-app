import React, { useEffect } from 'react';
import { resolveMediaUrl } from '../lib/apiClient';

export default function ImageLightbox({ open, images = [], index = 0, title, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrev();
      if (event.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, onPrev, onNext]);

  if (!open || images.length === 0) {
    return null;
  }

  const safeIndex = ((index % images.length) + images.length) % images.length;
  const currentImage = images[safeIndex];

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={title || 'Vista previa de imagen'} onClick={onClose}>
      <div className="image-lightbox-panel" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="image-lightbox-close" onClick={onClose} aria-label="Cerrar imagen">×</button>
        <button type="button" className="image-lightbox-nav image-lightbox-nav-prev" onClick={onPrev} aria-label="Imagen anterior">‹</button>
        <img src={resolveMediaUrl(currentImage.url)} alt={currentImage.alt || title || 'Imagen ampliada'} className="image-lightbox-image" />
        <button type="button" className="image-lightbox-nav image-lightbox-nav-next" onClick={onNext} aria-label="Imagen siguiente">›</button>
        <div className="image-lightbox-caption">
          <strong>{title}</strong>
          <span>{safeIndex + 1} / {images.length}</span>
        </div>
      </div>
    </div>
  );
}
