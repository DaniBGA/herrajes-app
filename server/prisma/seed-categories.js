import { prisma } from '../src/lib/prisma.js';

const categories = [
  {
    name: 'Guías para Cajones',
    slug: 'guias-cajones',
    description: 'Guías de aluminio y acero para cajones',
    sortOrder: 0
  },
  {
    name: 'Bisagras',
    slug: 'bisagras',
    description: 'Bisagras ocultas, cangrejo y piano',
    sortOrder: 1
  },
  {
    name: 'Cantos de Melamina y PVC',
    slug: 'cantos-melamina-pvc',
    description: 'Cantos para revestimiento de bordes',
    sortOrder: 2
  },
  {
    name: 'Accesorios para Placard',
    slug: 'placard',
    description: 'Accesorios y herrajes para placares',
    sortOrder: 3
  },
  {
    name: 'Elevadores',
    slug: 'elevadores',
    description: 'Elevadores y soportes de altura',
    sortOrder: 4
  },
  {
    name: 'Accesorios de Armado',
    slug: 'accesorios-armado',
    description: 'Conectores, escuadras y fijaciones',
    sortOrder: 5
  },
  {
    name: 'Patas',
    slug: 'patas',
    description: 'Patas regulables para muebles',
    sortOrder: 6
  },
  {
    name: 'Frentes de Placard y Sistemas Corredizos',
    slug: 'frentes-corredizos',
    description: 'Sistemas de puertas corredizas',
    sortOrder: 7
  },
  {
    name: 'Zócalos',
    slug: 'zocalos',
    description: 'Zócalos de diferentes materiales',
    sortOrder: 8
  },
  {
    name: 'Perfilería de Aluminio',
    slug: 'perfileria-aluminio',
    description: 'Perfiles estructurales de aluminio',
    sortOrder: 9
  },
  {
    name: 'Tiradores y Manijas',
    slug: 'tiradores-manijas',
    description: 'Tiradores en acero, cromado y vintage',
    sortOrder: 10
  },
  {
    name: 'LED',
    slug: 'led',
    description: 'Iluminación LED para muebles',
    sortOrder: 11
  },
  {
    name: 'Tornillos y Fijaciones',
    slug: 'tornillos-fijaciones',
    description: 'Tornillos, pernos y anclajes',
    sortOrder: 12
  },
  {
    name: 'Adhesivos',
    slug: 'adhesivos',
    description: 'Adhesivos de aplicación en muebles',
    sortOrder: 13
  },
  {
    name: 'Herramientas',
    slug: 'herramientas',
    description: 'Herramientas de instalación y ensamble',
    sortOrder: 14
  },
  {
    name: 'Accesorios para Bajomesadas',
    slug: 'accesorios-bajomesadas',
    description: 'Accesorios especiales para bajomesadas',
    sortOrder: 15
  },
  {
    name: 'Máquinas Industriales',
    slug: 'maquinas-industriales',
    description: 'Máquinas para procesamiento de madera',
    sortOrder: 16
  },
  {
    name: 'Varios',
    slug: 'varios',
    description: 'Otros accesorios y productos',
    sortOrder: 17
  }
];

async function main() {
  console.log('🌱 Sembrando categorías...');

  for (const category of categories) {
    try {
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug }
      });

      if (existing) {
        console.log(`✓ ${category.name} (ya existe)`);
      } else {
        await prisma.category.create({
          data: category
        });
        console.log(`✓ ${category.name} (creada)`);
      }
    } catch (error) {
      console.error(`✗ Error al crear ${category.name}:`, error.message);
    }
  }

  console.log('✅ Categorías sembradas exitosamente');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
