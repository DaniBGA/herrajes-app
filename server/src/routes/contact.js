import express from 'express';
import { z } from 'zod';
import { sendContactEmail } from '../lib/mailer.js';

const router = express.Router();

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres')
});

router.post('/', async (request, response, next) => {
  try {
    const body = request.body;
    
    // Validate input
    const validatedData = contactSchema.parse(body);

    // Send email
    await sendContactEmail(validatedData);

    response.status(200).json({
      message: 'Email enviado exitosamente. Te responderemos pronto.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({
        error: 'Validación fallida',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    // Pass to error handler for other errors
    next(error);
  }
});

export default router;
