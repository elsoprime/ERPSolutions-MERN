# 📋 Guía del Módulo de Gestión de Usuarios

## 🎯 Descripción General

El módulo de **Gestión de Usuarios** proporciona una interfaz completa para administrar usuarios en un sistema multi-empresa. Incluye dashboards estadísticos, tablas de gestión con filtros avanzados, y formularios para crear y editar usuarios.

## 🏗️ Arquitectura del Módulo

```
UserManagement/
├── Views/
│   ├── UserManagementPage.tsx       # Página principal con navegación
│   ├── UserOverviewDashboard.tsx     # Dashboard para Super Admin
│   └── UsersAdminDashboard.tsx       # Dashboard para Admin Empresa
├── UI/
│   └── UserTable.tsx                 # Tabla de usuarios con filtros
├── Forms/
│   └── UserForms.tsx                 # Formularios de usuario y roles
└── index.ts                          # Exportaciones del módulo
```

## 📦 Componentes Principales

### 1. UserManagementPage

**Descripción**: Página principal que orquesta el módulo completo

**Features**:

- ✅ Navegación entre Dashboard y Lista de Usuarios
- ✅ Control de acceso basado en roles
- ✅ Vista adaptativa para Super Admin y Admin Empresa
- ✅ Navegación móvil responsive

**Uso**:

```tsx
import {UserManagementPage} from '@/components/Modules/UserManagement'

export default function UsersPage() {
  return <UserManagementPage />
}
```

---

### 2. UserOverviewDashboard

**Descripción**: Dashboard estadístico para Super Admin con métricas globales

**Features**:

- 📊 **Estadísticas principales**:
  - Total de usuarios
  - Usuarios activos/inactivos/suspendidos
  - Crecimiento mensual con porcentaje dinámico
- 📈 **Gráficos y distribuciones**:

  - Distribución por roles (Super Admin, Admin Empresa, Manager, etc.)
  - Distribución por empresa
  - Actividad reciente de usuarios

- 🔄 **Estados de carga**:
  - LoadingSpinner integrado
  - Manejo de errores con opción de reintentar
  - Datos mock mientras se implementa el backend

**Uso**:

```tsx
import {UserOverviewDashboard} from '@/components/Modules/UserManagement'

;<UserOverviewDashboard />
```

---

### 3. UserTable

**Descripción**: Tabla completa de gestión de usuarios con filtros y acciones

**Props**:

```typescript
interface UserTableProps {
  companyScope?: boolean // true = Solo usuarios de la empresa
  showActions?: boolean // Mostrar botones de acción
  maxHeight?: string // Altura máxima de la tabla
  onUserSelect?: (user: IEnhancedUser) => void
}
```

**Features**:

- 🔍 **Filtros avanzados**:

  - Búsqueda por nombre/email
  - Filtro por rol
  - Filtro por estado
  - Botones para limpiar y actualizar

- 📊 **Visualización**:

  - Badges de rol (simple o múltiple)
  - Badges de estado con colores
  - Avatar generado automáticamente
  - Empresas asignadas (para Super Admin)

- ⚙️ **Acciones**:

  - Editar usuario
  - Asignar roles
  - Activar/Desactivar usuario
  - Eliminar usuario

- 📄 **Paginación**:
  - Navegación entre páginas
  - Selector de items por página
  - Contador de resultados

**Uso**:

```tsx
import {UserTable} from '@/components/Modules/UserManagement'

// Para Super Admin (vista global)
<UserTable
  companyScope={false}
  showActions={true}
  maxHeight="max-h-screen"
/>

// Para Admin Empresa (vista de empresa)
<UserTable
  companyScope={true}
  showActions={true}
  maxHeight="max-h-96"
/>
```

---

### 4. UsersAdminDashboard

**Descripción**: Dashboard para Admin de Empresa (heredado, puede ser reemplazado)

**Features**:

- 📊 Estadísticas de la empresa
- 🚀 Acciones rápidas
- 📈 Estado de salud de la empresa
- 👥 Actividad reciente

---

## 🎨 Diseño y UX

### Colores por Rol

```typescript
const roleColors = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin_empresa: 'bg-blue-100 text-blue-800',
  manager: 'bg-green-100 text-green-800',
  employee: 'bg-gray-100 text-gray-800',
  viewer: 'bg-yellow-100 text-yellow-800'
}
```

### Estados de Usuario

- 🟢 **Activo**: Usuario puede acceder al sistema
- 🟡 **Inactivo**: Usuario temporalmente deshabilitado
- 🔴 **Suspendido**: Usuario bloqueado

### Iconos Principales

- 👥 `UsersIcon` - Usuarios totales
- ✅ `CheckCircleIcon` - Usuarios activos
- ⏰ `ClockIcon` - Usuarios inactivos
- ⚠️ `ExclamationTriangleIcon` - Usuarios suspendidos
- 🏢 `BuildingOfficeIcon` - Empresas
- 📊 `ChartBarIcon` - Estadísticas

---

## 🔌 Integración con Hooks

### useUserManagement

```tsx
import {
  useUsers,
  useUserActions,
  useUserFilters
} from '@/hooks/useUserManagement'

const {users, pagination, isLoading, refetch} = useUsers(filters, companyScope)
const {handleUpdateUser, handleDeleteUser, handleToggleUserStatus} =
  useUserActions()
const {filters, updateFilter, clearFilters, setPage} = useUserFilters()
```

---

## 🚀 Características Dinámicas

### 1. Cálculo de Crecimiento Mensual

```typescript
const calculateGrowthPercentage = (): string => {
  if (!stats.monthlyGrowth || stats.totalUsers === 0) return '0.0'

  const {newUsers} = stats.monthlyGrowth
  const previousTotal = stats.totalUsers - newUsers

  if (previousTotal === 0) {
    return newUsers > 0 ? '100.0' : '0.0'
  }

  const growthPercentage = (newUsers / previousTotal) * 100
  return growthPercentage.toFixed(1)
}
```

### 2. Manejo de Roles Múltiples

```tsx
{
  hasMultipleRoles ? (
    <MultiRoleBadge roles={getAllRoles()} size='sm' maxVisible={2} />
  ) : (
    <RoleBadge role={mainRole} size='sm' />
  )
}
```

---

## 📱 Responsive Design

- **Desktop**: Navegación horizontal con tabs
- **Tablet**: Grid adaptativo de 2 columnas
- **Mobile**: Navegación inferior fija, cards apiladas

---

## 🔐 Control de Acceso

```typescript
// Verificar si el usuario tiene acceso
const hasUserManagementAccess = isSuperAdmin || isCompanyAdmin

// Vista según el rol
{
  isSuperAdmin && <UserOverviewDashboard />
}
{
  isCompanyAdmin && <CompanyAdminDashboard />
}
```

---

## 📊 Estados de Datos

### Loading

```tsx
if (loading) {
  return <LoadingSpinner text='Cargando estadísticas...' fullScreen={false} />
}
```

### Error

```tsx
if (error) {
  return (
    <div className='text-center py-12'>
      <ExclamationTriangleIcon className='mx-auto h-12 w-12 text-red-400' />
      <h3>Error de carga</h3>
      <button onClick={loadDashboardData}>Reintentar</button>
    </div>
  )
}
```

### Empty State

```tsx
{
  users.length === 0 && (
    <div className='text-center py-12'>
      <UsersIcon className='mx-auto h-12 w-12 text-gray-400' />
      <h3>No hay usuarios</h3>
      <p>Comienza creando tu primer usuario.</p>
    </div>
  )
}
```

---

## 🎯 Próximos Pasos (TODO)

### Backend Integration

- [ ] Implementar endpoint `UserAPI.getUsersSummary()`
- [ ] Conectar datos reales de usuarios
- [ ] Implementar filtros en el backend
- [ ] Agregar paginación del lado del servidor

### Features Adicionales

- [ ] Exportar usuarios a CSV/Excel
- [ ] Importar usuarios masivamente
- [ ] Historial de actividad detallado
- [ ] Notificaciones por email
- [ ] Gestión de permisos granular
- [ ] Auditoría de cambios

### Mejoras UI/UX

- [ ] Drag & drop para asignar roles
- [ ] Vista de calendario para actividad
- [ ] Gráficos interactivos con Chart.js
- [ ] Filtros avanzados con date range
- [ ] Búsqueda en tiempo real con debounce

---

## 📝 Ejemplo Completo

```tsx
// pages/dashboard/users/page.tsx
'use client'

import {UserManagementPage} from '@/components/Modules/UserManagement'
import DashboardHeader from '@/components/Layout/DashboardHeader'

export default function UsersPage() {
  return (
    <>
      <DashboardHeader
        title='Gestión de Usuarios'
        subtitle='Administra usuarios y roles del sistema'
        description='Control completo sobre usuarios, permisos y accesos'
      />

      <UserManagementPage />
    </>
  )
}
```

---

## 🤝 Contribución

Para agregar nuevas features:

1. Crear el componente en la carpeta correspondiente (Views/UI/Forms)
2. Exportarlo en `index.ts`
3. Documentar en esta guía
4. Agregar tests si es posible

---

## 📞 Soporte

**Autor**: Esteban Soto Ojeda @elsoprimeDev  
**Última Actualización**: 1 de noviembre de 2025

---

## 🎉 ¡Módulo Completo y Funcional!

El módulo de **Gestión de Usuarios** está listo para ser usado y extendido según las necesidades del proyecto.
