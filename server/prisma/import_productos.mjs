import { prisma } from '../src/lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer JSON de productos
const jsonPath = path.resolve(__dirname, '../../productos_importar.json');
const productosData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

function sanitizeSlug(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function buildUniqueSlug(baseSlug, sku) {
  const safeBase = sanitizeSlug(baseSlug) || sanitizeSlug(sku) || 'producto';
  const safeSku = sanitizeSlug(sku);
  let candidate = safeBase;
  let attempt = 0;

  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    candidate = `${safeBase}-${safeSku || attempt}`;
    if (attempt > 1) {
      candidate = `${safeBase}-${safeSku || attempt}-${attempt}`;
    }
  }
  return candidate;
}

async function main() {
  console.log('🌱 Importando productos a la base de datos...');
  console.log(`📊 Total a importar: ${productosData.length}\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const errorList = [];

  // Procesar por lotes de 50
  const batchSize = 50;

  for (let i = 0; i < productosData.length; i += batchSize) {
    const batch = productosData.slice(i, i + batchSize);

    for (const prod of batch) {
      try {
        // Validar categoría
        const category = await prisma.category.findUnique({
          where: { slug: prod.category }
        });

        if (!category) {
          console.warn(`⚠️  Categoría no encontrada: ${prod.category} para SKU ${prod.sku}`);
          skipped++;
          continue;
        }

        // Verificar si el SKU ya existe
        const existing = await prisma.product.findUnique({
          where: { sku: prod.sku }
        });

        if (existing) {
          await prisma.product.update({
            where: { sku: prod.sku },
            data: {
              categoryId: category.id,
              name: prod.name,
              description: prod.description,
              material: prod.material,
              price: prod.price,
              stock: prod.stock,
              status: prod.status
            }
          });

          updated++;
          continue;
        }

        const uniqueSlug = await buildUniqueSlug(prod.slug || prod.name, prod.sku);

        // Crear producto
        await prisma.product.create({
          data: {
            sku: prod.sku,
            name: prod.name,
            slug: uniqueSlug,
            description: prod.description,
            material: prod.material,
            price: prod.price,
            stock: prod.stock,
            status: prod.status,
            categoryId: category.id
          }
        });

        created++;
      } catch (error) {
        console.error(`✗ Error importando ${prod.sku}:`, error.message);
        errors++;
        errorList.push({ sku: prod.sku, error: error.message });
      }
    }

    // Mostrar progreso cada 100 productos
    if ((i + batchSize) % 100 === 0 || (i + batchSize) >= productosData.length) {
      const processed = Math.min(i + batchSize, productosData.length);
      console.log(`📈 Progreso: ${processed}/${productosData.length} procesados...`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORTACIÓN COMPLETADA');
  console.log('='.repeat(60));
  console.log(`✓ Creados: ${created}`);
  console.log(`♻️  Actualizados: ${updated}`);
  console.log(`⏭️  Saltados: ${skipped}`);
  console.log(`✗ Errores: ${errors}`);

  if (errorList.length > 0 && errorList.length <= 10) {
    console.log('\n📋 Errores encontrados:');
    errorList.forEach(({ sku, error }) => {
      console.log(`  - ${sku}: ${error}`);
    });
  }

  // Estadísticas finales
  const stats = await prisma.product.groupBy({
    by: ['categoryId'],
    _count: true,
    where: {}
  });

  console.log('\n📊 Productos por categoría en BD:');
  for (const stat of stats) {
    const category = await prisma.category.findUnique({
      where: { id: stat.categoryId }
    });
    console.log(`  - ${category.name}: ${stat._count}`);
  }

  console.log('='.repeat(60) + '\n');
}

main()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
