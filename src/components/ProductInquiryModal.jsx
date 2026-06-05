import React, { useEffect } from 'react';
import { buildProductWhatsAppUrl } from '../lib/whatsapp';

export default function ProductInquiryModal({ open, productName, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleSend = () => {
    const url = buildProductWhatsAppUrl(productName);
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="product-inquiry-modal" role="dialog" aria-modal="true" aria-label="Consulta por WhatsApp" onClick={onClose}>
      <div className="product-inquiry-panel" onClick={(event) => event.stopPropagation()}>
        <h3>¿Desea enviar la consulta de su producto por WhatsApp?</h3>
        <p>
          Se abrirá WhatsApp con un mensaje predeterminado para <strong>{productName}</strong>.
        </p>
        <div className="product-inquiry-actions">
          <button type="button" className="btn btn-primary product-inquiry-send" onClick={handleSend}>
            Enviar
          </button>
          <button type="button" className="btn btn-secondary product-inquiry-cancel" onClick={onClose}>
            No gracias
          </button>
        </div>
      </div>
    </div>
  );
}
