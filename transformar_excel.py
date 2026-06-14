import openpyxl
import json
import re

# Leer el Excel
excel_path = r"C:\Users\Daniel\Downloads\productos almacen de herrajes 5-6.xlsx"
wb = openpyxl.load_workbook(excel_path)
ws = wb.active

# Mapeo de palabras clave a categorías
category_mapping = {
    'guias-cajones': [
        'guía', 'guias', 'cajonera', 'riel', 'corredera', 'deslizador', 'carril',
        'telescópic', 'drawer', 'slider', 'corrimiento'
    ],
    'bisagras': [
        'bisagra', 'bisagras', 'charnela', 'articulación', 'hinge', 'piano',
        'cangrejo', 'oculta', 'tapa', 'cupula'
    ],
    'cantos-melamina-pvc': [
        'canto', 'cantos', 'borde', 'cantonera', 'melamina', 'pvc', 'revestimiento',
        'orilla', 'edge', 'trim'
    ],
    'placard': [
        'placard', 'placar', 'armario', 'closet', 'espejo', 'espejero',
        'puerta corredera', 'sistema placard'
    ],
    'elevadores': [
        'elevador', 'elevadores', 'elevable', 'elevación', 'lift', 'levanta',
        'soporte ajustable', 'altura'
    ],
    'accesorios-armado': [
        'conectar', 'conectores', 'escuadra', 'escuadras', 'conector', 'fijación',
        'unión', 'junta', 'soporte', 'abrazadera', 'bracket', 'columna'
    ],
    'patas': [
        'pata', 'patas', 'pata regulable', 'pié', 'pies', 'foot', 'feet',
        'altura', 'regulable'
    ],
    'frentes-corredizos': [
        'frente', 'puerta corredera', 'corrediza', 'corredera', 'frentes',
        'sistema corredizo', 'vidrio corredera', 'puerta deslizante'
    ],
    'zocalos': [
        'zócalo', 'zocalo', 'zóc', 'baseboard', 'rodapié', 'friso',
        'base mueble'
    ],
    'perfileria-aluminio': [
        'perfil', 'perfiles', 'aluminio', 'barra', 'tubo', 'angulo',
        'perfil estructural', 'rail', 'carril aluminio'
    ],
    'tiradores-manijas': [
        'tirador', 'tiradores', 'manija', 'manijas', 'handle', 'handles',
        'agarre', 'botón', 'perilla'
    ],
    'led': [
        'led', 'luz', 'iluminación', 'luminaria', 'strip', 'tira led',
        'iluminador', 'lámpara', 'light'
    ],
    'tornillos-fijaciones': [
        'tornillo', 'tornillos', 'perno', 'pernos', 'tuerca', 'tuercas',
        'clavo', 'clavos', 'anclaje', 'fijación', 'screw', 'bolt'
    ],
    'adhesivos': [
        'adhesivo', 'adhesivos', 'cola', 'pegamento', 'silicona', 'glue',
        'pegador', 'adhesión'
    ],
    'herramientas': [
        'herramienta', 'herramientas', 'destornillador', 'martillo', 'taladro',
        'llave', 'sierra', 'tool', 'tools', 'hardware'
    ],
    'accesorios-bajomesadas': [
        'bajomesada', 'bajo mesada', 'bajo-mesada', 'fregadero', 'sumidero',
        'cañería', 'tubo', 'sifón', 'rejilla'
    ],
    'maquinas-industriales': [
        'máquina', 'maquina', 'industrial', 'cortadora', 'sierra circular',
        'taladradora', 'fresadora', 'máquina herramienta', 'machinery'
    ],
    'varios': []
}

def assign_category(product_name):
    """Asigna categoría basada en palabras clave en el nombre del producto"""
    if not product_name:
        return 'varios'
    
    name_lower = str(product_name).lower().strip()
    
    # Buscar palabras clave
    for category, keywords in category_mapping.items():
        if category == 'varios':
            continue
        for keyword in keywords:
            if keyword.lower() in name_lower:
                return category
    
    # Si no coincide con ninguna, asignar a "Varios"
    return 'varios'

def sanitize_slug(text):
    """Convierte texto en slug válido"""
    if not text:
        return 'sin-nombre'
    slug = str(text).lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

def format_price(price):
    """Convierte precio a pesos enteros, ignorando centavos."""
    if price is None or price == '':
        return 0

    try:
        text = str(price).strip().replace(' ', '')

        if ',' in text and '.' in text:
          if text.rfind(',') > text.rfind('.'):
              text = text.replace('.', '')
              text = text.split(',')[0]
          else:
              text = text.replace(',', '')
              text = text.split('.')[0]
        elif ',' in text:
            text = text.replace('.', '')
            text = text.split(',')[0]
        elif '.' in text:
            text = text.replace(',', '')
            text = text.split('.')[0]

        integer_part = re.sub(r'\D', '', text)
        return int(integer_part) if integer_part else 0
    except:
        return 0

# Leer todos los productos
products = []
for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), 1):
    codigo, articulo, vta = row[0], row[1], row[2]
    
    # Validar datos obligatorios
    if not codigo or not articulo:
        continue
    
    codigo = str(codigo).strip()
    articulo = str(articulo).strip()
    
    # Si el artículo es un guión, es un error
    if articulo == '-':
        continue
    
    category = assign_category(articulo)
    slug = sanitize_slug(articulo)
    price = format_price(vta)
    
    product = {
        'sku': codigo,
        'name': articulo,
        'slug': slug,
        'description': f'Artículo {codigo}',
        'category': category,
        'price': price,
        'stock': 0,
        'status': 'PUBLISHED',
        'material': None
    }
    
    products.append(product)

# Agrupar por categoría para estadísticas
stats = {}
for prod in products:
    cat = prod['category']
    if cat not in stats:
        stats[cat] = 0
    stats[cat] += 1

# Generar reporte
print("\n" + "=" * 80)
print("TRANSFORMACION DE DATOS COMPLETADA")
print("=" * 80)
print(f"\nTotal de productos procesados: {len(products)}")
print(f"\nDistribucion por categoria:")
for cat in sorted(stats.keys()):
    print(f"  - {cat}: {stats[cat]} productos")

# Guardar JSON con todos los productos
output_json = r"e:\Vexus\Desarrollo\herrajes-app\productos_importar.json"
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"\nArchivo JSON generado: {output_json}")
print("=" * 80 + "\n")
