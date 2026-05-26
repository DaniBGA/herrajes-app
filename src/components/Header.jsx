import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../images/Captura_de_pantalla_de_2026-05-06_17-09-36-removebg-preview.png';
import { navLinks } from '../data/siteData';

const themeOptions = [
  { value: 'gold', label: 'Dorado' },
  { value: 'red', label: 'Rojo' }
];

export default function Header({ theme, onThemeChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mainLinks = navLinks.filter((link) => !link.cta);
  const ctaLink = navLinks.find((link) => link.cta);

  const scrollToSection = (sectionId) => {
    if (!sectionId) return;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInternalNavigation = (event, link) => {
    if (!link.sectionId) return;
    event.preventDefault();
    setMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => scrollToSection(link.sectionId));
      });
      return;
    }

    scrollToSection(link.sectionId);
  };

  const handleLogoClick = (event) => {
    event.preventDefault();
    setMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleThemeSelect = (event, value) => {
    onThemeChange(value);
    const details = event.currentTarget.closest('details');
    if (details) {
      details.removeAttribute('open');
    }
  };

  return (
    <header className="site-header">
      <a href="/" className="brand" onClick={handleLogoClick}>
        <img src={logoImage} alt="Almacen de Herrajes Logo" className="brand-logo" />
      </a>

      <button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Abrir menú">
        <span />
        <span />
        <span />
      </button>

      <nav className={menuOpen ? 'site-nav is-open' : 'site-nav'}>
        {mainLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noreferrer' : undefined}
            className="nav-link"
            onClick={(event) => handleInternalNavigation(event, link)}
          >
            {link.label}
          </a>
        ))}

        <div className="nav-actions">
          <details className="theme-dropdown">
            <summary className="theme-dropdown-trigger" aria-label="Cambiar color secundario" title="Cambiar color secundario">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 3a9 9 0 1 0 9 9c0-1.64-1.27-2.8-2.9-2.8h-2.3a1.8 1.8 0 0 1 0-3.6h1.7A2.5 2.5 0 0 0 20 3h-8Zm-5.7 9a1.4 1.4 0 1 1 2.8 0 1.4 1.4 0 0 1-2.8 0Zm2-4.2a1.4 1.4 0 1 1 2.8 0 1.4 1.4 0 0 1-2.8 0Zm6.6 0a1.4 1.4 0 1 1 2.8 0 1.4 1.4 0 0 1-2.8 0Z" />
              </svg>
            </summary>
            <div className="theme-dropdown-menu" role="menu" aria-label="Seleccionar color secundario">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={theme === option.value}
                  className={theme === option.value ? 'theme-dropdown-option is-active' : 'theme-dropdown-option'}
                  onClick={(event) => handleThemeSelect(event, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </details>

          {ctaLink ? (
            <a
              href={ctaLink.href}
              target={ctaLink.external ? '_blank' : undefined}
              rel={ctaLink.external ? 'noreferrer' : undefined}
              className="nav-link nav-link-cta"
              onClick={(event) => handleInternalNavigation(event, ctaLink)}
            >
              {ctaLink.label}
            </a>
          ) : null}
        </div>
      </nav>
    </header>
  );
}