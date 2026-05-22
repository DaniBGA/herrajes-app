# Herrajes API

Base backend en Node.js con PostgreSQL, Prisma y panel de administración.

## Qué incluye

- autenticación de administrador con JWT
- creación de categorías
- creación de productos
- carga de múltiples imágenes por producto
- listado paginado de productos desde la API

## Estructura

- `src/index.js` arranca el servidor
- `src/app.js` registra middleware y rutas
- `src/routes/` contiene auth, categorías y productos
- `prisma/schema.prisma` define el modelo de base de datos
- `prisma/migrations/0001_init/migration.sql` deja la base SQL inicial

## Variables de entorno

Copiá `server/.env.example` a `.env` y completá los valores.

## Flujo recomendado

```bash
cd server
npm install
npx prisma migrate deploy
npm run seed:admin
npm run dev
```

## Nota sobre imágenes

En esta base las imágenes se guardan en `uploads/` y la API devuelve rutas públicas. Si más adelante querés moverlas a Cloudinary o S3, la tabla `ProductImage` ya queda preparada.
