# Módulo de Gestión de Usuarios Multi-Empresa

Este módulo proporciona una solución completa para la gestión de usuarios en un sistema multi-empresa con roles jerárquicos y permisos granulares.

## 🏗️ Arquitectura

### Estructura de Archivos

```
UserManagement/
├── index.ts                    # Exportaciones principales
├── UserManagementPage.tsx      # Página principal del módulo
├── SuperAdminDashboard.tsx     # Dashboard para Super Administradores
├── CompanyAdminDashboard.tsx   # Dashboard para Admins de Empresa
├── UserForms.tsx              # Formularios de gestión de usuarios
├── UserTable.tsx              # Tabla de listado de usuarios
└── README.md                  # Esta documentación
```

### Dependencias

- `@/hooks/useUserManagement` - Hooks para gestión de usuarios
- `@/hooks/useCompanyManagement` - Hooks para gestión de empresas
- `@/hooks/useAuth` - Hook de autenticación
- `@/components/UI/MultiCompanyBadges` - Componentes de badges
- `@/interfaces/MultiCompany` - Interfaces TypeScript
- `@/utils/permissions` - Constantes y utilidades de permisos

## 🎯 Componentes Principales

### 1. UserManagementPage

**Descripción**: Página principal que orquesta todo el módulo
**Props**: Ninguna (usa hooks internos)
**Características**:

- Navegación entre Dashboard y Lista de Usuarios
- Control de acceso basado en roles
- Interfaz responsive con navegación móvil

**Uso**:

```tsx
import {UserManagementPage} from '@/components/Modules/UserManagement'

export default function UsersPage() {
  return <UserManagementPage />
}
```

### 2. SuperAdminDashboard

**Descripción**: Dashboard para Super Administradores con vista global del sistema
**Props**: Ninguna
**Características**:

- Estadísticas de empresas y usuarios
- Acciones rápidas para gestión global
- Alertas de empresas que requieren atención
- Métricas de actividad del sistema

**Datos mostrados**:

- Total de empresas y usuarios
- Distribución por planes de suscripción
- Empresas activas vs inactivas
- Actividad reciente del sistema

### 3. CompanyAdminDashboard

**Descripción**: Dashboard para Administradores de Empresa con vista específica de su organización
**Props**: Ninguna (obtiene datos de la empresa actual)
**Características**:

- Estadísticas de usuarios de la empresa
- Uso de capacidad (usuarios, productos, almacenamiento)
- Usuarios que requieren atención
- Actividad reciente de la empresa

**Datos mostrados**:

- Usuarios totales y activos
- Distribución por roles
- Límites de plan y uso actual
- Alertas de usuarios pendientes

### 4. UserForms

**Componentes incluidos**:

- `UserForm` - Formulario para crear/editar usuarios
- `RoleAssignmentForm` - Formulario para asignar roles adicionales
- `PermissionSelector` - Selector de permisos granulares

#### UserForm Props:

```tsx
interface UserFormProps {
  user?: IEnhancedUser // Usuario a editar (opcional para crear)
  isOpen: boolean // Estado del modal
  onClose: () => void // Callback al cerrar
  onSuccess?: () => void // Callback al éxito
  mode: 'create' | 'edit' | 'invite' // Modo del formulario
  companyScope?: boolean // Si está en scope de empresa
}
```

#### RoleAssignmentForm Props:

```tsx
interface RoleAssignmentProps {
  userId: string // ID del usuario
  currentRoles: IEnhancedUser['roles'] // Roles actuales
  isOpen: boolean // Estado del modal
  onClose: () => void // Callback al cerrar
  onSuccess?: () => void // Callback al éxito
}
```

### 5. UserTable

**Descripción**: Tabla completa para listar y gestionar usuarios
**Props**:

```tsx
interface UserTableProps {
  companyScope?: boolean // Si filtrar por empresa actual
  showActions?: boolean // Mostrar botones de acción
  maxHeight?: string // Altura máxima de la tabla
  onUserSelect?: (user: IEnhancedUser) => void // Callback al seleccionar
}
```

**Características**:

- Paginación automática
- Filtros por nombre, rol y estado
- Acciones: editar, eliminar, cambiar estado, asignar roles
- Responsive design
- Estados de carga y error

## 🔐 Sistema de Permisos

### Jerarquía de Roles

1. **Super Admin** (Global)

   - Acceso total al sistema
   - Gestión de empresas
   - Gestión global de usuarios

2. **Admin Empresa** (Por empresa)

   - Gestión completa de su empresa
   - Gestión de usuarios de la empresa
   - Configuraciones de empresa

3. **Manager** (Por empresa)

   - Gestión limitada de usuarios
   - Acceso a inventario y reportes
   - Operaciones de ventas/compras

4. **Employee** (Por empresa)

   - Acceso básico a funcionalidades
   - Operaciones limitadas

5. **Viewer** (Por empresa)
   - Solo lectura
   - Sin permisos de modificación

### Permisos Globales (Super Admin)

- Gestión de empresas (crear, editar, suspender)
- Gestión global de usuarios
- Configuración del sistema
- Facturación y analytics cross-empresa

### Permisos de Empresa

- Gestión de usuarios de la empresa
- Configuración de empresa
- Inventario y productos
- Reportes y analytics
- Ventas y compras

## 🎨 UI Components Utilizados

### MultiCompanyBadges

- `StatusBadge` - Estado de usuario/empresa
- `RoleBadge` - Rol del usuario
- `PlanBadge` - Plan de suscripción
- `CapacityBadge` - Uso de capacidad
- `TrialBadge` - Tiempo restante de trial
- `MultiRoleBadge` - Múltiples roles

### Estilos y Temas

- Diseño basado en Tailwind CSS
- Tema consistente con colores corporativos
- Iconos de Heroicons
- Componentes responsive

## 🔄 Flujos de Trabajo

### Crear Usuario (Super Admin)

1. Click en "Crear Usuario"
2. Llenar formulario con datos básicos
3. Seleccionar rol (puede ser global o por empresa)
4. Configurar permisos específicos
5. Asignar a empresa (si no es Super Admin)
6. Confirmar creación

### Crear Usuario (Admin Empresa)

1. Click en "Invitar Usuario"
2. Llenar datos básicos
3. Seleccionar rol dentro de la empresa
4. Configurar permisos
5. Enviar invitación

### Asignar Rol Adicional

1. Seleccionar usuario existente
2. Click en "Asignar Rol"
3. Seleccionar empresa y rol
4. Configurar permisos específicos
5. Confirmar asignación

## 📊 Integración con Backend

### Endpoints Utilizados

- `GET /api/v2/users` - Listar usuarios
- `POST /api/v2/users` - Crear usuario
- `PUT /api/v2/users/:id` - Actualizar usuario
- `DELETE /api/v2/users/:id` - Eliminar usuario
- `POST /api/v2/users/:id/roles` - Asignar rol
- `DELETE /api/v2/users/:id/roles/:index` - Revocar rol

### Endpoints de Empresa

- `GET /api/v2/companies` - Listar empresas
- `GET /api/v2/companies/current` - Empresa actual
- `GET /api/v2/companies/:id/stats` - Estadísticas de empresa

## 🧪 Testing

### Unit Tests Sugeridos

- Renderizado de componentes
- Validación de formularios
- Filtros y paginación
- Permisos y acceso

### Integration Tests

- Flujo completo de creación de usuario
- Asignación de roles
- Cambios de estado
- Filtros de tabla

## 🚀 Deployment

### Consideraciones

- El módulo es completamente client-side
- Requiere autenticación previa
- Depende de APIs REST del backend
- Utiliza React Query para caché

### Performance

- Lazy loading de componentes pesados
- Paginación para grandes datasets
- Debouncing en filtros de búsqueda
- Optimización de re-renders

## 🔧 Customización

### Temas

Los estilos pueden personalizarse modificando:

- Variables de Tailwind CSS
- Colores en `MultiCompanyBadges`
- Iconos en formularios

### Permisos

Nuevos permisos se agregan en:

- `@/utils/permissions.ts` (frontend)
- `backend/src/utils/multiCompanyPermissions.ts` (backend)

### Roles

Nuevos roles se definen en:

- `@/interfaces/MultiCompany.ts`
- Middleware de backend correspondiente

## 📝 TODO / Mejoras Futuras

- [ ] Importación masiva de usuarios (CSV)
- [ ] Invitaciones por email automáticas
- [ ] Audit log de cambios
- [ ] Notificaciones push
- [ ] Exportación de reportes
- [ ] Plantillas de permisos
- [ ] Roles temporales con expiración
- [ ] Integración con AD/LDAP
- [ ] 2FA para roles críticos
- [ ] Dashboard analytics avanzado

---

**Autor**: Esteban Soto Ojeda @elsoprimeDev  
**Fecha**: Octubre 2025  
**Versión**: 1.0.0
