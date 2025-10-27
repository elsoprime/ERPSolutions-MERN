/**
 * @description Sistema de rate limiting por usuario para prevenir ataques
 * @module middleware/rateLimitMiddleware
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
// TIPOS PARA RATE LIMITING
// ========================================

/**
 * Configuración de límites por endpoint
 */
export interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en ms
  maxRequests: number // Máximo de requests en la ventana
  message?: string // Mensaje personalizado
  skipSuccessfulRequests?: boolean // No contar requests exitosos
  skipFailedRequests?: boolean // No contar requests fallidos
  keyGenerator?: (req: Request) => string // Generador de clave personalizado
}

/**
 * Límites específicos por tipo de usuario
 */
export interface UserRateLimits {
  guest: RateLimitConfig
  user: RateLimitConfig
  employee: RateLimitConfig
  admin: RateLimitConfig
  superadmin: RateLimitConfig
}

/**
 * Entrada del contador de rate limiting
 */
export interface RateLimitEntry {
  count: number
  firstRequest: number // Timestamp del primer request
  lastRequest: number // Timestamp del último request
  resetTime: number // Timestamp cuando se resetea
}

/**
 * Información de rate limiting para response
 */
export interface RateLimitInfo {
  limit: number // Límite máximo
  remaining: number // Requests restantes
  reset: number // Timestamp de reset
  retryAfter?: number // Segundos para reintentar
}

// ========================================
// CONFIGURACIONES PREDEFINIDAS
// ========================================

/**
 * Límites por defecto para diferentes tipos de endpoints
 */
export const DEFAULT_RATE_LIMITS = {
  // Endpoints de autenticación (más restrictivos)
  auth: {
    guest: {windowMs: 15 * 60 * 1000, maxRequests: 5}, // 5 intentos en 15 min
    user: {windowMs: 15 * 60 * 1000, maxRequests: 10}, // 10 intentos en 15 min
    employee: {windowMs: 15 * 60 * 1000, maxRequests: 15},
    admin: {windowMs: 15 * 60 * 1000, maxRequests: 20},
    superadmin: {windowMs: 15 * 60 * 1000, maxRequests: 50}
  },

  // Endpoints de API general
  api: {
    guest: {windowMs: 15 * 60 * 1000, maxRequests: 100},
    user: {windowMs: 15 * 60 * 1000, maxRequests: 1000},
    employee: {windowMs: 15 * 60 * 1000, maxRequests: 2000},
    admin: {windowMs: 15 * 60 * 1000, maxRequests: 5000},
    superadmin: {windowMs: 15 * 60 * 1000, maxRequests: 10000}
  },

  // Endpoints críticos (muy restrictivos)
  critical: {
    guest: {windowMs: 60 * 60 * 1000, maxRequests: 1}, // 1 por hora
    user: {windowMs: 60 * 60 * 1000, maxRequests: 5},
    employee: {windowMs: 60 * 60 * 1000, maxRequests: 10},
    admin: {windowMs: 60 * 60 * 1000, maxRequests: 50},
    superadmin: {windowMs: 60 * 60 * 1000, maxRequests: 100}
  },

  // Endpoints de upload/descarga
  files: {
    guest: {windowMs: 15 * 60 * 1000, maxRequests: 10},
    user: {windowMs: 15 * 60 * 1000, maxRequests: 50},
    employee: {windowMs: 15 * 60 * 1000, maxRequests: 100},
    admin: {windowMs: 15 * 60 * 1000, maxRequests: 500},
    superadmin: {windowMs: 15 * 60 * 1000, maxRequests: 1000}
  }
}

// ========================================
// ALMACENAMIENTO EN MEMORIA
// ========================================

/**
 * Store en memoria para rate limiting (en producción usar Redis)
 */
class MemoryRateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpiar entradas expiradas cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Incrementa el contador para una clave
   */
  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now()
    const resetTime = now + windowMs

    const existing = this.store.get(key)

    if (existing && now < existing.resetTime) {
      // Dentro de la ventana actual, incrementar
      existing.count++
      existing.lastRequest = now
      return existing
    } else {
      // Nueva ventana o primera vez
      const newEntry: RateLimitEntry = {
        count: 1,
        firstRequest: now,
        lastRequest: now,
        resetTime
      }
      this.store.set(key, newEntry)
      return newEntry
    }
  }

  /**
   * Obtiene entrada sin incrementar
   */
  get(key: string): RateLimitEntry | null {
    const entry = this.store.get(key)
    if (entry && Date.now() >= entry.resetTime) {
      this.store.delete(key)
      return null
    }
    return entry || null
  }

  /**
   * Elimina entrada específica
   */
  delete(key: string): void {
    this.store.delete(key)
  }

  /**
   * Limpia entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Obtiene estadísticas del store
   */
  getStats() {
    return {
      totalKeys: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        count: entry.count,
        remaining: Math.max(0, entry.resetTime - Date.now())
      }))
    }
  }

  /**
   * Destruye el store
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

// ========================================
// CLASE PRINCIPAL DE RATE LIMITING
// ========================================

export class RateLimitMiddleware {
  private static store = new MemoryRateLimitStore()
  private static config = {
    trustProxy: false,
    logBlocked: true,
    addHeaders: true
  }

  /**
   * Obtiene la clave para rate limiting
   */
  private static getKey(req: Request, identifier: string): string {
    const ip = this.getClientIP(req)
    return `${identifier}:${ip}`
  }

  /**
   * Obtiene IP del cliente
   */
  private static getClientIP(req: Request): string {
    if (this.config.trustProxy) {
      return (
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        (req.headers['x-real-ip'] as string) ||
        req.connection.remoteAddress ||
        'unknown'
      )
    }
    return req.connection.remoteAddress || 'unknown'
  }

  /**
   * Obtiene el rol del usuario para determinar límites
   */
  private static getUserRole(req: Request): string {
    const user = req.authUser
    if (!user) return 'guest'

    return user.role || 'user'
  }

  /**
   * Obtiene la configuración de límites para un usuario
   */
  private static getRateLimitConfig(
    userRole: string,
    limits: UserRateLimits
  ): RateLimitConfig {
    const roleLimits = limits[userRole as keyof UserRateLimits]
    return roleLimits || limits.guest // Fallback a guest
  }

  /**
   * Agrega headers de rate limiting a la respuesta
   */
  private static addRateLimitHeaders(res: Response, info: RateLimitInfo): void {
    if (!this.config.addHeaders) return

    res.set({
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': Math.max(0, info.remaining).toString(),
      'X-RateLimit-Reset': new Date(info.reset).toISOString()
    })

    if (info.retryAfter) {
      res.set('Retry-After', info.retryAfter.toString())
    }
  }

  /**
   * Middleware factory para rate limiting con configuración personalizada
   */
  static createRateLimit(limits: UserRateLimits, identifier?: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = this.getUserRole(req)
      const config = this.getRateLimitConfig(userRole, limits)

      // Generar clave única
      const key = identifier
        ? this.getKey(req, identifier)
        : this.getKey(req, `${req.method}:${req.route?.path || req.path}`)

      // Incrementar contador
      const entry = this.store.increment(key, config.windowMs)

      // Calcular información de rate limiting
      const now = Date.now()
      const info: RateLimitInfo = {
        limit: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - entry.count),
        reset: entry.resetTime
      }

      // Agregar headers
      this.addRateLimitHeaders(res, info)

      // Verificar si se excedió el límite
      if (entry.count > config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
        info.retryAfter = retryAfter

        if (this.config.logBlocked) {
          console.warn(
            `Rate limit exceeded for key: ${key}, count: ${entry.count}, limit: ${config.maxRequests}`
          )
        }

        // Agregar header de retry
        res.set('Retry-After', retryAfter.toString())

        return res.status(429).json({
          error: {
            message:
              config.message || 'Demasiadas solicitudes, intente más tarde',
            code: AuthErrorCode.RATE_LIMIT_EXCEEDED,
            retryAfter,
            limit: config.maxRequests,
            resetTime: new Date(entry.resetTime).toISOString()
          },
          success: false,
          statusCode: 429
        } as AuthErrorResponse)
      }

      next()
    }
  }

  /**
   * Rate limiting para endpoints de autenticación
   */
  static authRateLimit = this.createRateLimit(DEFAULT_RATE_LIMITS.auth, 'auth')

  /**
   * Rate limiting para API general
   */
  static apiRateLimit = this.createRateLimit(DEFAULT_RATE_LIMITS.api, 'api')

  /**
   * Rate limiting para endpoints críticos
   */
  static criticalRateLimit = this.createRateLimit(
    DEFAULT_RATE_LIMITS.critical,
    'critical'
  )

  /**
   * Rate limiting para archivos
   */
  static fileRateLimit = this.createRateLimit(
    DEFAULT_RATE_LIMITS.files,
    'files'
  )

  /**
   * Rate limiting estricto para login
   */
  static loginRateLimit = this.createRateLimit(
    {
      guest: {windowMs: 15 * 60 * 1000, maxRequests: 3}, // 3 intentos en 15 min
      user: {windowMs: 15 * 60 * 1000, maxRequests: 5}, // 5 intentos en 15 min
      employee: {windowMs: 15 * 60 * 1000, maxRequests: 8},
      admin: {windowMs: 15 * 60 * 1000, maxRequests: 10},
      superadmin: {windowMs: 15 * 60 * 1000, maxRequests: 20}
    },
    'login'
  )

  /**
   * Rate limiting para creación de cuentas
   */
  static signupRateLimit = this.createRateLimit(
    {
      guest: {windowMs: 60 * 60 * 1000, maxRequests: 3}, // 3 cuentas por hora
      user: {windowMs: 60 * 60 * 1000, maxRequests: 5},
      employee: {windowMs: 60 * 60 * 1000, maxRequests: 10},
      admin: {windowMs: 60 * 60 * 1000, maxRequests: 20},
      superadmin: {windowMs: 60 * 60 * 1000, maxRequests: 50}
    },
    'signup'
  )

  /**
   * Rate limiting por IP (sin autenticación)
   */
  static createIPRateLimit(
    windowMs: number,
    maxRequests: number,
    message?: string
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = this.getClientIP(req)
      const key = `ip:${ip}`

      const entry = this.store.increment(key, windowMs)

      const info: RateLimitInfo = {
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - entry.count),
        reset: entry.resetTime
      }

      this.addRateLimitHeaders(res, info)

      if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000)

        if (this.config.logBlocked) {
          console.warn(
            `IP rate limit exceeded for: ${ip}, count: ${entry.count}`
          )
        }

        res.set('Retry-After', retryAfter.toString())

        return res.status(429).json({
          error: {
            message: message || 'Demasiadas solicitudes desde esta IP',
            code: AuthErrorCode.IP_RATE_LIMIT_EXCEEDED,
            retryAfter,
            resetTime: new Date(entry.resetTime).toISOString()
          },
          success: false,
          statusCode: 429
        })
      }

      next()
    }
  }

  /**
   * Rate limiting global por IP
   */
  static globalIPLimit = this.createIPRateLimit(
    15 * 60 * 1000, // 15 minutos
    1000, // 1000 requests
    'Demasiadas solicitudes desde esta dirección IP'
  )

  /**
   * Rate limiting estricto por IP para endpoints sensibles
   */
  static strictIPLimit = this.createIPRateLimit(
    60 * 60 * 1000, // 1 hora
    100, // 100 requests
    'Límite estricto excedido para esta IP'
  )

  /**
   * Configura el middleware
   */
  static configure(config: Partial<typeof RateLimitMiddleware.config>) {
    this.config = {...this.config, ...config}
  }

  /**
   * Obtiene estadísticas del rate limiting
   */
  static getStats() {
    return this.store.getStats()
  }

  /**
   * Limpia entrada específica
   */
  static clearUserRateLimit(userId: string, endpoint?: string) {
    const keyPattern = endpoint ? `${endpoint}:.*:${userId}` : `.*:${userId}`
    // En implementación real, se usaría patrón de búsqueda
    console.log(`Clearing rate limit for pattern: ${keyPattern}`)
  }

  /**
   * Limpia todas las entradas
   */
  static clearAll() {
    this.store = new MemoryRateLimitStore()
  }
}

// ========================================
// EXPORTS PARA CONVENIENCIA
// ========================================

export const {
  authRateLimit,
  apiRateLimit,
  criticalRateLimit,
  fileRateLimit,
  loginRateLimit,
  signupRateLimit,
  globalIPLimit,
  strictIPLimit,
  createRateLimit,
  createIPRateLimit
} = RateLimitMiddleware

// ========================================
// UTILIDADES ADICIONALES
// ========================================

/**
 * Middleware combinado para protección completa
 */
export const createProtectedEndpoint = (
  rateLimitType: 'auth' | 'api' | 'critical' | 'files' = 'api'
) => {
  const rateLimitMap = {
    auth: authRateLimit,
    api: apiRateLimit,
    critical: criticalRateLimit,
    files: fileRateLimit
  }

  return [
    globalIPLimit, // Límite global por IP
    rateLimitMap[rateLimitType] // Límite específico por usuario
  ]
}

/**
 * Detector de ataques de fuerza bruta
 */
export const detectBruteForce = (
  maxFailedAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Esta lógica se implementaría con el store de rate limiting
    // para detectar patrones de fallo repetidos
    next()
  }
}
