export const navLinks = [
  { label: 'Productos', href: '/productos' },
  { label: 'Nosotros', href: '/', sectionId: 'nosotros' },
  { label: 'Contacto', href: '/', sectionId: 'contacto' },
  { label: 'Consultar', href: '/', sectionId: 'contacto', cta: true }
];

export const heroStats = [
  { value: '+500', label: 'Referencias en stock' },
  { value: 'Tandil', label: 'Centro de distribución' },
  { value: 'Atención', label: 'Personalizada y directa' },
  { value: 'Mayorista', label: 'y minorista' }
];

export const categories = [
  {
    title: 'Bisagras y Articulaciones',
    description: 'Ocultas · Cangrejo · Piano · Especiales',
    featured: true,
    pattern: 'orbit'
  },
  {
    title: 'Corrimientos y Rieles',
    description: 'Cajoneras · Puertas · Soft-close',
    pattern: 'grid'
  },
  {
    title: 'Tiradores y Manijas',
    description: 'Acero · Cromados · Mate · Vintage',
    pattern: 'rings'
  },
  {
    title: 'Cierre y Seguridad',
    description: 'Chapas · Cilindros · Magnéticos',
    pattern: 'triangles'
  },
  {
    title: 'Accesorios Estructurales',
    description: 'Patas · Soportes · Conectores',
    pattern: 'diagonal'
  }
];

export const productFilters = [
  { label: 'Todos', value: 'all' },
  { label: 'Bisagras', value: 'bisagras' },
  { label: 'Corrimientos', value: 'corrimientos' },
  { label: 'Tiradores', value: 'tiradores' }
];

export const featuredProducts = [
  {
    category: 'bisagras',
    sku: 'BIS-OC-35',
    name: 'Bisagra Oculta 35mm Soft-Close',
    description: 'Cierre amortiguado, apertura 110°. Para puertas de MDF y madera maciza.',
    material: 'Acero niquelado',
    badge: 'Novedad',
    glyph: 'hinge'
  },
  {
    category: 'corrimientos',
    sku: 'RIE-SC-500',
    name: 'Riel Cajonera Soft-Close 500mm',
    description: 'Extracción total, cierre suave integrado. Carga 35 kg por par.',
    material: 'Acero galvanizado',
    glyph: 'drawer'
  },
  {
    category: 'tiradores',
    sku: 'TIR-CR-128',
    name: 'Tirador Barra Cromada 128mm',
    description: 'Perfil rectangular de bajo perfil. Acabado cromo brillo. Incluye tornillos.',
    material: 'Zamak cromado',
    badge: 'Popular',
    glyph: 'handle'
  },
  {
    category: 'bisagras',
    sku: 'BIS-PI-50',
    name: 'Bisagra Piano Continua 50mm',
    description: 'Distribución uniforme del peso. Ideal para tapas y frentes largos.',
    material: 'Aluminio anodizado',
    glyph: 'piano'
  }
];

export const productCategories = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'bisagras', label: 'Bisagras y Articulaciones' },
  { value: 'corrimientos', label: 'Corrimientos y Rieles' },
  { value: 'tiradores', label: 'Tiradores y Manijas' },
  { value: 'seguridad', label: 'Cierre y Seguridad' },
  { value: 'estructurales', label: 'Accesorios Estructurales' }
];

export const catalogProducts = [
  {
    sku: 'BIS-OC-35',
    category: 'bisagras',
    categoryLabel: 'Bisagras y Articulaciones',
    name: 'Bisagra Oculta 35mm Soft-Close',
    description: 'Cierre amortiguado, apertura 110°. Para puertas de MDF y madera maciza.',
    material: 'Acero niquelado',
    price: 5600,
    glyph: 'hinge'
  },
  {
    sku: 'BIS-PI-50',
    category: 'bisagras',
    categoryLabel: 'Bisagras y Articulaciones',
    name: 'Bisagra Piano Continua 50mm',
    description: 'Distribución uniforme del peso en tapas y frentes largos.',
    material: 'Aluminio anodizado',
    price: 8100,
    glyph: 'piano'
  },
  {
    sku: 'BIS-CG-105',
    category: 'bisagras',
    categoryLabel: 'Bisagras y Articulaciones',
    name: 'Bisagra Cangrejo 105°',
    description: 'Montaje rápido, regulación tridimensional y alta resistencia.',
    material: 'Acero templado',
    price: 4700,
    glyph: 'hinge'
  },
  {
    sku: 'RIE-SC-500',
    category: 'corrimientos',
    categoryLabel: 'Corrimientos y Rieles',
    name: 'Riel Cajonera Soft-Close 500mm',
    description: 'Extracción total y cierre suave integrado. Carga de 35 kg por par.',
    material: 'Acero galvanizado',
    price: 12400,
    glyph: 'drawer'
  },
  {
    sku: 'RIE-TE-450',
    category: 'corrimientos',
    categoryLabel: 'Corrimientos y Rieles',
    name: 'Riel Telescópico 450mm',
    description: 'Deslizamiento preciso para cajones de uso intensivo.',
    material: 'Acero zincado',
    price: 9800,
    glyph: 'drawer'
  },
  {
    sku: 'RIE-PV-2M',
    category: 'corrimientos',
    categoryLabel: 'Corrimientos y Rieles',
    name: 'Kit Corredera Puerta Vidrio 2m',
    description: 'Sistema corredizo superior con guía inferior y herrajes de fijación.',
    material: 'Aluminio + acero',
    price: 28400,
    glyph: 'drawer'
  },
  {
    sku: 'TIR-CR-128',
    category: 'tiradores',
    categoryLabel: 'Tiradores y Manijas',
    name: 'Tirador Barra Cromada 128mm',
    description: 'Perfil rectangular de bajo perfil con terminación brillo.',
    material: 'Zamak cromado',
    price: 3200,
    glyph: 'handle'
  },
  {
    sku: 'TIR-MN-160',
    category: 'tiradores',
    categoryLabel: 'Tiradores y Manijas',
    name: 'Manija Negra Mate 160mm',
    description: 'Diseño minimalista para cocinas y placares modernos.',
    material: 'Aluminio pintado',
    price: 4100,
    glyph: 'handle'
  },
  {
    sku: 'TIR-VT-96',
    category: 'tiradores',
    categoryLabel: 'Tiradores y Manijas',
    name: 'Tirador Vintage 96mm',
    description: 'Estilo clásico con textura envejecida.',
    material: 'Zamak envejecido',
    price: 3800,
    glyph: 'handle'
  },
  {
    sku: 'SEG-CH-30',
    category: 'seguridad',
    categoryLabel: 'Cierre y Seguridad',
    name: 'Cerradura Mueble 30mm',
    description: 'Cierre frontal con llaves codificadas para cajones y puertas.',
    material: 'Acero niquelado',
    price: 6500,
    glyph: 'hinge'
  },
  {
    sku: 'SEG-MG-PU',
    category: 'seguridad',
    categoryLabel: 'Cierre y Seguridad',
    name: 'Cierre Magnético Push',
    description: 'Sistema de apertura por presión, oculto y silencioso.',
    material: 'ABS + imán',
    price: 2900,
    glyph: 'piano'
  },
  {
    sku: 'SEG-CI-60',
    category: 'seguridad',
    categoryLabel: 'Cierre y Seguridad',
    name: 'Cilindro para Cerradura 60mm',
    description: 'Recambio universal con alta durabilidad para uso diario.',
    material: 'Latón',
    price: 7300,
    glyph: 'hinge'
  },
  {
    sku: 'EST-PA-120',
    category: 'estructurales',
    categoryLabel: 'Accesorios Estructurales',
    name: 'Pata Regulable 120mm',
    description: 'Altura regulable para muebles de cocina y baños.',
    material: 'Polímero reforzado',
    price: 2100,
    glyph: 'piano'
  },
  {
    sku: 'EST-SO-REP',
    category: 'estructurales',
    categoryLabel: 'Accesorios Estructurales',
    name: 'Soporte Reforzado de Estante',
    description: 'Soporte metálico para cargas altas en bibliotecas y alacenas.',
    material: 'Acero pintado',
    price: 3400,
    glyph: 'hinge'
  },
  {
    sku: 'EST-CN-MIN',
    category: 'estructurales',
    categoryLabel: 'Accesorios Estructurales',
    name: 'Conector Minifix 15mm',
    description: 'Fijación interna para ensamble prolijo de tableros.',
    material: 'Acero + zamak',
    price: 1800,
    glyph: 'drawer'
  }
];

export const aboutFeatures = [
  {
    title: 'Stock permanente',
    description: 'Más de 500 referencias disponibles sin tiempos de espera.',
    icon: 'check'
  },
  {
    title: 'Atención personalizada',
    description: 'Asesoramiento técnico para elegir el herraje correcto.',
    icon: 'users'
  },
  {
    title: 'Marcas de calidad',
    description: 'Trabajamos con proveedores reconocidos del mercado argentino.',
    icon: 'shield'
  }
];

export const contactChannels = [
  {
    label: 'WhatsApp',
    value: 'Consultas rápidas y pedidos',
    href: 'https://wa.me/5492494000000',
    icon: 'whatsapp',
    accent: 'wa'
  },
  {
    label: 'Instagram',
    value: '@almacendeherrajes',
    href: 'https://www.instagram.com/almacendeherrajes/',
    icon: 'instagram',
    accent: 'ig'
  },
  {
    label: 'Facebook',
    value: 'Almacen de Herrajes',
    href: 'https://www.facebook.com/p/Almacen-de-Herrajes-100014280965222/',
    icon: 'facebook',
    accent: 'fb'
  },
  {
    label: 'Ubicación',
    value: '4 de Abril 404, Tandil',
    href: 'https://maps.app.goo.gl/Atr3QXH1hasvHmGg6',
    icon: 'map',
    accent: 'map'
  }
];

export const footerColumns = [
  {
    title: 'Navegación',
    links: [
      { label: 'Catálogo de productos', href: '/productos' },
      { label: 'Destacados', href: '/', sectionId: 'productos' },
      { label: 'Quiénes somos', href: '/', sectionId: 'nosotros' },
      { label: 'Contacto', href: '/', sectionId: 'contacto' }
    ]
  },
  {
    title: 'Horarios',
    links: [
      { label: 'Lunes a Viernes: 9 – 18 hs', isText: true },
      { label: 'Sábados: 9 – 13 hs', isText: true },
      { label: '4 de Abril 404, Tandil', href: 'https://www.google.com/maps/search/4+de+Abril+404,+Tandil,+Argentina', external: true },
      { label: 'Instagram', href: 'https://www.instagram.com/almacendeherrajes/', external: true },
      { label: 'Facebook', href: 'https://www.facebook.com/p/Almacen-de-Herrajes-100014280965222/', external: true }
    ]
  }
];