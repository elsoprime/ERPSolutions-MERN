/**
 * Server-Side Authentication Utilities
 * @description: Utilities para autenticación en el lado del servidor (middleware)
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {NextRequest} from 'next/server'
import {UserRole} from '@/interfaces/EnhanchedCompany/MultiCompany'

export interface ServerUserData {
  id: string
  email: string
  name: string
  role: UserRole | string // 🔥 COMPATIBLE: Acepta tanto roles legacy como nuevos
  companyId?: string
  companies?: Array<{
    id: string
    name: string
    role: UserRole
  }>
}

/**
 * Obtiene los datos del usuario desde las cookies en el servidor
 */
export function getUserDataFromCookies(
  request: NextRequest
): ServerUserData | null {
  try {
    const userDataCookie = request.cookies.get('USER_DATA')?.value
    if (!userDataCookie) {
      return null
    }

    const userData = JSON.parse(decodeURIComponent(userDataCookie))
    return userData as ServerUserData
  } catch (error) {
    console.error('Error parsing user data from cookies:', error)
    return null
  }
}

/**
 * Obtiene el rol más alto del usuario (compatible con sistema legacy)
 */
export function getHighestRoleFromUserData(userData: ServerUserData): UserRole {
  // 🔥 ADAPTADOR: Para usuarios legacy con role simple
  if (userData.role && typeof userData.role === 'string') {
    // Mapear roles legacy del backend a enums del frontend
    const roleMappingLegacy: Record<string, UserRole> = {
      super_admin: UserRole.SUPER_ADMIN,
      admin_empresa: UserRole.ADMIN_EMPRESA,
      manager: UserRole.MANAGER,
      employee: UserRole.EMPLOYEE,
      viewer: UserRole.VIEWER,
      admin: UserRole.ADMIN_EMPRESA // Compatibilidad
    }

    return roleMappingLegacy[userData.role] || UserRole.VIEWER
  }

  // 🔥 SISTEMA ENHANCED: Para usuarios con array de companies
  const roleHierarchy = {
    [UserRole.SUPER_ADMIN]: 5,
    [UserRole.ADMIN_EMPRESA]: 4,
    [UserRole.MANAGER]: 3,
    [UserRole.EMPLOYEE]: 2,
    [UserRole.VIEWER]: 1
  }

  let highestRole: UserRole = userData.role as UserRole
  let highestValue: number = roleHierarchy[userData.role as UserRole] || 0

  if (userData.companies) {
    userData.companies.forEach(company => {
      const roleValue = roleHierarchy[company.role] || 0
      if (roleValue > highestValue) {
        highestRole = company.role
        highestValue = roleValue
      }
    })
  }

  return highestRole
}

/**
 * Obtiene la ruta por defecto según el rol del usuario
 */
export function getDefaultRouteForRole(role: UserRole): string {
  const roleRoutes = {
    [UserRole.SUPER_ADMIN]: '/dashboard/mismodulossuperadmin',
    [UserRole.ADMIN_EMPRESA]: '/home/miempresa',
    [UserRole.MANAGER]: '/dashboard/manager',
    [UserRole.EMPLOYEE]: '/dashboard/employee',
    [UserRole.VIEWER]: '/dashboard/viewer'
  }

  return roleRoutes[role] || '/dashboard/viewer'
}

/**
 * Verifica si un usuario tiene acceso a una ruta específica
 */
export function hasAccessToRoute(
  userData: ServerUserData,
  pathname: string
): boolean {
  const userRole = getHighestRoleFromUserData(userData)

  // Mapeo de rutas y roles mínimos requeridos
  const routeAccess = {
    '/dashboard/mismodulossuperadmin': [UserRole.SUPER_ADMIN],
    '/dashboard/super-admin': [UserRole.SUPER_ADMIN],
    '/home/miempresa': [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA],
    '/dashboard/company-admin': [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA],
    '/dashboard/manager': [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER
    ],
    '/dashboard/employee': [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE
    ],
    '/dashboard/viewer': [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE,
      UserRole.VIEWER
    ],
    '/users': [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA, UserRole.MANAGER],
    '/companies': [UserRole.SUPER_ADMIN],
    '/settings': [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA],
    '/reports': [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER
    ],
    '/home': [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE,
      UserRole.VIEWER
    ] // Mantener home para compatibilidad
  }

  // Verificar acceso exacto a la ruta
  for (const [route, allowedRoles] of Object.entries(routeAccess)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole)
    }
  }

  // Por defecto, permitir acceso a rutas generales si está autenticado
  return true
}

/**
 * Obtiene la ruta de redirección apropiada según el rol
 */
export function getRedirectRoute(userData: ServerUserData): string {
  const highestRole = getHighestRoleFromUserData(userData)
  return getDefaultRouteForRole(highestRole)
}

/**
 * Verifica si es una ruta de dashboard role-based
 */
export function isDashboardRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard/')
}

/**
 * Extrae el rol de una ruta de dashboard
 */
export function getRoleFromDashboardPath(pathname: string): UserRole | null {
  const roleMap = {
    '/dashboard/mismodulossuperadmin': UserRole.SUPER_ADMIN,
    '/dashboard/super-admin': UserRole.SUPER_ADMIN,
    '/home/miempresa': UserRole.ADMIN_EMPRESA,
    '/dashboard/company-admin': UserRole.ADMIN_EMPRESA,
    '/dashboard/manager': UserRole.MANAGER,
    '/dashboard/employee': UserRole.EMPLOYEE,
    '/dashboard/viewer': UserRole.VIEWER
  }

  for (const [route, role] of Object.entries(roleMap)) {
    if (pathname.startsWith(route)) {
      return role
    }
  }

  return null
}
