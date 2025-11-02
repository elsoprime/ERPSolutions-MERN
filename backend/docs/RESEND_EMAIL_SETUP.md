# Configuración de Resend para Emails

## 📧 Migración de Mailtrap a Resend

Este proyecto usa **Resend** para el envío de emails en producción.

### ✅ Ventajas de Resend:

- ✅ Sin límites en plan gratuito (100 emails/día)
- ✅ API moderna y simple
- ✅ Mejor deliverability
- ✅ Dashboard intuitivo
- ✅ Soporte para React Email (opcional)

---

## 🔧 Configuración

### 1️⃣ Obtener API Key de Resend:

1. Crear cuenta en [resend.com](https://resend.com)
2. Ir a **API Keys** en el dashboard
3. Crear una nueva API key
4. Copiar la key (empieza con `re_`)

### 2️⃣ Variables de entorno (.env):

```env
API_KEY_RESEND=re_tu_api_key_aqui
FRONTEND_URL=http://localhost:3000
```

### 3️⃣ Dominio de envío:

**En desarrollo/testing:**

```typescript
from: 'onboarding@resend.dev' // Dominio por defecto de Resend
```

**En producción:**

1. Verificar tu dominio en Resend
2. Actualizar `EMAIL_CONFIG.from` en `src/config/resend.ts`:

```typescript
from: 'ERPSolutions <noreply@tudominio.com>'
```

---

## 📨 Emails implementados:

### 1. Email de Confirmación de Cuenta

- **Archivo:** `templates/verification.html`
- **Uso:** Cuando un usuario se registra
- **Variables:** `{{name}}`, `{{token}}`, `{{confirmUrl}}`

### 2. Email de Recuperación de Contraseña

- **Archivo:** `templates/password-reset.html`
- **Uso:** Cuando solicita reset de password
- **Variables:** `{{name}}`, `{{token}}`, `{{confirmUrl}}`

### 3. Email de Bienvenida

- **Archivo:** `templates/welcome.html`
- **Uso:** Cuando un admin crea una cuenta de usuario
- **Variables:** `{{name}}`, `{{email}}`, `{{role}}`, `{{companyName}}`, `{{loginUrl}}`

---

## 🧪 Testing de Emails:

### Opción 1: Resend Dashboard

1. Ir a [resend.com/emails](https://resend.com/emails)
2. Ver todos los emails enviados
3. Previsualizar HTML

### Opción 2: Código de prueba

```typescript
import {AuthEmail} from './email/AuthEmail'

// Test email de bienvenida
await AuthEmail.sendWelcomeEmail({
  email: 'test@example.com',
  name: 'Usuario Test',
  companyName: 'Mi Empresa',
  role: 'admin_empresa'
})
```

---

## 🔍 Troubleshooting:

### Error: "API key not configured"

- ✅ Verificar que `API_KEY_RESEND` esté en `.env`
- ✅ Reiniciar el servidor backend

### Error: "Invalid API key"

- ✅ Regenerar API key en Resend dashboard
- ✅ Verificar que no tenga espacios al inicio/final

### Emails no llegan:

- ✅ Revisar la pestaña de **Spam**
- ✅ Verificar límite de 100 emails/día no superado
- ✅ Revisar logs en Resend dashboard

---

## 📊 Límites del Plan Gratuito:

| Característica   | Límite |
| ---------------- | ------ |
| Emails/día       | 100    |
| Emails/mes       | 3,000  |
| Dominios         | 1      |
| Tamaño del email | 25 MB  |

Para aumentar límites: [Planes de Resend](https://resend.com/pricing)

---

## 🚀 Próximos pasos (opcional):

1. **React Email Integration:**

   - Crear templates con componentes React
   - Mejor mantenibilidad y preview

2. **Email Analytics:**

   - Track de opens/clicks
   - Webhooks de eventos

3. **A/B Testing:**
   - Probar diferentes versiones de emails
   - Optimizar conversión

---

**Migrado por:** Esteban Soto Ojeda @elsoprimeDev  
**Fecha:** Noviembre 2025  
**Versión:** 2.0.0
