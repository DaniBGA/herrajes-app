# 🚀 Guía de Deploy en Hostinger - Plan Business

## Requisitos previos

- Plan Business de Hostinger activado
- Dominio apuntado a Hostinger
- Acceso SSH a tu servidor
- Node.js 18+ instalado en Hostinger
- PostgreSQL disponible (incluido en plan Business)
- Estructura esperada del repo:
  - frontend en la raíz del proyecto
  - API en `server/`
  - build del frontend en `dist/`

---

## Paso 1: Configurar Base de Datos PostgreSQL

> Si estás en un VPS, es normal que no veas la opción de crear bases de datos en hPanel.
> En ese caso, la base PostgreSQL se instala y administra por SSH dentro del servidor.

### 1.0 Opción VPS: instalar PostgreSQL manualmente

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable --now postgresql
sudo systemctl status postgresql
```

Crear base y usuario:

```bash
sudo -u postgres psql
```

Dentro de `psql`:

```sql
CREATE USER herrajes_user WITH PASSWORD 'P@ssw0rd2024Secure!';
CREATE DATABASE herrajes_db OWNER herrajes_user;
GRANT ALL PRIVILEGES ON DATABASE herrajes_db TO herrajes_user;
\q
```

### 1.1 Opción Hosting administrado

### 1.1 Acceder a hPanel (Panel de Control Hostinger)

1. Inicia sesión en [hPanel](https://hpanel.hostinger.com)
2. Ve a **Bases de Datos** → **PostgreSQL**
3. Crea una nueva base de datos:
   - Nombre: `herrajes_db`
   - Usuario: `Enrique_owner`
   - Contraseña: Elige una contraseña fuerte (ej: `HerrajesDB4abril`)
4. Guarda estos datos - los necesitarás en el `.env`

### 1.2 Conectar vía SSH

```bash
ssh username@tudominio.com
# O con IP directa si prefieres
ssh username@[tu-ip-hostinger]
```

---

## Paso 2: Preparar el Servidor

### 2.1 Crear estructura de carpetas

```bash
# Ir a directorio raíz
cd ~/public_html

# Crear carpeta para la aplicación
mkdir herrajes-app
cd herrajes-app

# Crear subdirectorios
mkdir server uploads logs
```

### 2.2 Descargar archivos del proyecto

**Opción A: Desde Git (recomendado)**
```bash
cd ~/public_html/herrajes-app
git clone https://tu-repositorio.git .
```

**Opción B: Manualmente (si no usas Git)**
```bash
# Subir los archivos vía FTP/SFTP
# Copiar el frontend a ~/public_html/herrajes-app/
# Copiar el backend a ~/public_html/herrajes-app/server
```

---

## Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo `.env` en /server

```bash
cd ~/public_html/herrajes-app/server
nano .env
```

Pega el siguiente contenido (reemplaza con tus valores):

```env
# Database - Datos de Hostinger PostgreSQL
DATABASE_URL="postgresql://herrajes_user:P@ssw0rd2024Secure!@localhost:5432/herrajes_db?schema=public"

# Security
JWT_SECRET="tu-cadena-aleatoria-super-segura-de-minimo-32-caracteres-aqui-mas-caracteres"
ADMIN_EMAIL="admin@tudominio.com"
ADMIN_PASSWORD="ContraseñaAdminSegura123!!"

# Server Configuration
PORT=3001
CORS_ORIGIN="https://tudominio.com"
NODE_ENV="production"

# File Upload
UPLOAD_DIR="uploads"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email-gmail@gmail.com"
SMTP_PASS="tu-app-password-16-caracteres"
BUSINESS_EMAIL="contacto@tudominio.com"
```

💾 Guarda: `Ctrl + O` → Enter → `Ctrl + X`

---

## Paso 4: Instalar Dependencias

### 4.1 Frontend

```bash
cd ~/public_html/herrajes-app

# Instalar dependencias
npm install

# Compilar para producción
npm run build

# Verificar que se creó dist/
ls -la dist/
```

### 4.2 Backend

```bash
cd ~/public_html/herrajes-app/server

# Instalar dependencias
npm install

# Verificar sintaxis
node -c src/index.js
```

---

## Paso 5: Configurar Base de Datos

### 5.1 Ejecutar migraciones Prisma

```bash
cd ~/public_html/herrajes-app/server

# Aplicar migraciones
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate

# Crear usuario administrador (opcional - se crea automático)
npx prisma db seed 2>/dev/null || true
```

---

## Paso 6: Configurar PM2 (Gestor de Procesos)

### 6.1 Instalar PM2 globalmente

```bash
npm install -g pm2
```

### 6.2 Crear archivo de configuración

```bash
cd ~/public_html/herrajes-app/server
nano ecosystem.config.js
```

Pega:

```javascript
module.exports = {
  apps: [
    {
      name: 'herrajes-api',
      script: 'src/index.js',
      instances: 1,
      exec_mode: 'fork',
      cwd: './',
      env_file: './.env',
      env: {
        NODE_ENV: 'production',
        FRONTEND_DIST_DIR: '../dist'
      },
      error_file: '../logs/err.log',
      out_file: '../logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
```

Guarda: `Ctrl + O` → Enter → `Ctrl + X`

### 6.3 Iniciar aplicación con PM2

```bash
cd ~/public_html/herrajes-app/server

# Iniciar el proceso
pm2 start ecosystem.config.js

# Guardar configuración para reinicio automático
pm2 save

# Crear script de startup
pm2 startup

# Monitorear
pm2 monit
```

---

## Paso 7: Configurar Reverse Proxy (Nginx)

Hostinger ya tiene Nginx. Necesitamos redirigir las peticiones.

### 7.1 Configurar dominio en hPanel

1. Ve a **Dominios** → tu dominio
2. En **Gestionar**, busca **Proxy Inverso**
3. Crea una entrada:
   - Ruta: `/`
   - Destino: `http://localhost:3001`
   - Reescribir: Activado

Con esto, Nginx solo actúa como proxy y la API Node sirve el frontend compilado desde `../dist`.

O si prefieres manualmente:

```bash
sudo nano /etc/nginx/conf.d/herrajes.conf
```

Pega:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /home/username/public_html/herrajes-app/uploads;
        expires 30d;
    }
}
```

Luego:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Paso 8: Configurar SSL/HTTPS

### 8.1 Generar certificado Let's Encrypt

```bash
# Certbot ya debe estar instalado en Hostinger
sudo certbot certonly --nginx -d tudominio.com -d www.tudominio.com

# Renovación automática
sudo systemctl enable certbot.timer
sudo systemctl status certbot.timer
```

---

## Paso 9: Verificar que todo funciona

```bash
# Ver estado de PM2
pm2 status

# Ver logs en tiempo real
pm2 logs herrajes-api

# Probar endpoint
curl http://localhost:3001/health

# Probar desde navegador
# Abre: https://tudominio.com
```

Si el frontend no carga, comprobá que exista `~/public_html/herrajes-app/dist/index.html` y que la API se haya iniciado con `NODE_ENV=production`.

---

## Solución de Problemas Comunes

### Puerto 3001 ya está en uso
```bash
# Encontrar proceso
lsof -i :3001

# Matar proceso
kill -9 [PID]

# O cambiar puerto en .env y PM2
```

### Base de datos no conecta
```bash
# Verificar conexión PostgreSQL
psql -U herrajes_user -d herrajes_db -h localhost

# Ver logs del servidor
pm2 logs herrajes-api
```

### Archivos de subida no se guardan
```bash
# Verificar permisos de carpeta uploads
chmod -R 755 ~/public_html/herrajes-app/uploads

# Verificar propietario
chown -R $USER:$USER ~/public_html/herrajes-app/uploads
```

### Email no envía
```bash
# Verificar credenciales SMTP en .env
# Revisar logs
pm2 logs herrajes-api | grep -i email

# Probar conexión SMTP
telnet smtp.gmail.com 587
```

---

## Mantenimiento Periódico

```bash
# Ver estado general
pm2 status

# Reiniciar aplicación
pm2 restart herrajes-api

# Actualizar código
cd ~/public_html/herrajes-app
git pull origin main  # Si usas Git

# Reconstruir frontend
cd ~/public_html/herrajes-app && npm run build

# Reiniciar PM2
pm2 restart herrajes-api
```

---

## Cambio de Contraseña Admin

```bash
cd ~/public_html/herrajes-app/server
npx prisma studio

# Busca el admin y edita
```

---

**¡Listo! Tu aplicación está en vivo en Hostinger Business.** 🎉

