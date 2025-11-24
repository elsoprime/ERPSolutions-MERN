# 🐛 Debug: Auto-cálculo de Permisos en UserFormInline

## Problema Reportado

Al seleccionar una **empresa** (ej: "Incoservice") y un **rol** (ej: "Administrador de Empresa") en el formulario `UserFormInline.tsx`, los permisos NO se auto-calculan y los checkboxes no muestran todas las opciones.

## Arquitectura Implementada

### Backend

1. **Service**: `backend/src/services/permissionService.ts`
   - Calcula permisos: `Permisos del Rol ∩ Permisos del Plan`
   - Función principal: `calculateUserPermissions(role, companyId)`

2. **Controller**: `backend/src/modules/userManagement/controllers/PermissionController.ts`
   - Endpoints REST para cálculo de permisos
   - `/api/v2/users/permissions/calculate` (GET con query params)
   - `/api/v2/users/permissions/available-modules/:id` (GET)
   - `/api/v2/users/permissions/validate` (POST)

3. **Routes**: `backend/src/modules/userManagement/routes/permissionRoutes.ts`
   - Rutas integradas en `userRoutes.ts` como subruta `/permissions`

### Frontend

1. **Hook**: `frontend-app/hooks/usePermissionCalculator.ts`
   - Llama a la API de cálculo de permisos
   - Retorna: `{ calculatePermissions, isLoading, error }`

2. **Componente**: `frontend-app/components/Modules/UserManagement/Forms/UserFormInline.tsx`
   - useEffect que dispara auto-cálculo cuando cambia `selectedCompany` o `selectedRole`
   - Muestra indicadores visuales (loading, success, restricted modules)

## Logs de Debugging Agregados

### En el useEffect (UserFormInline.tsx, línea ~298)

```typescript
console.log('🔍 useEffect disparado - Auto-calcular permisos:', {
    mode,
    selectedRole,
    selectedCompany,
    hasCalculatePermissions: !!calculatePermissions
})
```

### En el Hook (usePermissionCalculator.ts)

```typescript
console.log('🎯 usePermissionCalculator.calculatePermissions llamado:', {
    companyId,
    role,
    hasCompanyId: !!companyId,
    hasRole: !!role
})

console.log('📡 Enviando request a API:', {
    url: '/users/permissions/calculate',
    params: { companyId, role }
})

console.log('📥 Respuesta de API recibida:', {
    success: response.data.success,
    hasData: !!response.data.data,
    data: response.data.data
})
```

## Pasos para Debuggear

### 1. Verificar que el Backend está corriendo

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor escuchando en puerto 4000
✅ MongoDB conectado correctamente
```

### 2. Verificar que el Frontend está corriendo

```bash
cd frontend-app
npm run dev
```

Deberías ver:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### 3. Abrir el Formulario de Usuario

1. Navega a la sección de usuarios
2. Haz clic en "Crear Usuario"
3. **Abre la Consola del Navegador** (F12)

### 4. Seleccionar Empresa y Rol

1. Selecciona un **Rol** (ej: "Administrador de Empresa")
2. Selecciona una **Empresa** (ej: "Incoservice")
3. **Observa los console.logs** en la consola

## Qué Buscar en los Logs

### ✅ Flujo Correcto

```
🔍 useEffect disparado - Auto-calcular permisos: {
  mode: "create",
  selectedRole: "company_admin",
  selectedCompany: "673abc123...",
  hasCalculatePermissions: true
}

🚀 Iniciando auto-cálculo de permisos...

🎯 usePermissionCalculator.calculatePermissions llamado: {
  companyId: "673abc123...",
  role: "company_admin",
  hasCompanyId: true,
  hasRole: true
}

📡 Enviando request a API: {
  url: "/v2/users/permissions/calculate",
  params: { companyId: "673abc123...", role: "company_admin" }
}

📥 Respuesta de API recibida: {
  success: true,
  hasData: true,
  data: { permissions: [...], ... }
}

✅ Permisos auto-calculados en UserFormInline: {
  role: "company_admin",
  company: "673abc123...",
  permissions: 25,
  plan: "Professional",
  restrictedModules: 3
}
```

### ❌ Problemas Comunes

#### Problema 1: useEffect NO se dispara

```
// No hay logs de useEffect
```

**Causa**: Dependencias del useEffect incorrectas o estado no actualizado
**Solución**: Verificar que `selectedCompany` y `selectedRole` estén cambiando

#### Problema 2: useEffect se dispara pero NO cumple condiciones

```
🔍 useEffect disparado - Auto-calcular permisos: { ... }
⏭️ Modo no es "create", saltando auto-cálculo
```

**Causa**: El `mode` no es "create" o falta empresa/rol
**Solución**: Verificar que estés en modo creación y que ambos selectores tengan valor

#### Problema 3: API retorna error

```
📡 Enviando request a API: { ... }
❌ Error auto-calculando permisos: Error: Request failed with status code 404
```

**Causa**: Ruta de API incorrecta o backend no está corriendo
**Solución**: Verificar que backend esté corriendo en puerto 4000

#### Problema 4: API retorna success: false

```
📥 Respuesta de API recibida: {
  success: false,
  hasData: false,
  data: null
}
⚠️ calculatePermissions retornó null
```

**Causa**: Error en el backend (empresa no encontrada, plan no encontrado, etc.)
**Solución**: Verificar logs del backend

## Testing Manual

### Test 1: Auto-cálculo en Creación

1. **Objetivo**: Verificar que los permisos se calculan automáticamente
2. **Pasos**:
   - Modo: Create
   - Selecciona Rol: "Administrador de Empresa"
   - Selecciona Empresa: "Incoservice"
3. **Resultado Esperado**:
   - Aparece indicador "Calculando permisos automáticamente..."
   - Luego aparece "✅ X permisos asignados automáticamente"
   - Los checkboxes de permisos se marcan automáticamente
   - Los módulos restringidos muestran 🔒

### Test 2: Verificar Plan de Empresa

1. **Objetivo**: Asegurar que la empresa tiene un plan asignado
2. **Herramienta**: MongoDB Compass o mongosh
3. **Query**:
   ```javascript
   db.enhancedcompanies.findOne({ name: "Incoservice" })
   ```
4. **Verificar**:
   - Campo `plan` existe y tiene un ObjectId
   - El plan existe en la colección `plans`

### Test 3: Verificar Endpoint Backend

1. **Herramienta**: Postman, Thunder Client, o curl
2. **Request**:
   ```
   GET http://localhost:4000/api/v2/users/permissions/calculate?companyId=673abc123...&role=company_admin
   Authorization: Bearer YOUR_TOKEN
   ```
3. **Resultado Esperado**:
   ```json
   {
     "success": true,
     "data": {
       "permissions": ["users.view", "users.create", ...],
       "availableModules": ["inventoryManagement", ...],
       "restrictedModules": ["advancedAnalytics", ...],
       "planInfo": {
         "name": "Professional",
         "type": "monthly"
       },
       "metadata": { ... }
     }
   }
   ```

## Soluciones Rápidas

### Si el useEffect no se dispara

Verifica que las dependencias estén correctas:
```typescript
}, [selectedCompany, selectedRole, mode, calculatePermissions])
```

### Si la API retorna 404

Verifica que las rutas estén registradas correctamente:
- En `backend/src/routes/appRoutes.ts`: `router.use('/v2', userManagementRoutes)`
- En `backend/src/modules/userManagement/routes/index.ts`: `router.use('/users', userRoutes)`
- En `backend/src/modules/userManagement/routes/userRoutes.ts`: `router.use('/permissions', permissionRoutes)`

La ruta completa debe ser: `/api/v2/users/permissions/calculate`

### Si los permisos se calculan pero no se muestran

Verifica que `PermissionSelector` esté recibiendo los permisos:
```typescript
<PermissionSelector
  selectedPermissions={selectedPermissions}
  availablePermissions={getAvailablePermissions()}
  onPermissionChange={setSelectedPermissions}
  restrictedModules={restrictedModules}
  isGlobal={selectedRole === UserRole.SUPER_ADMIN}
/>
```

## Próximos Pasos

1. **Ejecutar ambos servidores** (backend y frontend)
2. **Abrir la consola del navegador**
3. **Seguir los pasos de testing manual**
4. **Reportar los logs obtenidos** para análisis

---

**Autor**: Esteban Soto Ojeda (@elsoprimeDev)
**Fecha**: 2024
**Versión**: 1.0.0
