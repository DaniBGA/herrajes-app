import React from 'react';
import logoImage from '../images/Captura_de_pantalla_de_2026-05-06_17-09-36-removebg-preview.png';
import { footerColumns } from '../data/siteData';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={logoImage} alt="Almacen de Herrajes Logo" className="footer-logo" style={{ width: '180px', height: 'auto', marginBottom: '16px' }} />
          <p>
            Venta y distribución de herrajes para amoblamiento en Tandil y la región. Atención personalizada, stock permanente.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="footer-title">{column.title}</p>
            <ul className="footer-links">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>© 2025 Almacen de Herrajes · Tandil, Buenos Aires</p>
        <p>
          Diseño y desarrollo · <span>Grupo Vexus</span>
        </p>
      </div>
    </footer>
  );
}