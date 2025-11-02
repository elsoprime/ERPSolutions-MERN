# 🚀 Enhanced Companies API v2.0 - Documentación Completa para Postman

## 📝 **Resumen del Sistema**

El módulo **Enhanced Companies v2.0** ha sido completamente refactorizado e implementado con:

- ✅ Arquitectura MVC + Services
- ✅ Validaciones robustas con Joi
- ✅ Índices MongoDB optimizados
- ✅ 12+ endpoints especializados
- ✅ Documentación Postman completa

---

## 🎯 **Endpoints de la API**

### **Base URL:** `http://localhost:4000/api/v2/enhanced-companies`

### **Endpoints Principales:**

1. **POST** `/` - Crear nueva empresa
2. **GET** `/` - Obtener todas las empresas
3. **GET** `/:id` - Obtener empresa por ID
4. **PUT** `/:id` - Actualizar empresa
5. **DELETE** `/:id` - Eliminar empresa

### **Endpoints Especializados:**

6. **GET** `/slug/:slug` - Obtener empresa por slug
7. **GET** `/summary` - Resumen de empresas
8. **GET** `/:id/users` - Usuarios de la empresa
9. **GET** `/:id/stats` - Estadísticas de la empresa
10. **PUT** `/:id/settings` - Actualizar configuraciones
11. **GET** `/search?q=término` - Buscar empresas
12. **GET** `/industry/:industry` - Filtrar por industria

---

## 📁 **Archivos de Documentación Disponibles**

### 1. **Colección Postman Principal** ⭐

**Archivo:** `Enhanced_Companies_API_v2.postman_collection.json`

- 8 requests pre-configurados
- Ejemplos de diferentes sectores
- Tests automatizados incluidos
- Variables configurables (baseUrl, token, companyId)

### 2. **Documentación con Ejemplos**

**Archivo:** `create-company-examples.md`

- 12+ ejemplos de JSON por sector
- Documentación completa de endpoints
- Headers y configuración
- Ejemplos desde básicos hasta complejos

### 3. **Ejemplos JSON Simples**

**Archivo:** `company-creation-examples.json`

- 5 ejemplos listos para copiar/pegar
- Diferentes tipos de empresas
- Formato JSON limpio

---

## 🔧 **Configuración para Postman**

### **Variables Requeridas:**

```json
{
  "baseUrl": "http://localhost:4000",
  "token": "your-jwt-token-here",
  "companyId": "company-id-from-response"
}
```

### **Headers Requeridos:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {{token}}"
}
```

---

## 📥 **Cómo Importar en Postman**

1. **Abrir Postman**
2. **Clic en "Import"**
3. **Seleccionar archivo:** `Enhanced_Companies_API_v2.postman_collection.json`
4. **Configurar variables** en el entorno o colección
5. **¡Listo para usar!**

---

## 🧪 **Ejemplos de Uso**

### **Ejemplo 1: Crear Empresa Básica:**

```bash
POST http://localhost:4000/api/v2/enhanced-companies/
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

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

### **Obtener Todas las Empresas:**

```bash
GET http://localhost:4000/api/v2/enhanced-companies/
Authorization: Bearer YOUR_TOKEN
```

### **Buscar Empresas:**

```bash
GET http://localhost:4000/api/v2/enhanced-companies/search?q=tecnología
Authorization: Bearer YOUR_TOKEN
```

---

## ✅ **Validaciones del Sistema**

- ✅ Nombre obligatorio (3-100 caracteres)
- ✅ Email válido en contactInfo
- ✅ Industria de lista predefinida
- ✅ Tamaño: pequeña, mediana, grande
- ✅ Status: active, inactive, pending
- ✅ Slug único generado automáticamente
- ✅ Fechas de creación/actualización automáticas

---

## 🎉 **Sistema Listo para Producción**

El módulo **Enhanced Companies v2.0** está completamente funcional y listo para uso:

- 🔒 **Autenticación JWT** integrada
- 📊 **Validaciones robustas** implementadas
- 🚀 **Performance optimizado** con índices MongoDB
- 📚 **Documentación completa** para desarrolladores
- 🧪 **Ejemplos funcionales** en Postman
- 🔄 **API RESTful** siguiendo mejores prácticas

---

## 📞 **Soporte y Desarrollo**

Para dudas sobre implementación o nuevas funcionalidades, todos los archivos están documentados y el sistema es extensible para futuras mejoras.

**¡El sistema Enhanced Companies v2.0 está listo para usar en Postman! 🚀**
