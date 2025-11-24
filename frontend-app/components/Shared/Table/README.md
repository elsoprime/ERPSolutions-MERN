# Table Components

Componentes reutilizables para tablas con controles, filtros y estados.

## 📦 Componentes Disponibles

### `TableControlsHeader`
Header completo con controles, búsqueda, filtros y acciones para tablas.

### `TableEmptyState`
Estado vacío cuando no hay datos.

### `TableLoadingState`
Skeleton loader animado para estado de carga.

### `TableErrorState`
Estado de error con opción de reintentar.

---

## 🚀 Instalación

```typescript
import {
  TableControlsHeader,
  TableEmptyState,
  TableLoadingState,
  TableErrorState,
  type TableControlsHeaderProps,
  type TableAction,
  type TableFilter
} from '@/components/Shared/Table';
```

---

## 📖 Ejemplos de Uso

### Ejemplo 1: CompanyTable

```tsx
<TableControlsHeader
  title="Listado de Empresas"
  totalCount={totalCount}
  pageSize={pageSize}
  selectedCount={selectedCompanies.length}
  loading={loading}
  
  onPageSizeChange={handlePageSizeChange}
  
  searchPlaceholder="Buscar por nombre, slug, industria..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  
  showFilters={showFilters}
  onToggleFilters={() => setShowFilters(!showFilters)}
  filters={[
    {
      key: 'plan',
      label: 'Plan',
      type: 'select',
      value: filters.plan || '',
      onChange: (v) => handleFilterChange('plan', v),
      options: [
        { value: '', label: 'Todos los planes' },
        { value: 'free', label: 'Free' },
        { value: 'basic', label: 'Basic' },
        { value: 'professional', label: 'Professional' },
        { value: 'enterprise', label: 'Enterprise' },
      ]
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      value: filters.status || '',
      onChange: (v) => handleFilterChange('status', v),
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'active', label: 'Activas' },
        { value: 'inactive', label: 'Inactivas' },
        { value: 'suspended', label: 'Suspendidas' },
      ]
    },
    {
      key: 'industry',
      label: 'Industria',
      type: 'select',
      value: filters.industry || '',
      onChange: (v) => handleFilterChange('industry', v),
      options: industryOptions
    }
  ]}
  onClearFilters={clearFilters}
  filterGridCols={3}
  
  primaryAction={{
    label: 'Nueva Empresa',
    icon: PlusIcon,
    onClick: onCreateCompany
  }}
  
  bulkActions={[
    {
      label: 'Suspender',
      icon: PauseIcon,
      onClick: handleBulkSuspend,
      variant: 'warning',
      showOnSelection: true
    },
    {
      label: 'Reactivar',
      icon: PlayIcon,
      onClick: handleBulkReactivate,
      variant: 'success',
      showOnSelection: true
    }
  ]}
  
  secondaryActions={[
    {
      label: selectedCompanies.length > 0 
        ? `Exportar (${selectedCompanies.length})` 
        : 'Exportar',
      icon: ArrowDownTrayIcon,
      onClick: handleExport,
      variant: selectedCompanies.length > 0 ? 'info' : 'secondary'
    }
  ]}
/>
```

### Ejemplo 2: UserTable

```tsx
<TableControlsHeader
  title="Gestión de Usuarios"
  subtitle={companyScope ? "Usuarios de la empresa" : "Todos los usuarios del sistema"}
  totalCount={totalCount}
  pageSize={pageSize}
  selectedCount={selectedUsers.length}
  loading={loading}
  
  onPageSizeChange={handlePageSizeChange}
  
  searchPlaceholder="Buscar por nombre, email..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  
  showFilters={showFilters}
  onToggleFilters={() => setShowFilters(!showFilters)}
  filters={[
    {
      key: 'company',
      label: 'Empresa',
      type: 'select',
      value: filters.companyId || '',
      onChange: (v) => handleFilterChange('companyId', v),
      options: companyOptions,
      hidden: companyScope // Ocultar en scope de empresa
    },
    {
      key: 'role',
      label: 'Rol',
      type: 'select',
      value: filters.role || '',
      onChange: (v) => handleFilterChange('role', v),
      options: roleOptions
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      value: filters.status || '',
      onChange: (v) => handleFilterChange('status', v),
      options: statusOptions
    }
  ]}
  onClearFilters={clearFilters}
  filterGridCols={companyScope ? 2 : 3}
  
  primaryAction={{
    label: companyScope ? 'Invitar Usuario' : 'Crear Usuario',
    icon: PlusIcon,
    onClick: handleCreateUser
  }}
  
  bulkActions={[
    {
      label: 'Activar',
      icon: PlayIcon,
      onClick: handleBulkActivate,
      variant: 'success',
      showOnSelection: true,
      hidden: isFilteringInactive
    },
    {
      label: 'Desactivar',
      icon: PauseIcon,
      onClick: handleBulkDeactivate,
      variant: 'warning',
      showOnSelection: true,
      hidden: isFilteringInactive
    },
    {
      label: 'Eliminar',
      icon: TrashIcon,
      onClick: handleBulkDelete,
      variant: 'danger',
      showOnSelection: true,
      hidden: isFilteringInactive
    }
  ]}
  
  banner={isFilteringInactive ? {
    type: 'warning',
    title: 'Modo Solo Lectura',
    message: 'Mostrando usuarios inactivos. La selección múltiple está deshabilitada.',
    dismissible: true,
    onDismiss: () => setIsFilteringInactive(false)
  } : undefined}
/>
```

### Ejemplo 3: Estados de Tabla

```tsx
{loading && <TableLoadingState rows={5} columns={6} />}

{error && (
  <TableErrorState
    title="Error al cargar empresas"
    message={error}
    onRetry={loadCompanies}
  />
)}

{!loading && !error && companies.length === 0 && (
  <TableEmptyState
    title="No hay empresas registradas"
    message="Comienza creando tu primera empresa."
    action={{
      label: 'Crear Primera Empresa',
      onClick: onCreateCompany
    }}
  />
)}
```

---

## 📋 Props API

### TableControlsHeaderProps

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | - | **Requerido**. Título principal |
| `subtitle` | `string` | - | Subtítulo opcional |
| `totalCount` | `number` | - | **Requerido**. Total de registros |
| `pageSize` | `number` | - | **Requerido**. Tamaño de página actual |
| `selectedCount` | `number` | `0` | Cantidad de elementos seleccionados |
| `loading` | `boolean` | `false` | Estado de carga |
| `onPageSizeChange` | `(size: number) => void` | - | **Requerido**. Callback al cambiar tamaño |
| `pageSizeOptions` | `number[]` | `[5, 10, 15, 25, 50]` | Opciones disponibles |
| `searchPlaceholder` | `string` | `'Buscar...'` | Placeholder de búsqueda |
| `searchValue` | `string` | - | **Requerido**. Valor de búsqueda |
| `onSearchChange` | `(value: string) => void` | - | **Requerido**. Callback de búsqueda |
| `hideSearch` | `boolean` | `false` | Ocultar barra de búsqueda |
| `showFilters` | `boolean` | `false` | Estado del panel de filtros |
| `onToggleFilters` | `() => void` | - | Callback toggle filtros |
| `filters` | `TableFilter[]` | `[]` | Array de filtros |
| `onClearFilters` | `() => void` | - | Callback limpiar filtros |
| `filterGridCols` | `2 \| 3 \| 4` | `3` | Columnas del grid de filtros |
| `primaryAction` | `TableAction` | - | Acción principal |
| `bulkActions` | `TableAction[]` | `[]` | Acciones masivas |
| `secondaryActions` | `TableAction[]` | `[]` | Acciones secundarias |
| `banner` | `BannerConfig` | - | Banner informativo |
| `className` | `string` | `''` | Clases CSS adicionales |
| `compact` | `boolean` | `false` | Modo compacto |
| `hideCount` | `boolean` | `false` | Ocultar contador |
| `hidePageSize` | `boolean` | `false` | Ocultar selector de tamaño |

### TableAction

```typescript
interface TableAction {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  showOnSelection?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  title?: string;
  showCount?: boolean;
}
```

### TableFilter

```typescript
interface TableFilter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'checkbox';
  value: string | string[];
  onChange: (value: string) => void;
  options?: FilterOption[];
  placeholder?: string;
  hidden?: boolean;
  disabled?: boolean;
  colSpan?: 1 | 2 | 3 | 4;
}
```

---

## 🎨 Variantes de Acción

- `primary`: Azul (acción principal)
- `secondary`: Gris (acción secundaria)
- `success`: Verde (activar, aprobar)
- `warning`: Amarillo (suspender, advertencia)
- `danger`: Rojo (eliminar, cancelar)
- `info`: Azul claro (exportar, información)

---

## 📱 Responsive

El componente es completamente responsive con breakpoints:
- **Mobile**: Vista vertical, botones full-width
- **Tablet** (sm): Layout semi-horizontal
- **Desktop** (lg): Layout horizontal completo

---

## ♿ Accesibilidad

- ✅ Labels semánticos en todos los inputs
- ✅ ARIA labels en botones
- ✅ Estados disabled manejados
- ✅ Navegación por teclado
- ✅ Contraste de colores WCAG AA

---

## 🔧 Customización

### Modo Compacto
```tsx
<TableControlsHeader compact={true} {...props} />
```

### Sin Búsqueda
```tsx
<TableControlsHeader hideSearch={true} {...props} />
```

### Sin Selector de Página
```tsx
<TableControlsHeader hidePageSize={true} {...props} />
```

### Grid de Filtros Personalizado
```tsx
<TableControlsHeader filterGridCols={4} {...props} />
```

---

## 📝 Notas

- El componente maneja automáticamente la visibilidad de acciones según `showOnSelection` y `hidden`
- Los filtros con `hidden: true` no se renderizan
- El banner se puede cerrar si `dismissible: true`
- Las acciones masivas solo aparecen cuando `selectedCount > 0`

---

## 🐛 Troubleshooting

**Problema**: Los filtros no aparecen
- **Solución**: Asegúrate de que `onToggleFilters` esté definido y `filters.length > 0`

**Problema**: Las acciones no responden
- **Solución**: Verifica que los callbacks `onClick` estén correctamente vinculados

**Problema**: El grid de filtros se ve mal
- **Solución**: Ajusta `filterGridCols` según el número de filtros (2, 3 o 4)
