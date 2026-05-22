# ✅ Checklist Deploy Hostinger Business - Comandos Necesarios

## PRE-DEPLOY: Preparación Local (Antes de subir)

- [ ] Build frontend compilado sin errores
  ```bash
  cd Herrajes
  npm run build
  # Debe crear carpeta dist/ sin errores
  ```

- [ ] Backend sin errores sintácticos
  ```bash
  cd Herrajes/server
  node -c src/index.js
  # Debe no mostrar errores
  ```

- [ ] `.env.example` existe en `/server`
  ```bash
  ls -la Herrajes/server/.env.example
  # Debe existir el archivo
  ```

---

## PASO 1: Acceder al Servidor Hostinger

- [ ] Conectar vía SSH
  ```bash
  ssh username@tudominio.com
  # O ssh username@[IP-HOSTINGER]
  ```

- [ ] Verificar que estás en `~/public_html`
  ```bash
  pwd
  # Debe mostrar: /home/username/public_html
  ```

---

## PASO 2: Estructura de Carpetas

- [ ] Crear carpeta principal
  ```bash
  mkdir -p herrajes-app
  cd herrajes-app
  ```

- [ ] Crear subdirectorios
  ```bash
  mkdir server frontend uploads logs
  ls -la
  # Debe mostrar los 4 directorios
  ```

---

## PASO 3: Subir Archivos

- [ ] Via Git (recomendado)
  ```bash
  cd ~/public_html/herrajes-app
  git clone https://tu-repositorio.git .
  ls -la
  # Debe mostrar carpetas: server, frontend, package.json, etc.
  ```

  O manualmente via FTP/SFTP:
  - [ ] Copiar contenido de `/server` → `~/public_html/herrajes-app/server`
  - [ ] Copiar contenido de `/frontend` → `~/public_html/herrajes-app/frontend`

---

## PASO 4: Configurar Base de Datos

- [ ] En **hPanel > Bases de Datos > PostgreSQL** crear:
  ```
  - Nombre BD: herrajes_db
  - Usuario: herrajes_user
  - Contraseña: [GENERA UNA SEGURA]
  - Host: localhost
  - Puerto: 5432
  ```

- [ ] Anotar en papel/notas:
  ```
  DATABASE_URL=postgresql://herrajes_user:[PASSWORD]@localhost:5432/herrajes_db?schema=public
  ```

---

## PASO 5: Crear Archivo `.env`

- [ ] Crear archivo en servidor
  ```bash
  cd ~/public_html/herrajes-app/server
  nano .env
  ```

- [ ] Copiar y reemplazar valores:
  ```env
  DATABASE_URL="postgresql://herrajes_user:TU_PASSWORD@localhost:5432/herrajes_db?schema=public"
  JWT_SECRET="GeneraUnaStringAleatoriaDe32+Caracteres!@#$%"
  ADMIN_EMAIL="admin@tudominio.com"
  ADMIN_PASSWORD="ContraseñaSegura123!!"
  PORT=3001
  CORS_ORIGIN="https://tudominio.com"
  NODE_ENV="production"
  UPLOAD_DIR="uploads"
  SMTP_HOST="smtp.gmail.com"
  SMTP_PORT="587"
  SMTP_USER="tu-email@gmail.com"
  SMTP_PASS="tu-app-password-16-chars"
  BUSINESS_EMAIL="contacto@tudominio.com"
  ```

- [ ] Guardar: `Ctrl + O` → Enter → `Ctrl + X`

- [ ] Verificar que se guardó
  ```bash
  cat .env | head -5
  # Debe mostrar las variables
  ```

---

## PASO 6: Instalar Dependencias Frontend

- [ ] Ir a carpeta frontend
  ```bash
  cd ~/public_html/herrajes-app/frontend
  ```

- [ ] Instalar paquetes
  ```bash
  npm install
  # Espera a que termine (puede tomar 1-2 minutos)
  ```

- [ ] Compilar para producción
  ```bash
  npm run build
  # Debe crear carpeta dist/ sin errores
  ```

- [ ] Verificar que existe dist/
  ```bash
  ls -la dist/ | head -10
  # Debe mostrar archivos HTML, CSS, JS
  ```

---

## PASO 7: Instalar Dependencias Backend

- [ ] Ir a carpeta backend
  ```bash
  cd ~/public_html/herrajes-app/server
  ```

- [ ] Instalar paquetes
  ```bash
  npm install
  # Espera a que termine
  ```

- [ ] Generar cliente Prisma
  ```bash
  npx prisma generate
  # Debe completar sin errores
  ```

---

## PASO 8: Setup Base de Datos

- [ ] Ejecutar migraciones Prisma
  ```bash
  npx prisma migrate deploy
  # Debe aplicar migraciones exitosamente
  ```

- [ ] Crear seed (usuarios iniciales)
  ```bash
  npx prisma db seed 2>/dev/null || echo "No hay seed"
  # Ok si muestra error - usuario admin se crea automático en arranque
  ```

- [ ] Verificar conexión BD
  ```bash
  psql -U herrajes_user -d herrajes_db -h localhost -c "SELECT 1"
  # Debe mostrar: 1 (si falla, revisar contraseña BD)
  ```

---

## PASO 9: Instalar PM2 (Gestor de Procesos)

- [ ] Instalar PM2 global
  ```bash
  npm install -g pm2
  # Espera a que termine
  ```

- [ ] Verificar instalación
  ```bash
  pm2 --version
  # Debe mostrar número de versión
  ```

- [ ] Crear archivo ecosystem.config.js
  ```bash
  cd ~/public_html/herrajes-app/server
  nano ecosystem.config.js
  ```

- [ ] Pegar configuración:
  ```javascript
  module.exports = {
    apps: [{
      name: 'herrajes-api',
      script: 'src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production' },
      error_file: '../logs/err.log',
      out_file: '../logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }]
  };
  ```

- [ ] Guardar: `Ctrl + O` → Enter → `Ctrl + X`

---

## PASO 10: Iniciar Aplicación

- [ ] Iniciar con PM2
  ```bash
  cd ~/public_html/herrajes-app/server
  pm2 start ecosystem.config.js
  # Debe mostrar: [PM2] App started
  ```

- [ ] Guardar configuración PM2
  ```bash
  pm2 save
  ```

- [ ] Crear startup automático
  ```bash
  pm2 startup
  # Copiar y pegar el comando que sale en la consola
  ```

- [ ] Verificar estado
  ```bash
  pm2 status
  # Debe mostrar: herrajes-api (online)
  ```

- [ ] Ver logs en tiempo real
  ```bash
  pm2 logs herrajes-api
  # Presiona Ctrl+C para salir
  ```

---

## PASO 11: Pruebas Básicas

- [ ] Probar que el servidor responde
  ```bash
  curl http://localhost:3001/health
  # Debe mostrar: {"ok":true}
  ```

- [ ] Probar API (lista de categorías)
  ```bash
  curl http://localhost:3001/api/categories
  # Debe mostrar JSON con categorías (si hay)
  ```

- [ ] Verificar que frontend está compilado
  ```bash
  ls -la ~/public_html/herrajes-app/frontend/dist/index.html
  # Debe existir el archivo
  ```

---

## PASO 12: Configurar Reverse Proxy (Nginx)

**Opción A: Vía hPanel (más fácil)**
- [ ] Ir a **hPanel > Dominios > Tu dominio**
- [ ] Click en **Gestionar**
- [ ] Buscar sección **Proxy Inverso**
- [ ] Crear entrada:
  - Ruta: `/`
  - Destino: `http://localhost:3001`
  - Reescribir: ON

**Opción B: Manual (si hPanel no tiene proxy)**
- [ ] Crear archivo de configuración
  ```bash
  sudo nano /etc/nginx/conf.d/herrajes.conf
  ```

- [ ] Pegar configuración:
  ```nginx
  server {
      listen 80;
      server_name tudominio.com www.tudominio.com;

      location / {
          proxy_pass http://localhost:3001;
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_cache_bypass $http_upgrade;
      }

      location /uploads {
          alias /home/username/public_html/herrajes-app/uploads;
      }
  }
  ```

- [ ] Guardar: `Ctrl + O` → Enter → `Ctrl + X`

- [ ] Probar configuración Nginx
  ```bash
  sudo nginx -t
  # Debe mostrar: ok / successful
  ```

- [ ] Reiniciar Nginx
  ```bash
  sudo systemctl restart nginx
  ```

---

## PASO 13: Configurar SSL/HTTPS

- [ ] Instalar certificado Let's Encrypt
  ```bash
  sudo certbot certonly --nginx -d tudominio.com -d www.tudominio.com
  # Sigue las instrucciones, presiona '1' para nuevo certificado
  ```

- [ ] Habilitar renovación automática
  ```bash
  sudo systemctl enable certbot.timer
  sudo systemctl start certbot.timer
  ```

- [ ] Verificar certificado
  ```bash
  sudo certbot certificates
  # Debe mostrar tu certificado con fecha válida
  ```

---

## PASO 14: Pruebas Finales

- [ ] Acceder a HTTPS
  ```bash
  # Abre en navegador: https://tudominio.com
  # Debe cargar la página sin errores de SSL
  ```

- [ ] Probar funcionalidades:
  ```bash
  # En navegador:
  1. https://tudominio.com           # Debe cargar Inicio
  2. https://tudominio.com/productos # Debe cargar Productos
  3. https://tudominio.com/admin     # Debe cargar Login Admin
  4. Enviar un email via Contacto
  5. Ver en BD que se guardó
  ```

- [ ] Revisar logs del servidor
  ```bash
  pm2 logs herrajes-api --lines 50
  # No debe haber errores rojos (ERROR, exception)
  ```

- [ ] Verificar base de datos
  ```bash
  psql -U herrajes_user -d herrajes_db -c "SELECT COUNT(*) FROM \"Product\";"
  # Debe mostrar el número de productos
  ```

---

## PASO 15: Configurar Permisos Finales

- [ ] Permisos de carpeta uploads
  ```bash
  chmod -R 755 ~/public_html/herrajes-app/uploads
  ```

- [ ] Permisos de logs
  ```bash
  chmod -R 755 ~/public_html/herrajes-app/logs
  ```

- [ ] Verificar permisos .env
  ```bash
  chmod 600 ~/public_html/herrajes-app/server/.env
  # Solo el propietario puede leer
  ```

---

## PASO 16: Backup y Monitoreo

- [ ] Crear backup de BD antes de cambios
  ```bash
  pg_dump -U herrajes_user herrajes_db > ~/backup_herrajes.sql
  ```

- [ ] Configurar monitoreo PM2 (opcional)
  ```bash
  pm2 web
  # Acceso en: http://localhost:9615
  ```

- [ ] Crear cron job para backups diarios
  ```bash
  crontab -e
  # Agregar línea:
  # 0 2 * * * pg_dump -U herrajes_user herrajes_db > ~/backups/herrajes_$(date +\%Y\%m\%d).sql
  ```

---

## CHECKLIST DE VERIFICACIÓN FINAL

- [ ] Dominio apunta a Hostinger
- [ ] SSL/HTTPS funciona
- [ ] Frontend se carga sin errores
- [ ] Admin login funciona
- [ ] CRUD de productos funciona
- [ ] CRUD de categorías funciona
- [ ] Email de contacto envía
- [ ] Subida de imágenes funciona
- [ ] Logs sin errores críticos
- [ ] BD conectada correctamente
- [ ] PM2 reinicia automático si cae la app
- [ ] Backups automáticos programados

---

## SOLUCIÓN RÁPIDA DE PROBLEMAS

**¿App no levanta?**
```bash
pm2 logs herrajes-api --lines 100
# Ver último error
pm2 restart herrajes-api
```

**¿BD no conecta?**
```bash
psql -U herrajes_user -d herrajes_db -h localhost
# Verificar credenciales
```

**¿Puerto 3001 ocupado?**
```bash
lsof -i :3001
kill -9 [PID]
pm2 restart herrajes-api
```

**¿Email no envía?**
```bash
# Revisar contraseña app Gmail
# https://myaccount.google.com/apppasswords
# Verificar .env SMTP_PASS correcto
pm2 logs herrajes-api | grep -i email
```

**¿Revisar todo está bien?**
```bash
pm2 status
pm2 logs herrajes-api --lines 20
curl https://tudominio.com/health
```

---

**¿Problema no resuelto? Revisa DEPLOY_HOSTINGER.md para más detalles.** 📖

