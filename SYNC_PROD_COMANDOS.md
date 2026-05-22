# 🔄 Guía: Sincronizar Cambios Desarrollo → Producción

**Última actualización:** 22 de Mayo de 2026

---

## 📋 Resumen de Métodos

| Método | Cuándo Usar | Velocidad | Seguridad |
|--------|------------|-----------|-----------|
| **Git + Automático** | Cambios de código frecuentes | ⭐⭐⭐ | ⭐⭐⭐ |
| **Manual SCP/SFTP** | Cambios puntuales, sin Git | ⭐ | ⭐⭐ |
| **Script Shell** | Deploy rápido de testing | ⭐⭐ | ⭐⭐ |
| **Sync con Rsync** | Carpetas completas | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 MÉTODO 1: GIT (Recomendado para Desarrollo)

### Configuración Inicial (Una sola vez)

#### 1.1 Crear Repositorio en GitHub/GitLab

```bash
# En tu máquina local
cd ~/Proyectos/Desarrollo/Herrajes
git init
git add .
git commit -m "Initial commit: Herrajes ecommerce"

# Agregar remoto (reemplazar con tu repo)
git remote add origin https://github.com/tu-usuario/herrajes-app.git
git branch -M main
git push -u origin main
```

#### 1.2 En Hostinger (primera vez)

```bash
# Conectar SSH
ssh username@tudominio.com

# Ir a producción
cd ~/public_html/herrajes-app

# Clonar repositorio
git clone https://github.com/tu-usuario/herrajes-app.git .

# Configurar credenciales
git config user.email "tu-email@gmail.com"
git config user.name "Daniel"
```

### Flujo Normal de Sincronización

#### 📝 PASO 1: Hacer cambios en Desarrollo

```bash
# En tu máquina local (Proyecto Desarrollo)
cd ~/Proyectos/Desarrollo/Herrajes

# Hacer cambios en archivos
# Ejemplo: modificar src/components/Header.jsx

# Ver cambios
git status

# Agregar cambios
git add .
# O específico:
git add src/components/Header.jsx

# Commit con mensaje descriptivo
git commit -m "Fix: Actualizar Header layout para mobile"

# Push a GitHub
git push origin main
```

#### 🚀 PASO 2: Pull en Producción (Hostinger)

```bash
# En Hostinger (SSH)
cd ~/public_html/herrajes-app

# Traer cambios
git pull origin main

# Si hay cambios en server, reinstalar
if [ -d server ] && git diff HEAD~1 --name-only | grep -q "server/"; then
  cd server
  npm install
  npx prisma generate
  pm2 restart herrajes-api
fi

# Si hay cambios en frontend, reconstruir
if [ -d frontend ] && git diff HEAD~1 --name-only | grep -q "frontend/"; then
  cd ../frontend
  npm install
  npm run build
  # El backend sirve automáticamente dist/
fi

# Ver estado
pm2 status
pm2 logs herrajes-api --lines 20
```

---

## 🔧 MÉTODO 2: SCRIPT AUTOMÁTICO (Recomendado)

### Crear Script de Deploy

#### 2.1 En Desarrollo: Crear `deploy.sh`

```bash
#!/bin/bash
# Archivo: ~/Proyectos/Desarrollo/Herrajes/deploy.sh

set -e  # Exit si hay error

echo "🚀 Iniciando deploy a producción..."

# Validaciones previas
echo "✓ Validando cambios..."
npm list react > /dev/null 2>&1 || { echo "❌ npm no inicializado"; exit 1; }

# Build frontend
echo "📦 Compilando frontend..."
cd frontend
npm run build 2>&1 | tail -5
cd ..

# Commit y push
echo "📤 Subiendo a Git..."
git add -A
git commit -m "Deployment: $(date '+%Y-%m-%d %H:%M:%S')" || echo "Sin cambios que commitear"
git push origin main

echo "✅ Push completado a GitHub"
echo "📍 Próximo paso: Ejecuta 'pull' en Hostinger"
echo ""
echo "En Hostinger (SSH):"
echo "  cd ~/public_html/herrajes-app && git pull && ./sync-production.sh"
```

Hacer ejecutable:
```bash
chmod +x ~/Proyectos/Desarrollo/Herrajes/deploy.sh
```

Ejecutar:
```bash
./deploy.sh
```

#### 2.2 En Hostinger: Crear `sync-production.sh`

```bash
#!/bin/bash
# Archivo: ~/public_html/herrajes-app/sync-production.sh

set -e

echo "🔄 Sincronizando producción..."

# 1. Backend
echo "📦 Actualizando backend..."
cd server
npm install --production 2>&1 | tail -3
npx prisma generate
npx prisma migrate deploy
cd ..

# 2. Frontend
echo "📦 Actualizando frontend..."
cd frontend
npm install --production 2>&1 | tail -3
npm run build
cd ..

# 3. Reiniciar PM2
echo "🔄 Reiniciando servidor..."
cd server
pm2 restart herrajes-api

# 4. Verificar
echo ""
echo "✅ Sincronización completada"
pm2 status
echo ""
echo "🌐 URL: https://tudominio.com"
```

Hacer ejecutable en Hostinger:
```bash
chmod +x ~/public_html/herrajes-app/sync-production.sh
```

Usarlo:
```bash
./sync-production.sh
```

---

## 📊 MÉTODO 3: RSYNC (Para Carpetas Completas)

### Cuando quieras copiar rápido sin Git

#### 3.1 Desde tu máquina a Hostinger

```bash
# En tu máquina local

# Copiar solo frontend/dist (compilado)
rsync -avz --delete \
  ~/Proyectos/Desarrollo/Herrajes/frontend/dist/ \
  username@tudominio.com:~/public_html/herrajes-app/frontend/dist/

# Copiar solo server/src (código backend)
rsync -avz \
  ~/Proyectos/Desarrollo/Herrajes/server/src/ \
  username@tudominio.com:~/public_html/herrajes-app/server/src/

# Copiar migraciones Prisma
rsync -avz \
  ~/Proyectos/Desarrollo/Herrajes/server/prisma/ \
  username@tudominio.com:~/public_html/herrajes-app/server/prisma/
```

#### 3.2 Después, en Hostinger ejecutar

```bash
cd ~/public_html/herrajes-app/server
npm install
npx prisma migrate deploy
pm2 restart herrajes-api
```

---

## 🎯 MÉTODO 4: CHECKLIST MANUAL (Cambios Puntuales)

Usar cuando cambias solo 1-2 archivos.

### 4.1 Cambios Solo Frontend

```bash
# EN DESARROLLO
cd ~/Proyectos/Desarrollo/Herrajes

# 1. Hacer cambios en src/
# Ej: src/components/Header.jsx

# 2. Compilar
npm run build

# 3. Copiar dist/ a Hostinger
scp -r frontend/dist/* username@tudominio.com:~/public_html/herrajes-app/frontend/dist/
```

### 4.2 Cambios Solo Backend (No BD)

```bash
# EN DESARROLLO
cd ~/Proyectos/Desarrollo/Herrajes/server

# 1. Hacer cambios en src/
# Ej: src/routes/products.js

# 2. Validar sintaxis
node -c src/index.js

# 3. Copiar a Hostinger
scp -r src/ username@tudominio.com:~/public_html/herrajes-app/server/

# EN HOSTINGER (SSH)
cd ~/public_html/herrajes-app/server
npm install  # Por si hay paquetes nuevos
pm2 restart herrajes-api
```

### 4.3 Cambios en Base de Datos (Migraciones)

```bash
# EN DESARROLLO
cd ~/Proyectos/Desarrollo/Herrajes/server

# 1. Hacer cambios en prisma/schema.prisma
# Ej: agregar campo nuevo a Product

# 2. Crear migración
npx prisma migrate dev --name describe_el_cambio

# 3. Copiar migraciones nuevas
scp -r prisma/migrations/[NUEVA_CARPETA] \
  username@tudominio.com:~/public_html/herrajes-app/server/prisma/migrations/

# EN HOSTINGER (SSH)
cd ~/public_html/herrajes-app/server
npx prisma migrate deploy
npx prisma generate
pm2 restart herrajes-api
```

---

## 🚨 ROLLBACK (Volver Atrás)

### Si algo se rompe en producción

#### Opción A: Con Git

```bash
# EN HOSTINGER (SSH)
cd ~/public_html/herrajes-app

# Ver historial de commits
git log --oneline | head -10

# Volver al commit anterior
git reset --hard HEAD~1

# O volver a un commit específico
git reset --hard [COMMIT_HASH]

# Reiniciar
cd server && pm2 restart herrajes-api
```

#### Opción B: Sin Git

```bash
# EN HOSTINGER (SSH)

# 1. Restaurar desde backup
# (Si tienes archivos .bak o zip)
cp frontend/dist.bak/* frontend/dist/
cp server/src.bak/* server/src/

# 2. Reiniciar
cd ~/public_html/herrajes-app/server
pm2 restart herrajes-api
pm2 logs herrajes-api
```

---

## 📅 MIGRACIONES DE BD EN PRODUCCIÓN

### Migración Segura de Schema

```bash
# EN DESARROLLO
cd server

# 1. Modificar schema.prisma
# 2. Crear migración
npx prisma migrate dev --name cambio_importante

# 3. Ver SQL que se ejecutará
cat prisma/migrations/[TIMESTAMP]_cambio_importante/migration.sql

# 4. Commit
git add .
git commit -m "Migration: cambio_importante"
git push

# EN HOSTINGER (SSH)
cd ~/public_html/herrajes-app/server

# 5. Aplicar migración
npx prisma migrate deploy

# 6. Si hay error, ver el estado
npx prisma migrate status

# 7. Resolver conflicto (si aplica)
npx prisma migrate resolve --rolled-back [MIGRATION_NAME]
```

---

## 🎯 FLUJO RECOMENDADO (Diario)

```bash
# MAÑANA - Cambios en Desarrollo
# ==========================================
cd ~/Proyectos/Desarrollo/Herrajes
git pull origin main  # Traer cambios si hay
# ... hacer cambios ...
./deploy.sh           # Script que compila y pushea

# TARDE - Deploy a Producción (En Hostinger SSH)
# ==========================================
cd ~/public_html/herrajes-app
git pull origin main
./sync-production.sh  # Script que sincroniza todo

# NOCHE - Verificación
# ==========================================
pm2 logs herrajes-api --lines 50
curl https://tudominio.com/health
```

---

## 🔒 SEGURIDAD EN DEPLOY

### No commitear estos archivos

Crear `.gitignore` en raíz:

```gitignore
# Entorno
.env
.env.local
.env.*.local

# Node
node_modules/
npm-debug.log*
yarn-debug.log*

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/

# Temp
temp/
tmp/
```

### Variables sensibles en Hostinger

```bash
# .env NUNCA se commiteaba
# En Hostinger lo creas manualmente una vez

# Ver que .env esté protegido
ls -la ~/public_html/herrajes-app/server/.env
# Debe mostrar: -rw------- (600)

# Si no, corregir permisos
chmod 600 ~/public_html/herrajes-app/server/.env
```

---

## 📊 COMPARATIVA DE MÉTODOS

### Para Workflow Normal (Recomendado)

```bash
# Desarrollo → GitHub (1 comando)
./deploy.sh

# GitHub → Hostinger (SSH - 1 comando)
./sync-production.sh
```

**Tiempo total:** 2-3 minutos  
**Seguridad:** ⭐⭐⭐ (Git history completo)  
**Reversible:** ⭐⭐⭐ (Git rollback)

---

## 🆘 COMANDOS DE EMERGENCIA

```bash
# ¿El sitio cayó?
cd ~/public_html/herrajes-app/server
pm2 restart herrajes-api
pm2 logs herrajes-api --lines 100

# ¿BD no conecta?
npx prisma generate
npx prisma migrate status

# ¿Frontend no carga?
cd ../frontend
npm run build
ls dist/index.html  # Debe existir

# ¿Puerto 3001 ocupado?
lsof -i :3001
kill -9 [PID]
pm2 start ecosystem.config.js
```

---

## 📈 MONITOREO POST-DEPLOY

```bash
# Verificar que todo está corriendo
pm2 status

# Ver logs en vivo
pm2 logs herrajes-api

# Probar endpoints
curl https://tudominio.com/health
curl https://tudominio.com/api/categories

# Revisar BD
psql -U herrajes_user -d herrajes_db -c "SELECT COUNT(*) FROM \"Product\";"
```

---

**✅ Sincronización optimizada y segura entre Desarrollo y Producción.**

