# ⚠️ SCRIPTS LEGACY - GUÍA DEPRECADA

## 🚨 **IMPORTANTE: ESTA GUÍA ESTÁ DEPRECADA**

Esta documentación describe scripts que han sido **REORGANIZADOS Y ACTUALIZADOS** para el sistema EnhancedUser.

---

## 🔄 **NUEVA ORGANIZACIÓN DE SCRIPTS**

Los scripts han sido reorganizados en las siguientes carpetas:

### 📁 **`deprecated/`** - Scripts Legacy

- `initializeNew.ts` y backups
- `initializeEnhanced.ts` (versión antigua)
- `runInitialization.ts`

### 📁 **`migration/`** - Scripts de Migración

- `migrateToEnhancedUser.ts`
- `migrateToEnhancedCompany.ts`
- `migrateUsers.ts` (legacy)

### 📁 **`initialization/`** - Scripts de Inicialización

- `initializeEnhancedNew.ts` ✅ **USAR ESTE**
- `runEnhancedInitialization.ts`
- `initializeSettings.ts`

### 📁 **`utilities/`** - Herramientas de Utilidad

- `verifyDatabase.ts`
- `verifyEnhancedDatabase.ts`
- `cleanDatabase.ts`
- `fixIndexes.ts`
- `quickTest.ts`
- `registerTestingRoutes.ts`

---

## 🎯 **COMANDOS ACTUALIZADOS**

### **✅ Nuevos Comandos (Usar estos):**

```bash
# Verificación
npm run verify:db
npm run verify:enhanced

# Inicialización
npm run init:enhanced
npm run init:settings
npm run init:clean

# Migración
npm run migrate:enhanced-user
npm run migrate:enhanced-company

# Utilidades
npm run clean:db
npm run fix:indexes
npm run test:quick
```

- Perfecto para reiniciar completamente

### **🗑️ Solo Limpiar Base de Datos**

```bash
npm run clean-db
```

**¿Qué hace?**

- ⚠️ **ELIMINA TODOS los usuarios y empresas**
- No crea nada nuevo
- Útil antes de importar datos externos

### **🔄 Migrar Usuarios Existentes**

```bash
npm run migrate-users
```

**¿Qué hace?**

- Convierte roles antiguos al nuevo sistema
- `admin` → `super_admin`
- `company_admin` → `admin_empresa`
- `user` → `employee`
- `readonly` → `viewer`

## 🎯 **Flujo de Trabajo Recomendado**

### **🆕 Primera Vez (Base de Datos Vacía)**

```bash
# 1. Verificar estado actual
npm run verify-db

# 2. Inicializar con usuarios de prueba
npm run init-db:test

# 3. Verificar que todo se creó correctamente
npm run verify-db
```

### **🔄 Desarrollo Diario**

```bash
# Verificar estado antes de trabajar
npm run verify-db

# Si necesitas datos frescos
npm run init-db:clean
```

### **🧪 Para Testing/QA**

```bash
# Limpiar e inicializar con datos de prueba
npm run init-db:clean
```

### **📦 Si tienes datos existentes**

```bash
# 1. Verificar estado actual
npm run verify-db

# 2. Si hay roles antiguos, migrar
npm run migrate-users

# 3. Agregar datos faltantes (sin borrar existentes)
npm run init-db

# 4. Verificar resultado final
npm run verify-db
```

## 🔐 **Credenciales por Defecto**

| Rol               | Email                      | Password        | Empresa         |
| ----------------- | -------------------------- | --------------- | --------------- |
| **Super Admin**   | superadmin@erpsolutions.cl | SuperAdmin2024! | Global          |
| **Admin Empresa** | admin@erpsolutions.cl      | AdminERP2024!   | ERP Solutions   |
| **Manager**       | manager@democompany.cl     | Manager2024!    | Demo Company    |
| **Employee**      | empleado@testindustries.cl | Employee2024!   | Test Industries |
| **Viewer**        | viewer@democompany.cl      | Viewer2024!     | Demo Company    |

### **Usuarios de Prueba Adicionales (con -test)**

| Rol               | Email                        | Password          | Empresa       |
| ----------------- | ---------------------------- | ----------------- | ------------- |
| **Manager**       | testmanager@erpsolutions.cl  | TestManager2024!  | ERP Solutions |
| **Employee**      | testemployee@erpsolutions.cl | TestEmployee2024! | ERP Solutions |
| **Admin Empresa** | demoadmin@democompany.cl     | DemoAdmin2024!    | Demo Company  |

## 🏢 **Empresas Creadas**

| Empresa                  | RUT          | Industria             | Email                   |
| ------------------------ | ------------ | --------------------- | ----------------------- |
| **ERP Solutions SPA**    | 77.123.456-7 | Tecnología y Software | admin@erpsolutions.cl   |
| **Demo Company SPA**     | 76.987.654-3 | Comercio y Retail     | demo@democompany.cl     |
| **Test Industries LTDA** | 75.555.444-9 | Manufactura           | admin@testindustries.cl |

## 🎨 **Personalización**

### **Variables de Entorno**

Puedes personalizar las contraseñas en tu `.env`:

```env
SUPER_ADMIN_PASSWORD=TuPasswordPersonalizada!
ADMIN_PASSWORD=OtraPassword123!
MANAGER_PASSWORD=ManagerPass456!
EMPLOYEE_PASSWORD=EmpleadoPass789!
VIEWER_PASSWORD=ViewerPass000!
```

### **Modificar Datos**

Edita `src/scripts/initializeNew.ts`:

- `COMPANIES_DATA` - Para cambiar empresas
- `USERS_DATA` - Para cambiar usuarios principales

## 🚨 **Advertencias Importantes**

### **⚠️ Comandos Destructivos**

- `npm run clean-db` - Elimina TODOS los datos
- `npm run init-db:clean` - Elimina TODOS los datos y recrea

### **✅ Comandos Seguros**

- `npm run verify-db` - Solo lee, no modifica nada
- `npm run init-db` - Solo agrega, no elimina
- `npm run migrate-users` - Solo actualiza roles, no elimina

## 🔍 **Troubleshooting**

### **❌ Error: "Cannot find module"**

```bash
# Verifica que estés en la carpeta backend
cd backend

# Instala dependencias si es necesario
npm install
```

### **❌ Error: "Database connection failed"**

```bash
# Verifica que MongoDB esté corriendo
# Verifica las variables de entorno de conexión
# Verifica el archivo .env
```

### **❌ Error: "User already exists"**

```bash
# Es normal, significa que el usuario ya existe
# El script actualiza la contraseña si es necesario
```

### **❌ Roles inválidos en verify-db**

```bash
# Ejecuta la migración de usuarios
npm run migrate-users
```

## 📊 **Salida Esperada de verify-db**

```
🔍 Verificando estado de la base de datos...
============================================================
📊 ESTADÍSTICAS GENERALES:
  • Total empresas: 3
  • Total usuarios: 5

🏢 EMPRESAS REGISTRADAS:
  1. ERP Solutions SPA
     RUT: 77.123.456-7
     Industria: Tecnología y Software
     Email: admin@erpsolutions.cl
  ...

👥 USUARIOS POR ROL:
  🔴 Super Admin: 1
  🔵 Admin Empresa: 1
  🟢 Manager: 1
  🟡 Employee: 1
  ⚪ Viewer: 1

🏢 USUARIOS POR EMPRESA:
  📋 ERP Solutions SPA (1 usuarios):
     ✅ 🔵 Admin ERP Solutions (admin@erpsolutions.cl)
  ...

🔐 CREDENCIALES DE TESTING:
  ✅ superadmin@erpsolutions.cl
     Nombre: Super Administrador
     Rol: 🔴 Super Admin
     Confirmado: Sí
  ...

🔍 VERIFICACIÓN DE PROBLEMAS:
  ✅ Todos los usuarios tienen empresa asignada correctamente
  ✅ Todos los usuarios tienen roles válidos
============================================================
🎉 Verificación completada
```

---

**¡Scripts de base de datos listos para usar!** 🚀

_Desarrollado por Esteban Soto Ojeda (@elsoprimeDev)_
