/**
 * Token Refresh Manager
 * @description: Sistema automático de renovación de tokens JWT
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {isTokenExpired, decodeJWT} from './jwtUtils'
import {getAuthToken, setAuthToken, removeAuthToken} from './cookies'
import {refreshAuthToken} from '../api/AuthAPI'

// Configuración del sistema de refresh
const REFRESH_CONFIG = {
  // Renovar cuando falten 5 minutos para expirar (300 segundos)
  REFRESH_THRESHOLD_SECONDS: 300,
  // Verificar cada 60 segundos
  CHECK_INTERVAL_MS: 60000,
  // Reintentos máximos en caso de error
  MAX_RETRY_ATTEMPTS: 3,
  // Tiempo de espera entre reintentos (en ms)
  RETRY_DELAY_MS: 5000
}

class TokenRefreshManager {
  private static instance: TokenRefreshManager
  private refreshTimer: NodeJS.Timeout | null = null
  private isRefreshing = false
  private retryCount = 0
  private callbacks: Array<(success: boolean) => void> = []

  private constructor() {
    this.startRefreshTimer()
  }

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager()
    }
    return TokenRefreshManager.instance
  }

  /**
   * Iniciar el timer de verificación automática
   */
  private startRefreshTimer(): void {
    if (typeof window === 'undefined') return // No ejecutar en SSR

    console.log('🔄 Token Refresh Manager iniciado')

    this.refreshTimer = setInterval(() => {
      this.checkTokenAndRefresh()
    }, REFRESH_CONFIG.CHECK_INTERVAL_MS)

    // Verificar inmediatamente al iniciar
    this.checkTokenAndRefresh()
  }

  /**
   * Detener el timer de verificación
   */
  public stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
      console.log('⏹️ Token Refresh Manager detenido')
    }
  }

  /**
   * Verificar si el token necesita renovación y ejecutarla
   */
  private async checkTokenAndRefresh(): Promise<void> {
    try {
      const token = getAuthToken()

      if (!token) {
        console.log('🔍 No hay token para verificar')
        return
      }

      if (this.shouldRefreshToken(token)) {
        console.log('⚠️ Token próximo a expirar, iniciando renovación...')
        await this.refreshToken()
      }
    } catch (error) {
      console.error('❌ Error en verificación de token:', error)
    }
  }

  /**
   * Determinar si el token necesita renovación
   */
  private shouldRefreshToken(token: string): boolean {
    try {
      const decoded = decodeJWT(token)

      if (!decoded || !decoded.exp) {
        console.log('🚫 Token inválido o sin fecha de expiración')
        return false
      }

      const currentTime = Math.floor(Date.now() / 1000)
      const expirationTime = decoded.exp
      const timeUntilExpiration = expirationTime - currentTime

      console.log(`⏰ Tiempo hasta expiración: ${timeUntilExpiration} segundos`)

      // Renovar si falta menos del threshold configurado
      return timeUntilExpiration <= REFRESH_CONFIG.REFRESH_THRESHOLD_SECONDS
    } catch (error) {
      console.error('❌ Error al verificar expiración del token:', error)
      return false
    }
  }

  /**
   * Ejecutar la renovación del token
   */
  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('🔄 Renovación ya en progreso, esperando...')
      return new Promise(resolve => {
        this.callbacks.push(resolve)
      })
    }

    this.isRefreshing = true

    try {
      console.log('🔄 Iniciando renovación de token...')

      const result = await refreshAuthToken()

      if (!result.token) {
        throw new Error('No se recibió nuevo token del servidor')
      }

      console.log('✅ Token renovado exitosamente')
      this.retryCount = 0
      this.notifyCallbacks(true)

      return true
    } catch (error) {
      console.error('❌ Error al renovar token:', error)

      this.retryCount++

      if (this.retryCount < REFRESH_CONFIG.MAX_RETRY_ATTEMPTS) {
        console.log(
          `🔄 Reintentando renovación (${this.retryCount}/${REFRESH_CONFIG.MAX_RETRY_ATTEMPTS})`
        )

        setTimeout(() => {
          this.isRefreshing = false
          this.refreshToken()
        }, REFRESH_CONFIG.RETRY_DELAY_MS)

        return false
      } else {
        console.error('❌ Máximo de reintentos alcanzado, cerrando sesión')
        this.handleRefreshFailure()
        this.notifyCallbacks(false)
        return false
      }
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Manejar fallo en la renovación después de todos los reintentos
   */
  private handleRefreshFailure(): void {
    console.log('🚪 Token no pudo renovarse, cerrando sesión...')

    // Limpiar tokens
    localStorage.removeItem('AUTH_TOKEN_VALIDATE')
    localStorage.removeItem('USER_DATA')
    removeAuthToken()

    // Detener el timer
    this.stopRefreshTimer()

    // Redirigir al login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth'
    }
  }

  /**
   * Notificar a los callbacks pendientes
   */
  private notifyCallbacks(success: boolean): void {
    this.callbacks.forEach(callback => callback(success))
    this.callbacks = []
  }

  /**
   * Forzar renovación manual del token
   */
  public async forceRefresh(): Promise<boolean> {
    console.log('🔄 Renovación manual solicitada')
    return await this.refreshToken()
  }

  /**
   * Obtener información del estado actual
   */
  public getStatus() {
    const token = getAuthToken()

    if (!token) {
      return {
        hasToken: false,
        isExpired: true,
        timeUntilExpiration: 0,
        needsRefresh: false
      }
    }

    const decoded = decodeJWT(token)

    if (!decoded || !decoded.exp) {
      return {
        hasToken: true,
        isExpired: true,
        timeUntilExpiration: 0,
        needsRefresh: true
      }
    }

    const currentTime = Math.floor(Date.now() / 1000)
    const timeUntilExpiration = decoded.exp - currentTime
    const isExpired = timeUntilExpiration <= 0
    const needsRefresh =
      timeUntilExpiration <= REFRESH_CONFIG.REFRESH_THRESHOLD_SECONDS

    return {
      hasToken: true,
      isExpired,
      timeUntilExpiration,
      needsRefresh,
      isRefreshing: this.isRefreshing
    }
  }
}

// Exportar la instancia singleton
export const tokenRefreshManager = TokenRefreshManager.getInstance()

// Utilidades adicionales
export const refreshToken = () => tokenRefreshManager.forceRefresh()
export const getTokenStatus = () => tokenRefreshManager.getStatus()
export const stopTokenRefresh = () => tokenRefreshManager.stopRefreshTimer()
