import React, { useState } from 'react';
import SectionHeading from './SectionHeading';
import { contactChannels } from '../data/siteData';
import { IconByName } from './Icons';
import { apiRequest } from '../lib/apiClient';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await apiRequest('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      setMessage('Consulta enviada exitosamente. Te responderemos pronto.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Error al enviar la consulta. Intenta de nuevo.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contacto" className="section section-dark contact-grid">
      <div className="contact-copy">
        <SectionHeading eyebrow="Contacto" title="¿Necesitás un herraje específico?" titleClassName="section-title-inverse" />
        <p className="section-copy section-copy-inverse">
          Consultanos por WhatsApp, redes sociales o visitanos en el local. Te respondemos rápido con disponibilidad y precios.
        </p>

        <div className="contact-channel-list">
          {contactChannels.map((channel) => (
            <a key={channel.label} href={channel.href} target="_blank" rel="noreferrer" className="contact-channel">
              <span className={`contact-channel-icon ${channel.accent}`}>
                <IconByName name={channel.icon} />
              </span>
              <span>
                <strong>{channel.label}</strong>
                <span>{channel.value}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="contact-form-panel">
        <h3>Envianos tu consulta</h3>
        {message && <div style={{ color: '#a8d66e', marginBottom: '14px', fontSize: '13px' }}>{message}</div>}
        {error && <div style={{ color: '#ffb2b5', marginBottom: '14px', fontSize: '13px' }}>{error}</div>}
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre</span>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Teléfono / WhatsApp</span>
            <input
              type="tel"
              name="phone"
              placeholder="+54 9 249..."
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>¿Qué necesitás?</span>
            <textarea
              name="message"
              placeholder="Consultá por un producto, pedí una cotización o dejanos tu mensaje..."
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className="button button-primary button-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar consulta'}
          </button>
        </form>
      </div>
    </section>
  );
}