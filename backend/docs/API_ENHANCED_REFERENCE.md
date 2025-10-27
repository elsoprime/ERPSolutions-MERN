# 🔗 **API ENHANCED COMPANY - REFERENCIA TÉCNICA**

## 📋 **Introducción**

Esta es la referencia completa de la API del **EnhancedCompanyController**, que proporciona endpoints avanzados para la gestión de empresas con características enterprise.

---

## 🌐 **BASE URL**

```
http://localhost:4000/api/enhanced-companies
```

---

## 📊 **ENDPOINTS PRINCIPALES**

### **📋 GET /api/enhanced-companies**

Obtener todas las empresas con paginación y filtros avanzados.

#### **Query Parameters**

```typescript
interface QueryParams {
  page?: number // Página (default: 1)
  limit?: number // Registros por página (default: 10)
  status?: string // Filtrar por estado
  plan?: string // Filtrar por plan
  industry?: string // Filtrar por industria
}
```

#### **Ejemplo de Request**

```bash
GET /api/enhanced-companies?page=1&limit=10&status=active&plan=professional
```

#### **Response**

```json
{
  "companies": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Demo Company SPA",
      "slug": "demo-company-spa",
      "email": "demo@democompany.cl",
      "plan": "professional",
      "status": "active",
      "settings": {
        "businessType": "retail",
        "industry": "Comercio y Retail",
        "taxId": "76.987.654-3",
        "currency": "CLP",
        "features": {
          "inventory": true,
          "accounting": true,
          "hrm": false,
          "crm": true,
          "projects": false
        },
        "limits": {
          "maxUsers": 25,
          "maxProducts": 5000,
          "maxTransactions": 25000,
          "storageGB": 10
        },
        "branding": {
          "primaryColor": "#10B981",
          "secondaryColor": "#6B7280"
        }
      },
      "stats": {
        "totalUsers": 2,
        "totalProducts": 0,
        "storageUsed": 0,
        "lastActivity": "2025-10-26T10:30:00Z"
      },
      "createdBy": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Super Administrador",
        "email": "superadmin@erpsolutions.cl"
      },
      "ownerId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Manager Demo",
        "email": "manager@democompany.cl"
      }
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### **🔍 GET /api/enhanced-companies/:id**

Obtener una empresa específica por ID.

#### **Path Parameters**

```typescript
interface PathParams {
  id: string // ObjectId de la empresa
}
```

#### **Response**

```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "Demo Company SPA",
  "slug": "demo-company-spa",
  "description": "Empresa de demostración para testing del sistema ERP",
  "email": "demo@democompany.cl",
  "phone": "+56 9 8765 4321",
  "address": {
    "street": "Av. Las Condes 5678",
    "city": "Santiago",
    "state": "Región Metropolitana",
    "country": "Chile",
    "zipCode": "7550000"
  },
  "status": "active",
  "plan": "professional",
  "settings": {
    // ... configuraciones completas
  },
  "stats": {
    // ... estadísticas actuales
  },
  "createdAt": "2025-10-26T08:00:00Z",
  "updatedAt": "2025-10-26T10:30:00Z"
}
```

#### **Error Responses**

```json
// 400 - ID inválido
{
  "error": "ID de empresa inválido"
}

// 404 - Empresa no encontrada
{
  "error": "Empresa no encontrada"
}
```

---

### **🏷️ GET /api/enhanced-companies/slug/:slug**

Obtener empresa por su slug (URL-friendly identifier).

#### **Path Parameters**

```typescript
interface PathParams {
  slug: string // Slug único de la empresa
}
```

#### **Ejemplo**

```bash
GET /api/enhanced-companies/slug/demo-company-spa
```

---

### **👥 GET /api/enhanced-companies/:id/users**

Obtener empresa con sus usuarios asociados.

#### **Query Parameters**

```typescript
interface QueryParams {
  page?: number // Página de usuarios (default: 1)
  limit?: number // Usuarios por página (default: 10)
}
```

#### **Response**

```json
{
  "company": {
    // ... datos completos de la empresa
  },
  "users": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
      "name": "Manager Demo",
      "email": "manager@democompany.cl",
      "role": "manager",
      "status": "active",
      "confirmed": true
    },
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
      "name": "Viewer Demo",
      "email": "viewer@democompany.cl",
      "role": "viewer",
      "status": "active",
      "confirmed": true
    }
  ],
  "totalUsers": 2,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "usage": {
    "users": 8, // 2/25 = 8%
    "products": 0, // 0/5000 = 0%
    "storage": 0 // 0/10GB = 0%
  }
}
```

---

### **📈 GET /api/enhanced-companies/:id/stats**

Obtener estadísticas detalladas y métricas de la empresa.

#### **Response**

```json
{
  "stats": {
    "totalUsers": 2,
    "totalProducts": 45,
    "storageUsed": 128, // en MB
    "lastActivity": "2025-10-26T10:30:00Z"
  },
  "usage": {
    "users": 8, // % vs límite
    "products": 1, // % vs límite
    "storage": 1 // % vs límite
  },
  "limits": {
    "maxUsers": 25,
    "maxProducts": 5000,
    "maxTransactions": 25000,
    "storageGB": 10
  },
  "isActive": true,
  "canAddUser": true,
  "isTrialExpired": false
}
```

---

## 🔧 **ENDPOINTS DE MODIFICACIÓN**

### **✅ POST /api/enhanced-companies**

Crear una nueva empresa.

#### **Request Body**

```json
{
  "name": "Nueva Empresa LTDA",
  "email": "admin@nuevaempresa.cl",
  "phone": "+56 9 1111 2222",
  "address": {
    "street": "Av. Nueva 123",
    "city": "Santiago",
    "state": "RM",
    "country": "Chile",
    "zipCode": "8000000"
  },
  "description": "Descripción de la nueva empresa",
  "website": "https://nuevaempresa.cl",
  "plan": "basic",
  "settings": {
    "businessType": "service",
    "industry": "Consultoría",
    "taxId": "76.111.222-3",
    "currency": "CLP",
    "features": {
      "inventory": true,
      "accounting": false,
      "hrm": true,
      "crm": false,
      "projects": true
    }
    // limits y branding se asignan automáticamente por plan
  }
}
```

#### **Success Response (201)**

```json
{
  "message": "Empresa creada correctamente",
  "company": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
    "name": "Nueva Empresa LTDA",
    "slug": "nueva-empresa-ltda"
    // ... datos completos de la empresa creada
  }
}
```

#### **Error Responses**

```json
// 400 - RUT duplicado
{
  "message": "Ya existe una empresa registrada con este RUT/Tax ID"
}

// 400 - Slug duplicado
{
  "message": "Ya existe una empresa con este identificador único (slug)"
}

// 400 - Error de validación
{
  "error": "Error de validación",
  "details": "Path `name` is required."
}
```

---

### **📝 PUT /api/enhanced-companies/:id**

Actualizar una empresa existente.

#### **Request Body**

```json
{
  "name": "Empresa Actualizada SPA",
  "description": "Descripción actualizada",
  "phone": "+56 9 9999 8888",
  "settings": {
    "branding": {
      "primaryColor": "#FF6B35",
      "secondaryColor": "#2E86AB"
    },
    "features": {
      "inventory": true,
      "accounting": true,
      "hrm": true,
      "crm": true,
      "projects": false
    }
  }
}
```

#### **Success Response (200)**

```json
{
  "message": "Empresa actualizada correctamente",
  "company": {
    // ... datos actualizados de la empresa
  }
}
```

---

### **⚙️ PUT /api/enhanced-companies/:id/settings**

Actualizar solo las configuraciones de la empresa.

#### **Request Body**

```json
{
  "settings": {
    "features": {
      "inventory": true,
      "accounting": true,
      "hrm": false,
      "crm": true,
      "projects": true
    },
    "branding": {
      "primaryColor": "#8B5CF6",
      "secondaryColor": "#64748B"
    },
    "notifications": {
      "emailDomain": "nuevodiminio.com",
      "webhookUrl": "https://api.nuevaempresa.cl/webhook"
    }
  }
}
```

#### **Success Response (200)**

```json
{
  "message": "Configuraciones actualizadas correctamente",
  "settings": {
    // ... configuraciones actualizadas
  }
}
```

---

### **🗑️ DELETE /api/enhanced-companies/:id**

Eliminar una empresa (solo si no tiene usuarios asociados).

#### **Success Response (200)**

```json
{
  "message": "Empresa eliminada correctamente"
}
```

#### **Error Responses**

```json
// 400 - Empresa tiene usuarios
{
  "error": "No se puede eliminar la empresa porque tiene usuarios asociados",
  "userCount": 5
}

// 404 - Empresa no encontrada
{
  "error": "Empresa no encontrada"
}
```

---

## 🔐 **AUTENTICACIÓN Y AUTORIZACIÓN**

### **Headers Requeridos**

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### **Permisos por Rol**

| Endpoint                               | Super Admin | Admin Empresa | Manager | Employee | Viewer |
| -------------------------------------- | ----------- | ------------- | ------- | -------- | ------ |
| `GET /enhanced-companies`              | ✅          | ✅\*          | ❌      | ❌       | ❌     |
| `GET /enhanced-companies/:id`          | ✅          | ✅\*          | ✅\*    | ✅\*     | ✅\*   |
| `GET /enhanced-companies/:id/users`    | ✅          | ✅\*          | ✅\*    | ❌       | ❌     |
| `GET /enhanced-companies/:id/stats`    | ✅          | ✅\*          | ✅\*    | ❌       | ❌     |
| `POST /enhanced-companies`             | ✅          | ❌            | ❌      | ❌       | ❌     |
| `PUT /enhanced-companies/:id`          | ✅          | ✅\*          | ❌      | ❌       | ❌     |
| `PUT /enhanced-companies/:id/settings` | ✅          | ✅\*          | ❌      | ❌       | ❌     |
| `DELETE /enhanced-companies/:id`       | ✅          | ❌            | ❌      | ❌       | ❌     |

**\*** Solo para su propia empresa

---

## 📊 **CÓDIGOS DE ESTADO HTTP**

| Código | Significado           | Cuándo se usa                           |
| ------ | --------------------- | --------------------------------------- |
| 200    | OK                    | Operación exitosa                       |
| 201    | Created               | Empresa creada exitosamente             |
| 400    | Bad Request           | Datos inválidos, duplicados, validación |
| 401    | Unauthorized          | Token JWT inválido o expirado           |
| 403    | Forbidden             | Sin permisos para la operación          |
| 404    | Not Found             | Empresa no encontrada                   |
| 500    | Internal Server Error | Error interno del servidor              |

---

## 🧪 **EJEMPLOS DE USO**

### **1. Obtener empresa con estadísticas**

```javascript
const response = await fetch(
  '/api/enhanced-companies/64f1a2b3c4d5e6f7g8h9i0j1/stats',
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
)

const stats = await response.json()

if (stats.usage.users > 90) {
  alert('¡Cerca del límite de usuarios!')
}

if (!stats.canAddUser) {
  disableAddUserButton()
}
```

### **2. Crear nueva empresa**

```javascript
const newCompany = {
  name: 'Startup Innovadora',
  email: 'admin@startup.cl',
  plan: 'basic',
  settings: {
    businessType: 'service',
    industry: 'Tecnología',
    taxId: '76.555.444-1',
    currency: 'CLP'
  }
}

const response = await fetch('/api/enhanced-companies', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newCompany)
})

if (response.ok) {
  const result = await response.json()
  console.log('Empresa creada:', result.company.slug)
}
```

### **3. Actualizar branding de empresa**

```javascript
const updateBranding = async (companyId, colors) => {
  const response = await fetch(
    `/api/enhanced-companies/${companyId}/settings`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        settings: {
          branding: {
            primaryColor: colors.primary,
            secondaryColor: colors.secondary
          }
        }
      })
    }
  )

  return response.json()
}
```

### **4. Verificar características disponibles**

```javascript
const checkFeatures = async companyId => {
  const response = await fetch(`/api/enhanced-companies/${companyId}`)
  const company = await response.json()

  const availableFeatures = Object.entries(company.settings.features)
    .filter(([feature, enabled]) => enabled)
    .map(([feature]) => feature)

  return availableFeatures
  // Retorna: ['inventory', 'accounting', 'crm']
}
```

---

## 🔄 **WEBHOOKS Y EVENTOS**

### **Eventos Disponibles**

| Evento                    | Cuándo se dispara                  | Payload                  |
| ------------------------- | ---------------------------------- | ------------------------ |
| `company.created`         | Nueva empresa creada               | Datos completos empresa  |
| `company.updated`         | Empresa actualizada                | Datos actualizados       |
| `company.plan.changed`    | Cambio de plan de suscripción      | Plan anterior y nuevo    |
| `company.limits.exceeded` | Límite excedido (usuarios/storage) | Tipo de límite y valores |
| `company.user.added`      | Usuario agregado a empresa         | Datos usuario y empresa  |
| `company.stats.updated`   | Estadísticas actualizadas          | Nuevas estadísticas      |

### **Configurar Webhook**

```javascript
// Configurar URL de webhook en empresa
await fetch(`/api/enhanced-companies/${companyId}/settings`, {
  method: 'PUT',
  body: JSON.stringify({
    settings: {
      notifications: {
        webhookUrl: 'https://tu-app.com/webhooks/company-events'
      }
    }
  })
})
```

---

## 📚 **SDKs Y LIBRERÍAS**

### **JavaScript/TypeScript SDK**

```typescript
import {EnhancedCompanyAPI} from './api/enhanced-company'

const api = new EnhancedCompanyAPI(baseURL, token)

// Métodos disponibles
const companies = await api.getAll({page: 1, limit: 10})
const company = await api.getById(id)
const stats = await api.getStats(id)
const created = await api.create(companyData)
const updated = await api.update(id, updateData)
```

### **React Hooks**

```typescript
import {useEnhancedCompany, useCompanyStats} from './hooks'

const CompanyDashboard = ({companyId}) => {
  const {company, loading, error} = useEnhancedCompany(companyId)
  const {stats, usage} = useCompanyStats(companyId)

  if (usage.users > 90) {
    return <WarningAlert>Cerca del límite de usuarios</WarningAlert>
  }

  return (
    <div style={{color: company.settings.branding.primaryColor}}>
      {/* Dashboard con branding personalizado */}
    </div>
  )
}
```

---

**Desarrollado por Esteban Soto Ojeda** (@elsoprimeDev)  
_API Enhanced Company - ERP Solutions Enterprise_
