# 📚 Contexto Completo - Almacén de Herrajes

**Última actualización:** 13 de Junio de 2026

---

## 🏗️ Arquitectura General

La aplicación es un **sistema full-stack de catálogo de productos** con panel administrativo.

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│                        :5173 / dist/                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSON (apiClient.js)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  BACKEND (Node.js + Express)                │
│                        :3000 / :3001                         │
│                    /api/* endpoints                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM
                           │
┌──────────────────────────▼──────────────────────────────────┐
│          DATABASE (PostgreSQL + Prisma Migrations)          │
│         prisma/schema.prisma + migrations/                  │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|----------|
| **Frontend** | React 18 | - | Interfaz SPA |
| | Vite | - | Build tool |
| | Tailwind CSS | - | Estilos |
| **Backend** | Node.js | 20+ | Runtime |
| | Express | - | Framework HTTP |
| | Prisma | - | ORM |
| | JWT | - | Autenticación |
| | bcrypt | - | Hash de contraseñas |
| | Multer | - | Carga de archivos |
| **Database** | PostgreSQL | 14+ | Base de datos |
| | Prisma Migrate | - | Control de versiones BD |

---

## 🗄️ Base de Datos (Prisma Schema)

### Modelos Principales

#### **AdminUser**
Administradores autenticados del sistema.

```prisma
model AdminUser {
  id           String    @id @default(cuid())      // ID único
  email        String    @unique                    // Único, para login
  passwordHash String                              // Hash bcrypt
  name         String                              // Nombre
  role         AdminRole @default(EDITOR)          // OWNER | EDITOR
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  @@index([email])       // Para búsquedas de login rápidas
  @@index([createdAt])
}

enum AdminRole {
  OWNER   // Control total
  EDITOR  // Gestión de contenido
}
```

#### **Category**
Categorías de productos (Bisagras, Corrimientos, etc).

```prisma
model Category {
  id               String    @id @default(cuid())
  name             String    @unique              // "Bisagras y Articulaciones"
  slug             String    @unique              // "bisagras-articulaciones" (para URLs)
  description      String?                        // Texto descriptivo
  sortOrder        Int       @default(0)          // Orden de visualización
  featuredPosition Int?                           // Posición si es destacada
  image            String?                        // URL imagen de categoría
  imageAlt         String?                        // Alt para accesibilidad
  products         Product[]                      // Relación 1:N
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  @@index([slug])
  @@index([sortOrder])
  @@index([featuredPosition])
  @@index([createdAt])
}
```

#### **Product**
Productos del catálogo con múltiples imágenes.

```prisma
model Product {
  id               String         @id @default(cuid())
  categoryId       String                         // FK a Category
  category         Category       @relation(...)
  sku              String         @unique        // "BIS-OC-35"
  name             String                        // "Bisagra Oculta 35mm"
  slug             String         @unique        // Para URLs
  description      String                        // Especificaciones
  material         String?                       // "Acero niquelado"
  price            Int                           // En centavos (100 = $1)
  compareAtPrice   Int?                          // Precio tachado (oferta)
  stock            Int            @default(0)   // Cantidad disponible
  featured         Boolean        @default(false) // ¿Destacado?
  featuredPosition Int?                          // Orden entre destacados
  status           ProductStatus  @default(DRAFT) // DRAFT|PUBLISHED|ARCHIVED
  images           ProductImage[]                // Relación 1:N
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  
  @@index([categoryId])
  @@index([status])
  @@index([price])
  @@index([slug])
  @@index([sku])
  @@index([featured])
  @@index([stock])
  @@index([createdAt])
  @@index([featured, featuredPosition])  // Optimiza búsqueda de destacados
  @@index([status, featured])
}

enum ProductStatus {
  DRAFT      // No visible en público
  PUBLISHED  // Visible en catálogo
  ARCHIVED   // Oculto, no eliminado
}
```

#### **ProductImage**
Imágenes asociadas a productos (múltiples por producto).

```prisma
model ProductImage {
  id        String   @id @default(cuid())
  productId String                        // FK a Product
  product   Product  @relation(...)
  url       String                        // "/uploads/filename.jpg"
  alt       String?                       // Texto alternativo
  sortOrder Int      @default(0)          // Orden de visualización
  createdAt DateTime @default(now())
  
  @@index([productId])
  @@index([createdAt])
  @@index([productId, sortOrder])
}
```

### Relaciones en Diagrama

```
AdminUser (1) ──────────────── [sin relación directa]

Category (1) ──────── (N) Product
             └─ products: Product[]

Product (1) ──────── (N) ProductImage
           └─ images: ProductImage[]
```

---

## 🔌 Backend - Rutas API

### Base URL
- **Desarrollo:** `http://localhost:3001/api`
- **Producción:** `https://tudominio.com/api`

### Autenticación
La mayoría de endpoints protegidos usan **JWT en header**:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El token se obtiene en login y dura **12 horas**.

### Rutas de Autenticación (`/api/auth`)

#### `POST /api/auth/login`
**Descripción:** Inicia sesión y devuelve JWT.
**Requiere:** -
**Body:**
```json
{
  "email": "admin@herrajes.com",
  "password": "micontraseña123"
}
```
**Respuesta (200):**
```json
{
  "token": "eyJhbGc...",
  "admin": {
    "id": "clx...",
    "email": "admin@herrajes.com",
    "name": "Admin User",
    "role": "OWNER"
  }
}
```
**Errores:**
- `401` - Credenciales inválidas

---

#### `GET /api/auth/me`
**Descripción:** Valida y devuelve datos del admin autenticado.
**Requiere:** JWT válido en header
**Respuesta (200):**
```json
{
  "admin": {
    "id": "clx...",
    "email": "admin@herrajes.com",
    "name": "Admin User",
    "role": "OWNER"
  }
}
```
**Errores:**
- `401` - Token ausente, inválido o vencido

---

### Rutas de Categorías (`/api/categories`)

#### `GET /api/categories`
**Descripción:** Lista todas las categorías ordenadas.
**Requiere:** -
**Query params:** -
**Respuesta (200):**
```json
{
  "categories": [
    {
      "id": "clx...",
      "name": "Bisagras y Articulaciones",
      "slug": "bisagras-articulaciones",
      "description": "Ocultas · Cangrejo · Piano · Especiales",
      "sortOrder": 0,
      "featuredPosition": null,
      "image": "/uploads/bisagras.jpg",
      "imageAlt": "Bisagras",
      "createdAt": "2026-05-22T00:41:01.000Z",
      "updatedAt": "2026-05-22T00:41:01.000Z",
      "_count": {
        "products": 42  // Cantidad de productos en esta categoría
      }
    }
  ]
}
```

---

#### `POST /api/categories`
**Descripción:** Crea una nueva categoría.
**Requiere:** JWT (OWNER o EDITOR)
**Body (FormData):**
```
name: "Tiradores y Manijas"
slug: "tiradores-manijas"  (opcional, se genera automático)
description: "Acero · Cromados · Mate · Vintage"
sortOrder: 3
featuredPosition: null
imageAlt: "Tiradores de acero cromado"
image: <archivo.jpg>
```
**Respuesta (201):**
```json
{
  "category": { ... }
}
```

---

#### `PUT /api/categories/:id`
**Descripción:** Actualiza una categoría.
**Requiere:** JWT (OWNER o EDITOR)
**Body (FormData):**
```
name: "Nombre actualizado"
description: "..."
image: <nuevo archivo.jpg>  (opcional)
```
**Respuesta (200):**
```json
{
  "category": { ... }
}
```

---

#### `DELETE /api/categories/:id`
**Descripción:** Elimina una categoría (requiere que no tenga productos).
**Requiere:** JWT (OWNER o EDITOR)
**Respuesta (200):**
```json
{ "message": "Categoría eliminada" }
```

---

### Rutas de Productos (`/api/products`)

#### `GET /api/products`
**Descripción:** Lista productos con filtros y paginación.
**Requiere:** -
**Query params:**
```
page=1              // Número de página (default 1)
limit=20            // Items por página (max 20)
search=bisagra      // Búsqueda en name/sku/description
category=bisagras-articulaciones  // Filtro por slug
minPrice=100        // Precio mínimo (en centavos)
maxPrice=50000      // Precio máximo
featured=true       // Solo destacados
```

**Respuesta (200):**
```json
{
  "page": 1,
  "limit": 20,
  "total": 156,
  "totalPages": 8,
  "products": [
    {
      "id": "clx...",
      "categoryId": "clx...",
      "sku": "BIS-OC-35",
      "name": "Bisagra Oculta 35mm Soft-Close",
      "slug": "bisagra-oculta-35mm",
      "description": "Cierre amortiguado, apertura 110°...",
      "material": "Acero niquelado",
      "price": 18900,
      "compareAtPrice": 24900,
      "stock": 125,
      "featured": true,
      "featuredPosition": 1,
      "status": "PUBLISHED",
      "createdAt": "2026-05-22T00:41:01.000Z",
      "updatedAt": "2026-05-22T00:41:01.000Z",
      "category": { /* object Category */ },
      "images": [
        {
          "id": "clx...",
          "url": "/uploads/bis-oc-35-1.jpg",
          "alt": "Vista frontal",
          "sortOrder": 0
        }
      ]
    }
  ]
}
```

**Nota especial:** Si un producto no tiene imágenes, se devuelve una imagen placeholder de `picsum.photos`.

---

#### `POST /api/products`
**Descripción:** Crea un nuevo producto (con múltiples imágenes).
**Requiere:** JWT (OWNER o EDITOR)
**Body (FormData multipart):**
```
categoryId: "clx..."
sku: "BIS-OC-35"
name: "Bisagra Oculta 35mm"
slug: "bisagra-oculta-35mm"  (opcional, se genera)
description: "Cierre amortiguado, apertura 110°..."
material: "Acero niquelado"
price: 18900
compareAtPrice: 24900
stock: 125
featured: true
featuredPosition: 1
status: PUBLISHED
images: <archivo1.jpg, archivo2.jpg, ...>  (máx 12)
imageAlts: '["Vista frontal","Detalle cierre","Medidas"]'
```

**Respuesta (201):**
```json
{
  "product": { /* objeto Product */ }
}
```

---

#### `PUT /api/products/:id`
**Descripción:** Actualiza un producto.
**Requiere:** JWT (OWNER o EDITOR)
**Body (FormData):**
```
categoryId: "clx..."
sku: "..."
name: "..."
description: "..."
price: 18900
stock: 100
featured: true
status: PUBLISHED
images: <nuevos archivos.jpg>  (opcional, reemplaza todos si se envía)
```

**Respuesta (200):**
```json
{
  "product": { /* objeto actualizado */ }
}
```

---

#### `DELETE /api/products/:id`
**Descripción:** Elimina un producto (sus imágenes se borran en cascada).
**Requiere:** JWT (OWNER o EDITOR)
**Respuesta (200):**
```json
{ "message": "Producto eliminado" }
```

---

### Rutas de Contacto (`/api/contact`)

#### `POST /api/contact`
**Descripción:** Envía un formulario de contacto por email.
**Requiere:** -
**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@gmail.com",
  "message": "Consulta sobre bisagras...",
  "phone": "+54 911234567"
}
```

**Respuesta (200):**
```json
{ "message": "Email enviado" }
```

---

### Rutas de Estadísticas (`/api/stats`)

#### `GET /api/stats`
**Descripción:** Devuelve estadísticas del sistema.
**Requiere:** JWT (OWNER)
**Respuesta (200):**
```json
{
  "totalProducts": 156,
  "totalCategories": 5,
  "totalAdmins": 2,
  "publishedProducts": 140,
  "draftProducts": 16,
  "averagePrice": 24500
}
```

---

## 🎨 Frontend - Estructura de Componentes

### Árbol de Componentes

```
App.jsx
├─ TopBanner (banner informativo)
├─ Header (navegación + logo)
├─ Hero (sección principal)
├─ CategoriesSection (grid de categorías)
├─ FeaturedProducts (productos destacados)
├─ AboutSection (nosotros)
├─ ContactSection (formulario)
├─ Footer (pie de página)
├─ FloatingWhatsApp (botón flotante)
├─ ProductsPage (catálogo paginado)
├─ AdminPage (enrutador panel admin)
│  ├─ AdminDashboard
│  ├─ AdminProductsPage (tabla de productos)
│  ├─ AdminCategoriesPage (tabla de categorías)
│  └─ AdminProductsPage (crear/editar)
└─ MockupNotice (aviso desarrollo)
```

### Componentes Principales

#### **App.jsx**
Orquestador principal. Decide qué mostrar según la ruta.
- Verifica autenticación admin
- Renderiza `ProductsPage` o `AdminPage` según contexto

#### **Header.jsx**
Barra de navegación con:
- Logo
- Links de navegación
- Button de admin (login/logout)
- Responsive mobile

#### **Hero.jsx**
Sección principal con:
- Título: "Almacén de Herrajes"
- Subtítulo descriptivo
- Stats en `heroStats` (siteData.js)
- CTA "Consultar"

#### **CategoriesSection.jsx**
Grid de categorías con:
- Cards animadas por patrón (`orbit`, `grid`, `rings`, etc)
- Datos desde `categories` en siteData.js
- Links a `/productos?category=`

#### **FeaturedProducts.jsx**
Carrusel/grid de productos destacados:
- Obtiene de `GET /api/products?featured=true`
- Muestra máx 4 productos
- Cada card con imagen, nombre, precio

#### **ProductsPage.jsx**
Catálogo completo con:
- Búsqueda y filtros
- Paginación
- API: `GET /api/products?page=X&category=Y&search=Z`
- Muestra grid de productos con:
  - Imagen (primera de `images[]`)
  - Nombre, descripción, material
  - Precio y precio anterior
  - Badge si es destacado

#### **AdminDashboard.jsx**
Panel principal admin con:
- Bienvenida
- Links a crear/gestionar productos y categorías
- Estadísticas básicas (API `/api/stats`)

#### **AdminProductsPage.jsx**
Gestión de productos admin:
- Tabla con listado de productos
- Botones editar/eliminar
- Formulario para crear nuevo
- Carga múltiples imágenes
- Validaciones antes de enviar

#### **AdminCategoriesPage.jsx**
Gestión de categorías admin:
- Tabla con listado
- Botones editar/eliminar
- Formulario para crear
- Carga imagen de categoría

### Datos Centralizados (`src/data/siteData.js`)

Todos los textos y datos editables en **un solo archivo**:

```javascript
export const navLinks = [...]           // Items navegación
export const heroStats = [...]          // Estadísticas hero
export const categories = [...]         // Categorías (contenido local)
export const productFilters = [...]     // Opciones de filtro
export const featuredProducts = [...]   // Productos destacados (datos mock)
export const productCategories = [...]  // Opciones de categoría
export const catalogProducts = [...]    // Catálogo inicial (deprecated)
```

---

## 🔐 Sistema de Autenticación

### Flujo de Login Admin

```
1. Admin va a /admin
2. Si no hay token → Muestra formulario login
3. Admin ingresa email + password
4. Frontend hace POST /api/auth/login
5. Backend valida credentials + devuelve JWT
6. Frontend guarda token en localStorage: "herrajes-admin-token"
7. Frontend setea Authorization header en futuras requests
8. Acceso a rutas protegidas (/admin/*)
```

### Verificación de Token

**Middleware `requireAuth` en backend:**
```javascript
// Solo deja pasar si hay JWT válido en header
// Si JWT es inválido o vencido → error 401
```

**Lado frontend (`apiClient.js`):**
```javascript
// Antes de cada request:
// 1. Lee token de localStorage
// 2. Lo agrega en header si existe
// 3. Si respuesta es 401 → limpia token y redirige a login
```

### Cierre de Sesión

```javascript
// Frontend elimina token
localStorage.removeItem('herrajes-admin-token');
// Limpia headers en futuras requests
// Redirige a inicio
```

---

## 📁 Manejo de Archivos y Uploads

### Flujo de Carga de Imágenes

**Productos:** Hasta **12 imágenes** por producto
**Categorías:** **1 imagen** por categoría

### Ubicación de Archivos

```
server/
├─ uploads/              ← Carpeta física
│  ├─ produto-1.jpg
│  ├─ producto-2.jpg
│  └─ ...
└─ src/lib/uploads.js    ← Configuración Multer
```

### Flujo Técnico

1. **Frontend** → FormData con archivos + datos
2. **Multer** (middleware) → Recibe y guarda en `/uploads`
3. **Prisma** → Guarda ruta `/uploads/filename.jpg` en BD
4. **API** → Devuelve ruta como `/uploads/filename.jpg`
5. **Frontend** → `resolveMediaUrl()` convierte a URL completa
   ```
   /uploads/file.jpg → http://localhost:3001/uploads/file.jpg
   ```

### Límites

- Tamaño máximo de body: 2MB
- Máximo 12 imágenes por producto
- Máximo 1 imagen por categoría
- Formatos soportados: jpg, jpeg, png, gif, webp (según Multer config)

---

## 🌍 Variables de Entorno

### `.env` (Raíz del proyecto)

```bash
# Frontend
VITE_API_BASE_URL=http://localhost:3001/api

# En producción:
# VITE_API_BASE_URL=https://tudominio.com/api
```

### `.env` (Carpeta `server/`)

```bash
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/herrajes_db"

# Seguridad
JWT_SECRET="tu-secret-super-seguro-min-32-caracteres"
CORS_ORIGIN="http://localhost:5173,http://localhost:3001"

# Email (para formulario contacto)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
CONTACT_EMAIL="admin@herrajes.com"

# Archivos
UPLOAD_DIR="uploads"
UPLOAD_MAX_SIZE=2097152  # 2MB en bytes

# Servidor
PORT=3001
NODE_ENV="development"
```

---

## 🚀 Flujos Principales de la Aplicación

### 1️⃣ Visualizar Catálogo (Público)

```
Usuario → GET / (Home)
         ├─ Carga FeaturedProducts
         │  └─ GET /api/products?featured=true
         └─ Carga CategoriesSection (datos mock locales)

Usuario → Hace clic en categoría
         └─ GET /productos?category=bisagras-articulaciones
            └─ ProductsPage → GET /api/products?category=bisagras...
               └─ Renderiza grid de productos con paginación
```

### 2️⃣ Admin Login

```
Admin → Click "Admin"
       └─ Muestra formulario login

Admin → Ingresa credenciales
       └─ POST /api/auth/login
          ├─ Backend valida
          ├─ Devuelve JWT
          └─ Frontend guarda en localStorage

Admin → Redirige a /admin/dashboard
       └─ Frontend verifica token válido
          └─ Muestra panel admin
```

### 3️⃣ Crear Producto

```
Admin → /admin/productos → Hace clic "Crear"
       └─ Muestra formulario

Admin → Rellena formulario:
        - Categoría
        - SKU, nombre, descripción
        - Precio, stock
        - Sube imágenes (max 12)
       └─ POST /api/products (FormData)
          ├─ Multer guarda imágenes en /uploads
          ├─ Prisma crea registro en BD
          └─ Devuelve producto creado

Admin → Lista se recarga automáticamente
```

### 4️⃣ Editar Categoría

```
Admin → /admin/categorías → Hace clic en categoría
       └─ Abre formulario de edición pre-llenado

Admin → Modifica datos (nombre, descripción, imagen)
       └─ PUT /api/categories/:id (FormData)
          ├─ Si hay imagen nueva:
          │  ├─ Borra imagen antigua
          │  └─ Guarda nueva
          ├─ Prisma actualiza registro
          └─ Devuelve categoría actualizada

Admin → Lista se actualiza
```

### 5️⃣ Eliminar Producto

```
Admin → /admin/productos → Hace clic eliminar
       └─ Confirmación

Admin → Confirma
       └─ DELETE /api/products/:id
          ├─ Prisma borra producto
          ├─ En cascada: Elimina todas sus ProductImage
          ├─ FileSystem elimina archivos de /uploads
          └─ Devuelve confirmación

Admin → Lista se refresca
```

---

## 🔧 Configuraciones y Convenciones

### Convención de URLs

| Recurso | Patrón | Ejemplo |
|---------|--------|---------|
| Producto | `/productos/:slug` | `/productos/bisagra-oculta-35mm` |
| Categoría | `/productos?category=:slug` | `/productos?category=bisagras` |
| Admin | `/admin/...` | `/admin/productos` |
| API | `/api/:resource/:action` | `/api/products`, `/api/categories/123` |

### Convención de IDs

- `cuid()` - ID único generado por Prisma (24 caracteres)
- Ejemplo: `clx4m8z7x0000n7z7q8q8q8q8`

### Convención de Slugs

```javascript
// Generado automáticamente de nombre/título:
"Bisagra Oculta 35mm" → "bisagra-oculta-35mm"
// Reglas:
// 1. Convertir a minúsculas
// 2. Reemplazar caracteres no alfanuméricos por guiones
// 3. Eliminar guiones al inicio/fin
```

### Convención de Precios

- **Almacenados en centavos** (no decimales)
- `18900` en BD = $189.00
- Frontend: `price / 100` para mostrar

### Estados de Producto

```
DRAFT      → Producto en edición, no visible públicamente
PUBLISHED  → Visible en catálogo
ARCHIVED   → Oculto pero no eliminado (auditoría)
```

---

## 📊 Índices de Base de Datos

Los índices están optimizados para las consultas más comunes:

```prisma
// Category
@@index([slug])              // Búsqueda por URL
@@index([sortOrder])         // Ordenamiento
@@index([featuredPosition])  // Destacados
@@index([createdAt])         // Orden cronológico

// Product
@@index([categoryId])        // Productos por categoría
@@index([status])            // Filtro por estado
@@index([price])             // Rango de precios
@@index([slug])              // Búsqueda por URL
@@index([sku])               // Búsqueda por SKU
@@index([featured])          // Destacados
@@index([stock])             // Disponibilidad
@@index([featured, featuredPosition])  // Combo: destacados + orden
@@index([status, featured])           // Combo: publicados destacados
```

---

## 🐛 Debug y Troubleshooting

### Token JWT vencido o inválido

**Síntoma:** 401 en endpoint protegido
**Solución:**
```javascript
// Limpiar localStorage
localStorage.removeItem('herrajes-admin-token');
// Hacer login nuevamente
```

### Imágenes no cargan

**Síntoma:** 404 en `/uploads/...`
**Checklist:**
1. ¿Archivo existe en `server/uploads/`?
2. ¿URL en BD es correcta?
3. ¿Servidor sirve `/uploads` estático?
   ```javascript
   app.use('/uploads', express.static('uploads'));
   ```

### Producto no aparece en catálogo

**Síntoma:** Creado pero no visible
**Checklist:**
1. ¿Estado es `PUBLISHED`?
   ```sql
   SELECT status FROM "Product" WHERE id = '...';
   ```
2. ¿Categoría existe y tiene slug válido?
3. ¿Stock > 0?

### Migraciones de BD fallan

**Síntoma:** Error en `npx prisma migrate`
**Solución:**
```bash
# Resetear BD (⚠️ Elimina datos):
npx prisma migrate reset

# O ver cambios sin aplicar:
npx prisma migrate diff --from-empty --to-schema-datamodel --script
```

---

## 📝 Procedimientos Comunes

### Setup Inicial (Desarrollo)

```bash
# 1. Raíz del proyecto
npm install
npm run dev  # Frontend en :5173

# 2. En otra terminal, carpeta server/
cd server
npm install
npx prisma migrate deploy
npm run seed:admin
npm run dev  # Backend en :3001
```

### Agregar Admin Nuevo

```bash
cd server
npm run seed:admin
# (O manualmente en DB)
```

### Revertir Migración

```bash
npx prisma migrate resolve --rolled-back 20260522004101_add_featured_position
```

### Regenerar Prisma Client

```bash
npx prisma generate
```

### Hacer Backup de Datos

```bash
pg_dump -U usuario herrajes_db > backup.sql
```

### Build para Producción

```bash
# Frontend
npm run build  # Genera dist/

# Subir dist/ + server/ al hosting
# Configurar variables de entorno en servidor
# Ejecutar migraciones en servidor
npx prisma migrate deploy
# Iniciar servidor
npm run start
```

---

## 📞 Contacto y Soporte

- **Base de datos:** PostgreSQL en `DATABASE_URL`
- **Archivos:** `/uploads` (relativo a `server/`)
- **Logs:** Ver terminal del servidor (Morgan en dev mode)
- **JWT Secret:** Cambiar en `.env` para renovar sesiones

---

**Documento generado como referencia constante para reducir errores y acelerar desarrollo.**
