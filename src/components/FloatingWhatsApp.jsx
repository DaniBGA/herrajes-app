import React from 'react';
import { WhatsAppIcon } from './Icons';

export default function FloatingWhatsApp() {
  return (
    <a href="https://wa.me/5492494000000" className="floating-whatsapp" target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp">
      <WhatsAppIcon />
    </a>
  );
}