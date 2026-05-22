import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (request, response, next) => {
  try {
    const lowStockThreshold = Number(request.query.lowStockThreshold) || 10;

    const [categoriesCount, productsCount, publishedCount, lowStockCount, lowStockProducts] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.product.count({ where: { stock: { lte: lowStockThreshold }, status: 'PUBLISHED' } }),
      prisma.product.findMany({
        where: { stock: { lte: lowStockThreshold }, status: 'PUBLISHED' },
        select: { id: true, name: true, sku: true, stock: true, price: true },
        orderBy: { stock: 'asc' },
        take: 10
      })
    ]);

    return response.json({
      stats: {
        categoriesCount,
        productsCount,
        publishedCount,
        lowStockCount,
        lowStockThreshold
      },
      lowStockProducts
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
