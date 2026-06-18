import React from 'react';
import { WhatsAppIcon } from './Icons';
import { WHATSAPP_URL } from '../data/contactInfo';

export default function FloatingWhatsApp() {
  return (
    <a href={WHATSAPP_URL} className="floating-whatsapp" target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp">
      <WhatsAppIcon />
    </a>
  );
}