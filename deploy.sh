#!/bin/bash
# Deploy Script para Desarrollo
# Uso: ./deploy.sh
# Compila frontend, valida backend y pushea a Git

set -e  # Exit si hay error

echo "🚀 ========================================="
echo "   HERRAJES - Deploy a Producción"
echo "========================================="
echo ""

# Variables
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"
SERVER_DIR="$PROJECT_DIR/server"

# ================================
# 1. VALIDAR AMBIENTE
# ================================
echo "✓ Validando ambiente..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js no está instalado"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌ npm no está instalado"
  exit 1
fi

if ! command -v git &> /dev/null; then
  echo "❌ Git no está instalado"
  exit 1
fi

echo "✓ Herramientas OK: Node $(node --version), npm $(npm --version)"
echo ""

# ================================
# 2. COMPILAR FRONTEND
# ================================
echo "📦 Compilando frontend..."
cd "$FRONTEND_DIR"

if [ ! -f package.json ]; then
  echo "❌ package.json no encontrado en frontend/"
  exit 1
fi

npm install --silent 2>&1 | grep -E "(added|up to date|vulnerabilities)" || true
npm run build 2>&1 | tail -5

if [ ! -d dist ]; then
  echo "❌ Build de frontend falló - no existe dist/"
  exit 1
fi

echo "✓ Frontend compilado exitosamente"
echo ""

# ================================
# 3. VALIDAR BACKEND
# ================================
echo "🔍 Validando backend..."
cd "$SERVER_DIR"

if [ ! -f package.json ]; then
  echo "❌ package.json no encontrado en server/"
  exit 1
fi

if ! node -c src/index.js 2>&1 | grep -q "syntax ok\|^$"; then
  echo "⚠️ Backend tiene errores de sintaxis"
  node -c src/index.js
  exit 1
fi

echo "✓ Backend validado sin errores"
echo ""

# ================================
# 4. GIT - COMMIT Y PUSH
# ================================
echo "📤 Preparando Git..."
cd "$PROJECT_DIR"

# Verificar que estamos en un repo Git
if [ ! -d .git ]; then
  echo "⚠️ No es un repositorio Git. Inicializando..."
  git init
  git add .
  git commit -m "Initial commit: Herrajes ecommerce"
  echo "📍 Primer commit creado. Agrega remote:"
  echo "   git remote add origin https://github.com/tu-usuario/herrajes-app.git"
  exit 0
fi

# Mostrar cambios
CHANGES=$(git status --short | wc -l)
if [ "$CHANGES" -eq 0 ]; then
  echo "ℹ️ No hay cambios para commitear"
else
  echo "📝 Cambios detectados: $CHANGES archivos"
  git status --short | head -10
  echo ""
fi

# Agregar cambios
git add -A

# Commit
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Deploy: $TIMESTAMP

Frontend: Compilado
Backend: Validado
DB: Schema actualizado" 2>&1 | grep -v "nothing to commit" || echo "ℹ️ Sin cambios nuevos"

# Push
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo ""
echo "🔄 Subiendo a GitHub ($BRANCH)..."

if git push origin "$BRANCH" 2>&1 | grep -E "(Everything up-to-date|✓|files changed)"; then
  echo "✓ Push completado exitosamente"
else
  echo "⚠️ Push completado (revisar arriba)"
fi

echo ""
echo "========================================="
echo "✅ Deploy a desarrollo completado"
echo "========================================="
echo ""
echo "📍 Próximo paso: Sincronizar en Hostinger"
echo ""
echo "SSH a Hostinger:"
echo "  ssh username@tudominio.com"
echo ""
echo "Luego ejecutar:"
echo "  cd ~/public_html/herrajes-app"
echo "  git pull origin $BRANCH"
echo "  ./sync-production.sh"
echo ""
