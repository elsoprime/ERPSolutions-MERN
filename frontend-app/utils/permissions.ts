/**
 * Permission Constants for Frontend
 * @description: Constantes de permisos sincronizadas con el backend
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

// Permisos globales (Solo Super Admin)
export const GLOBAL_PERMISSIONS = {
  // Gestión de empresas
  'companies.create': 'Crear nuevas empresas',
  'companies.delete': 'Eliminar empresas',
  'companies.list_all': 'Listar todas las empresas',
  'companies.edit_any': 'Editar cualquier empresa',
  'companies.suspend': 'Suspender empresas',

  // Gestión global de usuarios
  'users.manage_global': 'Gestionar usuarios globalmente',
  'users.assign_global_roles': 'Asignar roles globales',
  'users.view_all': 'Ver todos los usuarios del sistema',

  // Configuración del sistema
  'system.configure': 'Configurar el sistema',
  'system.maintenance': 'Modo mantenimiento',
  'system.backup': 'Gestionar backups',
  'system.logs': 'Ver logs del sistema',

  // Facturación y suscripciones
  'billing.manage_all': 'Gestionar facturación de todas las empresas',
  'billing.view_revenue': 'Ver ingresos totales',

  // Analytics cross-empresa
  'analytics.cross_company': 'Ver analytics de múltiples empresas',
  'analytics.system_metrics': 'Ver métricas del sistema',

  // Soporte
  'support.access_all': 'Acceder a datos de soporte de todas las empresas'
} as const

// Permisos por empresa (Admin Empresa, Manager, etc.)
export const COMPANY_PERMISSIONS = {
  // Gestión de usuarios de la empresa
  'users.create': 'Crear usuarios en la empresa',
  'users.edit': 'Editar usuarios de la empresa',
  'users.delete': 'Eliminar usuarios de la empresa',
  'users.view': 'Ver usuarios de la empresa',
  'users.assign_roles': 'Asignar roles en la empresa',

  // Configuración de la empresa
  'company.edit': 'Editar información de la empresa',
  'company.configure': 'Configurar empresa',
  'company.branding': 'Gestionar branding',
  'company.billing': 'Ver facturación de la empresa',

  // Inventario
  'inventory.create': 'Crear productos',
  'inventory.edit': 'Editar productos',
  'inventory.delete': 'Eliminar productos',
  'inventory.view': 'Ver inventario',
  'inventory.transfer': 'Transferir productos',
  'inventory.adjust': 'Ajustar stock',

  // Reportes
  'reports.view': 'Ver reportes de la empresa',
  'reports.export': 'Exportar reportes',
  'reports.create': 'Crear reportes personalizados',

  // Configuraciones
  'settings.edit': 'Editar configuraciones',
  'settings.view': 'Ver configuraciones',

  // Facturación/Ventas
  'sales.create': 'Crear ventas',
  'sales.edit': 'Editar ventas',
  'sales.view': 'Ver ventas',
  'sales.delete': 'Eliminar ventas',

  // Compras
  'purchases.create': 'Crear compras',
  'purchases.edit': 'Editar compras',
  'purchases.view': 'Ver compras',
  'purchases.delete': 'Eliminar compras'
} as const

// Tipos de permisos
export type GlobalPermission = keyof typeof GLOBAL_PERMISSIONS
export type CompanyPermission = keyof typeof COMPANY_PERMISSIONS
export type Permission = GlobalPermission | CompanyPermission

// Roles y sus permisos por defecto
export const ROLE_PERMISSIONS = {
  // Roles globales
  super_admin: Object.keys(GLOBAL_PERMISSIONS) as GlobalPermission[],

  // Roles por empresa
  admin_empresa: [
    'users.create',
    'users.edit',
    'users.delete',
    'users.view',
    'users.assign_roles',
    'company.edit',
    'company.configure',
    'company.branding',
    'company.billing',
    'inventory.create',
    'inventory.edit',
    'inventory.delete',
    'inventory.view',
    'inventory.transfer',
    'inventory.adjust',
    'reports.view',
    'reports.export',
    'reports.create',
    'settings.edit',
    'settings.view',
    'sales.create',
    'sales.edit',
    'sales.view',
    'sales.delete',
    'purchases.create',
    'purchases.edit',
    'purchases.view',
    'purchases.delete'
  ] as CompanyPermission[],

  manager: [
    'users.view',
    'users.assign_roles',
    'inventory.create',
    'inventory.edit',
    'inventory.view',
    'inventory.transfer',
    'reports.view',
    'reports.export',
    'settings.view',
    'sales.create',
    'sales.edit',
    'sales.view',
    'purchases.create',
    'purchases.edit',
    'purchases.view'
  ] as CompanyPermission[],

  employee: [
    'users.view',
    'inventory.view',
    'inventory.transfer',
    'reports.view',
    'settings.view',
    'sales.create',
    'sales.view',
    'purchases.view'
  ] as CompanyPermission[],

  viewer: [
    'inventory.view',
    'reports.view',
    'sales.view',
    'purchases.view'
  ] as CompanyPermission[]
} as const

// Utilidades para permisos
export const PermissionUtils = {
  /**
   * Obtiene la etiqueta de un permiso
   */
  getPermissionLabel: (permission: string): string => {
    return (
      (GLOBAL_PERMISSIONS as any)[permission] ||
      (COMPANY_PERMISSIONS as any)[permission] ||
      permission
    )
  },

  /**
   * Obtiene todos los permisos globales como array
   */
  getAllGlobalPermissions: (): GlobalPermission[] => {
    return Object.keys(GLOBAL_PERMISSIONS) as GlobalPermission[]
  },

  /**
   * Obtiene todos los permisos de empresa como array
   */
  getAllCompanyPermissions: (): CompanyPermission[] => {
    return Object.keys(COMPANY_PERMISSIONS) as CompanyPermission[]
  },

  /**
   * Obtiene los permisos por defecto de un rol
   */
  getDefaultPermissions: (role: keyof typeof ROLE_PERMISSIONS): string[] => {
    return ROLE_PERMISSIONS[role] as string[]
  },

  /**
   * Agrupa permisos por categoría
   */
  groupPermissionsByCategory: (
    permissions: string[]
  ): Record<string, string[]> => {
    const groups: Record<string, string[]> = {}
    permissions.forEach(permission => {
      const category = permission.split('.')[0] // Primera parte antes del .
      if (!groups[category]) groups[category] = []
      groups[category].push(permission)
    })
    return groups
  },

  /**
   * Obtiene etiqueta de categoría
   */
  getCategoryLabel: (category: string): string => {
    const labels: Record<string, string> = {
      users: 'Gestión de Usuarios',
      companies: 'Gestión de Empresas',
      company: 'Configuración de Empresa',
      system: 'Sistema',
      billing: 'Facturación',
      analytics: 'Analytics',
      support: 'Soporte',
      inventory: 'Inventario',
      reports: 'Reportes',
      settings: 'Configuraciones',
      sales: 'Ventas',
      purchases: 'Compras'
    }
    return (
      labels[category] || category.charAt(0).toUpperCase() + category.slice(1)
    )
  }
}

export default {
  GLOBAL_PERMISSIONS,
  COMPANY_PERMISSIONS,
  ROLE_PERMISSIONS,
  PermissionUtils
}
