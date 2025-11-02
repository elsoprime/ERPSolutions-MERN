# Ejemplos de JSON para Crear Empresas - Postman Collection

## 📋 **Crear Empresa - Ejemplos de JSON para Postman**

### **Endpoint Principal:** `POST /api/v2/enhanced-companies/`

### **Base URL:** `http://localhost:4000` (desarrollo)

### **URL Completa:** `http://localhost:4000/api/v2/enhanced-companies/`

### **Headers Requeridos:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### **🔗 Endpoints Disponibles:**

- **POST** `/api/v2/enhanced-companies/` - Crear nueva empresa
- **GET** `/api/v2/enhanced-companies/` - Obtener todas las empresas
- **GET** `/api/v2/enhanced-companies/:id` - Obtener empresa por ID
- **PUT** `/api/v2/enhanced-companies/:id` - Actualizar empresa
- **DELETE** `/api/v2/enhanced-companies/:id` - Eliminar empresa
- **GET** `/api/v2/enhanced-companies/slug/:slug` - Obtener empresa por slug
- **GET** `/api/v2/enhanced-companies/summary` - Resumen de empresas
- **GET** `/api/v2/enhanced-companies/:id/users` - Usuarios de la empresa
- **GET** `/api/v2/enhanced-companies/:id/stats` - Estadísticas de la empresa
- **PUT** `/api/v2/enhanced-companies/:id/settings` - Actualizar configuraciones
- **PUT** `/api/v2/enhanced-companies/:id/status` - Cambiar estado de empresa
- **PUT** `/api/v2/enhanced-companies/:id/plan` - Cambiar plan de suscripción

---

## 🏢 **Ejemplo 1: Empresa Básica (Mínimos Requeridos)**

```json
{
  "name": "Mi Nueva Empresa SPA",
  "email": "contacto@minuevaempresa.cl",
  "address": {
    "street": "Av. Providencia 1234",
    "city": "Santiago",
    "state": "Región Metropolitana",
    "country": "Chile",
    "postalCode": "7500000"
  },
  "settings": {
    "taxId": "76.123.456-7"
  }
}
```

---

## 🏭 **Ejemplo 2: Empresa Industrial Completa**

```json
{
  "name": "Industrias del Norte LTDA",
  "slug": "industrias-norte",
  "description": "Empresa industrial especializada en manufactura y producción",
  "website": "https://industriasdelnorte.cl",
  "email": "admin@industriasdelnorte.cl",
  "phone": "+56 9 8765 4321",
  "address": {
    "street": "Parque Industrial Los Andes 567",
    "city": "Antofagasta",
    "state": "Región de Antofagasta",
    "country": "Chile",
    "postalCode": "1240000"
  },
  "plan": "professional",
  "settings": {
    "businessType": "manufacturing",
    "industry": "Manufactura e Industria",
    "taxId": "77.456.789-0",
    "currency": "CLP",
    "fiscalYear": {
      "startMonth": 1,
      "endMonth": 12
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

---

## 💼 **Ejemplo 3: Empresa de Servicios Profesionales**

```json
{
  "name": "Consultora Estratégica SPA",
  "slug": "consultora-estrategica",
  "description": "Consultoría empresarial y estrategia de negocios",
  "website": "https://consultoraes.cl",
  "email": "info@consultoraes.cl",
  "phone": "+56 2 2234 5678",
  "address": {
    "street": "Av. Apoquindo 3000, Of. 501",
    "city": "Santiago",
    "state": "Región Metropolitana",
    "country": "Chile",
    "postalCode": "7550000"
  },
  "plan": "enterprise",
  "settings": {
    "businessType": "consulting",
    "industry": "Consultoría y Servicios Profesionales",
    "taxId": "76.789.012-3",
    "currency": "CLP",
    "fiscalYear": {
      "startMonth": 3,
      "endMonth": 2
    },
    "features": {
      "inventory": false,
      "accounting": true,
      "hrm": true,
      "crm": true,
      "projects": true
    },
    "branding": {
      "primaryColor": "#2563EB",
      "secondaryColor": "#64748B"
    }
  }
}
```

---

## 🛒 **Ejemplo 4: Empresa de Retail/Comercio**

```json
{
  "name": "TecnoStore Chile",
  "slug": "tecnostore-chile",
  "description": "Venta de equipos tecnológicos y electrónicos",
  "website": "https://tecnostore.cl",
  "email": "ventas@tecnostore.cl",
  "phone": "+56 9 1111 2222",
  "address": {
    "street": "Mall Plaza Norte, Local 205",
    "city": "Santiago",
    "state": "Región Metropolitana",
    "country": "Chile",
    "postalCode": "8580000"
  },
  "plan": "basic",
  "settings": {
    "businessType": "retail",
    "industry": "Tecnología y Electrónicos",
    "taxId": "77.345.678-9",
    "currency": "CLP",
    "fiscalYear": {
      "startMonth": 1,
      "endMonth": 12
    },
    "features": {
      "inventory": true,
      "accounting": true,
      "hrm": false,
      "crm": true,
      "projects": false
    }
  }
}
```

---

## 🏥 **Ejemplo 5: Empresa de Salud**

```json
{
  "name": "Centro Médico Integral",
  "slug": "centro-medico-integral",
  "description": "Centro de atención médica integral y especializada",
  "website": "https://centromedicointegral.cl",
  "email": "administracion@centromedicointegral.cl",
  "phone": "+56 2 2345 6789",
  "address": {
    "street": "Av. Las Condes 12000",
    "city": "Santiago",
    "state": "Región Metropolitana",
    "country": "Chile",
    "postalCode": "7550000"
  },
  "plan": "professional",
  "settings": {
    "businessType": "healthcare",
    "industry": "Salud y Medicina",
    "taxId": "76.567.890-1",
    "currency": "CLP",
    "fiscalYear": {
      "startMonth": 1,
      "endMonth": 12
    },
    "features": {
      "inventory": true,
      "accounting": true,
      "hrm": true,
      "crm": true,
      "projects": false
    },
    "branding": {
      "primaryColor": "#059669",
      "secondaryColor": "#6B7280"
    }
  }
}
```

---

## 🎓 **Ejemplo 6: Institución Educativa**

```json
{
  "name": "Instituto Técnico Superior",
  "slug": "instituto-tecnico-superior",
  "description": "Formación técnica profesional y capacitación empresarial",
  "website": "https://institutotech.cl",
  "email": "admision@institutotech.cl",
  "phone": "+56 9 9999 8888",
  "address": {
    "street": "Av. Libertador Bernardo O'Higgins 1500",
    "city": "Santiago",
    "state": "Región Metropolitana",
    "country": "Chile",
    "postalCode": "8320000"
  },
  "plan": "professional",
  "settings": {
    "businessType": "education",
    "industry": "Educación y Capacitación",
    "taxId": "77.111.222-3",
    "currency": "CLP",
    "fiscalYear": {
      "startMonth": 3,
      "endMonth": 2
    },
    "features": {
      "inventory": false,
      "accounting": true,
      "hrm": true,
      "crm": true,
      "projects": true
    }
  }
}
```

---

## 📊 **Enums y Valores Válidos**

### **Planes Disponibles (`plan`):**

- `"free"` - Plan gratuito
- `"basic"` - Plan básico
- `"professional"` - Plan profesional
- `"enterprise"` - Plan empresarial

### **Tipos de Negocio (`businessType`):**

- `"retail"` - Comercio/Retail
- `"manufacturing"` - Manufactura
- `"services"` - Servicios
- `"technology"` - Tecnología
- `"healthcare"` - Salud
- `"education"` - Educación
- `"finance"` - Finanzas
- `"real_estate"` - Bienes Raíces
- `"transportation"` - Transporte
- `"food_beverage"` - Alimentos y Bebidas
- `"consulting"` - Consultoría
- `"construction"` - Construcción
- `"tourism"` - Turismo
- `"agriculture"` - Agricultura
- `"mining_energy"` - Minería y Energía
- `"media"` - Medios de Comunicación
- `"entertainment"` - Entretenimiento
- `"sports"` - Deportes
- `"government"` - Gobierno
- `"non_profit"` - Sin Fines de Lucro
- `"other"` - Otros

### **Monedas Disponibles (`currency`):**

- `"CLP"` - Peso Chileno
- `"USD"` - Dólar Americano
- `"EUR"` - Euro
- `"ARS"` - Peso Argentino
- `"PEN"` - Sol Peruano
- `"COP"` - Peso Colombiano
- `"MXN"` - Peso Mexicano
- `"BRL"` - Real Brasileño

---

## ⚠️ **Notas Importantes:**

1. **Token JWT:** Requerido en el header `Authorization: Bearer YOUR_TOKEN`
2. **TaxId:** Debe ser único en el sistema
3. **Slug:** Si no se proporciona, se genera automáticamente desde el nombre
4. **Plan:** Si no se especifica, se asigna "free" por defecto
5. **BusinessType:** Si no se especifica, se asigna "other" por defecto
6. **Currency:** Si no se especifica, se asigna "CLP" por defecto

---

## 🚀 **Respuesta Esperada (201 Created):**

```json
{
  "success": true,
  "message": "Empresa creada exitosamente",
  "data": {
    "_id": "64f123abc456def789012345",
    "name": "Mi Nueva Empresa SPA",
    "slug": "mi-nueva-empresa-spa",
    "email": "contacto@minuevaempresa.cl",
    "status": "trial",
    "plan": "free",
    "createdAt": "2025-10-28T12:00:00.000Z",
    "settings": {
      "taxId": "76.123.456-7",
      "businessType": "other",
      "industry": "Otros"
    }
  }
}
```
