import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, deleteFile, deleteFiles } from '../lib/uploads.js';

const router = express.Router();

const productSchema = z.object({
  categoryId: z.string().min(1),
  sku: z.string().min(2),
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().min(5),
  material: z.string().optional().nullable(),
  price: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return 0;
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? Math.trunc(parsed) : value;
  }, z.coerce.number().int().nonnegative()),
  compareAtPrice: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? Math.trunc(parsed) : value;
  }, z.coerce.number().int().nonnegative().optional()),
  stock: z.coerce.number().int().nonnegative().optional(),
  featured: z.preprocess((val) => {
    if (typeof val === 'string') {
      const normalized = val.trim().toLowerCase();
      if (['true', '1', 'on', 'yes'].includes(normalized)) return true;
      if (['false', '0', 'off', 'no', ''].includes(normalized)) return false;
    }
    return val;
  }, z.boolean().optional()),
  featuredPosition: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  }, z.coerce.number().int().positive().optional()),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  imageAlts: z.string().optional()
});

router.get('/', async (request, response, next) => {
  try {
    const page = Math.max(Number(request.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 20);
    const skip = (page - 1) * limit;
    const search = String(request.query.search || '').trim();
    const category = String(request.query.category || '');
    const minPrice = request.query.minPrice ? Number(request.query.minPrice) : undefined;
    const maxPrice = request.query.maxPrice ? Number(request.query.maxPrice) : undefined;
    const featured = request.query.featured;

    const where = {
      ...(category && category !== 'all' ? { category: { slug: category } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {}),
      ...(Number.isFinite(minPrice) || Number.isFinite(maxPrice)
        ? {
            price: {
              ...(Number.isFinite(minPrice) ? { gte: minPrice } : {}),
              ...(Number.isFinite(maxPrice) ? { lte: maxPrice } : {})
            }
          }
        : {}),
      ...(featured === 'true' ? { featured: true } : featured === 'false' ? { featured: false } : {})
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: featured === 'true' 
          ? [{ featuredPosition: 'asc' }, { createdAt: 'desc' }]
          : [{ createdAt: 'desc' }],
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      })
    ]);

    return response.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, upload.array('images', 12), async (request, response, next) => {
  try {
    const body = productSchema.parse(request.body);
    const slug = body.slug || body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const imageAlts = body.imageAlts ? JSON.parse(body.imageAlts) : [];
    const files = request.files || [];

    const product = await prisma.product.create({
      data: {
        categoryId: body.categoryId,
        sku: body.sku,
        name: body.name,
        slug,
        description: body.description,
        material: body.material || null,
        price: body.price,
        compareAtPrice: body.compareAtPrice ?? null,
        stock: body.stock ?? 0,
        featured: body.featured ?? false,
        featuredPosition: body.featuredPosition || null,
        status: body.status || 'DRAFT',
        images: {
          create: files.map((file, index) => ({
            url: `/uploads/${file.filename}`,
            alt: imageAlts[index] || body.name,
            sortOrder: index
          }))
        }
      },
      include: {
        category: true,
        images: true
      }
    });

    return response.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', requireAuth, upload.array('images', 12), async (request, response, next) => {
  try {
    const body = productSchema.parse(request.body);
    const files = request.files || [];

    const existingProduct = await prisma.product.findUnique({
      where: { id: request.params.id },
      include: { images: true }
    });

    if (!existingProduct) {
      return response.status(404).json({ message: 'Producto no encontrado' });
    }

    const slug = body.slug || body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const imageAlts = body.imageAlts ? JSON.parse(body.imageAlts) : [];

    // If new images are uploaded, delete old ones
    if (files.length > 0 && existingProduct.images.length > 0) {
      deleteFiles(existingProduct.images.map(img => img.url));
    }

    const product = await prisma.product.update({
      where: { id: request.params.id },
      data: {
        categoryId: body.categoryId,
        sku: body.sku,
        name: body.name,
        slug,
        description: body.description,
        material: body.material || null,
        price: body.price,
        compareAtPrice: body.compareAtPrice ?? null,
        stock: body.stock ?? 0,
        featured: body.featured ?? false,
        featuredPosition: body.featuredPosition || null,
        status: body.status || 'DRAFT',
        ...(files.length > 0 && {
          images: {
            deleteMany: {},
            create: files.map((file, index) => ({
              url: `/uploads/${file.filename}`,
              alt: imageAlts[index] || body.name,
              sortOrder: index
            }))
          }
        })
      },
      include: {
        category: true,
        images: true
      }
    });

    return response.json({ product });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id/images/:imageId', requireAuth, async (request, response, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: request.params.id },
      include: { images: true }
    });

    if (!product) {
      return response.status(404).json({ message: 'Producto no encontrado' });
    }

    const image = product.images.find((item) => item.id === request.params.imageId);
    if (!image) {
      return response.status(404).json({ message: 'Imagen no encontrada para este producto' });
    }

    deleteFile(image.url);

    await prisma.productImage.delete({
      where: { id: request.params.imageId }
    });

    return response.json({ message: 'Imagen eliminada exitosamente' });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth, async (request, response, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: request.params.id },
      include: { images: true }
    });

    if (!product) {
      return response.status(404).json({ message: 'Producto no encontrado' });
    }

    // Delete images from filesystem
    if (product.images && product.images.length > 0) {
      deleteFiles(product.images.map(img => img.url));
    }

    // Delete product (images cascade delete due to schema)
    await prisma.product.delete({
      where: { id: request.params.id }
    });

    return response.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    return next(error);
  }
});

export default router;
