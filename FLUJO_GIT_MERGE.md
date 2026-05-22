# 🔄 Flujo Git: Desarrollo → Merge → Producción (PASO A PASO)

**Estado:** ✅ Configurado y Listo  
**Repositorio:** https://github.com/DaniBGA/herrajes-app  
**Ramas:** main (desarrollo) y production (producción)

---

## 📊 Arquitectura de Ramas

```
GitHub: herrajes-app
│
├─ main (Rama de DESARROLLO)
│  ├─ src/
│  ├─ server/
│  ├─ frontend/
│  └─ Archivos del proyecto
│
└─ production (Rama de PRODUCCIÓN)
   ├─ src/
   ├─ server/
   ├─ frontend/
   └─ Igual a main (sincronizado después de merge)

Local:
│
├─ ~/Proyectos/Desarrollo/Herrajes → Conectada a rama main
└─ ~/Proyectos/Produccion/herrajes-app → Conectada a rama production
```

---

## 🎯 FLUJO DIARIO (Paso a Paso)

### PASO 1: Cambios en Desarrollo

```bash
# En tu máquina
cd ~/Proyectos/Desarrollo/Herrajes

# Haces cambios (ej: editas un componente)
nano frontend/src/components/Header.jsx

# Ves que cambió
git status
# Mostará: frontend/src/components/Header.jsx modificado

# Compilas frontend (si cambió)
npm run build

# Validas backend (si cambió)
cd server && node -c src/index.js && cd ..
```

---

### PASO 2: Commit en Desarrollo

```bash
# Staging de cambios
git add .
# O solo archivos específicos:
git add frontend/src/components/Header.jsx

# Commit con mensaje descriptivo
git commit -m "Fix: Actualizar Header para mobile responsivo"

# Ver commits
git log --oneline -5
```

---

### PASO 3: Push a GitHub (main)

```bash
# Subir a rama main
git push origin main

# Verificar
git status
# Debe mostrar: "Tu rama está actualizada con 'origin/main'"
```

---

### PASO 4: Mergear a Producción (Opción A: Manual)

```bash
# Cambiar a rama production LOCAL
git checkout production

# Traer cambios desde GitHub (si alguien más hizo cambios)
git pull origin production

# Mergear cambios de main
git merge main -m "Merge: Sincronizar cambios de desarrollo"

# Subir el merge a GitHub
git push origin production

# Volver a main
git checkout main

# Resultado: production ahora tiene los cambios ✅
```

---

### PASO 4B: Mergear a Producción (Opción B: Pull Request en GitHub)

1. Ve a https://github.com/DaniBGA/herrajes-app
2. Click en **Pull requests**
3. Click en **New pull request**
4. Configura:
   - **Base:** production (destino)
   - **Compare:** main (origen)
5. Click **Create pull request**
6. Añade descripción (opcional)
7. Click **Merge pull request**
8. Click **Confirm merge**
9. Delete branch (opcional)

**Resultado:** GitHub hace el merge automáticamente ✅

---

### PASO 5: Sincronizar Carpeta de Producción

```bash
# En Hostinger LOCAL (o tu carpeta de producción)
cd ~/Proyectos/Produccion/herrajes-app

# Traer cambios desde GitHub
git pull origin production

# Verificar
git status
# Debe mostrar: "Tu rama está actualizada con 'origin/production'"

# Ver qué cambió
git log --oneline -3

# Resultado: Carpeta de producción sincronizada ✅
```

---

## 📁 Archivos en Cada Rama

### Rama main (Desarrollo)
```
~/Proyectos/Desarrollo/Herrajes/
├── frontend/
│   ├── src/
│   ├── dist/            ← Generado por npm run build (NO versionado)
│   └── package.json
├── server/
│   ├── src/
│   ├── prisma/
│   ├── node_modules/    ← NO versionado
│   └── package.json
├── deploy.sh            ← Script de deploy
├── .gitignore
└── *.md
```

### Rama production (Producción)
```
~/Proyectos/Produccion/herrajes-app/
├── frontend/
│   ├── src/
│   ├── dist/            ← Compilado
│   └── package.json
├── server/
│   ├── src/
│   ├── prisma/
│   ├── node_modules/    ← NO versionado
│   └── package.json
├── sync-production.sh   ← Script de sincronización
├── .env.example
└── *.md
```

---

## 🚀 CICLO COMPLETO (Un Ejemplo Real)

### Escenario: Quieres cambiar el color del Header

**PASO 1: En Desarrollo**
```bash
cd ~/Proyectos/Desarrollo/Herrajes
git checkout main

# Editar archivo
nano frontend/src/styles/header.css
# Cambiar color: #333 → #0066cc

# Compilar
npm run build

# Commit
git add frontend/src/styles/header.css
git commit -m "Feature: Cambiar color header a azul corporativo"

# Push
git push origin main
```

**PASO 2: Mergear a Producción**
```bash
# Opción A: Manual
git checkout production
git pull origin production
git merge main -m "Merge: Color header azul"
git push origin production

# O Opción B: Pull Request en GitHub.com
```

**PASO 3: Sincronizar en Hostinger**
```bash
cd ~/Proyectos/Produccion/herrajes-app
git pull origin production

# Opcional: compilar si hay cambios
cd frontend && npm run build

# Opcional: reiniciar servidor
cd ../server && npm install && pm2 restart herrajes-api
```

**RESULTADO:** El sitio en vivo ahora tiene el header azul ✅

---

## 🔄 CASOS ESPECIALES

### Caso 1: Cambios SOLO en Frontend

```bash
# Desarrollo
cd ~/Proyectos/Desarrollo/Herrajes
npm run build
git add frontend/
git commit -m "UI: Cambios en botones"
git push origin main

# Producción (Git + rebuild)
cd ~/Proyectos/Produccion/herrajes-app
git pull origin production
cd frontend && npm run build
# El backend sirve automáticamente dist/
```

---

### Caso 2: Cambios SOLO en Backend

```bash
# Desarrollo
cd ~/Proyectos/Desarrollo/Herrajes/server
node -c src/index.js
git add server/
git commit -m "API: Nueva ruta de búsqueda"
git push origin main

# Producción (Git + reinstalar + reiniciar)
cd ~/Proyectos/Produccion/herrajes-app
git pull origin production
cd server
npm install
pm2 restart herrajes-api
```

---

### Caso 3: Cambios en Base de Datos (CRÍTICO)

```bash
# Desarrollo
cd ~/Proyectos/Desarrollo/Herrajes/server
# Editar prisma/schema.prisma
npx prisma migrate dev --name "describe_el_cambio"
git add server/prisma/
git commit -m "DB: Agregar campo nuevo a Product"
git push origin main

# Producción (Git + migración)
cd ~/Proyectos/Produccion/herrajes-app
git pull origin production
cd server
npx prisma migrate deploy  # ← Aplica automáticamente
npx prisma generate
pm2 restart herrajes-api
```

---

### Caso 4: Revertir Cambios (Rollback)

```bash
# Si algo salió mal en producción
cd ~/Proyectos/Produccion/herrajes-app

# Ver historial
git log --oneline -10

# Volver al commit anterior
git reset --hard HEAD~1

# O volver a un commit específico
git reset --hard [HASH_DEL_COMMIT]

# Reiniciar servidor
cd server && pm2 restart herrajes-api

# Si necesitas revertir en GitHub también
git push -f origin production
```

---

## 📋 COMANDOS MÁS USADOS

```bash
# VER ESTADO
git status
git log --oneline -5

# AGREGAR Y COMMIT
git add .
git commit -m "Descripción del cambio"

# PUSH/PULL
git push origin main          # Enviar a GitHub
git pull origin main          # Traer desde GitHub

# CAMBIAR RAMA
git checkout main             # Cambiar a main
git checkout production       # Cambiar a production

# MERGE
git merge main                # Mergear main a rama actual

# VER RAMAS
git branch -a                 # Ver todas las ramas
git branch -vv                # Ver ramas con tracking
```

---

## 🔐 SEGURIDAD

### Archivos que NO se versionan (.gitignore)

```
.env                          ← NUNCA commitear
node_modules/                 ← Se regenera con npm install
frontend/dist/                ← Se genera con npm run build
server/node_modules/          ← Se regenera con npm install
```

### ¿Qué SI se versionan?

```
✅ Código fuente (src/, frontend/src/, server/src/)
✅ Configuración (schema.prisma, package.json)
✅ Migraciones (server/prisma/migrations/)
✅ Documentación (.md)
✅ Scripts (deploy.sh, sync-production.sh)
```

---

## ⚠️ ERRORES COMUNES

### Error: "Tu rama está adelantada a 'origin/main'"

Significa que tienes commits locales no pusheados.

```bash
git push origin main  # Subir los cambios
```

---

### Error: "Conflicto al mergear"

Dos personas editaron el mismo archivo.

```bash
# Git te muestra el conflicto
# Abrir archivo y resolver manualmente

git status  # Ver archivos con conflicto

# Después de resolver
git add .
git commit -m "Resolver conflicto"
git push origin [rama]
```

---

### Error: "Los archivos sin seguimiento serán sobrescritos"

Tienes archivos no versionados que entran en conflicto.

```bash
# Opción 1: Agregar los archivos
git add .
git commit -m "Add untracked files"

# Opción 2: Descartar los cambios locales
git clean -fd
git checkout .
```

---

## ✅ CHECKLIST ANTES DE MERGE

- [ ] Probaste los cambios en desarrollo
- [ ] `npm run build` compila sin errores
- [ ] `node -c server/src/index.js` sin errores
- [ ] Git status está limpio
- [ ] Commits tienen mensajes descriptivos
- [ ] Has hecho `git push origin main`
- [ ] La rama production está lista en GitHub

---

## 📊 RESUMEN RÁPIDO

```
Desarrollo                      GitHub                      Producción
    │                              │                             │
    ├─ Editar archivos             │                             │
    ├─ npm run build               │                             │
    ├─ git add .                   │                             │
    ├─ git commit                  │                             │
    └─ git push ───────────────→   main                          │
                                    │                             │
                       Pull Request o Merge Manual                │
                                    │                             │
                                    production ─────────────────→ ├─ git pull
                                    │                             └─ Sincronizado
                                    │                             ✅ En Vivo
```

---

## 🎓 RESUMEN

**Cuando terminas cambios:**

1. `git add .`
2. `git commit -m "descripción"`
3. `git push origin main`

**Para llevar a producción:**

4. `git checkout production`
5. `git merge main -m "Merge: ..."`
6. `git push origin production`

**En Hostinger:**

7. `git pull origin production`
8. Rebuild si es necesario
9. `pm2 restart herrajes-api`

**¡Listo!** Cambios en vivo 🚀

---

## 📚 Documentos Relacionados

- `QUICK_SYNC.md` - Scripts automatizados
- `SYNC_PROD_COMANDOS.md` - Métodos avanzados
- `DEPLOY_HOSTINGER.md` - Setup inicial en Hostinger

---

**Repositorio:** https://github.com/DaniBGA/herrajes-app  
**Fecha:** 22 de Mayo 2026

