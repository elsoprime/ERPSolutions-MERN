# 🎯 Guía de Integración - Módulo de Gestión de Usuarios

## ✅ Estado de Integración: COMPLETADO

**Fecha de integración:** 1 de noviembre de 2025  
**Autor:** Esteban Soto Ojeda @elsoprimeDev

---

## 📋 Resumen de Verificación

### ✅ Componentes Verificados y Existentes

| Componente                 | Estado    | Ubicación                                  |
| -------------------------- | --------- | ------------------------------------------ |
| **MultiCompanyBadges**     | ✅ Existe | `components/UI/MultiCompanyBadges.tsx`     |
| **Permissions Utils**      | ✅ Existe | `utils/permissions.ts`                     |
| **SuperAdminDashboard**    | ✅ Existe | `components/Modules/SuperAdmin/`           |
| **CompanyAdminDashboard**  | ✅ Existe | `components/Modules/SuperAdmin/`           |
| **UserManagementPage**     | ✅ Existe | `components/Modules/UserManagement/Views/` |
| **UserTable**              | ✅ Existe | `components/Modules/UserManagement/`       |
| **UserForms**              | ✅ Existe | `components/Modules/UserManagement/`       |
| **useUserManagement Hook** | ✅ Existe | `hooks/useUserManagement.ts`               |
| **MultiCompanyAPI**        | ✅ Existe | `api/MultiCompanyAPI.ts`                   |

### ✅ Rutas Configuradas

| Ruta               | Propósito                                       | Acceso                      |
| ------------------ | ----------------------------------------------- | --------------------------- |
| `/dashboard/users` | **Ruta principal** - Módulo completo con layout | Super Admin + Admin Empresa |
| `/home/users`      | Redirección a `/users`                          | Todos (redirige)            |

---

## 🚀 Cómo Usar el Módulo

### 1. Acceso desde el Menú

**Super Admin:**

```
Dashboard > Gestión de Usuarios
```

**Admin Empresa:**

```
Dashboard > Gestión de Usuarios
```

El módulo automáticamente detecta el rol del usuario y muestra:

- **Super Admin**: Dashboard global + lista de todos los usuarios
- **Admin Empresa**: Dashboard de empresa + lista de usuarios de su empresa

### 2. Importar Componentes en Tu Código

```tsx
// Importar página completa
import {UserManagementPage} from '@/components/Modules/UserManagement'

// Importar componentes individuales
import {
  UserTable,
  UserForm,
  RoleAssignmentForm
} from '@/components/Modules/UserManagement'

// Usar en tu página
export default function MyPage() {
  return <UserManagementPage />
}
```

### 3. Usar Solo la Tabla de Usuarios

```tsx
import {UserTable} from '@/components/Modules/UserManagement'

export default function CustomPage() {
  return (
    <div>
      <h1>Mis Usuarios</h1>
      <UserTable
        companyScope={true} // Solo usuarios de mi empresa
        showActions={true} // Mostrar botones de acción
        maxHeight='max-h-96' // Altura máxima
      />
    </div>
  )
}
```

### 4. Usar Hooks de Gestión de Usuarios

```tsx
import {useUsers, useUserMutations} from '@/hooks/useUserManagement'

export default function MyComponent() {
  // Obtener lista de usuarios
  const {users, isLoading, filters, updateFilters} = useUsers()

  // Obtener mutaciones (crear, editar, eliminar)
  const {createUser, updateUser, deleteUser} = useUserMutations()

  // Filtrar usuarios
  const handleSearch = (searchTerm: string) => {
    updateFilters({search: searchTerm})
  }

  return (
    <div>
      <input onChange={e => handleSearch(e.target.value)} />
      {users.map(user => (
        <div key={user._id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### 5. Usar Badges

```tsx
import {
  StatusBadge,
  RoleBadge,
  MultiRoleBadge,
  CapacityBadge,
  TrialBadge
} from '@/components/UI/MultiCompanyBadges'

export default function UserCard({user}) {
  return (
    <div>
      <StatusBadge status={user.status} size='md' />
      <RoleBadge role={user.roles[0].role} variant='solid' />
      <MultiRoleBadge roles={user.roles.map(r => r.role)} maxVisible={2} />
    </div>
  )
}
```

### 6. Verificar Permisos

```tsx
import {PermissionUtils} from '@/utils/permissions'

// Obtener etiqueta de permiso
const label = PermissionUtils.getPermissionLabel('users.create')
// Resultado: "Crear usuarios en la empresa"

// Obtener permisos por defecto de un rol
const permissions = PermissionUtils.getDefaultPermissions('admin_empresa')

// Agrupar permisos por categoría
const grouped = PermissionUtils.groupPermissionsByCategory(permissions)
```

---

## 🔧 Configuración del Backend

### Endpoints Utilizados

El módulo consume los siguientes endpoints del backend:

```typescript
// Usuarios
GET    /api/v2/users/all          // Listar todos (Super Admin)
GET    /api/v2/users/company      // Listar usuarios de empresa
GET    /api/v2/users/profile      // Perfil actual
POST   /api/v2/users              // Crear usuario
POST   /api/v2/users/company      // Crear usuario en empresa
PUT    /api/v2/users/:id          // Actualizar usuario
DELETE /api/v2/users/:id          // Eliminar usuario
POST   /api/v2/users/:id/roles    // Asignar rol
DELETE /api/v2/users/:id/roles/:index  // Revocar rol

// Empresas
GET    /api/v2/companies          // Listar empresas
GET    /api/v2/companies/current  // Empresa actual
GET    /api/v2/companies/:id/stats  // Estadísticas
```

### Autenticación Requerida

Todos los endpoints requieren:

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

El token se gestiona automáticamente con `useAuth()` hook.

---

## 🎨 Personalización

### Modificar Estilos de Badges

Edita: `components/UI/MultiCompanyBadges.tsx`

```typescript
const STATUS_STYLES = {
  active: {
    solid: 'bg-green-100 text-green-800', // Cambiar colores aquí
    outline: 'border-green-300 text-green-700'
  }
}
```

### Agregar Nuevos Permisos

Edita: `utils/permissions.ts`

```typescript
export const COMPANY_PERMISSIONS = {
  // ... existentes
  'new_module.create': 'Crear en nuevo módulo',
  'new_module.edit': 'Editar en nuevo módulo'
}
```

### Modificar Filtros de Usuario

Edita el hook: `hooks/useUserManagement.ts`

```typescript
export interface IUserFilters {
  search?: string
  role?: UserRole
  status?: UserStatus
  // Agregar nuevos filtros aquí
  department?: string
  location?: string
}
```

---

## 📊 Componentes Disponibles

### UserManagementPage

Página completa con navegación entre Dashboard y Lista de Usuarios.

**Props:** Ninguna (usa hooks internos)

**Uso:**

```tsx
<UserManagementPage />
```

### UserTable

Tabla completa con filtros, paginación y acciones.

**Props:**

```typescript
interface UserTableProps {
  companyScope?: boolean // Filtrar por empresa actual
  showActions?: boolean // Mostrar botones de acción
  maxHeight?: string // Altura máxima CSS
  onUserSelect?: (user) => void // Callback al seleccionar
}
```

**Uso:**

```tsx
<UserTable
  companyScope={true}
  showActions={true}
  maxHeight='max-h-screen'
  onUserSelect={user => console.log(user)}
/>
```

### UserForm

Formulario para crear/editar usuarios.

**Props:**

```typescript
interface UserFormProps {
  user?: IEnhancedUser // Usuario a editar
  isOpen: boolean // Estado del modal
  onClose: () => void // Callback al cerrar
  onSuccess?: () => void // Callback al éxito
  mode: 'create' | 'edit' | 'invite' // Modo
  companyScope?: boolean // Si está en scope de empresa
}
```

**Uso:**

```tsx
<UserForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  mode='create'
  companyScope={false}
/>
```

### RoleAssignmentForm

Formulario para asignar roles adicionales.

**Props:**

```typescript
interface RoleAssignmentProps {
  userId: string
  currentRoles: IUserRole[]
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}
```

---

## 🔐 Control de Acceso

### Roles y Permisos

| Rol               | Puede Ver              | Puede Crear                    | Puede Editar           | Puede Eliminar         |
| ----------------- | ---------------------- | ------------------------------ | ---------------------- | ---------------------- |
| **Super Admin**   | Todos los usuarios     | Usuarios globales y de empresa | Cualquier usuario      | Cualquier usuario      |
| **Admin Empresa** | Usuarios de su empresa | Usuarios en su empresa         | Usuarios de su empresa | Usuarios de su empresa |
| **Manager**       | Usuarios de su empresa | ❌ No                          | ❌ No                  | ❌ No                  |
| **Employee**      | ❌ No                  | ❌ No                          | ❌ No                  | ❌ No                  |
| **Viewer**        | ❌ No                  | ❌ No                          | ❌ No                  | ❌ No                  |

### Verificación Automática

El componente `UserManagementPage` verifica automáticamente:

```tsx
const hasUserManagementAccess = isSuperAdmin || isCompanyAdmin
```

Si el usuario no tiene acceso, muestra un mensaje de restricción.

---

## 🐛 Troubleshooting

### Problema: No veo usuarios

**Solución:**

1. Verificar que tienes rol `super_admin` o `admin_empresa`
2. Verificar que el token JWT esté vigente
3. Revisar console del navegador para errores de API

### Problema: Error al crear usuario

**Solución:**

1. Verificar que todos los campos requeridos estén llenos
2. Verificar formato de email
3. Verificar que el backend esté ejecutándose

### Problema: No aparecen los badges

**Solución:**

1. Verificar importación: `import {StatusBadge} from '@/components/UI/MultiCompanyBadges'`
2. Verificar que los valores de status/role sean válidos

---

## 📝 Notas Importantes

1. **React Query Cache:** Los datos se cachean por 5 minutos. Usa `refetch()` para actualizar.

2. **Filtros Persistentes:** Los filtros se mantienen mientras el componente está montado.

3. **Validaciones:** Todas las validaciones críticas se hacen en el backend.

4. **TypeScript:** Todos los componentes tienen tipado estricto.

5. **Responsive:** El módulo es completamente responsive (mobile, tablet, desktop).

---

## ✅ Checklist de Integración Completado

- [x] Componentes UI de Badges verificados y existentes
- [x] Utilidades de permisos verificadas y funcionales
- [x] Componentes SuperAdmin exportados correctamente
- [x] Rutas consolidadas en `/users`
- [x] Menús actualizados con enlaces correctos
- [x] Redirección configurada desde `/dashboard/users`
- [x] Sin errores de compilación
- [x] Hooks de React Query configurados
- [x] API endpoints documentados
- [x] TypeScript interfaces completas

---

## 🎉 ¡Listo para Usar!

El módulo de gestión de usuarios está completamente integrado y listo para producción.

**Próximos pasos recomendados:**

1. Probar flujo completo como Super Admin
2. Probar flujo completo como Admin Empresa
3. Agregar tests unitarios si es necesario
4. Personalizar estilos según branding de la empresa

---

**¿Preguntas o problemas?**  
Contacta a: @elsoprimeDev
