/**
 * @traductor Middleware de autenticación
 * @module middleware/authMiddleware
 * @description Middleware para manejar la autenticación de usuarios
 * @requires express
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

import type {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import EnhancedUser, {IUser} from '../models/EnhancedUser'
import type {
  AuthenticatedUser,
  AuthError,
  AuthErrorResponse,
  AuthMiddlewareConfig
} from '../types/authTypes'
import {AuthErrorCode, DEFAULT_AUTH_CONFIG} from '../types/authTypes'
import {
  verifyJWT,
  extractTokenFromHeader,
  isTokenBlacklisted
} from '../utils/jwtUtils'
import {
  getUserCache,
  createCacheEntry,
  generateCacheKey
} from '../utils/memoryCache'

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export class authMiddleware {
  // Configuración del middleware
  private static config: AuthMiddlewareConfig = DEFAULT_AUTH_CONFIG
  private static cache = getUserCache()

  /**
   * @description Middleware para proteger rutas que requieren autenticación
   * @param req Objeto de solicitud de Express
   * @param res Objeto de respuesta de Express
   * @param next Función para pasar al siguiente middleware
   */
  static async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extraer token del header
      const authHeader = req.headers.authorization
      const token = extractTokenFromHeader(authHeader)

      if (!token) {
        return authMiddleware.sendErrorResponse(
          res,
          {
            message: 'Token de acceso requerido',
            code: AuthErrorCode.TOKEN_MISSING
          },
          401
        )
      }

      // 2. Verificar si el token está en blacklist
      if (isTokenBlacklisted(token)) {
        return authMiddleware.sendErrorResponse(
          res,
          {
            message: 'Token invalidado',
            code: AuthErrorCode.TOKEN_INVALID
          },
          401
        )
      }

      // 3. Verificar y decodificar el token
      const verificationResult = verifyJWT(token)

      if (!verificationResult.isValid || !verificationResult.payload) {
        return authMiddleware.sendErrorResponse(
          res,
          verificationResult.error || {
            message: 'Token inválido',
            code: AuthErrorCode.TOKEN_INVALID
          },
          401
        )
      }

      const {payload} = verificationResult
      const userId = payload.id

      // 4. Intentar obtener usuario del cache
      let authenticatedUser: AuthenticatedUser | null = null

      if (authMiddleware.config.cacheEnabled) {
        const cacheKey = generateCacheKey(userId)
        const cachedEntry = await authMiddleware.cache.get(cacheKey)

        if (cachedEntry) {
          authenticatedUser = cachedEntry.user

          if (authMiddleware.config.logAuthAttempts) {
            console.log(
              `Usuario autenticado desde cache: ${authenticatedUser.email}`
            )
          }
        }
      }

      // 5. Si no está en cache, buscar en base de datos
      if (!authenticatedUser) {
        const user = await EnhancedUser.findById(userId)

        if (!user) {
          return authMiddleware.sendErrorResponse(
            res,
            {
              message: 'Usuario no encontrado',
              code: AuthErrorCode.USER_NOT_FOUND
            },
            404
          )
        }

        // 6. Validar estado del usuario
        const userValidation = authMiddleware.validateUserStatus(user)
        if (!userValidation.isValid) {
          return authMiddleware.sendErrorResponse(
            res,
            userValidation.error!,
            403
          )
        }

        // 7. Crear usuario autenticado
        authenticatedUser = authMiddleware.createAuthenticatedUser(
          user,
          payload
        )

        // 8. Guardar en cache si está habilitado
        if (authMiddleware.config.cacheEnabled) {
          const cacheKey = generateCacheKey(userId)
          const cacheEntry = createCacheEntry(
            authenticatedUser,
            authMiddleware.config.cacheTTL
          )
          await authMiddleware.cache.set(cacheKey, cacheEntry)
        }

        if (authMiddleware.config.logAuthAttempts) {
          console.log(
            `Usuario autenticado desde DB: ${authenticatedUser.email}`
          )
        }
      }

      // 9. Inyectar usuario autenticado en request
      req.authUser = authenticatedUser

      next()
    } catch (error) {
      console.error('Error en middleware de autenticación:', error)

      return authMiddleware.sendErrorResponse(
        res,
        {
          message: 'Error interno de autenticación',
          code: AuthErrorCode.INTERNAL_ERROR,
          details: error?.message || 'Error desconocido'
        },
        500
      )
    }
  }

  /**
   * Validar el estado del usuario
   */
  private static validateUserStatus(user: IUser) {
    if (authMiddleware.config.requireConfirmedUser && !user.confirmed) {
      return {
        isValid: false,
        error: {
          message: 'Cuenta no confirmada',
          code: AuthErrorCode.USER_NOT_CONFIRMED
        }
      }
    }

    if (
      authMiddleware.config.validateUserStatus &&
      (user.status === 'inactive' || user.status === 'suspended')
    ) {
      return {
        isValid: false,
        error: {
          message: 'Cuenta inactiva o suspendida',
          code: AuthErrorCode.USER_INACTIVE
        }
      }
    }

    return {isValid: true}
  }

  /**
   * Crear objeto de usuario autenticado sin datos sensibles
   */
  private static createAuthenticatedUser(
    user: IUser,
    payload: any
  ): AuthenticatedUser {
    // Obtener el rol primario activo del usuario
    const primaryRole = user.roles.find(role => role.isActive)
    const userRole = primaryRole ? primaryRole.role : 'viewer'
    const isGlobalRole = primaryRole?.roleType === 'global'

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      status: user.status || 'active',
      confirmed: user.confirmed,
      role: userRole,
      roleType: primaryRole?.roleType || 'company',
      companyId: isGlobalRole ? null : user.primaryCompanyId,
      companies: user.getAllCompanies(),
      hasGlobalRole: user.hasGlobalRole(),
      iat: payload.iat,
      exp: payload.exp
    }
  }

  /**
   * Enviar respuesta de error estructurada
   */
  private static sendErrorResponse(
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

  /**
   * Configurar el middleware
   */
  static configure(config: Partial<AuthMiddlewareConfig>) {
    authMiddleware.config = {...authMiddleware.config, ...config}
  }

  /**
   * Obtener configuración actual
   */
  static getConfig(): AuthMiddlewareConfig {
    return {...authMiddleware.config}
  }

  /**
   * Limpiar cache de usuario específico
   */
  static async clearUserCache(userId: string) {
    if (authMiddleware.config.cacheEnabled) {
      const cacheKey = generateCacheKey(userId)
      await authMiddleware.cache.delete(cacheKey)
    }
  }

  /**
   * Limpiar todo el cache
   */
  static async clearAllCache() {
    if (authMiddleware.config.cacheEnabled) {
      await authMiddleware.cache.clear()
    }
  }
}
