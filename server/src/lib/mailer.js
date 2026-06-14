import nodemailer from 'nodemailer';

let transporter;

export function initializeMailer() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase();
  const smtpRejectUnauthorized = String(process.env.SMTP_REJECT_UNAUTHORIZED || 'true').toLowerCase();

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('Email configuration incomplete. Email sending may not work.');
    return false;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure
      ? ['true', '1', 'yes', 'on'].includes(smtpSecure)
      : smtpPort === 465,
    tls: {
      rejectUnauthorized: !['false', '0', 'no', 'off'].includes(smtpRejectUnauthorized)
    },
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
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'Almacen de Herrajes';

  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
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
    `,
    text: [
      'Nueva consulta recibida',
      `Nombre: ${name}`,
      `Email: ${email}`,
      `Teléfono: ${phone}`,
      '',
      'Mensaje:',
      message,
      '',
      'Enviado desde el formulario de contacto del sitio web.'
    ].join('\n')
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
