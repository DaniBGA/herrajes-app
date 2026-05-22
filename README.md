# Almacen de Herrajes

Base modular en React preparada para Hostinger con soporte Node.js.

Ahora el proyecto está dividido en dos capas:

- `src/` para el frontend del catálogo y el panel admin
- `server/` para la API Node + PostgreSQL + Prisma

## Estructura

- `src/App.jsx` compone todas las secciones.
- `src/data/siteData.js` concentra el contenido editable.
- `src/components/` contiene cada bloque visual por separado.
- `src/styles/global.css` define el diseño completo.

## Desarrollo

```bash
npm install
npm run dev
```

## Backend

La API vive en `server/` y expone:

- login de administrador con JWT
- creación de categorías
- creación de productos con múltiples imágenes
- listado paginado de productos

Revisá [server/README.md](server/README.md) para la puesta en marcha completa.

## Build para producción

```bash
npm run build
```

El resultado queda en `dist/`, listo para subir al hosting.

## Pensado para crecer

La base ya queda separada por capas para sumar después:

- catálogo dinámico desde API o CMS
- carrito y checkout
- fichas de producto
- buscador y filtros avanzados
- panel de administración