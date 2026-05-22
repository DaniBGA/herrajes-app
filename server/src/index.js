import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';
import { initializeMailer } from './lib/mailer.js';

const app = createApp();
const port = Number(process.env.PORT) || 3001;

async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (admin) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: 'Administrador',
      role: 'OWNER'
    }
  });
}

bootstrapAdmin()
  .then(() => {
    // Initialize email service
    const mailerReady = initializeMailer();
    if (!mailerReady) {
      console.warn('Email service not fully configured. Contact form may not work.');
    }

    app.listen(port, () => {
      console.log(`Herrajes API corriendo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo iniciar la API', error);
    process.exitCode = 1;
  });
