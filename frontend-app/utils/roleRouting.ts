/**
 * Role-Based Routing Utilities
 * @description: Utilidades para enrutamiento inteligente basado en roles
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {UserRole, IEnhancedUser} from '@/interfaces/MultiCompany'

// Definir rutas por defecto para cada rol
export const DEFAULT_ROUTES = {
  [UserRole.SUPER_ADMIN]: '/home',
  [UserRole.ADMIN_EMPRESA]: '/home',
  [UserRole.MANAGER]: '/home',
  [UserRole.EMPLOYEE]: '/home',
  [UserRole.VIEWER]: '/home'
} as const

// Rutas permitidas por rol
export const ALLOWED_ROUTES = {
  [UserRole.SUPER_ADMIN]: [
    '/home',
    '/dashboard/super-admin',
    '/users',
    '/companies',
    '/system',
    '/analytics',
    '/billing'
  ],
  [UserRole.ADMIN_EMPRESA]: [
    '/home',
    '/dashboard/company-admin',
    '/users',
    '/settings',
    '/reports',
    '/inventory',
    '/sales',
    '/purchases',
    '/billing'
  ],
  [UserRole.MANAGER]: [
    '/home',
    '/dashboard/manager',
    '/users',
    '/inventory',
    '/reports',
    '/sales',
    '/purchases'
  ],
  [UserRole.EMPLOYEE]: [
    '/home',
    '/dashboard/employee',
    '/inventory',
    '/sales',
    '/reports'
  ],
  [UserRole.VIEWER]: ['/home', '/dashboard/viewer', '/reports']
} as const

// Obtener el rol más alto del usuario
export function getHighestRole(user: IEnhancedUser | any | null): UserRole {
  if (!user) {
    return UserRole.VIEWER
  }

  // 🔥 ADAPTADOR: Si el usuario viene del sistema legacy (con role simple)
  if (user.role && typeof user.role === 'string' && !user.roles) {
    // Mapear roles legacy del backend a enums del frontend
    const roleMappingLegacy: Record<string, UserRole> = {
      super_admin: UserRole.SUPER_ADMIN,
      admin_empresa: UserRole.ADMIN_EMPRESA,
      manager: UserRole.MANAGER,
      employee: UserRole.EMPLOYEE,
      viewer: UserRole.VIEWER,
      admin: UserRole.ADMIN_EMPRESA // Compatibilidad
    }

    return roleMappingLegacy[user.role] || UserRole.VIEWER
  }

  // 🔥 SISTEMA ENHANCED: Si el usuario tiene array de roles
  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    // Jerarquía de roles (de mayor a menor)
    const roleHierarchy = [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE,
      UserRole.VIEWER
    ]

    // Buscar el rol más alto que tenga el usuario
    for (const role of roleHierarchy) {
      if (
        user.roles.some(
          (userRole: any) => userRole.role === role && userRole.isActive
        )
      ) {
        return role
      }
    }
  }

  return UserRole.VIEWER
}

// Obtener la ruta por defecto del usuario
export function getDefaultRoute(user: IEnhancedUser | any | null): string {
  const highestRole = getHighestRole(user)
  return DEFAULT_ROUTES[highestRole] || '/dashboard/viewer'
}

// Verificar si un usuario tiene acceso a una ruta
export function hasRouteAccess(
  user: IEnhancedUser | any | null,
  route: string
): boolean {
  const highestRole = getHighestRole(user)
  const allowedRoutes = ALLOWED_ROUTES[highestRole] || []

  // Super Admin tiene acceso a todo
  if (highestRole === UserRole.SUPER_ADMIN) {
    return true
  }

  // Verificar si la ruta está en las permitidas
  return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute))
}

// Obtener información del contexto empresarial
export function getCompanyContext(user: IEnhancedUser | any | null): {
  currentCompanyId: string | null
  hasMultipleCompanies: boolean
  isGlobalUser: boolean
} {
  if (!user) {
    return {
      currentCompanyId: null,
      hasMultipleCompanies: false,
      isGlobalUser: false
    }
  }

  // 🔥 ADAPTADOR: Para usuarios legacy con role simple
  if (user.role && typeof user.role === 'string' && !user.roles) {
    const isGlobalUser = user.role === 'super_admin'
    return {
      currentCompanyId: user.companyId || null,
      hasMultipleCompanies: false,
      isGlobalUser
    }
  }

  // 🔥 SISTEMA ENHANCED: Para usuarios con array de roles
  if (user.roles && Array.isArray(user.roles)) {
    // Verificar si es usuario global (Super Admin)
    const isGlobalUser = user.roles.some(
      (role: any) => role.roleType === 'global'
    )

    // Obtener empresas únicas
    const companyIds = user.roles
      .filter((role: any) => role.companyId && role.isActive)
      .map((role: any) => role.companyId)
      .filter(
        (id: any, index: number, self: any[]) => self.indexOf(id) === index
      )

    return {
      currentCompanyId: companyIds[0] || null,
      hasMultipleCompanies: companyIds.length > 1,
      isGlobalUser
    }
  }

  return {
    currentCompanyId: null,
    hasMultipleCompanies: false,
    isGlobalUser: false
  }
}

// Generar breadcrumbs basado en la ruta actual
export function generateBreadcrumbs(
  pathname: string,
  user: IEnhancedUser | any | null
) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: Array<{label: string; href: string; isActive?: boolean}> =
    [{label: 'Inicio', href: '/home'}]

  if (segments.length === 0) return breadcrumbs

  // Mapeo de rutas a etiquetas
  const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    'super-admin': 'Super Administrador',
    'company-admin': 'Admin Empresa',
    manager: 'Manager',
    employee: 'Empleado',
    viewer: 'Visualizador',
    users: 'Gestión de Usuarios',
    companies: 'Gestión de Empresas',
    inventory: 'Inventario',
    sales: 'Ventas',
    purchases: 'Compras',
    reports: 'Reportes',
    settings: 'Configuraciones',
    billing: 'Facturación',
    system: 'Sistema',
    analytics: 'Analytics'
  }

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const label =
      routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    breadcrumbs.push({
      label,
      href: currentPath,
      isActive: index === segments.length - 1
    })
  })

  return breadcrumbs
}

/**
 * Verifica si un rol tiene acceso a un rol específico
 */
export function hasRoleAccess(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const roleHierarchy = {
    [UserRole.SUPER_ADMIN]: 5,
    [UserRole.ADMIN_EMPRESA]: 4,
    [UserRole.MANAGER]: 3,
    [UserRole.EMPLOYEE]: 2,
    [UserRole.VIEWER]: 1
  }

  const userLevel = roleHierarchy[userRole] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0

  return userLevel >= requiredLevel
}

// Hook para navegación inteligente
export function useSmartNavigation() {
  const navigate = (path: string, user: IEnhancedUser | any | null) => {
    // Verificar acceso
    if (!hasRouteAccess(user, path)) {
      const defaultRoute = getDefaultRoute(user)
      window.location.href = defaultRoute
      return
    }

    window.location.href = path
  }

  return {navigate}
}

export default {
  getHighestRole,
  getDefaultRoute,
  hasRouteAccess,
  hasRoleAccess,
  getCompanyContext,
  generateBreadcrumbs,
  useSmartNavigation
}
