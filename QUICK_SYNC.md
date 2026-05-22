# 🔄 RESUMEN RÁPIDO: Sincronización Dev → Prod

## ✨ La Forma Más Rápida

```bash
# EN TU MÁQUINA (Desarrollo)
# ============================
cd ~/Proyectos/Desarrollo/Herrajes
./deploy.sh

# EN HOSTINGER (SSH)
# ============================
cd ~/public_html/herrajes-app
git pull origin main
./sync-production.sh
```

**¡LISTO!** Todo sincronizado en 3 comandos. ⏱️ ~3 minutos total.

---

## 📋 ¿Qué Hace Cada Script?

### 1️⃣ `deploy.sh` (En Desarrollo)

```bash
✓ Valida que npm, node, git estén instalados
✓ Compila frontend → npm run build → crea dist/
✓ Valida sintaxis backend → node -c src/index.js
✓ Git add + commit con timestamp
✓ Git push origin main
```

**Resultado:** Código en GitHub listo para producción.

---

### 2️⃣ `sync-production.sh` (En Hostinger)

```bash
✓ Git pull → trae cambios
✓ npm install (production mode)
✓ npx prisma generate → genera cliente
✓ npx prisma migrate deploy → aplica migraciones BD
✓ npm run build → compila frontend
✓ pm2 restart herrajes-api → reinicia servidor
✓ Verifica que todo funcione
```

**Resultado:** Cambios aplicados en vivo, servidor reiniciado, verificado.

---

## 🎯 Casos de Uso

### Caso 1: Cambios en Frontend (Componentes, Estilos)

```bash
# Desarrollo
./deploy.sh

# Hostinger
git pull origin main && ./sync-production.sh
```

✅ Frontend compilado + backend reiniciado  
⏱️ ~2 minutos

---

### Caso 2: Cambios en Backend (API, rutas)

```bash
# Desarrollo
./deploy.sh

# Hostinger
git pull origin main && ./sync-production.sh
```

✅ Backend actualizado + dependencias instaladas  
⏱️ ~3 minutos

---

### Caso 3: Cambios en Base de Datos (Schema)

```bash
# Desarrollo
# 1. Editar server/prisma/schema.prisma
# 2. npx prisma migrate dev --name describe_cambio
# 3. ./deploy.sh

# Hostinger
git pull origin main && ./sync-production.sh
```

✅ Migraciones aplicadas automáticamente  
⏱️ ~4 minutos

---

## 🚨 Si algo Falla

### El script de deploy se detiene

```bash
# Ver qué salió mal
cat output.log

# O ejecutar paso a paso:
npm run build      # Ver error de build
node -c server/src/index.js  # Ver error de sintaxis
```

### En Hostinger, sync falla

```bash
# Ver logs
pm2 logs herrajes-api --lines 100

# Problemas comunes
git status         # ¿Hay conflictos?
npm list           # ¿Dependencias OK?
psql -U herrajes_user -d herrajes_db -c "SELECT 1"  # ¿BD conecta?
```

---

## 📊 Alternativas Rápidas (Sin Scripts)

### Solo Frontend
```bash
# Dev
cd frontend && npm run build
scp -r dist/* user@host:~/public_html/herrajes-app/frontend/dist/

# Host
pm2 restart herrajes-api
```

### Solo Backend (Sin BD)
```bash
# Dev
cd server && node -c src/index.js
scp -r src/ user@host:~/public_html/herrajes-app/server/

# Host
cd server && npm install && pm2 restart herrajes-api
```

### Solo BD
```bash
# Dev
npx prisma migrate dev --name cambio

# Host
cd server
npx prisma migrate deploy
npm install
pm2 restart herrajes-api
```

---

## ⏱️ Tiempos Esperados

| Acción | Tiempo |
|--------|--------|
| npm run build | 30s |
| npm install | 20s |
| prisma migrate | 5s |
| pm2 restart | 3s |
| Git push | 5s |
| Git pull | 3s |
| **TOTAL** | **~2-3 min** |

---

## 🔗 Ver Estado en Hostinger

```bash
# SSH
ssh user@tudominio.com

# Estado del servidor
pm2 status

# Logs en vivo
pm2 logs herrajes-api

# Health check
curl https://tudominio.com/health

# Base de datos
psql -U herrajes_user -d herrajes_db -c "SELECT COUNT(*) FROM \"Product\";"
```

---

## 💡 Tips

✅ **Antes de deploy:** Git commit con mensaje descriptivo  
✅ **Después de deploy:** Probar en navegador https://tudominio.com  
✅ **Problemas:** Revisar `pm2 logs` primero  
✅ **Emergencia:** `pm2 reset && pm2 start ecosystem.config.js`

---

## 📚 Documentación Completa

Para detalles completos, ver:
- `SYNC_PROD_COMANDOS.md` - Todos los métodos
- `SEGURIDAD_BD_INDEXACION.md` - Índices y seguridad
- `DEPLOY_HOSTINGER.md` - Setup inicial

---

**🚀 Sincronización lista para producción.**

