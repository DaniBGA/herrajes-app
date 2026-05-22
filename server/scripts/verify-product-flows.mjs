#!/usr/bin/env node
import assert from 'assert';

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('Por favor exporta ADMIN_TOKEN con un token válido del admin. Ej: export ADMIN_TOKEN=...');
  process.exit(1);
}

function headers() {
  return { Authorization: `Bearer ${ADMIN_TOKEN}` };
}

async function createProduct(nameSuffix = '') {
  const name = `Test Product ${Date.now()} ${nameSuffix}`;
  const form = new FormData();
  form.append('categoryId', '');
  form.append('sku', `TEST-${Date.now()}`);
  form.append('name', name);
  form.append('description', 'Producto de prueba creado por script');
  form.append('price', '1000');
  form.append('stock', '5');
  // deliberately do NOT append featured to ensure default false

  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: headers(),
    body: form
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Create failed: ${res.status} ${JSON.stringify(payload)}`);
  return payload.product;
}

async function updateFeatured(id, value) {
  const form = new FormData();
  form.append('categoryId', '');
  form.append('sku', `UPD-${Date.now()}`);
  form.append('name', `Updated ${id}`);
  form.append('description', 'update');
  form.append('price', '2000');
  form.append('stock', '1');
  form.append('featured', value ? 'true' : 'false');

  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: form
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Update failed: ${res.status} ${JSON.stringify(payload)}`);
  return payload.product;
}

async function searchByName(name) {
  const url = new URL(`${API_BASE}/products`);
  url.searchParams.set('search', name);
  url.searchParams.set('limit', '10');

  const res = await fetch(url.toString(), { headers: headers() });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Search failed: ${res.status} ${JSON.stringify(payload)}`);
  return payload.products || [];
}

async function run() {
  console.log('Creando producto de prueba (sin featured)...');
  const created = await createProduct('no-featured');
  console.log('Creado:', created.id, 'featured:', created.featured);
  assert(created.featured === false || created.featured === 0 || created.featured === null || typeof created.featured === 'boolean', 'featured debe estar presente');

  console.log('Buscando por nombre...');
  const found = await searchByName(created.name);
  const match = found.find((p) => p.id === created.id);
  assert(match, 'El producto creado debe encontrarse con search');

  console.log('Marcando featured en PUT...');
  const updated = await updateFeatured(created.id, true);
  console.log('Actualizado:', updated.id, 'featured:', updated.featured);
  assert(updated.featured === true, 'featured debe ser true después del update');

  console.log('Desmarcando featured en PUT...');
  const updated2 = await updateFeatured(created.id, false);
  console.log('Actualizado:', updated2.id, 'featured:', updated2.featured);
  assert(updated2.featured === false, 'featured debe ser false después del segundo update');

  console.log('Prueba completada con éxito');
}

run().catch((err) => {
  console.error('Error en verificación:', err);
  process.exit(1);
});
