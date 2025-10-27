/**
 * @description Sistema de logging avanzado para auditoría de seguridad
 * @module utils/authLogger
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

import type {Request, Response} from 'express'
import type {AuthenticatedUser} from '../types/authTypes'

// ========================================
// TIPOS PARA LOGGING
// ========================================

/**
 * Niveles de severidad para logs
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Tipos de eventos de autenticación
 */
export enum AuthEventType {
  // Eventos de autenticación
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_INVALID = 'token_invalid',

  // Eventos de autorización
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  PERMISSION_DENIED = 'permission_denied',
  ROLE_VALIDATION_FAILED = 'role_validation_failed',

  // Eventos de empresa
  COMPANY_ACCESS_GRANTED = 'company_access_granted',
  COMPANY_ACCESS_DENIED = 'company_access_denied',
  COMPANY_SWITCH = 'company_switch',

  // Eventos de rate limiting
  RATE_LIMIT_HIT = 'rate_limit_hit',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  IP_BLOCKED = 'ip_blocked',

  // Eventos de seguridad
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_DETECTED = 'brute_force_detected',
  ACCOUNT_LOCKED = 'account_locked',
  MULTIPLE_LOGIN_ATTEMPTS = 'multiple_login_attempts',

  // Eventos de cuenta
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_CONFIRMED = 'account_confirmed',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',

  // Eventos de sistema
  CACHE_HIT = 'cache_hit',
  CACHE_MISS = 'cache_miss',
  DATABASE_ERROR = 'database_error',
  SYSTEM_ERROR = 'system_error'
}

/**
 * Estructura del evento de log
 */
export interface AuthLogEvent {
  // Información básica
  timestamp: Date
  eventType: AuthEventType
  level: LogLevel
  message: string

  // Información del usuario
  userId?: string
  userEmail?: string
  userRole?: string
  userIP: string
  userAgent?: string

  // Información de la empresa
  companyId?: string
  companyName?: string

  // Información de la solicitud
  method: string
  path: string
  endpoint?: string
  statusCode?: number
  responseTime?: number

  // Datos adicionales
  metadata?: Record<string, any>
  sessionId?: string
  requestId?: string

  // Información de seguridad
  riskScore?: number
  threat?: string
  location?: {
    country?: string
    city?: string
    coordinates?: [number, number]
  }
}

/**
 * Configuración del logger
 */
export interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  logToConsole: boolean
  logToFile: boolean
  logToDatabase: boolean
  includeUserAgent: boolean
  includeLocation: boolean
  maskSensitiveData: boolean
  retentionDays: number
}

/**
 * Estadísticas de eventos
 */
export interface EventStats {
  eventType: AuthEventType
  count: number
  lastOccurrence: Date
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

// ========================================
// CONFIGURACIÓN DEFAULT
// ========================================

const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  enabled: true,
  level: LogLevel.INFO,
  logToConsole: true,
  logToFile: false,
  logToDatabase: false,
  includeUserAgent: true,
  includeLocation: false,
  maskSensitiveData: true,
  retentionDays: 90
}

// ========================================
// ALMACENAMIENTO DE LOGS
// ========================================

/**
 * Store en memoria para logs (en producción usar base de datos)
 */
class MemoryLogStore {
  private logs: AuthLogEvent[] = []
  private stats: Map<AuthEventType, EventStats> = new Map()
  private maxLogs: number = 10000

  /**
   * Agrega un evento de log
   */
  add(event: AuthLogEvent): void {
    this.logs.push(event)
    this.updateStats(event)

    // Mantener solo los últimos N logs en memoria
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  /**
   * Actualiza estadísticas de eventos
   */
  private updateStats(event: AuthLogEvent): void {
    const existing = this.stats.get(event.eventType)

    if (existing) {
      existing.count++
      existing.lastOccurrence = event.timestamp
    } else {
      this.stats.set(event.eventType, {
        eventType: event.eventType,
        count: 1,
        lastOccurrence: event.timestamp,
        riskLevel: this.calculateRiskLevel(event.eventType)
      })
    }
  }

  /**
   * Calcula nivel de riesgo por tipo de evento
   */
  private calculateRiskLevel(
    eventType: AuthEventType
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = [
      AuthEventType.BRUTE_FORCE_DETECTED,
      AuthEventType.ACCOUNT_LOCKED,
      AuthEventType.SUSPICIOUS_ACTIVITY
    ]

    const highRiskEvents = [
      AuthEventType.LOGIN_FAILED,
      AuthEventType.PERMISSION_DENIED,
      AuthEventType.RATE_LIMIT_EXCEEDED
    ]

    const mediumRiskEvents = [
      AuthEventType.ACCESS_DENIED,
      AuthEventType.TOKEN_INVALID,
      AuthEventType.MULTIPLE_LOGIN_ATTEMPTS
    ]

    if (criticalEvents.includes(eventType)) return 'critical'
    if (highRiskEvents.includes(eventType)) return 'high'
    if (mediumRiskEvents.includes(eventType)) return 'medium'
    return 'low'
  }

  /**
   * Obtiene logs filtrados
   */
  getLogs(filter?: {
    userId?: string
    eventType?: AuthEventType
    level?: LogLevel
    since?: Date
    limit?: number
  }): AuthLogEvent[] {
    let filteredLogs = [...this.logs]

    if (filter) {
      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filter.userId)
      }
      if (filter.eventType) {
        filteredLogs = filteredLogs.filter(
          log => log.eventType === filter.eventType
        )
      }
      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level)
      }
      if (filter.since) {
        filteredLogs = filteredLogs.filter(
          log => log.timestamp >= filter.since!
        )
      }
      if (filter.limit) {
        filteredLogs = filteredLogs.slice(-filter.limit)
      }
    }

    return filteredLogs.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  }

  /**
   * Obtiene estadísticas
   */
  getStats(): EventStats[] {
    return Array.from(this.stats.values()).sort((a, b) => b.count - a.count)
  }

  /**
   * Detecta patrones sospechosos
   */
  detectSuspiciousPatterns(
    userId?: string,
    timeWindow: number = 15 * 60 * 1000
  ): any[] {
    const now = Date.now()
    const recentLogs = this.logs.filter(
      log =>
        now - log.timestamp.getTime() <= timeWindow &&
        (!userId || log.userId === userId)
    )

    const patterns: any[] = []

    // Múltiples fallos de login
    const loginFailures = recentLogs.filter(
      log => log.eventType === AuthEventType.LOGIN_FAILED
    )
    if (loginFailures.length >= 5) {
      patterns.push({
        type: 'multiple_login_failures',
        count: loginFailures.length,
        riskLevel: 'high',
        logs: loginFailures
      })
    }

    // Accesos desde múltiples IPs
    const uniqueIPs = new Set(recentLogs.map(log => log.userIP))
    if (uniqueIPs.size >= 3 && userId) {
      patterns.push({
        type: 'multiple_ip_access',
        ipCount: uniqueIPs.size,
        riskLevel: 'medium',
        ips: Array.from(uniqueIPs)
      })
    }

    // Rate limiting frecuente
    const rateLimitHits = recentLogs.filter(
      log => log.eventType === AuthEventType.RATE_LIMIT_EXCEEDED
    )
    if (rateLimitHits.length >= 10) {
      patterns.push({
        type: 'excessive_rate_limiting',
        count: rateLimitHits.length,
        riskLevel: 'high',
        logs: rateLimitHits
      })
    }

    return patterns
  }

  /**
   * Limpia logs antiguos
   */
  cleanup(retentionDays: number): number {
    const cutoffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000
    )
    const initialCount = this.logs.length

    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate)

    return initialCount - this.logs.length
  }
}

// ========================================
// CLASE PRINCIPAL DE LOGGING
// ========================================

export class AuthLogger {
  private static store = new MemoryLogStore()
  private static config: LoggerConfig = DEFAULT_LOGGER_CONFIG

  /**
   * Extrae información de la solicitud
   */
  private static extractRequestInfo(req: Request): Partial<AuthLogEvent> {
    return {
      userIP: this.getClientIP(req),
      userAgent: this.config.includeUserAgent
        ? req.headers['user-agent']
        : undefined,
      method: req.method,
      path: req.path,
      endpoint: `${req.method} ${req.route?.path || req.path}`,
      sessionId: (req as any).sessionID,
      requestId: (req as any).requestId || this.generateRequestId()
    }
  }

  /**
   * Obtiene IP del cliente
   */
  private static getClientIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection.remoteAddress ||
      'unknown'
    )
  }

  /**
   * Genera ID único para la solicitud
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Extrae información del usuario
   */
  private static extractUserInfo(
    user?: AuthenticatedUser
  ): Partial<AuthLogEvent> {
    if (!user) return {}

    return {
      userId: user.id,
      userEmail: this.config.maskSensitiveData
        ? this.maskEmail(user.email)
        : user.email,
      userRole: user.role,
      companyId: user.companyId?.toString()
    }
  }

  /**
   * Enmascara email para privacidad
   */
  private static maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return email

    const maskedLocal =
      local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    return `${maskedLocal}@${domain}`
  }

  /**
   * Log genérico de evento
   */
  static logEvent(
    eventType: AuthEventType,
    level: LogLevel,
    message: string,
    req: Request,
    user?: AuthenticatedUser,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled) return

    const requestInfo = this.extractRequestInfo(req)
    const userInfo = this.extractUserInfo(user)

    const event: AuthLogEvent = {
      timestamp: new Date(),
      eventType,
      level,
      message,
      userIP: requestInfo.userIP || 'unknown',
      userAgent: requestInfo.userAgent,
      method: requestInfo.method || 'unknown',
      path: requestInfo.path || 'unknown',
      endpoint: requestInfo.endpoint,
      sessionId: requestInfo.sessionId,
      requestId: requestInfo.requestId,
      userId: userInfo.userId,
      userEmail: userInfo.userEmail,
      userRole: userInfo.userRole,
      companyId: userInfo.companyId,
      metadata
    }

    this.store.add(event)

    if (this.config.logToConsole) {
      this.logToConsole(event)
    }

    // Aquí se implementarían logs a archivo o base de datos
    if (this.config.logToFile) {
      this.logToFile(event)
    }

    if (this.config.logToDatabase) {
      this.logToDatabase(event)
    }
  }

  /**
   * Log a consola con formato
   */
  private static logToConsole(event: AuthLogEvent): void {
    const timestamp = event.timestamp.toISOString()
    const level = event.level.toUpperCase().padEnd(8)
    const userInfo = event.userId ? `[User: ${event.userId}]` : '[Anonymous]'
    const endpoint = `[${event.method} ${event.path}]`

    const logMessage = `${timestamp} ${level} ${userInfo} ${endpoint} ${event.message}`

    switch (event.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, event.metadata)
        break
      case LogLevel.INFO:
        console.info(logMessage, event.metadata)
        break
      case LogLevel.WARN:
        console.warn(logMessage, event.metadata)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(logMessage, event.metadata)
        break
    }
  }

  /**
   * Log a archivo (implementación placeholder)
   */
  private static logToFile(event: AuthLogEvent): void {
    // En producción, usar librerías como winston o bunyan
    console.log('LOG TO FILE:', JSON.stringify(event))
  }

  /**
   * Log a base de datos (implementación placeholder)
   */
  private static logToDatabase(event: AuthLogEvent): void {
    // En producción, guardar en MongoDB, PostgreSQL, etc.
    console.log('LOG TO DATABASE:', event.eventType)
  }

  // ========================================
  // MÉTODOS ESPECÍFICOS DE EVENTOS
  // ========================================

  /**
   * Log de login exitoso
   */
  static logLoginSuccess(req: Request, user: AuthenticatedUser): void {
    this.logEvent(
      AuthEventType.LOGIN_SUCCESS,
      LogLevel.INFO,
      `Usuario ${user.email} inició sesión exitosamente`,
      req,
      user
    )
  }

  /**
   * Log de login fallido
   */
  static logLoginFailed(req: Request, email: string, reason: string): void {
    this.logEvent(
      AuthEventType.LOGIN_FAILED,
      LogLevel.WARN,
      `Intento de login fallido para ${email}: ${reason}`,
      req,
      undefined,
      {
        email: this.config.maskSensitiveData ? this.maskEmail(email) : email,
        reason
      }
    )
  }

  /**
   * Log de logout
   */
  static logLogout(req: Request, user: AuthenticatedUser): void {
    this.logEvent(
      AuthEventType.LOGOUT,
      LogLevel.INFO,
      `Usuario ${user.email} cerró sesión`,
      req,
      user
    )
  }

  /**
   * Log de acceso denegado
   */
  static logAccessDenied(
    req: Request,
    user: AuthenticatedUser,
    reason: string
  ): void {
    this.logEvent(
      AuthEventType.ACCESS_DENIED,
      LogLevel.WARN,
      `Acceso denegado para ${user.email}: ${reason}`,
      req,
      user,
      {reason}
    )
  }

  /**
   * Log de rate limiting
   */
  static logRateLimitExceeded(
    req: Request,
    user: AuthenticatedUser | undefined,
    limit: number
  ): void {
    this.logEvent(
      AuthEventType.RATE_LIMIT_EXCEEDED,
      LogLevel.WARN,
      `Rate limit excedido (${limit} requests)`,
      req,
      user,
      {limit}
    )
  }

  /**
   * Log de actividad sospechosa
   */
  static logSuspiciousActivity(
    req: Request,
    user: AuthenticatedUser | undefined,
    reason: string
  ): void {
    this.logEvent(
      AuthEventType.SUSPICIOUS_ACTIVITY,
      LogLevel.ERROR,
      `Actividad sospechosa detectada: ${reason}`,
      req,
      user,
      {reason, riskScore: 8}
    )
  }

  /**
   * Log de acceso a empresa
   */
  static logCompanyAccess(
    req: Request,
    user: AuthenticatedUser,
    companyId: string,
    granted: boolean
  ): void {
    this.logEvent(
      granted
        ? AuthEventType.COMPANY_ACCESS_GRANTED
        : AuthEventType.COMPANY_ACCESS_DENIED,
      granted ? LogLevel.INFO : LogLevel.WARN,
      `Acceso a empresa ${companyId} ${
        granted ? 'concedido' : 'denegado'
      } para ${user.email}`,
      req,
      user,
      {companyId, granted}
    )
  }

  // ========================================
  // MÉTODOS DE CONSULTA Y ANÁLISIS
  // ========================================

  /**
   * Obtiene logs de usuario específico
   */
  static getUserLogs(userId: string, limit: number = 100): AuthLogEvent[] {
    return this.store.getLogs({userId, limit})
  }

  /**
   * Obtiene logs por tipo de evento
   */
  static getEventLogs(
    eventType: AuthEventType,
    limit: number = 100
  ): AuthLogEvent[] {
    return this.store.getLogs({eventType, limit})
  }

  /**
   * Obtiene estadísticas de eventos
   */
  static getEventStats(): EventStats[] {
    return this.store.getStats()
  }

  /**
   * Detecta actividad sospechosa
   */
  static detectSuspiciousActivity(userId?: string): any[] {
    return this.store.detectSuspiciousPatterns(userId)
  }

  /**
   * Obtiene resumen de seguridad
   */
  static getSecuritySummary(timeWindow: number = 24 * 60 * 60 * 1000): any {
    const since = new Date(Date.now() - timeWindow)
    const recentLogs = this.store.getLogs({since})

    const summary = {
      totalEvents: recentLogs.length,
      loginAttempts: recentLogs.filter(
        log =>
          log.eventType === AuthEventType.LOGIN_SUCCESS ||
          log.eventType === AuthEventType.LOGIN_FAILED
      ).length,
      failedLogins: recentLogs.filter(
        log => log.eventType === AuthEventType.LOGIN_FAILED
      ).length,
      rateLimitHits: recentLogs.filter(
        log => log.eventType === AuthEventType.RATE_LIMIT_EXCEEDED
      ).length,
      suspiciousActivities: recentLogs.filter(
        log => log.eventType === AuthEventType.SUSPICIOUS_ACTIVITY
      ).length,
      uniqueUsers: new Set(recentLogs.map(log => log.userId).filter(Boolean))
        .size,
      uniqueIPs: new Set(recentLogs.map(log => log.userIP)).size
    }

    return summary
  }

  /**
   * Configura el logger
   */
  static configure(config: Partial<LoggerConfig>): void {
    this.config = {...this.config, ...config}
  }

  /**
   * Obtiene configuración actual
   */
  static getConfig(): LoggerConfig {
    return {...this.config}
  }

  /**
   * Limpia logs antiguos
   */
  static cleanup(): number {
    return this.store.cleanup(this.config.retentionDays)
  }
}

// ========================================
// EXPORTS PARA CONVENIENCIA
// ========================================

export const {
  logLoginSuccess,
  logLoginFailed,
  logLogout,
  logAccessDenied,
  logRateLimitExceeded,
  logSuspiciousActivity,
  logCompanyAccess,
  getUserLogs,
  getEventLogs,
  getEventStats,
  detectSuspiciousActivity,
  getSecuritySummary
} = AuthLogger

export default AuthLogger
