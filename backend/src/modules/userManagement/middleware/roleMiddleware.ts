/**
 * @description Middleware de roles granular con soporte jerárquico
 * @module middleware/roleMiddleware
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

import type {Request, Response, NextFunction} from 'express'
import type {
  AuthenticatedUser,
  AuthError,
  AuthErrorResponse
} from '../types/authTypes'
import {AuthErrorCode} from '../types/authTypes'

// ========================================
// DEFINICIÓN DE ROLES Y JERARQUÍA
// ========================================

/**
 * Definición de roles del sistema con jerarquía (compatible con Enhanced System)
 */
export enum SystemRole {
  // Roles de usuario estándar
  GUEST = 'guest',
  USER = 'user',
  VIEWER = 'viewer',

  // Roles de empresa (Enhanced System)
  EMPLOYEE = 'employee',
  SUPERVISOR = 'supervisor',
  MANAGER = 'manager',
  ADMIN_EMPRESA = 'admin_empresa',

  // Roles administrativos (Enhanced System)
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin', // 🔥 CORREGIDO: Usar snake_case como en Enhanced DB

  // Roles especializados
  AUDITOR = 'auditor',
  SUPPORT = 'support',
  DEVELOPER = 'developer'
}

/**
 * Jerarquía de roles - cada rol incluye los permisos de roles anteriores
 */
export const ROLE_HIERARCHY: Record<SystemRole, SystemRole[]> = {
  [SystemRole.GUEST]: [],
  [SystemRole.USER]: [SystemRole.GUEST],
  [SystemRole.VIEWER]: [SystemRole.USER],
  [SystemRole.EMPLOYEE]: [SystemRole.VIEWER],
  [SystemRole.SUPERVISOR]: [SystemRole.EMPLOYEE],
  [SystemRole.MANAGER]: [SystemRole.SUPERVISOR],
  [SystemRole.ADMIN_EMPRESA]: [SystemRole.MANAGER], // 🔥 NUEVO: Admin de empresa
  [SystemRole.ADMIN]: [SystemRole.ADMIN_EMPRESA],
  [SystemRole.SUPER_ADMIN]: [SystemRole.ADMIN],
  [SystemRole.AUDITOR]: [SystemRole.VIEWER],
  [SystemRole.SUPPORT]: [SystemRole.USER],
  [SystemRole.DEVELOPER]: [SystemRole.ADMIN]
}

/**
 * Permisos específicos por módulo
 */
export interface ModulePermissions {
  warehouse: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
    export: boolean
    import: boolean
  }
  users: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
    manage_roles: boolean
  }
  reports: {
    read: boolean
    create: boolean
    financial: boolean
    export: boolean
  }
  settings: {
    read: boolean
    update: boolean
    system: boolean
  }
  audit: {
    read: boolean
    export: boolean
  }
}

/**
 * Matriz de permisos por rol
 */
export const ROLE_PERMISSIONS: Record<
  SystemRole,
  Partial<ModulePermissions>
> = {
  [SystemRole.GUEST]: {
    // Solo lectura muy limitada
  },

  [SystemRole.USER]: {
    warehouse: {
      read: true,
      create: false,
      update: false,
      delete: false,
      export: false,
      import: false
    }
  },

  [SystemRole.VIEWER]: {
    warehouse: {
      read: true,
      create: false,
      update: false,
      delete: false,
      export: false,
      import: false
    },
    reports: {
      read: true,
      create: false,
      financial: false,
      export: false
    }
  },

  [SystemRole.EMPLOYEE]: {
    warehouse: {
      read: true,
      create: true,
      update: true,
      delete: false,
      export: false,
      import: false
    },
    reports: {
      read: true,
      create: false,
      financial: false,
      export: false
    }
  },

  [SystemRole.SUPERVISOR]: {
    warehouse: {
      read: true,
      create: true,
      update: true,
      delete: true,
      export: true,
      import: false
    },
    users: {
      read: true,
      create: false,
      update: false,
      delete: false,
      manage_roles: false
    },
    reports: {
      read: true,
      create: true,
      financial: false,
      export: true
    }
  },

  [SystemRole.MANAGER]: {
    warehouse: {
      read: true,
      create: true,
      update: true,
      delete: true,
      export: true,
      import: true
    },
    users: {
      read: true,
      create: true,
      update: true,
      delete: false,
      manage_roles: false
    },
    reports: {
      read: true,
      create: true,
      financial: true,
      export: true
    },
    settings: {
      read: true,
      update: false,
      system: false
    }
  },

  [SystemRole.ADMIN_EMPRESA]: {
    warehouse: {
      read: true,
      create: true,
      update: true,
      delete: true,
      export: true,
      import: true
    },
    users: {
      read: true,
      create: true,
      update: true,
      delete: true,
      manage_roles: true
    },
    reports: {
      read: true,
      create: true,
      financial: true,
      export: true
    },
    settings: {
      read: true,
      update: true,
      system: false
    },
    audit: {
      read: true,
      export: false
    }
  },

  [SystemRole.ADMIN]: {
    warehouse: {
      read: true,
      create: true,
      update: true,
      delete: true,
      export: true,
      import: true
    },
    users: {
      read: true,
      create: true,
      update: true,
      delete: true,
      manage_roles: true
    },
    reports: {
      read: true,
      create: true,
      financial: true,
      export: true
    },
    settings: {
      read: true,
      update: true,
      system: false
    },
    audit: {
      read: true,
      export: false
    }
  },

  [SystemRole.SUPER_ADMIN]: {
    warehouse: {
      read: true,
      create: true,
      update: true,
      delete: true,
      export: true,
      import: true
    },
    users: {
      read: true,
      create: true,
      update: true,
      delete: true,
      manage_roles: true
    },
    reports: {
      read: true,
      create: true,
      financial: true,
      export: true
    },
    settings: {
      read: true,
      update: true,
      system: true
    },
    audit: {
      read: true,
      export: true
    }
  },

  [SystemRole.AUDITOR]: {
    warehouse: {
      read: true,
      create: false,
      update: false,
      delete: false,
      export: true,
      import: false
    },
    users: {
      read: true,
      create: false,
      update: false,
      delete: false,
      manage_roles: false
    },
    reports: {
      read: true,
      create: false,
      financial: true,
      export: true
    },
    audit: {
      read: true,
      export: true
    }
  },

  [SystemRole.SUPPORT]: {
    users: {
      read: true,
      create: false,
      update: true,
      delete: false,
      manage_roles: false
    },
    settings: {
      read: true,
      update: false,
      system: false
    }
  },

  [SystemRole.DEVELOPER]: {
    // Hereda todo de ADMIN
    settings: {
      read: true,
      update: true,
      system: true
    },
    audit: {
      read: true,
      export: true
    }
  }
}

// ========================================
// CLASE PRINCIPAL DE ROLES
// ========================================

export class RoleMiddleware {
  /**
   * Mapea roles legacy a roles del sistema Enhanced
   */
  static mapLegacyRole(legacyRole: string): SystemRole {
    const roleMapping: Record<string, SystemRole> = {
      // Roles Enhanced existentes
      super_admin: SystemRole.SUPER_ADMIN,
      admin_empresa: SystemRole.ADMIN_EMPRESA,
      manager: SystemRole.MANAGER,
      employee: SystemRole.EMPLOYEE,
      viewer: SystemRole.VIEWER,

      // Compatibilidad con roles antiguos
      admin: SystemRole.ADMIN,
      superadmin: SystemRole.SUPER_ADMIN,
      user: SystemRole.USER,
      guest: SystemRole.GUEST,

      // Roles especializados
      auditor: SystemRole.AUDITOR,
      support: SystemRole.SUPPORT,
      developer: SystemRole.DEVELOPER
    }

    return roleMapping[legacyRole] || SystemRole.VIEWER
  }

  /**
   * Verifica si un usuario tiene un rol específico o superior
   */
  static hasRole(user: AuthenticatedUser, requiredRole: SystemRole): boolean {
    if (!user.role) {
      return false
    }

    // 🔥 MAPEAR ROL LEGACY A SISTEMA ENHANCED
    const userRole = this.mapLegacyRole(user.role)

    // Verificación directa
    if (userRole === requiredRole) {
      return true
    }

    // Verificación jerárquica
    return this.hasAnyRole(user, this.getRoleHierarchy(requiredRole))
  }

  /**
   * Verifica si un usuario tiene cualquiera de los roles especificados
   */
  static hasAnyRole(user: AuthenticatedUser, roles: SystemRole[]): boolean {
    if (!user.role) {
      return false
    }

    // 🔥 MAPEAR ROL LEGACY A SISTEMA ENHANCED
    const userRole = this.mapLegacyRole(user.role)
    return roles.includes(userRole)
  }

  /**
   * Obtiene la jerarquía completa de un rol (rol + roles inferiores)
   */
  static getRoleHierarchy(role: SystemRole): SystemRole[] {
    const hierarchy = [role]
    const subRoles = ROLE_HIERARCHY[role] || []

    for (const subRole of subRoles) {
      hierarchy.push(...this.getRoleHierarchy(subRole))
    }

    return [...new Set(hierarchy)] // Eliminar duplicados
  }

  /**
   * Verifica permisos específicos por módulo
   */
  static hasPermission(
    user: AuthenticatedUser,
    module: keyof ModulePermissions,
    action: string
  ): boolean {
    if (!user.role) {
      return false
    }

    // 🔥 MAPEAR ROL LEGACY A SISTEMA ENHANCED
    const userRole = this.mapLegacyRole(user.role)
    const rolePermissions = ROLE_PERMISSIONS[userRole]

    if (!rolePermissions || !rolePermissions[module]) {
      return false
    }

    const modulePermissions = rolePermissions[module] as any
    return modulePermissions[action] === true
  }

  /**
   * Obtiene todos los permisos de un usuario
   */
  static getUserPermissions(
    user: AuthenticatedUser
  ): Partial<ModulePermissions> {
    if (!user.role) {
      return {}
    }

    // 🔥 MAPEAR ROL LEGACY A SISTEMA ENHANCED
    const userRole = this.mapLegacyRole(user.role)
    const directPermissions = ROLE_PERMISSIONS[userRole] || {}

    // Combinar permisos de la jerarquía
    const hierarchy = this.getRoleHierarchy(userRole)
    const combinedPermissions: Partial<ModulePermissions> = {}

    for (const role of hierarchy) {
      const rolePerms = ROLE_PERMISSIONS[role] || {}
      this.mergePermissions(combinedPermissions, rolePerms)
    }

    return combinedPermissions
  }

  /**
   * Combina permisos de múltiples roles
   */
  private static mergePermissions(
    target: Partial<ModulePermissions>,
    source: Partial<ModulePermissions>
  ): void {
    for (const [module, permissions] of Object.entries(source)) {
      if (!target[module as keyof ModulePermissions]) {
        target[module as keyof ModulePermissions] = {} as any
      }

      const targetModule = target[module as keyof ModulePermissions] as any
      const sourceModule = permissions as any

      for (const [action, value] of Object.entries(sourceModule)) {
        if (value === true) {
          targetModule[action] = true
        }
      }
    }
  }

  /**
   * Middleware factory para requerir rol específico
   */
  static requireRole(requiredRole: SystemRole) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.authUser

      if (!user) {
        return this.sendRoleError(
          res,
          {
            message: 'Usuario no autenticado',
            code: AuthErrorCode.AUTHENTICATION_FAILED
          },
          401
        )
      }

      if (!this.hasRole(user, requiredRole)) {
        return this.sendRoleError(
          res,
          {
            message: `Se requiere rol: ${requiredRole}`,
            code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
            details: `Usuario actual: ${user.role || 'sin rol'}`
          },
          403
        )
      }

      next()
    }
  }

  /**
   * Middleware factory para requerir cualquiera de varios roles
   */
  static requireAnyRole(roles: SystemRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.authUser

      if (!user) {
        return this.sendRoleError(
          res,
          {
            message: 'Usuario no autenticado',
            code: AuthErrorCode.AUTHENTICATION_FAILED
          },
          401
        )
      }

      if (!this.hasAnyRole(user, roles)) {
        return this.sendRoleError(
          res,
          {
            message: `Se requiere uno de los roles: ${roles.join(', ')}`,
            code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
            details: `Usuario actual: ${user.role || 'sin rol'}`
          },
          403
        )
      }

      next()
    }
  }

  /**
   * Middleware factory para requerir permiso específico
   */
  static requirePermission(module: keyof ModulePermissions, action: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.authUser

      if (!user) {
        return this.sendRoleError(
          res,
          {
            message: 'Usuario no autenticado',
            code: AuthErrorCode.AUTHENTICATION_FAILED
          },
          401
        )
      }

      if (!RoleMiddleware.hasPermission(user, module, action)) {
        return this.sendRoleError(
          res,
          {
            message: `Sin permisos para ${module}.${action}`,
            code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
            details: `Rol actual: ${user.role || 'sin rol'}`
          },
          403
        )
      }

      next()
    }
  }

  /**
   * Middleware para roles administrativos
   */
  static requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    return RoleMiddleware.requireAnyRole([
      SystemRole.ADMIN,
      SystemRole.SUPER_ADMIN
    ])(req, res, next)
  }

  /**
   * Middleware para roles de gestión
   */
  static requireManagement = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    return RoleMiddleware.requireAnyRole([
      SystemRole.MANAGER,
      SystemRole.ADMIN,
      SystemRole.SUPER_ADMIN
    ])(req, res, next)
  }

  /**
   * Middleware para roles de supervisión
   */
  static requireSupervision = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    return RoleMiddleware.requireAnyRole([
      SystemRole.SUPERVISOR,
      SystemRole.MANAGER,
      SystemRole.ADMIN,
      SystemRole.SUPER_ADMIN
    ])(req, res, next)
  }

  /**
   * Envía respuesta de error de roles
   */
  private static sendRoleError(
    res: Response,
    error: AuthError,
    statusCode: number
  ) {
    const response: AuthErrorResponse = {
      error: {
        ...error,
        timestamp: new Date()
      },
      success: false,
      statusCode
    }

    return res.status(statusCode).json(response)
  }
}

// ========================================
// EXPORTS PARA CONVENIENCIA
// ========================================

export const {
  requireRole,
  requireAnyRole,
  requirePermission,
  requireAdmin,
  requireManagement,
  requireSupervision
} = RoleMiddleware

export const {hasRole, hasAnyRole, hasPermission, getUserPermissions} =
  RoleMiddleware
