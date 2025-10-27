# 🎯 PLAN DE INTEGRACIÓN - RUTAS REALES

## 📋 ANÁLISIS DE RUTAS ACTUALES

### **🔍 ESTADO ACTUAL:**

- ✅ **domainRoutes** - Ya usa `authMiddleware.authenticate` (perfecto)
- ❌ **warehouseRoutes** - Sin autenticación ni autorización
- ❌ **settingsRoutes** - Sin protección (crítico para seguridad)
- ✅ **authRoutes** - Autenticación básica funcionando

---

## 🚀 INTEGRACIÓN PASO A PASO

### **FASE 1: PROTEGER RUTAS CRÍTICAS (15 minutos)**

#### **1.1 Settings Routes (ALTA PRIORIDAD)**

Las configuraciones deben estar MUY protegidas:

- `GET /general-settings` → Solo **admin/manager**
- `PUT /general-settings` → Solo **admin**
- `GET /security-settings` → Solo **admin/superadmin**
- `PUT /security-settings` → Solo **admin/superadmin**
- `GET /active-modules` → **admin/manager**
- `PUT /active-modules` → Solo **admin**

#### **1.2 Warehouse Routes (MEDIA PRIORIDAD)**

Diferentes permisos según operación:

- `GET /category` → **warehouse.read**
- `POST /category` → **warehouse.create**
- `PUT /categories/:id` → **warehouse.update**
- `DELETE /categories/:id` → **warehouse.delete**
- Similar para productos

---

### **FASE 2: IMPLEMENTAR ROLES GRANULARES (20 minutos)**

#### **2.1 Definir Permisos por Módulo:**

- **Settings:** Solo roles de gestión
- **Warehouse:** Permisos granulares CRUD
- **Dashboard:** Acceso general autenticado

#### **2.2 Aplicar Rate Limiting:**

- **Settings:** Rate limiting estricto
- **Warehouse:** Rate limiting normal
- **Dashboard:** Rate limiting básico

---

### **FASE 3: MULTI-TENANCY (15 minutos)**

#### **3.1 Aislamiento por Empresa:**

- **Warehouse:** Productos por empresa
- **Settings:** Configuraciones por empresa
- **Dashboard:** Datos filtrados por empresa

---

## 🛠️ IMPLEMENTACIÓN INMEDIATA

### **COMENZAMOS CON SETTINGS (Más crítico):**

1. **Proteger configuraciones generales**
2. **Proteger configuraciones de seguridad**
3. **Proteger módulos activos**

### **LUEGO WAREHOUSE:**

1. **Proteger categorías**
2. **Proteger productos**
3. **Implementar permisos CRUD**

### **FINALMENTE OPTIMIZAR:**

1. **Rate limiting por tipo de operación**
2. **Multi-tenancy donde aplique**
3. **Logging de operaciones críticas**

---

## 📊 MATRIZ DE PERMISOS PROPUESTA

| Ruta                          | Método | Rol Mínimo | Permiso Específico | Rate Limit |
| ----------------------------- | ------ | ---------- | ------------------ | ---------- |
| `/settings/general-settings`  | GET    | manager    | settings.read      | Strict     |
| `/settings/general-settings`  | PUT    | admin      | settings.write     | Critical   |
| `/settings/security-settings` | GET    | admin      | security.read      | Critical   |
| `/settings/security-settings` | PUT    | superadmin | security.write     | Critical   |
| `/warehouse/category`         | GET    | user       | warehouse.read     | Normal     |
| `/warehouse/category`         | POST   | employee   | warehouse.create   | Normal     |
| `/warehouse/categories/:id`   | PUT    | employee   | warehouse.update   | Normal     |
| `/warehouse/categories/:id`   | DELETE | manager    | warehouse.delete   | Strict     |

---

## ⚡ ACCIÓN INMEDIATA

**¿Empezamos con qué rutas quieres proteger primero?**

1. **🔒 SETTINGS (Recomendado)** - Más crítico para seguridad
2. **📦 WAREHOUSE** - Más frecuente en uso diario
3. **🏠 DASHBOARD** - Ya está parcialmente protegido

**¿Cuál eliges para empezar?**
