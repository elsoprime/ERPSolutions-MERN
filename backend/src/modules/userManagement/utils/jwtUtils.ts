/**
 * @description Utilidades JWT extendidas para autenticación
 * @module utils/jwtUtils
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @note Este archivo extiende las utilidades JWT existentes sin modificarlas
 */

import jwt, {SignOptions} from 'jsonwebtoken'
import type {
  JWTPayload,
  DecodedJWT,
  JWTOptions,
  JWTVerificationResult,
  AuthError
} from '../types/authTypes'
import {AuthErrorCode} from '../types/authTypes'

// ========================================
// CONSTANTES
// ========================================

const DEFAULT_EXPIRES_IN: string | number = '10d'
const DEFAULT_REFRESH_EXPIRES_IN: string | number = '30d'

// ========================================
// UTILIDADES DE GENERACIÓN
// ========================================

/**
 * Genera un JWT con configuración avanzada
 * @param payload Datos a incluir en el token
 * @param options Opciones adicionales para el token
 * @returns Token JWT generado
 */
export const generateJWTAdvanced = (
  payload: JWTPayload,
  options: JWTOptions = {}
): string => {
  const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET_KEY is not defined in environment variables')
  }

  const expiresIn = options.expiresIn || DEFAULT_EXPIRES_IN
  const jwtOptions: SignOptions = {
    expiresIn: expiresIn as any,
    issuer: options.issuer || 'ERPSolutions',
    audience: options.audience || 'ERPSolutions-App'
  }

  return jwt.sign(payload, secret, jwtOptions)
}

/**
 * Genera un refresh token para renovación de sesión
 * @param payload Datos del usuario
 * @returns Refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      'JWT_REFRESH_SECRET is not defined in environment variables'
    )
  }

  return jwt.sign(payload, secret, {
    expiresIn: DEFAULT_REFRESH_EXPIRES_IN as any,
    issuer: 'ERPSolutions',
    audience: 'ERPSolutions-Refresh'
  })
}

/**
 * Genera tanto access token como refresh token
 * @param payload Datos del usuario
 * @returns Objeto con ambos tokens
 */
export const generateTokenPair = (payload: JWTPayload) => {
  return {
    accessToken: generateJWTAdvanced(payload),
    refreshToken: generateRefreshToken(payload),
    tokenType: 'Bearer',
    expiresIn: DEFAULT_EXPIRES_IN
  }
}

// ========================================
// UTILIDADES DE VERIFICACIÓN
// ========================================

/**
 * Verifica un JWT y devuelve resultado estructurado
 * @param token Token a verificar
 * @param isRefreshToken Si es un refresh token
 * @returns Resultado de la verificación
 */
export const verifyJWT = (
  token: string,
  isRefreshToken: boolean = false
): JWTVerificationResult => {
  try {
    const secret = isRefreshToken
      ? process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      : process.env.JWT_SECRET_KEY || process.env.JWT_SECRET

    if (!secret) {
      return {
        isValid: false,
        error: {
          message: 'JWT secret not configured',
          code: AuthErrorCode.INTERNAL_ERROR
        }
      }
    }

    const decoded = jwt.verify(token, secret) as DecodedJWT

    return {
      isValid: true,
      payload: decoded
    }
  } catch (error) {
    let authError: AuthError

    if (error instanceof jwt.TokenExpiredError) {
      authError = {
        message: 'Token has expired',
        code: AuthErrorCode.TOKEN_EXPIRED,
        details: error.message
      }
    } else if (error instanceof jwt.JsonWebTokenError) {
      authError = {
        message: 'Invalid token',
        code: AuthErrorCode.TOKEN_INVALID,
        details: error.message
      }
    } else if (error instanceof jwt.NotBeforeError) {
      authError = {
        message: 'Token not active yet',
        code: AuthErrorCode.TOKEN_INVALID,
        details: error.message
      }
    } else {
      authError = {
        message: 'Token verification failed',
        code: AuthErrorCode.TOKEN_MALFORMED,
        details: error?.message || 'Unknown error'
      }
    }

    return {
      isValid: false,
      error: authError
    }
  }
}

/**
 * Verifica un refresh token específicamente
 * @param refreshToken Token de actualización
 * @returns Resultado de la verificación
 */
export const verifyRefreshToken = (
  refreshToken: string
): JWTVerificationResult => {
  return verifyJWT(refreshToken, true)
}

// ========================================
// UTILIDADES DE RENOVACIÓN
// ========================================

/**
 * Renueva un access token usando un refresh token
 * @param refreshToken Token de actualización
 * @returns Nuevo par de tokens o error
 */
export const renewTokens = (refreshToken: string) => {
  const verificationResult = verifyRefreshToken(refreshToken)

  if (!verificationResult.isValid || !verificationResult.payload) {
    return {
      success: false,
      error: verificationResult.error || {
        message: 'Invalid refresh token',
        code: AuthErrorCode.TOKEN_INVALID
      }
    }
  }

  // Crear nuevo payload sin propiedades de JWT (iat, exp)
  const newPayload: JWTPayload = {
    id: verificationResult.payload.id
  }

  const tokens = generateTokenPair(newPayload)

  return {
    success: true,
    tokens
  }
}

// ========================================
// UTILIDADES DE EXTRACCIÓN
// ========================================

/**
 * Extrae el token del header Authorization
 * @param authHeader Header de autorización
 * @returns Token extraído o null
 */
export const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader) {
    return null
  }

  // Verificar formato "Bearer <token>"
  if (!authHeader.startsWith('Bearer ')) {
    return null
  }

  const [, token] = authHeader.split(' ')

  if (!token || token.trim() === '') {
    return null
  }

  return token.trim()
}

/**
 * Decodifica un JWT sin verificar (solo para debugging)
 * @param token Token a decodificar
 * @returns Payload decodificado o null
 */
export const decodeJWTWithoutVerification = (token: string): any | null => {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}

// ========================================
// UTILIDADES DE VALIDACIÓN
// ========================================

/**
 * Verifica si un token está cerca de expirar
 * @param token Token a verificar
 * @param thresholdMinutes Minutos antes de expiración (default: 5)
 * @returns true si está cerca de expirar
 */
export const isTokenNearExpiration = (
  token: string,
  thresholdMinutes: number = 5
): boolean => {
  const decoded = decodeJWTWithoutVerification(token)

  if (!decoded || !decoded.exp) {
    return true // Si no se puede decodificar, asumir que está expirado
  }

  const expirationTime = decoded.exp * 1000 // Convertir a milliseconds
  const thresholdTime = Date.now() + thresholdMinutes * 60 * 1000

  return expirationTime <= thresholdTime
}

/**
 * Obtiene información del token sin verificar firma
 * @param token Token a analizar
 * @returns Información del token
 */
export const getTokenInfo = (token: string) => {
  const decoded = decodeJWTWithoutVerification(token)

  if (!decoded) {
    return null
  }

  return {
    userId: decoded.id,
    issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
    expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
    issuer: decoded.iss,
    audience: decoded.aud,
    isExpired: decoded.exp ? Date.now() >= decoded.exp * 1000 : true
  }
}

// ========================================
// UTILIDADES DE BLACKLIST (para logout)
// ========================================

// Cache en memoria para tokens en blacklist (en producción usar Redis)
const tokenBlacklist = new Set<string>()

/**
 * Agrega un token a la blacklist
 * @param token Token a invalidar
 */
export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token)

  // Auto-limpiar tokens expirados cada hora
  setTimeout(() => {
    const tokenInfo = getTokenInfo(token)
    if (tokenInfo?.isExpired) {
      tokenBlacklist.delete(token)
    }
  }, 60 * 60 * 1000) // 1 hora
}

/**
 * Verifica si un token está en la blacklist
 * @param token Token a verificar
 * @returns true si está en blacklist
 */
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token)
}

/**
 * Limpia la blacklist de tokens expirados
 */
export const cleanupBlacklist = (): void => {
  tokenBlacklist.forEach(token => {
    const tokenInfo = getTokenInfo(token)
    if (tokenInfo?.isExpired) {
      tokenBlacklist.delete(token)
    }
  })
}
