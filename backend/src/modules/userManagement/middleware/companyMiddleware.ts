/**
 * @description Middleware multi-tenant para gestión por empresa
 * @module middleware/companyMiddleware
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

import type {Request, Response, NextFunction} from 'express'
import type {
  AuthenticatedUser,
  AuthError,
  AuthErrorResponse
} from '../types/authTypes'
import {AuthErrorCode} from '../types/authTypes'
import mongoose from 'mongoose'

// ========================================
// TIPOS PARA MULTI-TENANCY
// ========================================

/**
 * Configuración de acceso por empresa
 */
export interface CompanyAccess {
  companyId: string
  role: string
  permissions: string[]
  isActive: boolean
  joinedAt: Date
  lastAccess?: Date
}

/**
 * Usuario con acceso a múltiples empresas
 */
export interface MultiTenantUser extends AuthenticatedUser {
  companies: CompanyAccess[]
  currentCompany?: string
}

/**
 * Contexto de empresa para la solicitud
 */
export interface CompanyContext {
  companyId: string
  companyName?: string
  userRole: string
  userPermissions: string[]
  isOwner: boolean
  isActive: boolean
}

/**
 * Configuración del middleware de empresa
 */
export interface CompanyMiddlewareConfig {
  enforceCompanyAccess: boolean
  allowSuperAdminBypass: boolean
  cacheCompanyData: boolean
  logCompanyAccess: boolean
}

// ========================================
// CONFIGURACIÓN DEFAULT
// ========================================

const DEFAULT_COMPANY_CONFIG: CompanyMiddlewareConfig = {
  enforceCompanyAccess: true,
  allowSuperAdminBypass: true,
  cacheCompanyData: true,
  logCompanyAccess: true
}

// ========================================
// CLASE PRINCIPAL MULTI-TENANT
// ========================================

export class CompanyMiddleware {
  private static config: CompanyMiddlewareConfig = DEFAULT_COMPANY_CONFIG

  /**
   * Verifica si un usuario tiene acceso a una empresa específica
   */
  static hasCompanyAccess(user: AuthenticatedUser, companyId: string): boolean {
    // Super admin bypass si está configurado
    if (this.config.allowSuperAdminBypass && user.role === 'superadmin') {
      return true
    }

    // Verificar companyId del usuario
    if (user.companyId && user.companyId.toString() === companyId) {
      return true
    }

    // Si el usuario tiene acceso multi-empresa (extensión futura)
    const multiUser = user as MultiTenantUser
    if (multiUser.companies) {
      return multiUser.companies.some(
        company => company.companyId === companyId && company.isActive
      )
    }

    return false
  }

  /**
   * Obtiene el contexto de empresa para un usuario
   */
  static getCompanyContext(
    user: AuthenticatedUser,
    companyId: string
  ): CompanyContext | null {
    if (!this.hasCompanyAccess(user, companyId)) {
      return null
    }

    // Para super admin
    if (user.role === 'superadmin') {
      return {
        companyId,
        userRole: 'superadmin',
        userPermissions: ['*'], // Todos los permisos
        isOwner: true,
        isActive: true
      }
    }

    // Para usuario con companyId directo
    if (user.companyId && user.companyId.toString() === companyId) {
      return {
        companyId,
        userRole: user.role || 'user',
        userPermissions: [], // Se pueden agregar permisos específicos
        isOwner: user.role === 'admin' || user.role === 'owner',
        isActive: true
      }
    }

    // Para acceso multi-empresa (extensión futura)
    const multiUser = user as MultiTenantUser
    if (multiUser.companies) {
      const companyAccess = multiUser.companies.find(
        company => company.companyId === companyId && company.isActive
      )

      if (companyAccess) {
        return {
          companyId,
          userRole: companyAccess.role,
          userPermissions: companyAccess.permissions,
          isOwner:
            companyAccess.role === 'owner' || companyAccess.role === 'admin',
          isActive: companyAccess.isActive
        }
      }
    }

    return null
  }

  /**
   * Middleware factory para requerir acceso a empresa específica
   */
  static requireCompanyAccess(companyId: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.authUser

      if (!user) {
        return this.sendCompanyError(
          res,
          {
            message: 'Usuario no autenticado',
            code: AuthErrorCode.AUTHENTICATION_FAILED
          },
          401
        )
      }

      if (!this.hasCompanyAccess(user, companyId)) {
        return this.sendCompanyError(
          res,
          {
            message: `Sin acceso a la empresa: ${companyId}`,
            code: AuthErrorCode.COMPANY_ACCESS_DENIED,
            details: `Usuario pertenece a: ${
              user.companyId || 'ninguna empresa'
            }`
          },
          403
        )
      }

      // Agregar contexto de empresa al request
      const companyContext = this.getCompanyContext(user, companyId)
      if (companyContext) {
        ;(req as any).companyContext = companyContext
      }

      if (this.config.logCompanyAccess) {
        console.log(
          `Acceso autorizado a empresa ${companyId} para usuario ${user.id}`
        )
      }

      next()
    }
  }

  /**
   * Middleware para requerir acceso a empresa desde parámetro de URL
   */
  static requireCompanyFromParam(paramName: string = 'companyId') {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.authUser
      const companyId = req.params[paramName]

      if (!user) {
        return this.sendCompanyError(
          res,
          {
            message: 'Usuario no autenticado',
            code: AuthErrorCode.AUTHENTICATION_FAILED
          },
          401
        )
      }

      if (!companyId) {
        return this.sendCompanyError(
          res,
          {
            message: `Parámetro de empresa '${paramName}' requerido`,
            code: AuthErrorCode.COMPANY_ACCESS_DENIED
          },
          400
        )
      }

      if (!this.hasCompanyAccess(user, companyId)) {
        return this.sendCompanyError(
          res,
          {
            message: `Sin acceso a la empresa solicitada`,
            code: AuthErrorCode.COMPANY_ACCESS_DENIED,
            details: `Usuario pertenece a: ${
              user.companyId || 'ninguna empresa'
            }`
          },
          403
        )
      }

      // Agregar contexto de empresa al request
      const companyContext = this.getCompanyContext(user, companyId)
      if (companyContext) {
        ;(req as any).companyContext = companyContext
      }

      if (this.config.logCompanyAccess) {
        console.log(
          `Acceso autorizado a empresa ${companyId} para usuario ${user.id}`
        )
      }

      next()
    }
  }

  /**
   * Middleware para requerir acceso a empresa desde header
   */
  static requireCompanyFromHeader(headerName: string = 'x-company-id') {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.authUser
      const companyId = req.headers[headerName] as string

      if (!user) {
        return this.sendCompanyError(
          res,
          {
            message: 'Usuario no autenticado',
            code: AuthErrorCode.AUTHENTICATION_FAILED
          },
          401
        )
      }

      if (!companyId) {
        return this.sendCompanyError(
          res,
          {
            message: `Header '${headerName}' requerido`,
            code: AuthErrorCode.COMPANY_ACCESS_DENIED
          },
          400
        )
      }

      if (!this.hasCompanyAccess(user, companyId)) {
        return this.sendCompanyError(
          res,
          {
            message: `Sin acceso a la empresa solicitada`,
            code: AuthErrorCode.COMPANY_ACCESS_DENIED,
            details: `Usuario pertenece a: ${
              user.companyId || 'ninguna empresa'
            }`
          },
          403
        )
      }

      // Agregar contexto de empresa al request
      const companyContext = this.getCompanyContext(user, companyId)
      if (companyContext) {
        ;(req as any).companyContext = companyContext
      }

      if (this.config.logCompanyAccess) {
        console.log(
          `Acceso autorizado a empresa ${companyId} para usuario ${user.id}`
        )
      }

      next()
    }
  }

  /**
   * Middleware para requerir que el usuario sea propietario/admin de la empresa
   */
  static requireCompanyOwnership() {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.authUser
      const companyContext = (req as any).companyContext as CompanyContext

      if (!user) {
        return this.sendCompanyError(
          res,
          {
            message: 'Usuario no autenticado',
            code: AuthErrorCode.AUTHENTICATION_FAILED
          },
          401
        )
      }

      if (!companyContext) {
        return this.sendCompanyError(
          res,
          {
            message: 'Contexto de empresa no establecido',
            code: AuthErrorCode.COMPANY_ACCESS_DENIED
          },
          400
        )
      }

      if (!companyContext.isOwner) {
        return this.sendCompanyError(
          res,
          {
            message: 'Se requieren permisos de propietario/admin de la empresa',
            code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
            details: `Rol actual en empresa: ${companyContext.userRole}`
          },
          403
        )
      }

      next()
    }
  }

  /**
   * Middleware para validar que la empresa esté activa
   */
  static requireActiveCompany() {
    return (req: Request, res: Response, next: NextFunction) => {
      const companyContext = (req as any).companyContext as CompanyContext

      if (!companyContext) {
        return this.sendCompanyError(
          res,
          {
            message: 'Contexto de empresa no establecido',
            code: AuthErrorCode.COMPANY_ACCESS_DENIED
          },
          400
        )
      }

      if (!companyContext.isActive) {
        return this.sendCompanyError(
          res,
          {
            message: 'La empresa no está activa',
            code: AuthErrorCode.COMPANY_ACCESS_DENIED,
            details: `Empresa: ${companyContext.companyId}`
          },
          403
        )
      }

      next()
    }
  }

  /**
   * Middleware combinado para casos comunes
   */
  static requireCompanyAccessFromParam(
    paramName: string = 'companyId',
    requireOwnership: boolean = false,
    requireActive: boolean = true
  ) {
    return [
      this.requireCompanyFromParam(paramName),
      ...(requireActive ? [this.requireActiveCompany()] : []),
      ...(requireOwnership ? [this.requireCompanyOwnership()] : [])
    ]
  }

  /**
   * Verifica permisos específicos en el contexto de empresa
   */
  static hasCompanyPermission(
    companyContext: CompanyContext,
    permission: string
  ): boolean {
    // Super admin tiene todos los permisos
    if (companyContext.userRole === 'superadmin') {
      return true
    }

    // Verificar permisos específicos
    return (
      companyContext.userPermissions.includes(permission) ||
      companyContext.userPermissions.includes('*')
    )
  }

  /**
   * Middleware factory para requerir permiso específico en empresa
   */
  static requireCompanyPermission(permission: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const companyContext = (req as any).companyContext as CompanyContext

      if (!companyContext) {
        return this.sendCompanyError(
          res,
          {
            message: 'Contexto de empresa no establecido',
            code: AuthErrorCode.COMPANY_ACCESS_DENIED
          },
          400
        )
      }

      if (!this.hasCompanyPermission(companyContext, permission)) {
        return this.sendCompanyError(
          res,
          {
            message: `Sin permiso '${permission}' en esta empresa`,
            code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
            details: `Rol: ${
              companyContext.userRole
            }, Permisos: ${companyContext.userPermissions.join(', ')}`
          },
          403
        )
      }

      next()
    }
  }

  /**
   * Obtiene lista de empresas accesibles por el usuario
   */
  static getUserCompanies(user: AuthenticatedUser): string[] {
    const companies: string[] = []

    // Empresa principal
    if (user.companyId) {
      companies.push(user.companyId.toString())
    }

    // Empresas adicionales (multi-tenant)
    const multiUser = user as MultiTenantUser
    if (multiUser.companies) {
      companies.push(
        ...multiUser.companies
          .filter(company => company.isActive)
          .map(company => company.companyId)
      )
    }

    return [...new Set(companies)] // Eliminar duplicados
  }

  /**
   * Configura el middleware
   */
  static configure(config: Partial<CompanyMiddlewareConfig>) {
    this.config = {...this.config, ...config}
  }

  /**
   * Obtiene configuración actual
   */
  static getConfig(): CompanyMiddlewareConfig {
    return {...this.config}
  }

  /**
   * Envía respuesta de error de empresa
   */
  private static sendCompanyError(
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
  requireCompanyAccess,
  requireCompanyFromParam,
  requireCompanyFromHeader,
  requireCompanyOwnership,
  requireActiveCompany,
  requireCompanyAccessFromParam,
  requireCompanyPermission
} = CompanyMiddleware

export const {
  hasCompanyAccess,
  getCompanyContext,
  hasCompanyPermission,
  getUserCompanies
} = CompanyMiddleware

// ========================================
// UTILIDADES ADICIONALES
// ========================================

/**
 * Valida formato de ObjectId para companyId
 */
export const isValidCompanyId = (companyId: string): boolean => {
  return mongoose.Types.ObjectId.isValid(companyId)
}

/**
 * Middleware para validar formato de companyId en parámetros
 */
export const validateCompanyIdParam = (paramName: string = 'companyId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.params[paramName]

    if (!companyId) {
      return res.status(400).json({
        error: {
          message: `Parámetro '${paramName}' requerido`,
          code: 'MISSING_COMPANY_ID'
        }
      })
    }

    if (!isValidCompanyId(companyId)) {
      return res.status(400).json({
        error: {
          message: `Formato inválido para '${paramName}'`,
          code: 'INVALID_COMPANY_ID_FORMAT'
        }
      })
    }

    next()
  }
}
