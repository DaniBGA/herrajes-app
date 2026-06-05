import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, deleteFile, getFileUrl } from '../lib/uploads.js';

const router = express.Router();

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
  featuredPosition: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  }, z.coerce.number().int().positive().optional()),
  imageAlt: z.string().optional().nullable()
});

router.get('/', async (request, response, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return response.json({ categories });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, upload.single('image'), async (request, response, next) => {
  try {
    const body = categorySchema.parse(request.body);
    const slug = body.slug || body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const imageUrl = getFileUrl(request.file, request);

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        sortOrder: body.sortOrder ?? 0,
        featuredPosition: body.featuredPosition ?? null,
        image: imageUrl,
        imageAlt: body.imageAlt || null
      }
    });

    return response.status(201).json({ category });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', requireAuth, upload.single('image'), async (request, response, next) => {
  try {
    const body = categorySchema.parse(request.body);
    const slug = body.slug || body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Get current category to check if we need to delete old image
    const currentCategory = await prisma.category.findUnique({
      where: { id: request.params.id }
    });

    let imageUrl = currentCategory.image;
    if (request.file) {
      // Delete old image if exists and is not null
      if (currentCategory.image) {
        deleteFile(currentCategory.image);
      }
      imageUrl = getFileUrl(request.file, request);
    }

    const category = await prisma.category.update({
      where: { id: request.params.id },
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        sortOrder: body.sortOrder ?? 0,
        featuredPosition: body.featuredPosition ?? null,
        image: imageUrl,
        imageAlt: body.imageAlt || null
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return response.json({ category });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth, async (request, response, next) => {
  try {
    const linkedProductsCount = await prisma.product.count({
      where: { categoryId: request.params.id }
    });

    if (linkedProductsCount > 0) {
      return response.status(400).json({
        message: 'No se puede eliminar una categoría con productos asociados'
      });
    }

    // Get category to delete its image
    const category = await prisma.category.findUnique({
      where: { id: request.params.id }
    });

    deleteFile(category.image);

    await prisma.category.delete({
      where: { id: request.params.id }
    });

    return response.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    return next(error);
  }
});

export default router;
