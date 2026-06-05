export const WHATSAPP_PHONE_NUMBER = '5492494000000';

export function buildProductWhatsAppUrl(productName) {
  const message = `hola me interesa obtener informacion sobre : ${productName}.`;
  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}
