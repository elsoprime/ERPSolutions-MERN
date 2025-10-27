/**
 * @description Tipos TypeScript personalizados para autenticación
 * @module types/authTypes
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

import type {Request} from 'express'
import type {IUser} from '../models/User'
import mongoose from 'mongoose'

// ========================================
// INTERFACES PARA EXTENDER REQUEST
// ========================================

/**
 * Usuario autenticado con datos seguros (sin password)
 */
export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  status: string
  confirmed: boolean
  role: string
  companyId: mongoose.Types.ObjectId
  iat?: number // Token issued at
  exp?: number // Token expiration
}

/**
 * Extensión del Request de Express para incluir usuario autenticado
 * Usamos authUser para evitar conflictos con la propiedad user existente
 */
export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser
}

// Declaración global para extender el namespace de Express
declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser
    }
  }
}

// ========================================
// TIPOS PARA JWT
// ========================================

/**
 * Payload que se incluye en el JWT
 */
export interface JWTPayload {
  id: string
  iat?: number
  exp?: number
}

/**
 * Datos decodificados del JWT
 */
export interface DecodedJWT extends JWTPayload {
  id: string
  iat: number
  exp: number
}

// ========================================
// INTERFACES PARA RESPUESTAS DE ERROR
// ========================================

/**
 * Estructura estándar para errores de autenticación
 */
export interface AuthError {
  message: string
  code: AuthErrorCode
  details?: string
  timestamp?: Date
}

/**
 * Códigos específicos de errores de autenticación
 */
export enum AuthErrorCode {
  // Token related errors
  TOKEN_MISSING = 'TOKEN_MISSING',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_MALFORMED = 'TOKEN_MALFORMED',

  // User related errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_NOT_CONFIRMED = 'USER_NOT_CONFIRMED',
  USER_INACTIVE = 'USER_INACTIVE',
  USER_BLOCKED = 'USER_BLOCKED',

  // Permission related errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  COMPANY_ACCESS_DENIED = 'COMPANY_ACCESS_DENIED',

  // Rate limiting errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  IP_RATE_LIMIT_EXCEEDED = 'IP_RATE_LIMIT_EXCEEDED',

  // General errors
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * Respuesta estándar para errores HTTP de autenticación
 */
export interface AuthErrorResponse {
  error: AuthError
  success: false
  statusCode: number
}

/**
 * Respuesta exitosa de autenticación
 */
export interface AuthSuccessResponse {
  message: string
  success: true
  user?: Partial<AuthenticatedUser>
  token?: string
}

// ========================================
// TIPOS PARA CONFIGURACIÓN
// ========================================

/**
 * Configuración del middleware de autenticación
 */
export interface AuthMiddlewareConfig {
  cacheEnabled: boolean
  cacheTTL: number // Time to live in seconds
  validateUserStatus: boolean
  requireConfirmedUser: boolean
  logAuthAttempts: boolean
}

/**
 * Configuración por defecto del middleware
 */
export const DEFAULT_AUTH_CONFIG: AuthMiddlewareConfig = {
  cacheEnabled: true,
  cacheTTL: 300, // 5 minutos
  validateUserStatus: true,
  requireConfirmedUser: true,
  logAuthAttempts: true
}

// ========================================
// TIPOS PARA CACHE
// ========================================

/**
 * Entrada del cache de usuarios
 */
export interface UserCacheEntry {
  user: AuthenticatedUser
  timestamp: number
  ttl: number
}

/**
 * Interface para el gestor de cache
 */
export interface CacheManager {
  get(key: string): Promise<UserCacheEntry | null>
  set(key: string, value: UserCacheEntry): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

// ========================================
// TIPOS PARA VALIDACIÓN
// ========================================

/**
 * Resultado de validación de usuario
 */
export interface UserValidationResult {
  isValid: boolean
  error?: AuthError
  user?: AuthenticatedUser
}

/**
 * Contexto de validación
 */
export interface ValidationContext {
  skipStatusCheck?: boolean
  skipConfirmationCheck?: boolean
  requiredRole?: string
  requiredCompany?: string
}

// ========================================
// UTILITY TYPES
// ========================================

/**
 * Datos del usuario sin información sensible
 */
export type SafeUserData = Omit<IUser, 'password'>

/**
 * Opciones para la generación de JWT
 */
export interface JWTOptions {
  expiresIn?: string | number // e.g., '1h', '7d'
  issuer?: string
  audience?: string
}

/**
 * Resultado de verificación de JWT
 */
export interface JWTVerificationResult {
  isValid: boolean
  payload?: DecodedJWT
  error?: AuthError
}
