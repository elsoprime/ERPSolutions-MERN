# 🔧 **ENHANCED SCRIPTS - GUÍA COMPLETA**

## 🎯 **Scripts Enterprise Disponibles**

### **🚀 Sistema Enhanced (RECOMENDADO)**

El sistema Enhanced es la versión enterprise del ERP con características avanzadas como planes de suscripción, límites configurables y personalización por empresa.

---

## 📊 **COMANDOS PRINCIPALES**

### **🔍 Verificar Estado Enhanced**

```bash
npm run verify-enhanced-db
```

**¿Qué hace?**

- 📊 Estadísticas detalladas de empresas enhanced
- 🏢 Lista empresas con planes y límites
- 👥 Usuarios por rol y empresa
- 📈 Porcentajes de uso vs límites
- ⚠️ Detecta límites excedidos y problemas
- 🎨 Muestra configuraciones de branding

**Salida esperada:**

```
🔍 Verificando estado de la base de datos (Enhanced)...
============================================================
📊 ESTADÍSTICAS GENERALES:
  • Total empresas: 3
  • Total usuarios: 5

🏢 EMPRESAS REGISTRADAS:
  1. ERP Solutions SPA
     Slug: erp-solutions-spa
     RUT: 77.123.456-7
     Plan: ENTERPRISE
     Usuarios: 1/100
     Características: inventory, accounting, hrm, crm, projects
```

### **🚀 Inicialización Enhanced Básica**

```bash
npm run init-enhanced-db
```

**¿Qué hace?**

- 🏢 Crea 3 empresas enhanced con diferentes planes
- 👥 Crea 5 usuarios con roles específicos
- ⚙️ Configura límites y características por plan
- 🎨 Aplica branding por industria
- 📊 Inicializa estadísticas en tiempo real
- 🔄 Mantiene datos existentes, solo agrega faltantes

### **🧹 Limpieza Total + Inicialización Enhanced**

```bash
npm run init-enhanced-db:clean
```

**¿Qué hace?**

- ⚠️ **ELIMINA TODOS LOS DATOS** (usuarios y empresas)
- 🆕 Inicializa sistema enhanced desde cero
- 📋 Crea datos de prueba enterprise
- 🎯 Perfecto para testing y desarrollo

---

## 🔄 **COMANDOS DE MIGRACIÓN**

### **📦 Migrar de Company a Enhanced**

```bash
npm run migrate-to-enhanced
```

**¿Qué hace?**

- 🔄 Convierte datos del modelo Company básico a EnhancedCompany
- 📊 Mapea industrias a tipos de negocio
- 🎯 Asigna planes basados en configuraciones
- 🏷️ Genera slugs únicos automáticamente
- 📈 Calcula estadísticas iniciales
- ⚠️ Preserva integridad referencial

**Proceso de migración:**

```
🔄 Iniciando migración de Company a EnhancedCompany
📊 Encontradas 3 empresas para migrar
🔄 Migrando empresa: ERP Solutions SPA
✅ Empresa migrada: ERP Solutions SPA → erp-solutions-spa
```

### **🔗 Actualizar Referencias**

```bash
npm run update-company-refs
```

**¿Qué hace?**

- 🔗 Actualiza referencias de User.companyId
- 📊 Mapea IDs antiguos a nuevos
- ✅ Verifica integridad de datos
- 🔄 Mantiene consistencia relacional

---

## 📦 **COMANDOS LEGACY (Compatibilidad)**

### **Sistema Tradicional**

```bash
# Verificación legacy
npm run verify-db

# Inicialización legacy
npm run init-db
npm run init-db:clean
npm run init-db:test

# Migración de roles legacy
npm run migrate-users

# Limpieza legacy
npm run clean-db
```

---

## 🏢 **EMPRESAS ENHANCED CREADAS**

### **🟠 ERP Solutions SPA (Enterprise)**

```yaml
Plan: enterprise
Límites:
  - Usuarios: 100
  - Productos: 50,000
  - Transacciones: 100,000/mes
  - Storage: 50 GB
Características:
  - ✅ Inventory
  - ✅ Accounting
  - ✅ HRM
  - ✅ CRM
  - ✅ Projects
Branding:
  - Color Primario: #3B82F6 (Azul tecnología)
  - Color Secundario: #64748B
```

### **🔵 Demo Company SPA (Professional)**

```yaml
Plan: professional
Límites:
  - Usuarios: 25
  - Productos: 5,000
  - Transacciones: 25,000/mes
  - Storage: 10 GB
Características:
  - ✅ Inventory
  - ✅ Accounting
  - ❌ HRM
  - ✅ CRM
  - ❌ Projects
Branding:
  - Color Primario: #10B981 (Verde comercio)
  - Color Secundario: #6B7280
```

### **🟡 Test Industries LTDA (Basic)**

```yaml
Plan: basic
Límites:
  - Usuarios: 10
  - Productos: 1,000
  - Transacciones: 5,000/mes
  - Storage: 5 GB
Características:
  - ✅ Inventory
  - ❌ Accounting
  - ✅ HRM
  - ❌ CRM
  - ✅ Projects
Branding:
  - Color Primario: #F59E0B (Naranja industrial)
  - Color Secundario: #9CA3AF
```

---

## 🔐 **CREDENCIALES ENHANCED**

| Usuario           | Email                      | Password        | Empresa         | Plan            |
| ----------------- | -------------------------- | --------------- | --------------- | --------------- |
| **Super Admin**   | superadmin@erpsolutions.cl | SuperAdmin2024! | Global          | -               |
| **Admin ERP**     | admin@erpsolutions.cl      | AdminERP2024!   | ERP Solutions   | 🟠 Enterprise   |
| **Manager Demo**  | manager@democompany.cl     | Manager2024!    | Demo Company    | 🔵 Professional |
| **Employee Test** | empleado@testindustries.cl | Employee2024!   | Test Industries | 🟡 Basic        |
| **Viewer Demo**   | viewer@democompany.cl      | Viewer2024!     | Demo Company    | 🔵 Professional |

---

## 🔄 **FLUJOS DE TRABAJO RECOMENDADOS**

### **🆕 Primer Setup (Proyecto Nuevo)**

```bash
# 1. Verificar estado inicial
npm run verify-enhanced-db

# 2. Inicializar sistema enhanced
npm run init-enhanced-db:clean

# 3. Verificar que todo se creó correctamente
npm run verify-enhanced-db
```

### **📦 Migración desde Legacy**

```bash
# 1. Verificar estado actual legacy
npm run verify-db

# 2. Migrar a enhanced
npm run migrate-to-enhanced

# 3. Actualizar referencias
npm run update-company-refs

# 4. Verificar migración exitosa
npm run verify-enhanced-db
```

### **🔄 Desarrollo Diario**

```bash
# Verificar estado antes de trabajar
npm run verify-enhanced-db

# Si necesitas datos frescos
npm run init-enhanced-db:clean

# Para agregar solo datos faltantes
npm run init-enhanced-db
```

### **🧪 Testing/QA**

```bash
# Resetear para testing
npm run init-enhanced-db:clean

# Verificar configuraciones de prueba
npm run verify-enhanced-db
```

---

## 🎨 **PERSONALIZACIÓN AVANZADA**

### **Variables de Entorno**

```env
# Configuraciones enhanced
ENHANCED_DEFAULT_PLAN=professional
ENHANCED_TRIAL_DAYS=30
ENHANCED_MAX_FREE_USERS=2

# Colores por defecto
DEFAULT_PRIMARY_COLOR=#3B82F6
DEFAULT_SECONDARY_COLOR=#64748B

# Límites globales
MAX_ENTERPRISE_USERS=1000
MAX_STORAGE_GB=100
```

### **Configuración de Planes**

Edita `src/scripts/initializeEnhanced.ts` para personalizar:

```typescript
// Modificar límites por plan
const PLAN_LIMITS = {
  free: {maxUsers: 2, maxProducts: 50, storageGB: 0.5},
  basic: {maxUsers: 10, maxProducts: 1000, storageGB: 5},
  professional: {maxUsers: 25, maxProducts: 5000, storageGB: 10},
  enterprise: {maxUsers: 100, maxProducts: 50000, storageGB: 50}
}

// Modificar características por plan
const PLAN_FEATURES = {
  free: {inventory: true, accounting: false, hrm: false},
  basic: {inventory: true, accounting: false, hrm: true},
  professional: {inventory: true, accounting: true, hrm: false},
  enterprise: {inventory: true, accounting: true, hrm: true}
}
```

---

## 📊 **SALIDAS DETALLADAS**

### **🔍 Salida de verify-enhanced-db**

```
🔍 Verificando estado de la base de datos (Enhanced)...
============================================================
📊 ESTADÍSTICAS GENERALES:
  • Total empresas: 3
  • Total usuarios: 5

🏢 EMPRESAS REGISTRADAS:
  1. ERP Solutions SPA
     Slug: erp-solutions-spa
     RUT: 77.123.456-7
     Industria: Tecnología y Software
     Email: admin@erpsolutions.cl
     Plan: ENTERPRISE
     Estado: ACTIVE
     Usuarios: 1/100
     Características: inventory, accounting, hrm, crm, projects

👥 USUARIOS POR ROL:
  🔴 Super Admin: 1
  🔵 Admin Empresa: 1
  🟢 Manager: 1
  🟡 Employee: 1
  ⚪ Viewer: 1

🏢 USUARIOS POR EMPRESA:
  📋 ERP Solutions SPA (1 usuarios):
     ✅ 🔵 Admin ERP Solutions (admin@erpsolutions.cl)
  📋 Demo Company SPA (2 usuarios):
     ✅ 🟢 Manager Demo (manager@democompany.cl)
     ✅ ⚪ Viewer Demo (viewer@democompany.cl)

🔍 VERIFICACIÓN DE PROBLEMAS:
  ✅ Todos los usuarios tienen empresa asignada correctamente
  ✅ Todos los usuarios tienen roles válidos
  ✅ Ninguna empresa excede límites de usuarios
============================================================
🎉 Verificación completada
```

### **🚀 Salida de init-enhanced-db:clean**

```
🚀 ENHANCED DATABASE INITIALIZATION
============================================================
✅ Conectado a la base de datos

🧹 MODO LIMPIEZA ACTIVADO
Limpiando base de datos...
✅ 5 usuarios eliminados
✅ 4 empresas eliminadas
✅ Base de datos limpiada

📋 INICIALIZANDO DATOS...
ℹ️  Inicializando empresas...
✅ Empresa ERP Solutions SPA creada exitosamente
✅ Empresa Demo Company SPA creada exitosamente
✅ Empresa Test Industries LTDA creada exitosamente
✨ Inicialización de empresas completada

ℹ️  Inicializando usuarios...
✅ Usuario Super Administrador (super_admin) creado exitosamente
✅ Usuario Admin ERP Solutions (admin_empresa) creado exitosamente
✅ Usuario Manager Demo (manager) creado exitosamente
✅ Usuario Empleado Test (employee) creado exitosamente
✅ Usuario Viewer Demo (viewer) creado exitosamente
✨ Inicialización de usuarios completada

✨ INICIALIZACIÓN COMPLETADA
🎉 Sistema Enhanced ERP inicializado correctamente
```

---

## 🚨 **ADVERTENCIAS Y PRECAUCIONES**

### **⚠️ Comandos Destructivos**

- `npm run init-enhanced-db:clean` - Elimina TODOS los datos
- `npm run migrate-to-enhanced` - Modifica estructura de datos

### **✅ Comandos Seguros**

- `npm run verify-enhanced-db` - Solo lectura
- `npm run init-enhanced-db` - Solo agrega datos faltantes

### **🔄 Comandos de Migración**

- `npm run migrate-to-enhanced` - Requiere backup previo
- `npm run update-company-refs` - Ejecutar después de migrate-to-enhanced

---

## 🔍 **TROUBLESHOOTING**

### **❌ Error: Cannot find module enhanced**

```bash
# Verificar que estés en la carpeta backend
cd backend

# Instalar dependencias
npm install

# Verificar que los archivos enhanced existen
ls src/scripts/initializeEnhanced.ts
ls src/models/EnhancedCompany.ts
```

### **❌ Error: Duplicate key (slug/taxId)**

```bash
# Limpiar datos duplicados
npm run init-enhanced-db:clean

# O migrar con datos limpios
npm run clean-db
npm run migrate-to-enhanced
```

### **⚠️ Warning: Límites excedidos**

```typescript
// El sistema detecta automáticamente cuando una empresa excede límites
if (company.userCount > company.settings.limits.maxUsers) {
  console.warn(`Empresa ${company.name} excede límite de usuarios`)
}
```

### **🔄 Migración fallida**

```bash
# 1. Backup de datos actuales
npm run verify-db > backup_before_migration.txt

# 2. Limpiar enhanced si existe
# (eliminar manualmente colección enhancedcompanies si es necesario)

# 3. Ejecutar migración limpia
npm run migrate-to-enhanced
npm run update-company-refs

# 4. Verificar resultado
npm run verify-enhanced-db
```

---

## 📚 **ARCHIVOS RELACIONADOS**

### **📁 Scripts Enhanced**

- `src/scripts/initializeEnhanced.ts` - Lógica de inicialización
- `src/scripts/runEnhancedInitialization.ts` - Ejecutor principal
- `src/scripts/verifyEnhancedDatabase.ts` - Verificación y estadísticas
- `src/scripts/migrateToEnhancedCompany.ts` - Migración desde legacy

### **🏗️ Modelos y Controladores**

- `src/models/EnhancedCompany.ts` - Modelo de datos enhanced
- `src/controllers/EnhancedCompanyController.ts` - API endpoints

### **📊 Package.json Scripts**

```json
{
  "scripts": {
    // Enhanced (recomendado)
    "init-enhanced-db": "ts-node -r tsconfig-paths/register src/scripts/runEnhancedInitialization.ts",
    "init-enhanced-db:clean": "ts-node -r tsconfig-paths/register src/scripts/runEnhancedInitialization.ts --clean",
    "verify-enhanced-db": "ts-node -r tsconfig-paths/register src/scripts/verifyEnhancedDatabase.ts",

    // Migración
    "migrate-to-enhanced": "ts-node -r tsconfig-paths/register src/scripts/migrateToEnhancedCompany.ts",
    "update-company-refs": "ts-node -r tsconfig-paths/register src/scripts/migrateToEnhancedCompany.ts --update-refs"
  }
}
```

---

## 🎯 **ROADMAP DE SCRIPTS**

### **✅ Implementado**

- ✅ Inicialización enhanced completa
- ✅ Migración desde legacy
- ✅ Verificación y estadísticas avanzadas
- ✅ Limpieza y reset de datos
- ✅ Actualización de referencias

### **🔮 Próximas Características**

- 💡 **Auto-backup** antes de operaciones destructivas
- 💡 **Seeding avanzado** con datos de diferentes industrias
- 💡 **Monitoreo de performance** de scripts
- 💡 **Rollback automático** en caso de errores
- 💡 **Validación de datos** pre y post migración

---

**Desarrollado por Esteban Soto Ojeda** (@elsoprimeDev)  
_Arquitecto de Scripts Enterprise - ERP Solutions_
