/**
 * useTokenRefresh Hook
 * @description: Hook personalizado para manejar la renovación automática de tokens
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import {useEffect, useState, useCallback} from 'react'
import {useRouter} from 'next/navigation'
import {tokenRefreshManager, getTokenStatus} from '@/utils/tokenRefreshManager'
import {refreshAuthToken} from '@/api/AuthAPI'

interface TokenStatus {
  hasToken: boolean
  isExpired: boolean
  timeUntilExpiration: number
  needsRefresh: boolean
  isRefreshing?: boolean
}

interface UseTokenRefreshOptions {
  autoStart?: boolean
  onRefreshSuccess?: () => void
  onRefreshFailure?: () => void
  onSessionExpired?: () => void
}

export function useTokenRefresh({
  autoStart = true,
  onRefreshSuccess,
  onRefreshFailure,
  onSessionExpired
}: UseTokenRefreshOptions = {}) {
  const router = useRouter()
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    hasToken: false,
    isExpired: true,
    timeUntilExpiration: 0,
    needsRefresh: false,
    isRefreshing: false
  })

  const [isLoading, setIsLoading] = useState(false)

  /**
   * Actualizar el estado del token
   */
  const updateTokenStatus = useCallback(() => {
    const status = getTokenStatus()
    setTokenStatus(status)
    return status
  }, [])

  /**
   * Manejar renovación manual del token
   */
  const handleManualRefresh = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)

    try {
      console.log('🔄 Hook: Iniciando renovación manual...')
      const result = await refreshAuthToken()

      if (result.token) {
        console.log('✅ Hook: Token renovado exitosamente')
        updateTokenStatus()
        onRefreshSuccess?.()
        return true
      } else {
        throw new Error('No se recibió token válido')
      }
    } catch (error) {
      console.error('❌ Hook: Error en renovación manual:', error)

      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'

      if (errorMessage.includes('Sesión expirada')) {
        console.log('🚪 Hook: Sesión expirada, redirigiendo al login')
        onSessionExpired?.()
        router.push('/auth')
      } else {
        onRefreshFailure?.()
      }

      updateTokenStatus()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [
    router,
    onRefreshSuccess,
    onRefreshFailure,
    onSessionExpired,
    updateTokenStatus
  ])

  /**
   * Formatear tiempo restante de forma legible
   */
  const formatTimeRemaining = useCallback((seconds: number): string => {
    if (seconds <= 0) return 'Expirado'

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }, [])

  /**
   * Obtener el color del estado según el tiempo restante
   */
  const getStatusColor = useCallback((status: TokenStatus): string => {
    if (!status.hasToken || status.isExpired) return 'text-red-500'
    if (status.needsRefresh) return 'text-yellow-500'
    return 'text-green-500'
  }, [])

  // Inicializar el sistema de refresh automático
  useEffect(() => {
    if (autoStart && typeof window !== 'undefined') {
      console.log('🚀 Hook: Iniciando sistema de token refresh')

      // Actualizar estado inicial
      updateTokenStatus()

      // Configurar intervalo para actualizar el estado cada segundo
      const statusInterval = setInterval(updateTokenStatus, 1000)

      return () => {
        clearInterval(statusInterval)
        console.log('🔄 Hook: Limpiando intervalos')
      }
    }
  }, [autoStart, updateTokenStatus])

  // Efecto para manejar cambios en el estado del token
  useEffect(() => {
    if (tokenStatus.isExpired && tokenStatus.hasToken) {
      console.log('⚠️ Hook: Token expirado detectado')
      onSessionExpired?.()
    }
  }, [tokenStatus.isExpired, tokenStatus.hasToken, onSessionExpired])

  return {
    // Estado del token
    tokenStatus,
    isLoading,

    // Acciones
    refreshToken: handleManualRefresh,
    updateStatus: updateTokenStatus,

    // Utilidades
    formatTimeRemaining: (seconds?: number) =>
      formatTimeRemaining(seconds ?? tokenStatus.timeUntilExpiration),
    getStatusColor: () => getStatusColor(tokenStatus),

    // Estado calculado
    isTokenValid: tokenStatus.hasToken && !tokenStatus.isExpired,
    needsRefresh: tokenStatus.needsRefresh,
    timeRemaining: tokenStatus.timeUntilExpiration
  }
}

/**
 * Hook simplificado para componentes que solo necesitan verificar el estado
 */
export function useTokenStatus() {
  const [status, setStatus] = useState(() => getTokenStatus())

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getTokenStatus())
    }, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [])

  return status
}
