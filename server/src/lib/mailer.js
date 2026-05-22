import nodemailer from 'nodemailer';

let transporter;

export function initializeMailer() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('Email configuration incomplete. Email sending may not work.');
    return false;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  return true;
}

export async function sendContactEmail(contactData) {
  if (!transporter) {
    throw new Error('Email service not configured');
  }

  const { name, email, phone, message } = contactData;
  const businessEmail = process.env.BUSINESS_EMAIL || process.env.ADMIN_EMAIL;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: businessEmail,
    replyTo: email,
    subject: `Nueva consulta de ${name} - Almacen de Herrajes`,
    html: `
      <h2>Nueva consulta recibida</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>
      <h3>Mensaje:</h3>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Este email fue enviado desde el formulario de contacto del sitio web.</small></p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
