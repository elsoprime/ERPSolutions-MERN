# 📦 **Sistema de Inicialización Legacy (Compatibilidad)**

## ⚠️ **NOTA IMPORTANTE**

Este es el sistema **legacy** mantenido para compatibilidad. Para nuevos proyectos, utiliza el **sistema Enhanced** que incluye características enterprise avanzadas:

- 🚀 **Recomendado**: `npm run init-enhanced-db`
- 📚 **Documentación**: Ver `docs/ENHANCED_SCRIPTS_GUIDE.md`
- 🏢 **Características**: Planes, límites, branding, métricas

---

## 🎯 **Reconstrucción Completa del Módulo Legacy**

Este módulo legacy ha sido **completamente reconstruido** para coincidir con el sistema role-based multi-company implementado en el frontend, pero **sin las características enterprise**.

## 🏗️ **Estructura del Sistema Legacy**

### **1. Empresas Creadas Automáticamente**

| Empresa                  | RUT          | Industria             | Descripción                     |
| ------------------------ | ------------ | --------------------- | ------------------------------- |
| **ERP Solutions SPA**    | 77.123.456-7 | Tecnología y Software | Empresa principal del sistema   |
| **Demo Company SPA**     | 76.987.654-3 | Comercio y Retail     | Empresa de demostración         |
| **Test Industries LTDA** | 75.555.444-9 | Manufactura           | Empresa industrial para testing |

### **2. Usuarios y Roles Creados Automáticamente**

| Usuario                 | Email                      | Rol             | Empresa         | Password        |
| ----------------------- | -------------------------- | --------------- | --------------- | --------------- |
| **Super Administrador** | superadmin@erpsolutions.cl | `super_admin`   | Global          | SuperAdmin2024! |
| **Admin ERP Solutions** | admin@erpsolutions.cl      | `admin_empresa` | ERP Solutions   | AdminERP2024!   |
| **Manager Demo**        | manager@democompany.cl     | `manager`       | Demo Company    | Manager2024!    |
| **Empleado Test**       | empleado@testindustries.cl | `employee`      | Test Industries | Employee2024!   |
| **Viewer Demo**         | viewer@democompany.cl      | `viewer`        | Demo Company    | Viewer2024!     |

### **3. Usuarios de Prueba Adicionales (Opcional)**

| Usuario           | Email                        | Rol             | Empresa       | Password          |
| ----------------- | ---------------------------- | --------------- | ------------- | ----------------- |
| **Test Manager**  | testmanager@erpsolutions.cl  | `manager`       | ERP Solutions | TestManager2024!  |
| **Test Employee** | testemployee@erpsolutions.cl | `employee`      | ERP Solutions | TestEmployee2024! |
| **Demo Admin**    | demoadmin@democompany.cl     | `admin_empresa` | Demo Company  | DemoAdmin2024!    |

## 🚀 **Comandos de Inicialización Legacy**

### **⚠️ Sistema Recomendado (Enhanced)**

```bash
# RECOMENDADO: Sistema Enterprise con características avanzadas
npm run init-enhanced-db        # Inicialización enterprise
npm run verify-enhanced-db      # Verificación enterprise
```

### **📦 Sistema Legacy (Compatibilidad)**

### **Inicialización Básica**

```bash
cd backend
npm run init-db
```

Crea empresas y usuarios básicos del sistema.

### **Inicialización con Usuarios de Prueba**

```bash
npm run init-db:test
```

Crea empresas, usuarios básicos + usuarios adicionales de testing.

### **Inicialización con Limpieza Previa**

```bash
npm run init-db:clean
```

Limpia toda la base de datos y luego inicializa desde cero.

### **Solo Limpiar Base de Datos**

```bash
npm run clean-db
```

Elimina todos los usuarios y empresas de la base de datos.

## 🔧 **Archivos del Sistema**

### **Archivos Principales**

- `src/scripts/initializeNew.ts` - Lógica principal de inicialización
- `src/scripts/runInitialization.ts` - Script ejecutor
- `src/scripts/cleanDatabase.ts` - Script de limpieza

### **Funciones Exportadas**

```typescript
// Función principal
initializeDatabase(includeTestUsers?: boolean): Promise<void>

// Funciones específicas
initializeCompanies(): Promise<Map<string, string>>
initializeUsers(companyIdMap: Map<string, string>): Promise<void>
createTestUsers(companyIdMap: Map<string, string>): Promise<void>
showDatabaseStats(): Promise<void>

// Compatibilidad legacy
getOrCreateCompany(): Promise<string>
initializeAdminUser(): Promise<string>
```

## 🎯 **Roles y Permisos del Sistema**

### **Jerarquía de Roles**

```
SUPER_ADMIN (5)     → Acceso global a todas las empresas
ADMIN_EMPRESA (4)   → Acceso completo a su empresa
MANAGER (3)         → Gestión operativa en su empresa
EMPLOYEE (2)        → Acceso operativo básico
VIEWER (1)          → Solo lectura
```

### **Distribución por Empresa**

#### **ERP Solutions SPA (Principal)**

- 1 Admin Empresa
- 1 Manager (Test)
- 1 Employee (Test)

#### **Demo Company SPA**

- 1 Manager
- 1 Viewer
- 1 Admin (Test)

#### **Test Industries LTDA**

- 1 Employee

#### **Global**

- 1 Super Admin (sin empresa específica)

## 🔐 **Variables de Entorno**

Para personalizar las contraseñas, agrega estas variables a tu `.env`:

```env
# Contraseñas del sistema
SUPER_ADMIN_PASSWORD=SuperAdmin2024!
ADMIN_PASSWORD=AdminERP2024!
MANAGER_PASSWORD=Manager2024!
EMPLOYEE_PASSWORD=Employee2024!
VIEWER_PASSWORD=Viewer2024!
```

## 📊 **Salida del Script**

El script mostrará información detallada:

```
🚀 Iniciando configuración de base de datos...
============================================================
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

ℹ️  📊 Estadísticas de la base de datos:
  • Total empresas: 3
  • Total usuarios: 5
  • Usuarios por rol:
    - super_admin: 1
    - admin_empresa: 1
    - manager: 1
    - employee: 1
    - viewer: 1
  • Usuarios por empresa:
    - ERP Solutions SPA: 1
    - Demo Company SPA: 2
    - Test Industries LTDA: 1
    - Global (Super Admin): 1
============================================================
🎉 Inicialización de base de datos completada exitosamente!

📝 CREDENCIALES IMPORTANTES:
Super Admin: superadmin@erpsolutions.cl / SuperAdmin2024!
Admin ERP: admin@erpsolutions.cl / AdminERP2024!
Manager Demo: manager@democompany.cl / Manager2024!
Employee Test: empleado@testindustries.cl / Employee2024!
Viewer Demo: viewer@democompany.cl / Viewer2024!
```

## 🧪 **Testing del Sistema**

### **1. Limpiar e Inicializar**

```bash
npm run init-db:clean
```

### **2. Verificar en Frontend**

Accede a `http://localhost:3000` y prueba:

- Login con diferentes usuarios
- Verificar redirección automática a dashboards apropiados
- Probar navegación entre módulos según permisos

### **3. URLs de Testing Directo**

```bash
# Acceso directo a dashboards
http://localhost:3000/dashboard/super-admin    # superadmin@erpsolutions.cl
http://localhost:3000/dashboard/company-admin  # admin@erpsolutions.cl
http://localhost:3000/dashboard/manager        # manager@democompany.cl
http://localhost:3000/dashboard/employee       # empleado@testindustries.cl
http://localhost:3000/dashboard/viewer         # viewer@democompany.cl

# Módulos específicos
http://localhost:3000/users                    # Gestión de usuarios
http://localhost:3000/inventory                # Inventario
http://localhost:3000/reports                  # Reportes
```

## ✨ **Características Implementadas**

### **✅ Sistema Multi-Empresa**

- Empresas separadas con usuarios específicos
- Super Admin con acceso global
- Admins de empresa con acceso limitado a su empresa

### **✅ Roles Jerárquicos**

- 5 niveles de acceso claramente definidos
- Permisos cascada (roles superiores acceden a inferiores)
- Verificación automática de permisos

### **✅ Contraseñas Seguras**

- Hash con bcrypt y salt rounds de 12
- Contraseñas complejas por defecto
- Actualización automática si cambian

### **✅ Logging Detallado**

- Mensajes coloridos y descriptivos
- Estadísticas automáticas post-inicialización
- Manejo de errores robusto

### **✅ Compatibilidad Legacy**

- Funciones anteriores mantenidas para compatibilidad
- Migración suave desde sistema anterior

## 🎯 **Próximos Pasos**

1. **Ejecutar inicialización**:

   ```bash
   npm run init-db:clean
   ```

2. **Iniciar backend**:

   ```bash
   npm run dev
   ```

3. **Probar en frontend** con las credenciales proporcionadas

4. **Verificar navegación role-based** entre módulos

---

**¡Sistema de inicialización completamente reconstruido y listo para usar!** 🚀

_Desarrollado por Esteban Soto Ojeda (@elsoprimeDev)_
