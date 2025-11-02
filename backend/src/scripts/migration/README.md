# Scripts de Migración

🔄 **Scripts para migración entre versiones de modelos de datos**

## Archivos disponibles:

### `migrateToEnhancedUser.ts`

- **Estado:** ✅ ACTIVO (para migración)
- **Propósito:** Migrar datos de User.ts legacy a EnhancedUser.ts
- **Uso:** Solo durante migración de sistemas legacy
- **Comando:** `npm run migrate:enhanced-user`

### `migrateToEnhancedCompany.ts`

- **Estado:** ✅ ACTIVO (para migración)
- **Propósito:** Migrar empresas a modelo EnhancedCompany
- **Uso:** Migración de datos de empresa
- **Comando:** `npm run migrate:enhanced-company`

### `migrateUsers.ts`

- **Estado:** ⚠️ LEGACY (mantener para referencia)
- **Propósito:** Migración de roles en modelo User legacy
- **Uso:** Solo para sistemas que aún usan User.ts
- **Nota:** Usar solo si no se ha migrado a EnhancedUser

## 📋 Instrucciones de Uso

### Orden de Migración Recomendado:

1. `migrateToEnhancedCompany.ts` - Migrar empresas primero
2. `migrateToEnhancedUser.ts` - Migrar usuarios después
3. `migrateUsers.ts` - Solo si es necesario para datos legacy

### Antes de ejecutar:

- ✅ Crear backup completo de la base de datos
- ✅ Verificar que el entorno es de desarrollo/testing
- ✅ Revisar logs de migración anterior si existe
- ✅ Confirmar que tienes permisos de administrador

### Después de ejecutar:

- ✅ Verificar datos migrados con `utilities/verifyDatabase.ts`
- ✅ Probar funcionalidad crítica
- ✅ Guardar logs de migración para auditoría

## 🚨 Precauciones

- **NUNCA** ejecutar en producción sin backup
- **SIEMPRE** probar en ambiente de desarrollo primero
- **VERIFICAR** integridad de datos después de migración
- **DOCUMENTAR** cualquier issue encontrado

## 🔄 Estado de Scripts

| Script                      | Función         | Estado     | Requerido   |
| --------------------------- | --------------- | ---------- | ----------- |
| migrateToEnhancedUser.ts    | Migrar usuarios | ✅ Estable | Sí          |
| migrateToEnhancedCompany.ts | Migrar empresas | ✅ Estable | Sí          |
| migrateUsers.ts             | Roles legacy    | ⚠️ Legacy  | Condicional |

---

_Actualizado: 29 de octubre de 2025_
