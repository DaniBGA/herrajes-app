import React from 'react';
import SectionHeading from './SectionHeading';
import { aboutFeatures } from '../data/siteData';
import { IconByName } from './Icons';
import aboutImage from '../images/imagen2.jpeg';

export default function AboutSection() {
  return (
    <section id="nosotros" className="section section-warm about-grid">
      <div className="about-visual">
        <div className="about-visual-surface">
          <img src={aboutImage} alt="Foto del local y equipo" className="about-visual-image" />
        </div>
        <div className="about-badge">
          <strong>+15</strong>
          <span>años en Tandil</span>
        </div>
      </div>

      <div className="about-copy">
        <SectionHeading eyebrow="Quiénes somos" title="Especialistas en herrajes para amoblamientos" />
        <p className="section-copy">
          En Almacen de Herrajes trabajamos con carpinteros, diseñadores de interiores, arquitectos y particulares que buscan herrajes de calidad para sus proyectos. Nuestro local, ubicado en 4 de Abril 404 es referencia en Tandil y zona por la variedad y disponibilidad de stock.
        </p>
        <p className="section-copy">
          Atendemos tanto a nivel minorista como mayorista, con asesoramiento personalizado en cada consulta.
        </p>

        <div className="feature-list">
          {aboutFeatures.map((feature) => (
            <article key={feature.title} className="feature-item">
              <span className="feature-icon">
                <IconByName name={feature.icon} />
              </span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}