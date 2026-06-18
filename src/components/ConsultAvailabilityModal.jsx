import React, { useEffect } from 'react';
import { buildWhatsAppUrl } from '../data/contactInfo';
import '../styles/consult-availability-modal.css';

export default function ConsultAvailabilityModal({ open, productName, onClose, onEmail, onWhatsApp }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleWhatsAppClick = () => {
    const message = productName
      ? `Hola, quiero consultar disponibilidad por ${productName}.`
      : 'Hola, quiero consultar disponibilidad de un producto.';

    if (onWhatsApp) {
      onWhatsApp(buildWhatsAppUrl(message));
    }
  };

  return (
    <div className="consult-modal-backdrop" onClick={handleBackdropClick} role="presentation">
      <div className="consult-modal" role="dialog" aria-modal="true" aria-labelledby="consult-modal-title">
        <button type="button" className="consult-modal-close" onClick={onClose} aria-label="Cerrar modal">
          ×
        </button>

        <p className="consult-modal-eyebrow">Consultar disponibilidad</p>
        <h3 id="consult-modal-title" className="consult-modal-title">
          {productName ? productName : 'Este producto'}
        </h3>
        <p className="consult-modal-text">
          Elegí cómo querés consultar disponibilidad, precios o retiro en el local.
        </p>

        <div className="consult-modal-actions">
          <button type="button" className="consult-modal-action consult-modal-action-primary" onClick={onEmail}>
            Consultar por email
          </button>
          <button type="button" className="consult-modal-action consult-modal-action-secondary" onClick={handleWhatsAppClick}>
            Consultar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}