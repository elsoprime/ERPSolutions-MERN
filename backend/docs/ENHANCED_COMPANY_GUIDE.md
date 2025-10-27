# 🏢 **ENHANCED COMPANY MODEL - GUÍA TÉCNICA**

## 📋 **Introducción**

El **modelo EnhancedCompany** es la evolución enterprise del modelo Company básico, diseñado para soportar arquitecturas multi-tenant avanzadas con características como:

- 🎯 **Planes de suscripción** diferenciados
- 📊 **Límites configurables** por empresa
- 🎨 **Personalización de marca**
- 📈 **Métricas en tiempo real**
- ⚙️ **Control granular de características**

---

## 🏗️ **ESTRUCTURA DEL MODELO**

### **Información Básica**

```typescript
interface IEnhancedCompany {
  // Identificación
  name: string // Nombre de la empresa
  slug: string // URL-friendly identifier (único)
  description?: string // Descripción opcional
  website?: string // Sitio web de la empresa

  // Contacto
  email: string // Email principal
  phone?: string // Teléfono
  address: {
    // Dirección completa
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
}
```

### **Estado y Plan**

```typescript
interface IEnhancedCompany {
  // Estado operativo
  status: 'active' | 'inactive' | 'suspended' | 'trial'

  // Plan de suscripción
  plan: 'free' | 'basic' | 'professional' | 'enterprise'

  // Fechas importantes
  trialEndsAt?: Date // Fin del período de prueba
  subscriptionEndsAt?: Date // Fin de la suscripción
}
```

### **Configuraciones de Negocio**

```typescript
interface ICompanySettings {
  // Tipo de negocio
  businessType: 'retail' | 'wholesale' | 'manufacturing' | 'service' | 'other'
  industry: string
  taxId: string // RUT/Tax ID (único)
  currency: 'CLP' | 'USD' | 'EUR' | 'ARS' | 'PEN' | 'COL'

  // Año fiscal
  fiscalYear: {
    startMonth: number // 1-12
    endMonth: number // 1-12
  }

  // Control de características
  features: {
    inventory: boolean // Módulo de inventario
    accounting: boolean // Módulo de contabilidad
    hrm: boolean // Recursos humanos
    crm: boolean // Gestión de clientes
    projects: boolean // Gestión de proyectos
  }

  // Límites y cuotas
  limits: {
    maxUsers: number // Máximo usuarios
    maxProducts: number // Máximo productos
    maxTransactions: number // Máximo transacciones/mes
    storageGB: number // Almacenamiento en GB
  }

  // Personalización de marca
  branding: {
    logo?: string // URL del logo
    primaryColor: string // Color primario (hex)
    secondaryColor: string // Color secundario (hex)
    favicon?: string // URL del favicon
  }

  // Notificaciones
  notifications: {
    emailDomain?: string // Dominio de email
    smsProvider?: string // Proveedor SMS
    webhookUrl?: string // URL webhook
  }
}
```

### **Estadísticas y Metadata**

```typescript
interface IEnhancedCompany {
  // Metadata
  createdBy: Types.ObjectId // Usuario creador
  ownerId: Types.ObjectId // Usuario propietario

  // Estadísticas en tiempo real
  stats: {
    totalUsers: number // Usuarios activos
    totalProducts: number // Productos registrados
    lastActivity: Date // Última actividad
    storageUsed: number // Storage usado en MB
  }
}
```

---

## 🎛️ **MÉTODOS DEL MODELO**

### **Métodos de Estado**

```typescript
// Verificar si la empresa está activa
company.isActive(): boolean
// Retorna: true si status='active' o (status='trial' y no expiró)

// Verificar si expiró el trial
company.isTrialExpired(): boolean
// Retorna: true si status='trial' y trialEndsAt < now
```

### **Métodos de Límites**

```typescript
// Verificar si puede agregar usuarios
company.canAddUser(): boolean
// Retorna: true si stats.totalUsers < settings.limits.maxUsers

// Obtener porcentajes de uso
company.getUsagePercentage(): {
  users: number,      // % de usuarios vs límite
  products: number,   // % de productos vs límite
  storage: number     // % de storage vs límite
}
```

---

## 🚀 **CONFIGURACIONES POR PLAN**

### **🆓 Plan Free**

```typescript
const freePlanLimits = {
  maxUsers: 2,
  maxProducts: 50,
  maxTransactions: 100,
  storageGB: 0.5
}

const freePlanFeatures = {
  inventory: true,
  accounting: false,
  hrm: false,
  crm: false,
  projects: false
}
```

### **🟡 Plan Basic**

```typescript
const basicPlanLimits = {
  maxUsers: 10,
  maxProducts: 1000,
  maxTransactions: 5000,
  storageGB: 5
}

const basicPlanFeatures = {
  inventory: true,
  accounting: false,
  hrm: true,
  crm: false,
  projects: true
}
```

### **🔵 Plan Professional**

```typescript
const professionalPlanLimits = {
  maxUsers: 25,
  maxProducts: 5000,
  maxTransactions: 25000,
  storageGB: 10
}

const professionalPlanFeatures = {
  inventory: true,
  accounting: true,
  hrm: false,
  crm: true,
  projects: false
}
```

### **🟠 Plan Enterprise**

```typescript
const enterprisePlanLimits = {
  maxUsers: 100,
  maxProducts: 50000,
  maxTransactions: 100000,
  storageGB: 50
}

const enterprisePlanFeatures = {
  inventory: true,
  accounting: true,
  hrm: true,
  crm: true,
  projects: true
}
```

---

## 🎨 **PERSONALIZACIÓN DE MARCA**

### **Colores por Industria**

```typescript
const industryColors = {
  'Tecnología y Software': {
    primaryColor: '#3B82F6', // Azul tecnología
    secondaryColor: '#64748B'
  },
  'Comercio y Retail': {
    primaryColor: '#10B981', // Verde comercio
    secondaryColor: '#6B7280'
  },
  Manufactura: {
    primaryColor: '#F59E0B', // Naranja industrial
    secondaryColor: '#9CA3AF'
  },
  Servicios: {
    primaryColor: '#8B5CF6', // Púrpura servicios
    secondaryColor: '#6B7280'
  }
}
```

### **Logos y Assets**

```typescript
// Estructura recomendada para assets
const brandingAssets = {
  logo: 'https://company-assets.example.com/logo.png',
  favicon: 'https://company-assets.example.com/favicon.ico',

  // Tamaños recomendados
  logoSizes: {
    small: '32x32px', // Navbar
    medium: '64x64px', // Cards
    large: '128x128px' // Headers
  }
}
```

---

## 📊 **MONITOREO Y ANALYTICS**

### **Métricas Automáticas**

```typescript
// Actualización automática de estadísticas
const updateCompanyStats = async (companyId: string) => {
  const userCount = await User.countDocuments({companyId})
  const productCount = await Product.countDocuments({companyId})

  await EnhancedCompany.findByIdAndUpdate(companyId, {
    'stats.totalUsers': userCount,
    'stats.totalProducts': productCount,
    'stats.lastActivity': new Date()
  })
}
```

### **Alertas de Límites**

```typescript
// Verificación de límites
const checkCompanyLimits = async (companyId: string) => {
  const company = await EnhancedCompany.findById(companyId)
  const usage = company.getUsagePercentage()

  // Alertas por porcentaje de uso
  if (usage.users >= 90) {
    // Enviar alerta: cerca del límite de usuarios
  }

  if (usage.storage >= 80) {
    // Enviar alerta: storage casi lleno
  }
}
```

---

## 🔧 **API ENDPOINTS**

### **CRUD Básico**

```typescript
// GET /api/enhanced-companies
// Obtener todas las empresas (con paginación y filtros)

// GET /api/enhanced-companies/:id
// Obtener empresa por ID

// GET /api/enhanced-companies/slug/:slug
// Obtener empresa por slug

// POST /api/enhanced-companies
// Crear nueva empresa

// PUT /api/enhanced-companies/:id
// Actualizar empresa

// DELETE /api/enhanced-companies/:id
// Eliminar empresa (solo si no tiene usuarios)
```

### **Endpoints Especializados**

```typescript
// GET /api/enhanced-companies/:id/users
// Obtener empresa con sus usuarios

// GET /api/enhanced-companies/:id/stats
// Obtener estadísticas de la empresa

// PUT /api/enhanced-companies/:id/settings
// Actualizar solo configuraciones

// POST /api/enhanced-companies/:id/upgrade
// Cambiar plan de suscripción

// GET /api/enhanced-companies/:id/usage
// Obtener porcentajes de uso vs límites
```

---

## 🚀 **CASOS DE USO COMUNES**

### **1. Crear Nueva Empresa**

```typescript
const newCompany = await EnhancedCompany.create({
  name: 'Mi Nueva Empresa',
  email: 'admin@minuevaempresa.com',
  address: {
    street: 'Av. Principal 123',
    city: 'Santiago',
    state: 'RM',
    country: 'Chile',
    zipCode: '8320000'
  },
  plan: 'basic',
  settings: {
    businessType: 'retail',
    industry: 'Comercio',
    taxId: '76.123.456-7',
    currency: 'CLP'
    // ... configuraciones por defecto
  },
  createdBy: adminUserId,
  ownerId: ownerUserId
})
```

### **2. Verificar Permisos de Características**

```typescript
const canAccessAccounting = (company: IEnhancedCompany): boolean => {
  return company.isActive() && company.settings.features.accounting
}

const canAddMoreUsers = (company: IEnhancedCompany): boolean => {
  return company.isActive() && company.canAddUser()
}
```

### **3. Actualizar Plan de Empresa**

```typescript
const upgradeCompanyPlan = async (companyId: string, newPlan: string) => {
  const newLimits = getPlanLimits(newPlan)
  const newFeatures = getPlanFeatures(newPlan)

  await EnhancedCompany.findByIdAndUpdate(companyId, {
    plan: newPlan,
    'settings.limits': newLimits,
    'settings.features': newFeatures
  })
}
```

---

## 🔍 **TROUBLESHOOTING**

### **Problemas Comunes**

#### **❌ Error: Slug duplicado**

```typescript
// Solución: Generar slug único automáticamente
const generateUniqueSlug = async (baseName: string): Promise<string> => {
  let slug = baseName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  let counter = 1

  while (await EnhancedCompany.findOne({slug})) {
    slug = `${baseName}-${counter}`
    counter++
  }

  return slug
}
```

#### **❌ Error: TaxId duplicado**

```typescript
// Verificación antes de crear
const existingCompany = await EnhancedCompany.findOne({
  'settings.taxId': newTaxId
})

if (existingCompany) {
  throw new Error('Ya existe una empresa con este RUT/Tax ID')
}
```

#### **⚠️ Límites excedidos**

```typescript
// Verificación antes de agregar usuarios
if (!company.canAddUser()) {
  throw new Error(
    `Límite de usuarios alcanzado (${company.settings.limits.maxUsers})`
  )
}
```

---

## 📚 **REFERENCIAS**

### **Archivos Relacionados**

- `src/models/EnhancedCompany.ts` - Definición del modelo
- `src/controllers/EnhancedCompanyController.ts` - Controlador API
- `src/scripts/initializeEnhanced.ts` - Inicialización
- `src/scripts/migrateToEnhancedCompany.ts` - Migración

### **Comandos Útiles**

```bash
# Inicializar sistema enhanced
npm run init-enhanced-db

# Verificar estado
npm run verify-enhanced-db

# Migrar desde Company básico
npm run migrate-to-enhanced
```

---

**Desarrollado por Esteban Soto Ojeda** (@elsoprimeDev)  
_Arquitecto del Modelo EnhancedCompany Enterprise_
