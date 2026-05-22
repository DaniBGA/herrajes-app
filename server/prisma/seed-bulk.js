import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Bisagras Ocultas', description: 'Bisagras ocultas con cierre amortiguado' },
  { name: 'Bisagras Piano', description: 'Bisagras tipo piano para puertas grandes' },
  { name: 'Bisagras Cangrejo', description: 'Bisagras de cangrejo para carpintería' },
  { name: 'Corrimientos Cajoneras', description: 'Rieles para cajoneras con cierre suave' },
  { name: 'Corrimientos Puertas', description: 'Rieles corredizos para puertas' },
  { name: 'Tiradores Cromados', description: 'Tiradores con acabado cromado brillo' },
  { name: 'Tiradores Mate', description: 'Tiradores con acabado mate moderno' },
  { name: 'Tiradores Vintage', description: 'Tiradores estilo vintage clásico' },
  { name: 'Chapas y Cerraduras', description: 'Chapas de seguridad y cerraduras' },
  { name: 'Cilindros y Llaves', description: 'Cilindros de seguridad y sistemas de llaves' },
  { name: 'Cerraduras Magnéticas', description: 'Cerraduras magnéticas modernas' },
  { name: 'Patas Metálicas', description: 'Patas de hierro y acero para muebles' },
  { name: 'Soportes Ajustables', description: 'Soportes regulables para muebles' },
  { name: 'Conectores Estructurales', description: 'Conectores para estructuras de madera' },
  { name: 'Herrajes para Cocina', description: 'Herrajes especializados para cocinas' },
  { name: 'Herrajes para Baño', description: 'Herrajes para muebles de baño' },
  { name: 'Accesorios de Jardín', description: 'Accesorios para muebles de exterior' },
  { name: 'Tornillos y Tuercas', description: 'Tornillos, tuercas y pernos varios' },
  { name: 'Espárragos y Varillas', description: 'Espárragos y varillas roscadas' },
  { name: 'Elementos de Sujeción', description: 'Abrazaderas, pernos y elementos varios' }
];

const materials = [
  'Acero niquelado',
  'Acero galvanizado',
  'Zamak cromado',
  'Hierro pintado',
  'Latón',
  'Acero inoxidable',
  'Aleación de zinc',
  'Aluminio anodizado'
];

const generateSKU = () => {
  const prefix = ['BIS', 'RIE', 'TIR', 'CHA', 'CIL', 'PAT', 'SOP', 'CON', 'TOR', 'ESP'][Math.floor(Math.random() * 10)];
  const middle = Math.random().toString(36).substring(2, 5).toUpperCase();
  const suffix = Math.floor(Math.random() * 1000);
  return `${prefix}-${middle}-${suffix}`;
};

const generateProductName = (categoryName) => {
  const adjectives = ['Premium', 'Professional', 'Heavy-Duty', 'Deluxe', 'Standard', 'Compact', 'Industrial'];
  const sizes = ['50mm', '100mm', '150mm', '200mm', '300mm', '500mm', '1000mm'];
  const styles = ['Soft-Close', 'Quick Release', 'Ajustable', 'Reforzado', 'Especial', 'Universal'];

  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${categoryName} ${sizes[Math.floor(Math.random() * sizes.length)]} ${styles[Math.floor(Math.random() * styles.length)]}`;
};

const slugCounter = new Map();

const generateUniqueSlug = (name) => {
  let base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  if (!slugCounter.has(base)) {
    slugCounter.set(base, 0);
    return base;
  }
  
  const count = slugCounter.get(base) + 1;
  slugCounter.set(base, count);
  return `${base}-${count}`;
};

async function seedBulkData() {
  try {
    console.log('🌱 Iniciando carga masiva de datos...');

    // Eliminar datos existentes (excepto admin)
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log('✅ Base de datos limpia');

    // Crear categorías
    const createdCategories = [];
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: cat.description,
          sortOrder: i
        }
      });
      createdCategories.push(created);
    }

    console.log(`✅ ${createdCategories.length} categorías creadas`);

    // Crear productos masivamente
    let productCount = 0;
    const batchSize = 25; // Procesar en lotes
    const productsPerCategory = 25; // 25 * 20 = 500 productos

    for (const category of createdCategories) {
      const productsToCreate = [];

      for (let i = 0; i < productsPerCategory; i++) {
        const name = generateProductName(category.name);
        const productData = {
          categoryId: category.id,
          sku: generateSKU(),
          name,
          slug: generateUniqueSlug(name),
          description: `${category.description}. Producto de alta calidad con garantía de 12 meses.`,
          material: materials[Math.floor(Math.random() * materials.length)],
          price: Math.floor(Math.random() * 10000) + 1000,
          compareAtPrice: Math.floor(Math.random() * 15000) + 3000,
          stock: Math.floor(Math.random() * 500) + 10,
          featured: Math.random() > 0.8,
          status: Math.random() > 0.2 ? 'PUBLISHED' : 'DRAFT'
        };

        productsToCreate.push(productData);
      }

      // Insertar lotes de productos
      for (let j = 0; j < productsToCreate.length; j += batchSize) {
        const batch = productsToCreate.slice(j, j + batchSize);
        const created = await Promise.all(batch.map((p) => prisma.product.create({ data: p })));
        productCount += created.length;
        process.stdout.write(`\r📦 Productos creados: ${productCount}`);
      }
    }

    console.log(`\n✅ Total: ${productCount} productos creados`);

    // Estadísticas finales
    const totalCategories = await prisma.category.count();
    const totalProducts = await prisma.product.count();
    const publishedProducts = await prisma.product.count({ where: { status: 'PUBLISHED' } });
    const featuredProducts = await prisma.product.count({ where: { featured: true } });

    console.log(`\n📊 Estadísticas finales:`);
    console.log(`   Categorías: ${totalCategories}`);
    console.log(`   Productos totales: ${totalProducts}`);
    console.log(`   Productos publicados: ${publishedProducts}`);
    console.log(`   Productos destacados: ${featuredProducts}`);

    console.log('\n✨ Carga masiva completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la carga:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBulkData();
