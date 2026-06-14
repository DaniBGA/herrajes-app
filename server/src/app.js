import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import statsRoutes from './routes/stats.js';
import contactRoutes from './routes/contact.js';
import { errorHandler, notFound } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || true,
      credentials: true
    })
  );
  app.use(morgan('dev'));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

  // Production: serve frontend static files
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.resolve(
      process.cwd(),
      process.env.FRONTEND_DIST_DIR || path.join('..', 'dist')
    );

    console.log(`Serving frontend from: ${frontendPath}`);
    app.use(express.static(frontendPath));
    
    // SPA fallback: redirect non-API requests to index.html
    app.get('*', (request, response) => {
      if (!request.path.startsWith('/api')) {
        response.sendFile(path.join(frontendPath, 'index.html'));
      }
    });
  }

  app.get('/health', (request, response) => {
    response.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/contact', contactRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
