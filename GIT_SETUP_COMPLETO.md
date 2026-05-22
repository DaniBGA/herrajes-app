# ✅ GIT CONFIGURADO - Guía Final

**Fecha:** 22 de Mayo 2026  
**Repositorio:** https://github.com/DaniBGA/herrajes-app  
**Estado:** ✅ LISTO PARA USAR

---

## 🎯 Tu Configuración Actual

```
GitHub: herrajes-app
├── main (Rama de Desarrollo)
│   └── https://github.com/DaniBGA/herrajes-app/tree/main
│
└── production (Rama de Producción)
    └── https://github.com/DaniBGA/herrajes-app/tree/production

Tu Máquina:
├── ~/Proyectos/Desarrollo/Herrajes → Conectada a rama main
└── ~/Proyectos/Produccion/herrajes-app → Conectada a rama production
```

---

## 🚀 EL FLUJO (Resumen Super Rápido)

### 1️⃣ Haces cambios en Desarrollo

```bash
cd ~/Proyectos/Desarrollo/Herrajes
# ... editas archivos ...
git add .
git commit -m "Feature: Descripción"
git push origin main
```

### 2️⃣ Los mergeas a Producción

```bash
git checkout production
git merge main -m "Merge: Sincronizar cambios"
git push origin production
```

### 3️⃣ Listo! Los cambios están en GitHub

En GitHub aparecen en ambas ramas (main y production).

---

## 💻 TRES FORMAS DE USARLO

### FORMA 1: Línea de Comando (Lo que acabas de hacer)

```bash
# Desarrollo
cd ~/Proyectos/Desarrollo/Herrajes
git add .
git commit -m "Change: ..."
git push origin main

# Producción (fusión manual)
git checkout production
git merge main -m "Merge: ..."
git push origin production
```

---

### FORMA 2: Usando los Scripts

```bash
# Desarrollo
cd ~/Proyectos/Desarrollo/Herrajes
./deploy.sh

# Hostinger (si tienes)
cd ~/public_html/herrajes-app
git pull origin production
./sync-production.sh
```

---

### FORMA 3: GitHub Web (Visual)

1. Ve a https://github.com/DaniBGA/herrajes-app
2. Click en **Pull requests**
3. **New pull request** (main → production)
4. Click **Merge pull request**
5. Confirma

GitHub hace el merge automáticamente.

---

## 📋 TAREAS COMUNES

### Ver cambios que hiciste

```bash
git status
git log --oneline -5
```

### Deshacer un cambio

```bash
# Deshacer cambios locales (antes de commit)
git restore archivo.js

# Deshacer commit (pero mantener cambios)
git reset HEAD~1

# Deshacer commit y cambios
git reset --hard HEAD~1
```

### Ver diferencias

```bash
# Entre working directory y staging
git diff

# Entre commits
git diff HEAD~1 HEAD
```

### Crear una rama nueva (opcional)

```bash
# Rama para una feature
git checkout -b feature/header-redesign

# Trabajar en la rama
git add . && git commit -m "Feature: ..."

# Mergear a main
git checkout main
git merge feature/header-redesign
git push origin main
```

---

## 🔄 EJEMPLO: Cambiar el Logo

### Paso 1: En Desarrollo
```bash
cd ~/Proyectos/Desarrollo/Herrajes

# Reemplazar logo
cp /path/logo-nuevo.png frontend/src/images/

# Actualizar referencia
nano frontend/src/components/Header.jsx
# Cambiar: import logoImage from '../images/...'

# Ver cambios
git status
# Mostrará: frontend/src/images/logo-nuevo.png (new)
#           frontend/src/components/Header.jsx (modified)

# Commit
git add .
git commit -m "UI: Actualizar logo corporativo"

# Push a main
git push origin main
```

### Paso 2: Mergear a Producción
```bash
git checkout production
git merge main -m "Merge: Nuevo logo"
git push origin production

# Resultado en GitHub:
# - main tiene el nuevo logo
# - production tiene el nuevo logo
```

### Paso 3: Ver en GitHub
- Ve a https://github.com/DaniBGA/herrajes-app
- Tab "Code"
- Cambiar rama a main → Ve el logo nuevo ✓
- Cambiar rama a production → Ve el logo nuevo ✓

---

## 🔐 IMPORTANTE: .gitignore

Estos archivos NO se suben (quedan locales):

```
❌ .env                    ← Contraseñas y keys
❌ node_modules/          ← Se genera con npm install
❌ dist/                   ← Se genera con npm run build
❌ .vscode/               ← Configuración personal IDE
❌ *.log                   ← Logs de ejecución
```

---

## 📊 STATUS DE GITHUB

Ve a: https://github.com/DaniBGA/herrajes-app

Verás:
- ✅ **main** - Última commit tuya
- ✅ **production** - Mergeado desde main
- ✅ Historial de commits
- ✅ Pull requests (si los hiciste)

---

## 🎓 AHORA: Qué Hacer

### OPCIÓN 1: Seguir usando la terminal

```bash
# Cuando termines cambios
cd ~/Proyectos/Desarrollo/Herrajes
./deploy.sh          # O: git add . && git commit && git push

# Cuando quieras mergear
git checkout production
git merge main
git push origin production
```

### OPCIÓN 2: Usar GitHub Web para mergear

```bash
# Terminal: solo push a main
cd ~/Proyectos/Desarrollo/Herrajes
git add . && git commit && git push origin main

# GitHub Web: Ver el "Pull request" y hacer click en "Merge"
# https://github.com/DaniBGA/herrajes-app
```

### OPCIÓN 3: Automatizar con GitHub Actions (Avanzado)

Crear un workflow que automáticamente mergee main → production cuando hagas push.

---

## 📚 CHEAT SHEET RÁPIDO

```bash
# VER ESTADO
git status
git log --oneline

# CAMBIOS
git add .
git add archivo.js         # Solo un archivo
git commit -m "Descripción"
git push origin main       # Subir a main
git push origin production # Subir a production

# CAMBIAR RAMA
git checkout main          # Ir a main
git checkout production    # Ir a production
git branch -a              # Ver todas las ramas

# MERGEAR
git merge main             # Mergear main a rama actual
git merge production       # Mergear production a rama actual

# DESHACER
git reset HEAD~1           # Deshacer commit
git reset --hard HEAD~1    # Deshacer todo
git revert HEAD            # Crear commit que deshace
```

---

## ⚠️ ERRORES QUE PUEDEN PASAR

### "Tu rama está adelantada a origin"
```bash
git push origin [rama]  # Subir los cambios
```

### "Los archivos sin seguimiento serán sobrescritos"
```bash
git add .
git commit -m "Add files"
git push origin [rama]
```

### "Conflicto al mergear"
```bash
# Editar el archivo manualmente (Git te lo marca)
git add .
git commit -m "Resolver conflicto"
git push origin [rama]
```

---

## 🌟 LO MEJOR DE TODO

Una vez que hagas el merge en GitHub:

```
main → Se actualiza en GitHub
       ↓
production → Se actualiza en GitHub
             ↓
Tu carpeta de producción
             ↓
git pull origin production
             ↓
¡SINCRONIZADO! ✅
```

---

## 📞 RESUMEN FINAL

**Configuración:** ✅ LISTA

**Ramas en GitHub:** 
- ✅ main (desarrollo)
- ✅ production (producción)

**Carpetas locales:**
- ✅ ~/Proyectos/Desarrollo/Herrajes (main)
- ✅ ~/Proyectos/Produccion/herrajes-app (production)

**Próximos pasos:**
1. Editar código
2. Commit + push
3. Mergear a production
4. ¡LISTO!

---

## 🚀 COMANDO DE HOY

```bash
cd ~/Proyectos/Desarrollo/Herrajes
git add .
git commit -m "Ready for production"
git push origin main
```

**¡Ya estás usando Git como profesional!** 🎉

---

Para más detalles, ver:
- `FLUJO_GIT_MERGE.md` - Guía completa paso a paso
- `QUICK_SYNC.md` - Scripts automatizados
- `SYNC_PROD_COMANDOS.md` - Métodos avanzados

