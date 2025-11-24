# 📦 Archivos Deprecated

**Fecha de migración:** 16 de noviembre de 2025

Esta carpeta contiene archivos que han sido identificados como **no utilizados** en el proyecto actual. No se eliminaron directamente para mantener un historial y poder recuperarlos si es necesario.

## 📋 Contenido

### Hooks
- **useAdvancedForm.ts** - Hook para formularios avanzados (solo usado en componentes de ejemplo)
- **useConfirmAccount.ts** - Hook para confirmación de cuenta (sin referencias)
- **useValidateToken.ts** - Hook para validación de tokens (sin referencias)

### Utils
- **testLogout.ts** - Archivo de pruebas de logout (desarrollo)
- **testTokenDecoding.ts** - Archivo de pruebas de decodificación de tokens (desarrollo)
- **tokenRefreshTesting.ts** - Archivo de pruebas de refresh de tokens (desarrollo)

### Interfaces
- **FormTypes.ts** - Sistema de tipos avanzado para formularios (solo usado por useAdvancedForm)

### Components

#### Examples/
Componentes de ejemplo que no están siendo utilizados en el proyecto:
- **AdvancedFormExample.tsx** - Ejemplo de uso del hook useAdvancedForm
- **EnhancedCompanyFormExample.tsx** - Ejemplo de formulario de empresa
- **FormStepperExample.tsx** - Ejemplo de formulario paso a paso

#### Testing/
Componentes de testing que no están en uso:
- **DashboardTest.tsx** - Componente de prueba del dashboard

#### Backups/
- **UserForms.backup.tsx** - Archivo de respaldo del formulario de usuarios

## ⚠️ Importante

Estos archivos pueden ser **eliminados permanentemente** después de:
1. Confirmar que no se necesitan en el futuro cercano
2. Realizar un commit del estado actual como backup
3. Esperar al menos 1-2 sprints para asegurar que no se necesitan

## 🔄 Recuperación

Si necesitas recuperar algún archivo:
```bash
# Desde la raíz del frontend
mv deprecated/[carpeta]/[archivo] [carpeta_destino]/
```

## 📊 Estadísticas de Limpieza

- **Hooks eliminados:** 3 archivos
- **Utils eliminados:** 3 archivos
- **Interfaces eliminadas:** 1 archivo
- **Componentes eliminados:** 5 archivos (2 carpetas)
- **Total:** ~12 archivos movidos a deprecated

---

**Análisis realizado por:** GitHub Copilot  
**Método:** Búsqueda de referencias en todo el proyecto con grep y análisis de dependencias
