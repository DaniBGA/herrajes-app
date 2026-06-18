import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TopBanner from './components/TopBanner';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoriesSection from './components/CategoriesSection';
import FeaturedProducts from './components/FeaturedProducts';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ProductsPage from './components/ProductsPage';
import AdminPage from './components/AdminPage';
import AdminDashboard from './components/AdminDashboard';
import AdminCategoriesPage from './components/AdminCategoriesPage';
import AdminProductsPage from './components/AdminProductsPage';

const THEME_KEY = 'herrajes-accent-theme';
const THEME_DEFAULT = 'red';
const THEME_OPTIONS = ['gold', 'red'];

const THEME_TOKENS = {
  red: {
    '--accent': '#bb2f34',
    '--accent-soft': '#dd666b',
    '--accent-rgb': '187, 47, 52',
    '--accent-soft-rgb': '221, 102, 107',
    '--accent-contrast': '#f5f0e8',
    '--accent-contrast-rgb': '245, 240, 232'
  },
  gold: {
    '--accent': '#c8a96e',
    '--accent-soft': '#e4c990',
    '--accent-rgb': '200, 169, 110',
    '--accent-soft-rgb': '228, 201, 144',
    '--accent-contrast': '#111111',
    '--accent-contrast-rgb': '17, 17, 17'
  },
  black: {
    '--accent': '#1f1f1f',
    '--accent-soft': '#464646',
    '--accent-rgb': '31, 31, 31',
    '--accent-soft-rgb': '70, 70, 70',
    '--accent-contrast': '#f5f0e8',
    '--accent-contrast-rgb': '245, 240, 232'
  }
};

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return THEME_DEFAULT;
    }
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    if (savedTheme && THEME_OPTIONS.includes(savedTheme)) {
      return savedTheme;
    }
    return THEME_DEFAULT;
  });

  useLayoutEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const activeTokens = THEME_TOKENS[theme] || THEME_TOKENS[THEME_DEFAULT];

    Object.entries(activeTokens).forEach(([token, value]) => {
      root.style.setProperty(token, value);
      body.style.setProperty(token, value);
    });

    body.setAttribute('data-theme', theme);

    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage failures in restricted browsers.
    }
  }, [theme]);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = decodeURIComponent(location.hash.replace('#', ''));
    if (!targetId) {
      return;
    }

    const rafOne = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    return () => window.cancelAnimationFrame(rafOne);
  }, [location.hash, location.pathname]);

  return (
    <div className="app-shell">
      <TopBanner />
      <Header theme={theme} onThemeChange={setTheme} />
      <main>
        {location.pathname === '/productos' ? (
          <ProductsPage />
        ) : location.pathname === '/admin' ? (
          <AdminPage />
        ) : location.pathname === '/admin/dashboard' ? (
          <AdminDashboard token={window.localStorage.getItem('herrajes-admin-token')} />
        ) : location.pathname === '/admin/categorias' ? (
          <AdminCategoriesPage token={window.localStorage.getItem('herrajes-admin-token')} />
        ) : location.pathname === '/admin/productos' ? (
          <AdminProductsPage token={window.localStorage.getItem('herrajes-admin-token')} />
        ) : (
          <>
            <Hero />
            <CategoriesSection />
            <FeaturedProducts />
            <AboutSection />
            <ContactSection />
          </>
        )}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}