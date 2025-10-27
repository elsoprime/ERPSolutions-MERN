/**
 * @description Validadores específicos para autenticación
 * @module utils/authValidators
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

import type {Request, Response, NextFunction} from 'express'
import type {
  AuthenticatedUser,
  ValidationContext,
  UserValidationResult,
  AuthError,
  AuthErrorResponse
} from '../types/authTypes'
import {AuthErrorCode} from '../types/authTypes'

// ========================================
// VALIDADORES DE USUARIO
// ========================================

/**
 * Valida que el usuario tenga un rol específico
 */
export const validateUserRole = (
  user: AuthenticatedUser,
  requiredRole: string
): UserValidationResult => {
  if (!user.role || user.role !== requiredRole) {
    return {
      isValid: false,
      error: {
        message: `Se requiere rol: ${requiredRole}`,
        code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
        details: `Usuario tiene rol: ${user.role || 'ninguno'}`
      }
    }
  }

  return {isValid: true, user}
}

/**
 * Valida que el usuario tenga uno de los roles permitidos
 */
export const validateUserRoles = (
  user: AuthenticatedUser,
  allowedRoles: string[]
): UserValidationResult => {
  if (!user.role || !allowedRoles.includes(user.role)) {
    return {
      isValid: false,
      error: {
        message: `Se requiere uno de los roles: ${allowedRoles.join(', ')}`,
        code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
        details: `Usuario tiene rol: ${user.role || 'ninguno'}`
      }
    }
  }

  return {isValid: true, user}
}

/**
 * Valida que el usuario pertenezca a una empresa específica
 */
export const validateUserCompany = (
  user: AuthenticatedUser,
  requiredCompanyId: string
): UserValidationResult => {
  if (!user.companyId || user.companyId.toString() !== requiredCompanyId) {
    return {
      isValid: false,
      error: {
        message: 'Acceso denegado a esta empresa',
        code: AuthErrorCode.COMPANY_ACCESS_DENIED,
        details: `Usuario pertenece a empresa: ${user.companyId || 'ninguna'}`
      }
    }
  }

  return {isValid: true, user}
}

/**
 * Valida que el usuario esté confirmado
 */
export const validateUserConfirmed = (
  user: AuthenticatedUser
): UserValidationResult => {
  if (!user.confirmed) {
    return {
      isValid: false,
      error: {
        message: 'Cuenta no confirmada',
        code: AuthErrorCode.USER_NOT_CONFIRMED,
        details: 'Se requiere confirmar la cuenta para acceder a este recurso'
      }
    }
  }

  return {isValid: true, user}
}

/**
 * Valida que el usuario esté activo
 */
export const validateUserActive = (
  user: AuthenticatedUser
): UserValidationResult => {
  if (user.status !== 'active') {
    return {
      isValid: false,
      error: {
        message: 'Cuenta inactiva',
        code: AuthErrorCode.USER_INACTIVE,
        details: `Estado actual: ${user.status}`
      }
    }
  }

  return {isValid: true, user}
}

// ========================================
// MIDDLEWARE FACTORIES
// ========================================

/**
 * Crea middleware que requiere un rol específico
 */
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser

    if (!user) {
      return sendValidationError(
        res,
        {
          message: 'Usuario no autenticado',
          code: AuthErrorCode.AUTHENTICATION_FAILED
        },
        401
      )
    }

    const validation = validateUserRole(user, role)

    if (!validation.isValid) {
      return sendValidationError(res, validation.error!, 403)
    }

    next()
  }
}

/**
 * Crea middleware que requiere uno de varios roles
 */
export const requireAnyRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser

    if (!user) {
      return sendValidationError(
        res,
        {
          message: 'Usuario no autenticado',
          code: AuthErrorCode.AUTHENTICATION_FAILED
        },
        401
      )
    }

    const validation = validateUserRoles(user, roles)

    if (!validation.isValid) {
      return sendValidationError(res, validation.error!, 403)
    }

    next()
  }
}

/**
 * Crea middleware que requiere pertenencia a una empresa
 */
export const requireCompany = (companyId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser

    if (!user) {
      return sendValidationError(
        res,
        {
          message: 'Usuario no autenticado',
          code: AuthErrorCode.AUTHENTICATION_FAILED
        },
        401
      )
    }

    const validation = validateUserCompany(user, companyId)

    if (!validation.isValid) {
      return sendValidationError(res, validation.error!, 403)
    }

    next()
  }
}

/**
 * Crea middleware que requiere pertenencia a la empresa del parámetro
 */
export const requireCompanyFromParam = (paramName: string = 'companyId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser
    const companyId = req.params[paramName]

    if (!user) {
      return sendValidationError(
        res,
        {
          message: 'Usuario no autenticado',
          code: AuthErrorCode.AUTHENTICATION_FAILED
        },
        401
      )
    }

    if (!companyId) {
      return sendValidationError(
        res,
        {
          message: `Parámetro ${paramName} requerido`,
          code: AuthErrorCode.INSUFFICIENT_PERMISSIONS
        },
        400
      )
    }

    const validation = validateUserCompany(user, companyId)

    if (!validation.isValid) {
      return sendValidationError(res, validation.error!, 403)
    }

    next()
  }
}

/**
 * Middleware que requiere cuenta confirmada
 */
export const requireConfirmedAccount = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.authUser

  if (!user) {
    return sendValidationError(
      res,
      {
        message: 'Usuario no autenticado',
        code: AuthErrorCode.AUTHENTICATION_FAILED
      },
      401
    )
  }

  const validation = validateUserConfirmed(user)

  if (!validation.isValid) {
    return sendValidationError(res, validation.error!, 403)
  }

  next()
}

/**
 * Middleware que requiere cuenta activa
 */
export const requireActiveAccount = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.authUser

  if (!user) {
    return sendValidationError(
      res,
      {
        message: 'Usuario no autenticado',
        code: AuthErrorCode.AUTHENTICATION_FAILED
      },
      401
    )
  }

  const validation = validateUserActive(user)

  if (!validation.isValid) {
    return sendValidationError(res, validation.error!, 403)
  }

  next()
}

// ========================================
// VALIDADORES COMBINADOS
// ========================================

/**
 * Valida múltiples condiciones de usuario
 */
export const validateUserConditions = (
  user: AuthenticatedUser,
  context: ValidationContext
): UserValidationResult => {
  // Validar confirmación si es requerida
  if (!context.skipConfirmationCheck) {
    const confirmationResult = validateUserConfirmed(user)
    if (!confirmationResult.isValid) {
      return confirmationResult
    }
  }

  // Validar estado si es requerido
  if (!context.skipStatusCheck) {
    const statusResult = validateUserActive(user)
    if (!statusResult.isValid) {
      return statusResult
    }
  }

  // Validar rol si es requerido
  if (context.requiredRole) {
    const roleResult = validateUserRole(user, context.requiredRole)
    if (!roleResult.isValid) {
      return roleResult
    }
  }

  // Validar empresa si es requerida
  if (context.requiredCompany) {
    const companyResult = validateUserCompany(user, context.requiredCompany)
    if (!companyResult.isValid) {
      return companyResult
    }
  }

  return {isValid: true, user}
}

/**
 * Crea middleware con validaciones personalizadas
 */
export const createCustomValidator = (context: ValidationContext) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser

    if (!user) {
      return sendValidationError(
        res,
        {
          message: 'Usuario no autenticado',
          code: AuthErrorCode.AUTHENTICATION_FAILED
        },
        401
      )
    }

    const validation = validateUserConditions(user, context)

    if (!validation.isValid) {
      return sendValidationError(res, validation.error!, 403)
    }

    next()
  }
}

// ========================================
// VALIDADORES DE RECURSOS
// ========================================

/**
 * Valida que el usuario pueda acceder a un recurso específico
 * (ejemplo: solo el propietario o admin)
 */
export const requireResourceOwnership = (
  getUserIdFromResource: (req: Request) => string | null,
  allowAdmins: boolean = true
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser

    if (!user) {
      return sendValidationError(
        res,
        {
          message: 'Usuario no autenticado',
          code: AuthErrorCode.AUTHENTICATION_FAILED
        },
        401
      )
    }

    // Si se permiten admins y el usuario es admin
    if (allowAdmins && (user.role === 'admin' || user.role === 'superadmin')) {
      return next()
    }

    // Obtener ID del propietario del recurso
    const resourceOwnerId = getUserIdFromResource(req)

    if (!resourceOwnerId) {
      return sendValidationError(
        res,
        {
          message: 'No se pudo determinar la propiedad del recurso',
          code: AuthErrorCode.INSUFFICIENT_PERMISSIONS
        },
        400
      )
    }

    if (user.id !== resourceOwnerId) {
      return sendValidationError(
        res,
        {
          message: 'No tienes permisos para acceder a este recurso',
          code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
          details: 'Solo el propietario puede acceder a este recurso'
        },
        403
      )
    }

    next()
  }
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Envía respuesta de error de validación
 */
const sendValidationError = (
  res: Response,
  error: AuthError,
  statusCode: number
) => {
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

/**
 * Verifica si el usuario tiene al menos uno de los roles especificados
 */
export const hasAnyRole = (
  user: AuthenticatedUser,
  roles: string[]
): boolean => {
  return user.role ? roles.includes(user.role) : false
}

/**
 * Verifica si el usuario pertenece a la empresa especificada
 */
export const belongsToCompany = (
  user: AuthenticatedUser,
  companyId: string
): boolean => {
  return user.companyId ? user.companyId.toString() === companyId : false
}

/**
 * Verifica si el usuario es propietario del recurso
 */
export const isResourceOwner = (
  user: AuthenticatedUser,
  resourceOwnerId: string
): boolean => {
  return user.id === resourceOwnerId
}

/**
 * Verifica si el usuario tiene privilegios de administrador
 */
export const isAdmin = (user: AuthenticatedUser): boolean => {
  return hasAnyRole(user, ['admin', 'superadmin'])
}
