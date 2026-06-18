export const WHATSAPP_PHONE = '542494607065';

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}`;

export function buildWhatsAppUrl(message) {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `${WHATSAPP_URL}${text}`;
}