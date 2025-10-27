# Sistema de Navegación Basado en Roles - ERP Solutions

## 📋 Resumen del Sistema

Este documento detalla la implementación completa del sistema de navegación inteligente basado en roles para la aplicación ERP Solutions. El sistema garantiza que cada usuario acceda únicamente a las funcionalidades y vistas correspondientes a su rol y empresa.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Smart Home Router** (`components/Routing/SmartHomeRouter.tsx`)

   - Router inteligente que analiza el rol del usuario autenticado
   - Redirección automática a dashboards específicos según el rol
   - Manejo de estados de carga y error

2. **Role-Based Navigation** (`components/Layout/RoleBasedNavigation.tsx`)

   - Barra de navegación dinámica basada en permisos
   - Menú responsivo para dispositivos móviles
   - Visualización de información del usuario y empresa

3. **Protected Layout** (`components/Layout/ProtectedLayout.tsx`)

   - Layout wrapper para páginas protegidas
   - Integración automática de la navegación basada en roles
   - Verificación de autenticación

4. **Role Routing Utils** (`utils/roleRouting.ts`)
   - Utilidades para determinar el rol más alto del usuario
   - Mapeo de rutas por defecto según roles
   - Verificación de acceso a rutas específicas

## 🔐 Sistema de Roles y Permisos

### Jerarquía de Roles

```
SUPER_ADMIN (Global)
├── Gestión completa del sistema
├── Administración de todas las empresas
├── Acceso a todos los módulos
└── Configuraciones globales

ADMIN_EMPRESA (Por empresa)
├── Gestión completa de su empresa
├── Administración de usuarios de la empresa
├── Configuraciones de empresa
└── Todos los módulos operativos

MANAGER (Por empresa)
├── Gestión de equipos
├── Gestión de usuarios (limitada)
├── Módulos operativos
└── Reportes avanzados

EMPLOYEE (Por empresa)
├── Acceso operativo básico
├── Inventario (lectura)
├── Ventas y compras
└── Reportes básicos

VIEWER (Por empresa)
├── Solo lectura
├── Visualización de datos
├── Reportes básicos
└── Sin permisos de modificación
```

### Rutas por Defecto

```typescript
const DEFAULT_ROUTES = {
  [UserRole.SUPER_ADMIN]: '/dashboard/super-admin',
  [UserRole.ADMIN_EMPRESA]: '/dashboard/company-admin',
  [UserRole.MANAGER]: '/dashboard/manager',
  [UserRole.EMPLOYEE]: '/dashboard/employee',
  [UserRole.VIEWER]: '/dashboard/employee'
}
```

## 📱 Páginas de Dashboard

### 1. Super Admin Dashboard (`/dashboard/super-admin`)

- **Audiencia**: Super administradores del sistema
- **Funcionalidades**:
  - Gestión global de empresas
  - Administración de usuarios globales
  - Configuraciones del sistema
  - Métricas globales

### 2. Company Admin Dashboard (`/dashboard/company-admin`)

- **Audiencia**: Administradores de empresa
- **Funcionalidades**:
  - Dashboard específico de empresa
  - Gestión de usuarios de la empresa
  - Configuraciones de empresa
  - Métricas empresariales

### 3. Manager Dashboard (`/dashboard/manager`)

- **Audiencia**: Gerentes y managers
- **Funcionalidades**:
  - Gestión de equipos
  - Métricas operativas
  - Acceso a módulos de gestión
  - Reportes avanzados

### 4. Employee Dashboard (`/dashboard/employee`)

- **Audiencia**: Empleados y visualizadores
- **Funcionalidades**:
  - Panel de trabajo diario
  - Tareas asignadas
  - Acceso a herramientas operativas
  - Reportes básicos

## 🛡️ Middleware de Protección

### Rutas Protegidas

```typescript
const protectedRoutes = [
  '/dashboard',
  '/users',
  '/companies',
  '/inventory',
  '/sales',
  '/purchases',
  '/reports',
  '/settings'
]
```

### Verificación de Autenticación

- Redirección automática a `/auth/login` para usuarios no autenticados
- Validación de tokens JWT
- Verificación de roles y permisos

## 🧭 Navegación Inteligente

### Elementos de Navegación

```typescript
interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  requiredRoles: UserRole[]
  description?: string
}
```

### Módulos Disponibles por Rol

| Módulo              | Super Admin | Admin Empresa | Manager | Employee | Viewer |
| ------------------- | ----------- | ------------- | ------- | -------- | ------ |
| Dashboard           | ✅          | ✅            | ✅      | ✅       | ✅     |
| Gestión de Usuarios | ✅          | ✅            | ✅      | ❌       | ❌     |
| Gestión de Empresas | ✅          | ❌            | ❌      | ❌       | ❌     |
| Inventario          | ✅          | ✅            | ✅      | ✅       | 👁️     |
| Ventas              | ✅          | ✅            | ✅      | ✅       | 👁️     |
| Compras             | ✅          | ✅            | ✅      | ✅       | 👁️     |
| Reportes            | ✅          | ✅            | ✅      | ✅       | ✅     |
| Configuraciones     | ✅          | ✅            | ❌      | ❌       | ❌     |

_✅ = Acceso completo, 👁️ = Solo lectura, ❌ = Sin acceso_

## 🎨 Características de UX/UI

### Navegación Responsiva

- **Desktop**: Barra horizontal con íconos y texto
- **Mobile**: Menú hamburguesa colapsible
- **Tablet**: Adaptación automática según el tamaño de pantalla

### Indicadores Visuales

- **Badge de Rol**: Indicador visual del rol actual del usuario
- **Estado de Usuario**: Badge que muestra el estado (Activo/Inactivo)
- **Empresa Actual**: Indicador de la empresa en contexto
- **Navegación Activa**: Resaltado de la página actual

### Acceso Rápido

- Enlaces directos a módulos principales
- Acciones rápidas en dashboards
- Botón de logout accesible
- Información del usuario siempre visible

## 🔄 Flujo de Navegación

### 1. Login Exitoso

```
Login → Token Validation → Smart Home Router → Role Detection → Default Dashboard
```

### 2. Navegación Entre Páginas

```
Current Page → Role Verification → Route Access Check → Navigation → Protected Layout
```

### 3. Logout

```
Logout Button → Token Cleanup → Redirect to Login → Session End
```

## 🛠️ Implementación Técnica

### Hooks Utilizados

- `useAuth()`: Gestión de autenticación y datos del usuario
- `useRouter()`: Navegación programática
- `usePathname()`: Detección de ruta actual

### Dependencias Principales

- Next.js App Router
- React Query para gestión de estado
- Tailwind CSS para estilos
- TypeScript para tipado

### Patrones de Diseño

- **Higher-Order Component**: ProtectedLayout como wrapper
- **Smart Components**: Componentes que manejan lógica de negocio
- **Composition**: Composición de componentes reutilizables
- **Route Guards**: Protección de rutas mediante middleware

## 📊 Métricas y Monitoreo

### Estados de Carga

- Loading states para navegación asíncrona
- Skeletons para mejores transiciones
- Error boundaries para manejo de errores

### Optimizaciones

- Lazy loading de componentes de dashboard
- Memoización de verificaciones de permisos
- Cache de configuraciones de usuario

## 🚀 Próximas Mejoras

### Funcionalidades Planificadas

1. **Personalización de Dashboard**: Widgets configurables por usuario
2. **Notificaciones en Tiempo Real**: Sistema de alertas integrado
3. **Multi-idioma**: Soporte completo para internacionalización
4. **Tema Oscuro**: Alternativa de tema para mejorar la experiencia
5. **Accesos Rápidos Personalizables**: Favoritos por usuario

### Optimizaciones Técnicas

1. **Service Worker**: Cache inteligente para offline
2. **Bundle Splitting**: Carga optimizada por rol
3. **Analytics**: Tracking de uso por módulos
4. **A/B Testing**: Experimentación de UX

## 📝 Notas de Desarrollo

### Convenciones de Código

- Todos los componentes de navegación están en `components/Layout/`
- Utilidades de routing están en `utils/roleRouting.ts`
- Páginas de dashboard siguen el patrón `/dashboard/[role]/page.tsx`

### Testing

- Tests unitarios para utilidades de routing
- Tests de integración para flujos de navegación
- Tests E2E para verificación de roles

### Seguridad

- Verificación de roles tanto en frontend como backend
- Tokens JWT con expiración automática
- Validación de permisos en cada request

---

_Sistema desarrollado por Esteban Soto Ojeda (@elsoprimeDev) - ERP Solutions MERN_
