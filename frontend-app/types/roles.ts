/**
 * Roles y Permisos del Sistema
 * @description: Definición de roles, permisos y estructura de autorización
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'employee'
  | 'viewer'

export type Permission =
  // Gestión de usuarios
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  // Configuración del sistema
  | 'settings.view'
  | 'settings.edit'
  // Almacén/Inventario
  | 'warehouse.view'
  | 'warehouse.create'
  | 'warehouse.edit'
  | 'warehouse.delete'
  | 'inventory.view'
  | 'inventory.manage'
  // Productos
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  // Categorías
  | 'categories.view'
  | 'categories.create'
  | 'categories.edit'
  | 'categories.delete'
  // Reportes
  | 'reports.view'
  | 'reports.export'
  // Dashboard
  | 'dashboard.view'
  | 'dashboard.analytics'
  // Centros de costo
  | 'cost_centers.view'
  | 'cost_centers.manage'

export interface RoleDefinition {
  id: UserRole
  name: string
  description: string
  permissions: Permission[]
  color: string
  level: number // Nivel jerárquico (1 = más alto)
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Administrador',
    description: 'Acceso completo al sistema',
    level: 1,
    color: 'purple',
    permissions: [
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'settings.view',
      'settings.edit',
      'warehouse.view',
      'warehouse.create',
      'warehouse.edit',
      'warehouse.delete',
      'inventory.view',
      'inventory.manage',
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'categories.view',
      'categories.create',
      'categories.edit',
      'categories.delete',
      'reports.view',
      'reports.export',
      'dashboard.view',
      'dashboard.analytics',
      'cost_centers.view',
      'cost_centers.manage'
    ]
  },
  admin: {
    id: 'admin',
    name: 'Administrador',
    description: 'Administración completa excepto configuración del sistema',
    level: 2,
    color: 'blue',
    permissions: [
      'users.view',
      'users.create',
      'users.edit',
      'warehouse.view',
      'warehouse.create',
      'warehouse.edit',
      'warehouse.delete',
      'inventory.view',
      'inventory.manage',
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'categories.view',
      'categories.create',
      'categories.edit',
      'categories.delete',
      'reports.view',
      'reports.export',
      'dashboard.view',
      'dashboard.analytics',
      'cost_centers.view',
      'cost_centers.manage'
    ]
  },
  manager: {
    id: 'manager',
    name: 'Gerente',
    description: 'Gestión de operaciones y reportes',
    level: 3,
    color: 'green',
    permissions: [
      'users.view',
      'warehouse.view',
      'warehouse.edit',
      'inventory.view',
      'inventory.manage',
      'products.view',
      'products.edit',
      'categories.view',
      'reports.view',
      'reports.export',
      'dashboard.view',
      'dashboard.analytics',
      'cost_centers.view'
    ]
  },
  employee: {
    id: 'employee',
    name: 'Empleado',
    description: 'Operaciones básicas de inventario',
    level: 4,
    color: 'yellow',
    permissions: [
      'warehouse.view',
      'warehouse.edit',
      'inventory.view',
      'products.view',
      'categories.view',
      'dashboard.view',
      'cost_centers.view'
    ]
  },
  viewer: {
    id: 'viewer',
    name: 'Observador',
    description: 'Solo visualización de datos',
    level: 5,
    color: 'gray',
    permissions: [
      'warehouse.view',
      'inventory.view',
      'products.view',
      'categories.view',
      'dashboard.view'
    ]
  }
}

/**
 * Verificar si un usuario tiene un permiso específico
 */
export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  const role = ROLES[userRole]
  return role.permissions.includes(permission)
}

/**
 * Verificar si un usuario tiene al menos uno de los permisos especificados
 */
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

/**
 * Verificar si un usuario tiene todos los permisos especificados
 */
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

/**
 * Obtener todos los permisos de un rol
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLES[userRole].permissions
}

/**
 * Verificar si un rol puede acceder a una ruta específica
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    '/home': ['dashboard.view'],
    '/home/warehouse': ['warehouse.view'],
    '/home/warehouse/create': ['warehouse.create'],
    '/home/warehouse/edit': ['warehouse.edit'],
    '/home/cost-center': ['cost_centers.view'],
    '/settings': ['settings.view'],
    '/users': ['users.view'],
    '/reports': ['reports.view']
  }

  const requiredPermissions = routePermissions[route]
  if (!requiredPermissions) return true // Si no hay permisos definidos, permitir acceso

  return hasAnyPermission(userRole, requiredPermissions)
}

/**
 * Obtener información del rol con estilo
 */
export function getRoleInfo(userRole: UserRole) {
  const role = ROLES[userRole]
  const colors = {
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      dot: 'bg-purple-500'
    },
    blue: {bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500'},
    green: {bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500'},
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500'
    },
    gray: {bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500'}
  }

  return {
    ...role,
    colors: colors[role.color as keyof typeof colors]
  }
}
