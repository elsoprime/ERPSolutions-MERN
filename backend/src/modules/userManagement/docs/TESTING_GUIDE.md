# 🧪 GUÍA COMPLETA DE TESTING - FASES 1 Y 2

## 📋 PREPARACIÓN PARA TESTING

### **🔧 1. CONFIGURACIÓN INICIAL**

#### **Variables de Entorno Requeridas:**

```env
# En tu archivo .env
JWT_SECRET_KEY=tu-clave-secreta-super-segura-aqui
JWT_SECRET=tu-clave-secreta-super-segura-aqui
JWT_REFRESH_SECRET=tu-clave-refresh-diferente-aqui
MONGODB_URI=mongodb://localhost:27017/tu-base-de-datos
PORT=4000
```

#### **Verificar que el servidor esté ejecutándose:**

```bash
# En terminal backend
npm run dev
# o
yarn dev
```

#### **URL Base para testing:**

```
http://localhost:4000/api
```

---

## 🚀 **PHASE 1: TESTING BÁSICO - COMPATIBILIDAD**

### **📝 TEST 1: Verificar que las rutas existentes funcionen**

#### **A. Test del Dashboard (ruta existente):**

```http
POST http://localhost:4000/api/dashboard/home
Authorization: Bearer [TOKEN_AQUI]
Content-Type: application/json

{}
```

**✅ Resultado esperado:**

```json
{
  "message": "Bienvenido al Home"
}
```

**🔍 Lo que debes verificar:**

- ✅ La ruta funciona exactamente igual que antes
- ✅ Sin errores de middleware
- ✅ Respuesta en el mismo formato

---

## 🔐 **PHASE 2: TESTING DE AUTENTICACIÓN MEJORADA**

### **📝 TEST 2: Login y obtener token**

#### **A. Login exitoso:**

```http
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "tu-password"
}
```

**✅ Resultado esperado:**

```json
{
  "message": "Autenticado...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**🔍 Lo que debes verificar:**

- ✅ Token JWT válido recibido
- ✅ Mensaje de éxito
- ✅ Código 200

#### **B. Login con credenciales incorrectas:**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password-incorrecto"
}
```

**❌ Resultado esperado:**

```json
{
  "error": "La contraseña ingresada es incorrecta"
}
```

### **📝 TEST 3: Verificar middleware mejorado**

#### **A. Acceso con token válido:**

```http
POST http://localhost:3000/api/dashboard/home
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

**✅ Resultado esperado:**

```json
{
  "message": "Bienvenido al Home"
}
```

**🔍 Lo que verificar en logs de servidor:**

```
✅ Usuario autenticado desde cache: usuario@ejemplo.com
✅ O: Usuario autenticado desde DB: usuario@ejemplo.com
```

#### **B. Acceso sin token:**

```http
POST http://localhost:3000/api/dashboard/home
Content-Type: application/json

{}
```

**❌ Resultado esperado:**

```json
{
  "error": {
    "message": "Token de acceso requerido",
    "code": "TOKEN_MISSING",
    "timestamp": "2025-10-24T..."
  },
  "success": false,
  "statusCode": 401
}
```

#### **C. Acceso con token inválido:**

```http
POST http://localhost:3000/api/dashboard/home
Authorization: Bearer token-invalido-aqui
Content-Type: application/json

{}
```

**❌ Resultado esperado:**

```json
{
  "error": {
    "message": "Invalid token",
    "code": "TOKEN_INVALID",
    "timestamp": "2025-10-24T..."
  },
  "success": false,
  "statusCode": 401
}
```

---

## 🎭 **PHASE 3: TESTING DE ROLES GRANULARES**

Para estos tests, necesitas crear usuarios con diferentes roles en tu base de datos.

### **📝 TEST 4: Sistema de roles**

#### **A. Crear usuarios de prueba (opcional via registro):**

```http
POST http://localhost:3000/api/auth/create-account
Content-Type: application/json

{
  "name": "Admin Usuario",
  "email": "admin@test.com",
  "password": "123456",
  "passwordConfirmation": "123456"
}
```

**💡 Luego actualiza manualmente en MongoDB:**

```javascript
// En MongoDB Compass o shell
db.users.updateOne(
  {email: 'admin@test.com'},
  {
    $set: {
      role: 'admin',
      confirmed: true
    }
  }
)
```

#### **B. Test de ruta solo para admins:**

**🔧 Primero, agrega esta ruta de prueba a tu `domainRoutes.ts`:**

```typescript
import {requireAdmin} from '@/modules/userManagement/middleware/roleMiddleware'

// Agregar esta ruta para testing
router.get(
  '/admin-test',
  authMiddleware.authenticate,
  requireAdmin,
  (req, res) => {
    res.json({
      message: 'Acceso de admin autorizado',
      user: req.authUser?.name,
      role: req.authUser?.role
    })
  }
)
```

**Test con usuario admin:**

```http
GET http://localhost:3000/api/dashboard/admin-test
Authorization: Bearer [TOKEN_DE_ADMIN]
```

**✅ Resultado esperado:**

```json
{
  "message": "Acceso de admin autorizado",
  "user": "Admin Usuario",
  "role": "admin"
}
```

**Test con usuario normal:**

```http
GET http://localhost:3000/api/dashboard/admin-test
Authorization: Bearer [TOKEN_DE_USER_NORMAL]
```

**❌ Resultado esperado:**

```json
{
  "error": {
    "message": "Se requiere uno de los roles: admin, superadmin",
    "code": "INSUFFICIENT_PERMISSIONS",
    "timestamp": "2025-10-24T..."
  },
  "success": false,
  "statusCode": 403
}
```

---

## 🏢 **PHASE 4: TESTING MULTI-TENANT**

### **📝 TEST 5: Validación por empresa**

#### **A. Agregar ruta de prueba multi-tenant:**

```typescript
import {requireCompanyFromParam} from '@/modules/userManagement/middleware/companyMiddleware'

// En domainRoutes.ts
router.get(
  '/company/:companyId/data',
  authMiddleware.authenticate,
  requireCompanyFromParam('companyId'),
  (req, res) => {
    const companyContext = (req as any).companyContext
    res.json({
      message: 'Datos de empresa',
      companyId: req.params.companyId,
      userCompany: req.authUser?.companyId,
      context: companyContext
    })
  }
)
```

#### **B. Test acceso a empresa propia:**

```http
GET http://localhost:3000/api/dashboard/company/[TU_COMPANY_ID]/data
Authorization: Bearer [TOKEN]
```

**✅ Resultado esperado:**

```json
{
  "message": "Datos de empresa",
  "companyId": "672123456789abcdef012345",
  "userCompany": "672123456789abcdef012345",
  "context": {
    "companyId": "672123456789abcdef012345",
    "userRole": "user",
    "isOwner": false,
    "isActive": true
  }
}
```

#### **C. Test acceso a empresa diferente:**

```http
GET http://localhost:3000/api/dashboard/company/000000000000000000000000/data
Authorization: Bearer [TOKEN]
```

**❌ Resultado esperado:**

```json
{
  "error": {
    "message": "Sin acceso a la empresa solicitada",
    "code": "COMPANY_ACCESS_DENIED",
    "timestamp": "2025-10-24T..."
  },
  "success": false,
  "statusCode": 403
}
```

---

## 🚦 **PHASE 5: TESTING RATE LIMITING**

### **📝 TEST 6: Rate limiting básico**

#### **A. Agregar rate limiting a una ruta:**

```typescript
import {apiRateLimit} from '@/modules/userManagement/middleware/rateLimitMiddleware'

// En domainRoutes.ts
router.get(
  '/rate-test',
  apiRateLimit,
  authMiddleware.authenticate,
  (req, res) => {
    res.json({
      message: 'Request exitoso',
      timestamp: new Date(),
      user: req.authUser?.email
    })
  }
)
```

#### **B. Test rate limiting normal:**

```http
GET http://localhost:3000/api/dashboard/rate-test
Authorization: Bearer [TOKEN]
```

**✅ Resultado esperado (primera llamada):**

```json
{
  "message": "Request exitoso",
  "timestamp": "2025-10-24T10:30:00.000Z",
  "user": "usuario@ejemplo.com"
}
```

**🔍 Headers importantes:**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2025-10-24T10:45:00.000Z
```

#### **C. Test exceder rate limit:**

**💡 Para testing rápido, crea un límite bajo:**

```typescript
import {RateLimitMiddleware} from '@/modules/userManagement/middleware/rateLimitMiddleware'

// Límite muy bajo para testing
const testRateLimit = RateLimitMiddleware.createRateLimit(
  {
    guest: {windowMs: 60000, maxRequests: 3}, // 3 requests por minuto
    user: {windowMs: 60000, maxRequests: 5}, // 5 requests por minuto
    employee: {windowMs: 60000, maxRequests: 10},
    admin: {windowMs: 60000, maxRequests: 50},
    superadmin: {windowMs: 60000, maxRequests: 100}
  },
  'test'
)

router.get(
  '/rate-test-strict',
  testRateLimit,
  authMiddleware.authenticate,
  (req, res) => {
    res.json({message: 'Request exitoso', count: Math.random()})
  }
)
```

**Hacer múltiples requests rápidamente:**

```http
GET http://localhost:3000/api/dashboard/rate-test-strict
Authorization: Bearer [TOKEN]
```

**❌ Resultado esperado (después del límite):**

```json
{
  "error": {
    "message": "Demasiadas solicitudes, intente más tarde",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 45,
    "resetTime": "2025-10-24T10:31:00.000Z"
  },
  "success": false,
  "statusCode": 429
}
```

---

## 📊 **PHASE 6: TESTING LOGGING Y MÉTRICAS**

### **📝 TEST 7: Verificar logging**

#### **A. Agregar endpoint de métricas:**

```typescript
import {AuthLogger} from '@/modules/userManagement/utils/authLogger'
import {
  requireRole,
  SystemRole
} from '@/modules/userManagement/middleware/roleMiddleware'

// En domainRoutes.ts
router.get(
  '/metrics',
  authMiddleware.authenticate,
  requireRole(SystemRole.ADMIN),
  (req, res) => {
    const stats = AuthLogger.getEventStats()
    const summary = AuthLogger.getSecuritySummary()

    res.json({
      message: 'Métricas de seguridad',
      eventStats: stats.slice(0, 10),
      securitySummary: summary,
      timestamp: new Date()
    })
  }
)
```

#### **B. Test endpoint de métricas:**

```http
GET http://localhost:3000/api/dashboard/metrics
Authorization: Bearer [TOKEN_DE_ADMIN]
```

**✅ Resultado esperado:**

```json
{
  "message": "Métricas de seguridad",
  "eventStats": [
    {
      "eventType": "login_success",
      "count": 5,
      "lastOccurrence": "2025-10-24T10:30:00.000Z",
      "riskLevel": "low"
    },
    {
      "eventType": "access_granted",
      "count": 15,
      "lastOccurrence": "2025-10-24T10:29:00.000Z",
      "riskLevel": "low"
    }
  ],
  "securitySummary": {
    "totalEvents": 25,
    "loginAttempts": 8,
    "failedLogins": 2,
    "rateLimitHits": 1,
    "suspiciousActivities": 0,
    "uniqueUsers": 3,
    "uniqueIPs": 2
  }
}
```

---

## 🔧 **HERRAMIENTAS RECOMENDADAS PARA TESTING**

### **1. 📬 Postman Collection**

#### **Crear colección con estas configuraciones:**

**Variables de entorno:**

```json
{
  "baseURL": "http://localhost:3000/api",
  "authToken": "{{token}}",
  "userEmail": "usuario@ejemplo.com",
  "adminEmail": "admin@test.com"
}
```

**Pre-request script para login automático:**

```javascript
// En request de login
pm.test('Store token', function () {
  var jsonData = pm.response.json()
  if (jsonData.token) {
    pm.environment.set('token', jsonData.token)
  }
})
```

### **2. 🔥 REST Client (VS Code Extension)**

#### **Crear archivo `test-requests.http`:**

```http
### Variables
@baseURL = http://localhost:3000/api
@token = tu-token-aqui

### Login
POST {{baseURL}}/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "123456"
}

### Test Dashboard
POST {{baseURL}}/dashboard/home
Authorization: Bearer {{token}}

### Test Admin Route
GET {{baseURL}}/dashboard/admin-test
Authorization: Bearer {{token}}

### Test Rate Limiting
GET {{baseURL}}/dashboard/rate-test
Authorization: Bearer {{token}}

### Test Company Access
GET {{baseURL}}/dashboard/company/672123456789abcdef012345/data
Authorization: Bearer {{token}}
```

### **3. 🛠️ Scripts de Testing Automatizado**

#### **Crear `test-auth.js`:**

```javascript
const axios = require('axios')

const baseURL = 'http://localhost:3000/api'
let authToken = ''

async function testLogin() {
  try {
    const response = await axios.post(`${baseURL}/auth/login`, {
      email: 'usuario@ejemplo.com',
      password: '123456'
    })

    authToken = response.data.token
    console.log('✅ Login exitoso')
    console.log('🔑 Token:', authToken.substring(0, 20) + '...')
    return true
  } catch (error) {
    console.log('❌ Login fallido:', error.response?.data?.error)
    return false
  }
}

async function testDashboard() {
  try {
    const response = await axios.post(
      `${baseURL}/dashboard/home`,
      {},
      {
        headers: {Authorization: `Bearer ${authToken}`}
      }
    )

    console.log('✅ Dashboard accesible')
    console.log('📝 Respuesta:', response.data.message)
    return true
  } catch (error) {
    console.log(
      '❌ Dashboard inaccesible:',
      error.response?.data?.error?.message
    )
    return false
  }
}

async function testRateLimit() {
  console.log('🚦 Testing rate limiting...')
  let successCount = 0

  for (let i = 0; i < 10; i++) {
    try {
      await axios.get(`${baseURL}/dashboard/rate-test`, {
        headers: {Authorization: `Bearer ${authToken}`}
      })
      successCount++
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(
          `🛑 Rate limit alcanzado después de ${successCount} requests`
        )
        break
      }
    }
  }
}

async function runTests() {
  console.log('🧪 Iniciando tests de autenticación...\n')

  const loginOk = await testLogin()
  if (!loginOk) return

  await testDashboard()
  await testRateLimit()

  console.log('\n🎉 Tests completados')
}

runTests()
```

**Ejecutar:**

```bash
node test-auth.js
```

---

## 🔍 **CHECKLIST DE TESTING COMPLETO**

### **✅ FASE 1 - Compatibilidad:**

- [ ] Rutas existentes funcionan igual
- [ ] req.authUser disponible en handlers
- [ ] Cache funcionando (verificar logs)
- [ ] Manejo de errores mejorado

### **✅ FASE 2 - Funcionalidades Avanzadas:**

- [ ] Sistema de roles funcionando
- [ ] Validación por empresa operativa
- [ ] Rate limiting activo
- [ ] Logging registrando eventos
- [ ] Métricas generándose correctamente

### **🚨 Errores Comunes y Soluciones:**

#### **Error: "Cannot find module"**

```bash
# Instalar dependencias faltantes
npm install jsonwebtoken
npm install @types/jsonwebtoken
```

#### **Error: "companyId not found"**

```javascript
// Verificar que el usuario tenga companyId en MongoDB
db.users.updateOne(
  {email: 'usuario@test.com'},
  {$set: {companyId: ObjectId('672123456789abcdef012345')}}
)
```

#### **Error: "Role middleware not working"**

```javascript
// Actualizar rol del usuario
db.users.updateOne({email: 'admin@test.com'}, {$set: {role: 'admin'}})
```

---

## 🎯 **RESULTADOS ESPERADOS**

Al completar todos los tests deberías ver:

### **📊 En los logs del servidor:**

```
✅ Usuario autenticado desde cache: usuario@ejemplo.com
✅ Acceso autorizado a empresa 672123... para usuario 123...
⚠️ Rate limit hit for key: api:127.0.0.1, count: 5
📝 LOGIN_SUCCESS: Usuario usuario@ejemplo.com inició sesión
```

### **📈 Métricas de ejemplo:**

```json
{
  "totalEvents": 50,
  "loginAttempts": 10,
  "failedLogins": 2,
  "rateLimitHits": 3,
  "uniqueUsers": 5,
  "uniqueIPs": 3
}
```

**¡Tu sistema está funcionando perfectamente si todos estos tests pasan!** 🚀
