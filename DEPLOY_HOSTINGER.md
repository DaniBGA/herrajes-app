# Deploy en VPS Hostinger

Guía pensada para un **VPS real en Ubuntu**. No usa flujo de hosting compartido. La aplicación se despliega así:

- el frontend se compila en la **raíz** del proyecto con Vite
- el backend vive en `server/`
- PostgreSQL corre en el mismo VPS
- Nginx hace de reverse proxy
- PM2 mantiene vivo el proceso Node
- Certbot emite y renueva el SSL

## 1. Preparar el VPS

Conectate por SSH:

```bash
ssh ubuntu@IP_DEL_VPS
```

Actualizá el sistema e instalá lo necesario:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates build-essential nginx postgresql postgresql-contrib
```

## 2. Instalar Node.js

Instalá Node.js 20 LTS. Si el VPS no lo tiene, usá NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 3. Descargar el proyecto

Usá una carpeta como `~/herrajes-app` o la ruta que prefieras:

```bash
cd ~
git clone https://tu-repositorio.git herrajes-app
cd herrajes-app
```

La estructura esperada es:

- `package.json` y `src/` en la raíz
- `server/` con la API
pm2 start ~/herrajes-app/server/ecosystem.config.cjs

## 4. Crear PostgreSQL en el VPS

En un VPS no hace falta buscar una opción en hPanel. La base se crea por SSH.

Entrá a PostgreSQL como superusuario:

```bash
sudo -u postgres psql
```

Dentro de `psql`, creá usuario y base:

```sql
CREATE USER herrajes_user WITH PASSWORD 'P@ssw0rd2024Secure!';
CREATE DATABASE herrajes_db OWNER herrajes_user;
GRANT ALL PRIVILEGES ON DATABASE herrajes_db TO herrajes_user;
\q
```

### 4.1 Verificar que PostgreSQL esté activo

```bash
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

## 5. Configurar variables de entorno

### 5.1 Frontend

En la raíz del proyecto, si necesitás apuntar a la API:

```bash
nano .env
```

Ejemplo:

```env
VITE_API_BASE_URL=https://almacendeherrajes.com/api
```

### 5.2 Backend

Creá `server/.env`:

```bash
cd ~/herrajes-app/server
nano .env
```

Usá algo así:

```env
DATABASE_URL="postgresql://herrajes_user:P@ssw0rd2024Secure!@localhost:5432/herrajes_db?schema=public"
JWT_SECRET="una-clave-larga-y-segura-de-minimo-32-caracteres"
ADMIN_EMAIL="admin@almacendeherrajes.com"
ADMIN_PASSWORD="CambiarEstaClave123!"
PORT=3001
NODE_ENV="production"
CORS_ORIGIN="https://almacendeherrajes.com"
UPLOAD_DIR="uploads"
FRONTEND_DIST_DIR="../dist"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="tu-correo@gmail.com"
SMTP_PASS="tu-app-password"
SMTP_FROM_NAME="Almacen de Herrajes"
SMTP_FROM_EMAIL="tu-correo@gmail.com"
SMTP_REJECT_UNAUTHORIZED=false
BUSINESS_EMAIL="tu-correo@gmail.com"
```

## 6. Instalar dependencias y compilar

### 6.1 Frontend

Desde la raíz del proyecto:

```bash
cd ~/herrajes-app
npm install
npm run build
ls -la dist/
```

### 6.2 Backend

```bash
cd ~/herrajes-app/server
npm install
npx prisma generate
npx prisma migrate deploy
node prisma/seed-categories.js
node prisma/seed-admin.js
node prisma/import_productos.mjs
```

## 7. Probar localmente en el VPS

Antes de poner Nginx, probá la app con Node:

```bash
cd ~/herrajes-app/server
npm run dev
```

Si arranca bien, la API debería responder en:

```bash
curl http://localhost:3001/health
```

## 8. Configurar PM2

Instalá PM2 globalmente:

```bash
sudo npm install -g pm2
```

El repositorio ya incluye `server/ecosystem.config.cjs`. Si necesitás recrearlo, el contenido es:

```bash
cd ~/herrajes-app/server
nano ecosystem.config.cjs
```

Contenido:

```js
const path = require('node:path');

const serverRoot = __dirname;

module.exports = {
  apps: [
    {
      name: 'herrajes-api',
      script: path.join(serverRoot, 'src', 'index.js'),
      cwd: serverRoot,
      instances: 1,
      exec_mode: 'fork',
      env_file: path.join(serverRoot, '.env'),
      env: {
        NODE_ENV: 'production',
        FRONTEND_DIST_DIR: path.resolve(serverRoot, '..', 'dist')
      }
    }
  ]
};
```

Iniciá el proceso:

```bash
cd ~/herrajes-app/server
pm2 start ./ecosystem.config.cjs
pm2 save
pm2 startup
```

## 9. Configurar Nginx

Creá un sitio para el dominio:

```bash
sudo nano /etc/nginx/sites-available/herrajes
```

Contenido:

```nginx
server {
    listen 80;
    server_name almacendeherrajes.com www.almacendeherrajes.com;

    client_max_body_size 20m;

    location /uploads/ {
      alias /root/herrajes-app/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activá el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/herrajes /etc/nginx/sites-enabled/herrajes
sudo nginx -t
sudo systemctl reload nginx
```

## 10. Configurar SSL con Certbot

Instalá Certbot y el plugin de Nginx:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Emití el certificado:

```bash
sudo certbot --nginx -d almacendeherrajes.com -d www.almacendeherrajes.com
```

Verificá renovación automática:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## 11. Verificación final

Chequeá todo:

```bash
pm2 status
pm2 logs herrajes-api
curl http://localhost:3001/health
```

En navegador:

- `https://almacendeherrajes.com`
- `https://almacendeherrajes.com/health`

## 12. Actualizar la app después de un cambio

Cuando subas una nueva versión:

```bash
cd ~/herrajes-app
git pull origin main
npm install
npm run build

cd ~/herrajes-app/server
npm install
npx prisma migrate deploy
pm2 restart herrajes-api
```

## 13. Problemas comunes

### No levanta PostgreSQL

```bash
sudo systemctl status postgresql
sudo journalctl -u postgresql -n 100 --no-pager
```

### Puerto 3001 ocupado

```bash
sudo lsof -i :3001
sudo kill -9 PID
```

### No carga el frontend

Verificá que exista:

```bash
ls -la ~/herrajes-app/dist/index.html
```

Y que el backend esté corriendo con:

```bash
NODE_ENV=production
FRONTEND_DIST_DIR=../dist
```

### El email rebota

- `SMTP_USER` debe ser un correo real
- `BUSINESS_EMAIL` debe existir y recibir mail
- `SMTP_PASS` debe ser una app password válida

---

## Resumen del flujo real de deploy

1. Subís el repo al VPS.
2. Instalás Node, Nginx y PostgreSQL.
3. Creás la base y el usuario con `psql`.
4. Configurás `.env` en `server/`.
5. Corrés `npm install` en la raíz y en `server/`.
6. Corrés `npm run build` en la raíz.
7. Aplicás Prisma y seeds.
8. Levantás la API con PM2.
9. Ponés Nginx como reverse proxy.
10. Emitís SSL con Certbot.
11. Renovación automática con `certbot.timer`.

---

**Fin de la guía VPS.**
