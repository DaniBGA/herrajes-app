import React from 'react';
import SectionHeading from './SectionHeading';

const logoModules = import.meta.glob('../images/*logo*', {
  eager: true,
  import: 'default',
  query: '?url'
});

const providerLogos = Object.entries(logoModules)
  .map(([path, url]) => {
    const fileName = path.split('/').pop() || '';
    const match = fileName.match(/logo(\d+)/i);
    const order = match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;

    return {
      path,
      url,
      fileName,
      order,
      alt: fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
    };
  })
  .sort((left, right) => left.order - right.order || left.fileName.localeCompare(right.fileName));

const carouselItems = [...providerLogos, ...providerLogos];

export default function ProvidersSection() {
  return (
    <section id="proveedores" className="section section-light providers-section">
      <SectionHeading
        eyebrow="Proveedores"
        title="Nuestros proovedores"
        titleClassName="providers-title"
      />

      <p className="providers-intro">
        Trabajamos con marcas y distribuidores que respaldan la calidad de cada herraje que ofrecemos.
      </p>

      {providerLogos.length === 0 ? (
        <p className="providers-empty">No se encontraron logos en la carpeta de imágenes.</p>
      ) : (
        <div className="providers-carousel" aria-label="Carrusel de proveedores">
          <div className="providers-track">
            {carouselItems.map((logo, index) => (
              <article key={`${logo.path}-${index}`} className="providers-item">
                <img src={logo.url} alt={logo.alt || 'Logo de proveedor'} className="providers-logo" />
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
