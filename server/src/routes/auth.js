import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (request, response, next) => {
  try {
    const { email, password } = loginSchema.parse(request.body);
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin) {
      return response.status(401).json({ message: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      return response.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return response.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', async (request, response) => {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return response.status(401).json({ message: 'Falta token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await prisma.adminUser.findUnique({ where: { id: payload.sub } });

    if (!admin) {
      return response.status(404).json({ message: 'Administrador no encontrado' });
    }

    return response.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch {
    return response.status(401).json({ message: 'Token inválido o vencido' });
  }
});

export default router;
