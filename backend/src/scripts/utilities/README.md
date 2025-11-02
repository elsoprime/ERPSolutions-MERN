# Scripts de Utilidades

🛠️ **Herramientas para mantenimiento, testing y verificación del sistema**

## Archivos disponibles:

### Verificación y Diagnóstico

#### `verifyDatabase.ts`

- **Estado:** ✅ ACTIVO
- **Propósito:** Verificar integridad de base de datos con EnhancedUser
- **Funciones:** Estadísticas, validación de datos, detección de problemas
- **Comando:** `npm run verify:db`
- **Uso:** Después de migraciones o cambios importantes

#### `verifyEnhancedDatabase.ts`

- **Estado:** ✅ ACTIVO (específico Enhanced)
- **Propósito:** Verificación específica para modelo EnhancedCompany
- **Funciones:** Validación de empresas, estadísticas avanzadas
- **Comando:** `npm run verify:enhanced`
- **Uso:** Verificación específica de datos enhanced

### Mantenimiento

#### `cleanDatabase.ts`

- **Estado:** ✅ ACTIVO
- **Propósito:** Limpiar completamente la base de datos
- **Funciones:** Eliminar todos los datos, preparar para reinicialización
- **Comando:** `npm run clean:db`
- **⚠️ PELIGROSO:** Elimina TODOS los datos

#### `fixIndexes.ts`

- **Estado:** ✅ ACTIVO
- **Propósito:** Reparar índices duplicados o problemáticos
- **Funciones:** Eliminar y recrear índices de MongoDB
- **Comando:** `npm run fix:indexes`
- **Uso:** Cuando hay problemas de índices en MongoDB

### Testing y Desarrollo

#### `quickTest.ts`

- **Estado:** ✅ ACTIVO
- **Propósito:** Test rápido de middleware JWT y autenticación
- **Funciones:** Verificar endpoints, tiempos de respuesta, JWT
- **Comando:** `npm run test:quick`
- **Uso:** Verificación rápida durante desarrollo

#### `registerTestingRoutes.ts`

- **Estado:** ✅ ACTIVO (solo desarrollo)
- **Propósito:** Registrar rutas de testing automáticamente
- **Funciones:** Activar/desactivar rutas de testing
- **Uso:** Testing de autenticación y JWT
- **Nota:** Solo en ambiente de desarrollo

## 📋 Comandos NPM sugeridos:

```bash
# Verificación
npm run verify:db          # Verificar base de datos
npm run verify:enhanced    # Verificar modelo enhanced

# Mantenimiento
npm run clean:db           # Limpiar base de datos
npm run fix:indexes        # Reparar índices

# Testing
npm run test:quick         # Test rápido de sistema
```

## 🔧 Flujo de trabajo típico:

### Para desarrollo diario:

1. `npm run test:quick` - Verificar que todo funciona
2. `npm run verify:db` - Si hay dudas sobre datos

### Para mantenimiento:

1. `npm run fix:indexes` - Si hay problemas de rendimiento
2. `npm run verify:enhanced` - Verificar después de cambios

### Para reset completo:

1. `npm run clean:db` - Limpiar todo
2. `npm run init:enhanced` - Reinicializar
3. `npm run verify:db` - Confirmar estado

## ⚠️ Precauciones por script:

### `cleanDatabase.ts`

- **ELIMINA TODOS LOS DATOS**
- Solo usar en desarrollo
- Crear backup antes si necesitas los datos

### `fixIndexes.ts`

- Puede tardar en bases de datos grandes
- Verificar logs de MongoDB después

### `quickTest.ts`

- Requiere servidor ejecutándose
- Usa endpoints de testing (solo desarrollo)

### `registerTestingRoutes.ts`

- Solo activar en desarrollo
- **NUNCA** en producción

## 📊 Monitoreo de estado:

| Script                    | Frecuencia de uso    | Criticidad | Ambiente |
| ------------------------- | -------------------- | ---------- | -------- |
| verifyDatabase.ts         | Semanal              | Alta       | Todos    |
| verifyEnhancedDatabase.ts | Después de cambios   | Media      | Todos    |
| cleanDatabase.ts          | Cuando sea necesario | Muy Alta   | Solo Dev |
| fixIndexes.ts             | Mensual              | Media      | Todos    |
| quickTest.ts              | Diario               | Baja       | Solo Dev |
| registerTestingRoutes.ts  | Setup                | Baja       | Solo Dev |

---

_Actualizado: 29 de octubre de 2025_
