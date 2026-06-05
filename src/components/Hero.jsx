import React from 'react';
import { heroStats } from '../data/siteData';
import { ChatIcon } from './Icons';
import localImage from '../images/Imagen1.jpeg';

export default function Hero() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <p className="hero-kicker">Herrajes para amoblamientos · Tandil</p>
        <h1>Calidad que <em>define</em> cada detalle</h1>
        <p className="hero-text">
          Venta y distribución de herrajes premium para muebles y amoblamientos.
        </p>

        <div className="hero-actions">
          <a href="#categorias" className="button button-primary">
            Ver catálogo
          </a>
          <a href="#contacto" className="button button-secondary">
            <ChatIcon />
            Hacer una consulta
          </a>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-panel hero-panel-ambient" />
        <div className="hero-panel hero-panel-card">
          <img src={localImage} alt="Fotografía del local" className="hero-panel-image" />
        </div>
      </div>

      <div className="hero-stats">
        {heroStats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <article className="hero-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
            {index < heroStats.length - 1 ? <span className="hero-stat-divider" /> : null}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}