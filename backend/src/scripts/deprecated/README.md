# Scripts Deprecados / Legacy

⚠️ **IMPORTANTE: Estos scripts están DEPRECADOS y no deben usarse en desarrollo nuevo**

## Archivos en este directorio:

### `initializeNew.ts` y `initializeNew.ts.backup`

- **Estado:** ❌ DEPRECADO
- **Reemplazo:** `initialization/initializeEnhancedNew.ts`
- **Descripción:** Scripts de inicialización del modelo User.ts legacy
- **Motivo de deprecación:** Migrado a EnhancedUser con arquitectura multi-empresa

### `initializeEnhanced.ts`

- **Estado:** ❌ DEPRECADO
- **Reemplazo:** `initialization/initializeEnhancedNew.ts`
- **Descripción:** Primera versión del script enhanced, incompleta
- **Motivo de deprecación:** Reemplazado por versión mejorada y completa

### `runInitialization.ts`

- **Estado:** ❌ DEPRECADO
- **Reemplazo:** `initialization/runEnhancedInitialization.ts`
- **Descripción:** Ejecutor de scripts legacy
- **Motivo de deprecación:** Funcionalidad integrada en nuevo sistema

## ⚠️ Política de Uso

- **NO** importar estos archivos en código nuevo
- **NO** ejecutar estos scripts en entornos de desarrollo
- Mantener solo por historial y referencia
- Si necesitas funcionalidad similar, usar los reemplazos indicados

## 🗑️ Eliminar cuando sea seguro

Estos archivos pueden eliminarse cuando:

1. Se confirme que no hay dependencias residuales
2. Se complete el testing de los nuevos scripts
3. El equipo confirme que no se necesita rollback

---

_Actualizado: 29 de octubre de 2025_
