# Configuración para Almacén de Herrajes

## 📧 Configuración de Email (Formulario de Contacto)

El sistema de contacto envía los emails a la dirección de negocio del cliente. Para que funcione correctamente, necesitas configurar las siguientes variables en el archivo `.env`:

### Variables Requeridas en `.env`:

```
# Email donde recibirás los contactos del formulario
BUSINESS_EMAIL="tu-email@tudominio.com"

# Configuración SMTP (para enviar emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
```

### Pasos para configurar con Gmail:

1. **Crear una contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Windows (o tu dispositivo)"
   - Google generará una contraseña de 16 caracteres
   - Copia esa contraseña en `SMTP_PASS`

2. **Actualizar las variables:**
   - `BUSINESS_EMAIL`: Tu email principal donde quieres recibir los contactos
   - `SMTP_USER`: Tu email de Gmail (puede ser igual a BUSINESS_EMAIL)
   - `SMTP_PASS`: La contraseña de app de Gmail generada

### Alternativa: Usar otro proveedor SMTP

Si prefieres usar otro proveedor (SendGrid, Mailgun, etc.):
- Obtén los datos SMTP del proveedor
- Actualiza `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- El campo `BUSINESS_EMAIL` siempre es la dirección que recibe los mensajes

---

## 🖼️ Imágenes en Categorías

Ahora cada categoría puede tener una imagen. Para agregar:

1. **En el panel de administración:**
   - Navega a "Gestionar Categorías"
   - Al crear o editar una categoría, verás un campo "Imagen de la Categoría"
   - Sube la imagen (JPG, PNG, etc.)
   - El campo "Texto Alternativo" es para accesibilidad

2. **Las imágenes se almacenan en:** `/uploads/`

3. **Tamaño recomendado:** 
   - Ancho: 400-600px
   - Alto: 400-600px
   - Formato: JPG o PNG

---

## ✅ Checklist de Configuración

- [ ] Actualizar `BUSINESS_EMAIL` con tu email
- [ ] Configurar credenciales SMTP (Gmail o proveedor)
- [ ] Probar el formulario de contacto
- [ ] Agregarimágenes a las categorías en el admin
- [ ] Verificar que los emails se reciben correctamente

---

## 🆘 Solución de Problemas

### Los emails no se envían:
- Verifica que las credenciales SMTP sean correctas
- Si usas Gmail, asegúrate de haber generado una contraseña de app
- Revisa los logs del servidor: `npm run dev`

### Las imágenes de categorías no se cargan:
- Asegúrate que el directorio `/uploads/` existe
- Verifica los permisos de carpeta
- El navegador puede cachear imágenes antiguas (limpia el caché)

### El formulario muestra error:
- Verifica que todos los campos sean correctos (mínimo 2 caracteres para nombre, 10 para mensaje)
- Revisa que el email sea válido
- Consulta la consola del navegador (F12) para mensajes de error más detallados

---

## 📝 Notas Técnicas

- El servidor se inicia con: `npm run dev` (desde carpeta `/server`)
- El frontend se inicia con: `npm run dev` (desde raíz del proyecto)
- Los logs del servidor mostrarán mensajes sobre la inicialización del servicio de email
- Las imágenes se sirven desde: `http://localhost:3001/uploads/`

¡Cualquier duda, contacta al desarrollador!
