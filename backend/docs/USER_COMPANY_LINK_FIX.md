# Corrección de Vinculación Usuario-Empresa

## 📋 Problema Identificado

El script de inicialización `initializeEnhancedNew.ts` creaba correctamente usuarios y empresas, pero **no actualizaba las estadísticas** de las empresas después de crear los usuarios. Esto causaba que:

- ✅ Los usuarios se creaban con `primaryCompanyId` correcto
- ✅ Los roles de los usuarios incluían `companyId`
- ❌ Las empresas mostraban `stats.totalUsers: 0`
- ❌ Las validaciones de límite de usuarios no funcionaban correctamente

## 🔧 Cambios Realizados

### 1. Script de Inicialización Mejorado

**Archivo:** `backend/src/scripts/initialization/initializeEnhancedNew.ts`

**Cambio:** Se agregó actualización automática de estadísticas después de crear todos los usuarios.

```typescript
// ✅ Actualizar estadísticas de todas las empresas
logProcess('Actualizando estadísticas de empresas...')
for (const [rut, companyId] of companyMap.entries()) {
  try {
    const company = await EnhancedCompany.findById(companyId)
    if (company) {
      await company.updateStats()
      logInfo(
        `Estadísticas actualizadas para ${rut}: ${company.stats.totalUsers} usuarios`
      )
    }
  } catch (error) {
    logError(`Error actualizando estadísticas para empresa ${rut}: ${error}`)
  }
}
```

### 2. Script de Verificación

**Archivo:** `backend/src/scripts/verification/verifyUserCompanyLinks.ts`

Nuevo script que permite:

- ✅ Verificar vínculos entre usuarios y empresas
- ✅ Detectar inconsistencias en las estadísticas
- ✅ Identificar usuarios sin empresa o con empresa inválida
- ✅ Reparar automáticamente las estadísticas

**Funciones principales:**

- `verifyUserCompanyLinks()` - Verifica todos los vínculos
- `repairCompanyStats()` - Repara estadísticas inconsistentes
- `showDetailedSummary()` - Muestra resumen detallado

### 3. Script Ejecutable

**Archivo:** `backend/src/scripts/runVerification.ts`

Script para ejecutar la verificación desde línea de comandos.

### 4. Scripts NPM Agregados

**Archivo:** `backend/package.json`

```json
{
  "verify:links": "Verificar vínculos sin reparar",
  "verify:links:repair": "Verificar y reparar vínculos automáticamente"
}
```

## 📖 Uso

### Verificar vínculos (solo lectura)

```bash
npm run verify:links
```

Esto mostrará:

- Lista de empresas con usuarios vinculados
- Inconsistencias en las estadísticas
- Usuarios sin empresa o con empresa inválida
- Resumen detallado

### Verificar y reparar

```bash
npm run verify:links:repair
```

Esto hará lo mismo que el anterior, pero además:

- Actualizará automáticamente las estadísticas de todas las empresas
- Corregirá cualquier inconsistencia encontrada

### Inicialización limpia

```bash
npm run clean:db
npm run init:enhanced
```

Ahora el script de inicialización ya actualiza automáticamente las estadísticas.

## 🔍 Verificación del Modelo

El método `updateStats()` en `EnhancedCompany` ahora cuenta correctamente los usuarios activos:

```typescript
EnhancedCompanySchema.methods.updateStats = async function (): Promise<void> {
  const EnhancedUser = mongoose.model('EnhancedUser')

  const userCount = await EnhancedUser.countDocuments({
    primaryCompanyId: this._id,
    status: 'active' // ✅ Solo usuarios activos
  })

  this.stats.totalUsers = userCount
  this.stats.lastActivity = new Date()

  await this.save()
}
```

## 📊 Ejemplo de Salida

```
🔍 Verificando vínculos Usuario-Empresa...
============================================================
✅ Total de empresas encontradas: 3

📦 Empresa: ERP Solutions SPA (77.123.456-7)
   - Usuarios activos vinculados: 2
   - Estadística actual: 2 usuarios
   - Lista de usuarios:
     • Admin ERP Solutions (admin@erpsolutions.cl) - ✅ Rol activo
     • Test Manager (testmanager@erpsolutions.cl) - ✅ Rol activo

📦 Empresa: Demo Company SPA (76.987.654-3)
   - Usuarios activos vinculados: 3
   - Estadística actual: 3 usuarios
   - Lista de usuarios:
     • Manager Demo (manager@democompany.cl) - ✅ Rol activo
     • Viewer Demo (viewer@democompany.cl) - ✅ Rol activo
     • Demo Admin (demoadmin@democompany.cl) - ✅ Rol activo
```

## ✅ Beneficios

1. **Datos consistentes**: Las estadísticas ahora reflejan la realidad
2. **Validaciones funcionales**: Los límites de usuarios funcionan correctamente
3. **Trazabilidad**: Fácil verificar el estado de los vínculos
4. **Reparación automática**: No es necesario hacerlo manualmente
5. **Mantenimiento**: Script reutilizable para futuras verificaciones

## 🚀 Próximos Pasos Recomendados

1. Ejecutar `npm run verify:links:repair` para corregir la base de datos actual
2. Probar la creación de nuevos usuarios para verificar que las estadísticas se actualicen
3. Considerar agregar este script a un proceso de mantenimiento programado

## 📝 Notas Técnicas

- El método `updateStats()` solo cuenta usuarios con `status: 'active'`
- Los usuarios suspendidos o inactivos NO se cuentan en las estadísticas
- Los usuarios con rol global (super_admin) pueden tener `primaryCompanyId: null`
- Cada empresa tiene límites configurables según su plan de suscripción

---

**Autor:** Esteban Soto Ojeda (@elsoprimeDev)
**Fecha:** 2 de noviembre de 2025
**Versión:** 1.0.0
