# Scripts de Inicialización

🚀 **Scripts para inicializar el sistema con datos base**

## Archivos disponibles:

### `initializeEnhancedNew.ts`

- **Estado:** ✅ ACTIVO PRINCIPAL
- **Propósito:** Inicialización completa del sistema con EnhancedUser
- **Descripción:** Crea empresas, usuarios y configuraciones base
- **Uso:** Sistemas nuevos o después de migración completa
- **Comando:** `npm run init:enhanced`

### `runEnhancedInitialization.ts`

- **Estado:** ✅ ACTIVO
- **Propósito:** Ejecutor principal para inicialización enhanced
- **Descripción:** Wrapper que ejecuta initializeEnhancedNew.ts
- **Uso:** Script de entrada para inicialización
- **Comando:** `npm run init:run`

### `initializeSettings.ts`

- **Estado:** ✅ ACTIVO (auxiliar)
- **Propósito:** Configuraciones específicas del sistema
- **Descripción:** Crea configuraciones generales y de seguridad
- **Uso:** Configuración inicial de parámetros del sistema
- **Comando:** `npm run init:settings`

## 📋 Datos que se crean:

### Empresas creadas:

1. **ERP Solutions SPA** (77.123.456-7)

   - Plan: Enterprise
   - Usuario: Super Administrador

2. **Demo Company SPA** (76.987.654-3)

   - Plan: Professional
   - Usuario: Admin Empresa

3. **Test Industries LTDA** (75.555.444-9)
   - Plan: Basic
   - Usuarios: Manager, Employee, Viewer

### Usuarios por defecto:

- `superadmin@erpsolutions.cl` - Super Admin (rol global)
- `admin@erpsolutions.cl` - Admin Empresa
- `manager@democompany.cl` - Manager
- `empleado@testindustries.cl` - Employee
- `viewer@democompany.cl` - Viewer

**Contraseña por defecto:** `Admin123!`

## 🔧 Orden de Ejecución:

1. **Base de datos limpia:** `utilities/cleanDatabase.ts`
2. **Configuraciones:** `initializeSettings.ts`
3. **Inicialización principal:** `initializeEnhancedNew.ts`
4. **Verificación:** `utilities/verifyDatabase.ts`

## 📝 Comandos NPM:

```bash
# Inicialización completa
npm run init:enhanced

# Solo configuraciones
npm run init:settings

# Ejecutor principal
npm run init:run

# Verificar después de init
npm run verify:db
```

## ⚠️ Consideraciones importantes:

- **Verificar base de datos limpia** antes de ejecutar
- **Confirmar variables de entorno** están configuradas
- **No ejecutar múltiples veces** sin limpiar primero
- **Verificar logs** para confirmar éxito

## 🎯 Uso recomendado:

### Para desarrollo nuevo:

```bash
npm run clean:db
npm run init:enhanced
npm run verify:db
```

### Para después de migración:

```bash
npm run init:settings  # Solo configuraciones
npm run verify:db
```

---

_Actualizado: 29 de octubre de 2025_
