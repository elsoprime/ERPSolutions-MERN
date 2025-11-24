/**
 * TokenRefreshProvider Component
 * @description: Proveedor que maneja la renovación automática de tokens en toda la aplicación
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, { useEffect, useState } from 'react'
import { useTokenRefresh } from '@/hooks/useTokenRefresh'
import { toast } from 'react-toastify'

interface TokenRefreshProviderProps {
  children: React.ReactNode
}

export default function TokenRefreshProvider({
  children
}: TokenRefreshProviderProps) {
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  const {
    tokenStatus,
    isLoading,
    refreshToken,
    formatTimeRemaining,
    getStatusColor,
    isTokenValid,
    needsRefresh
  } = useTokenRefresh({
    autoStart: true,
    onRefreshSuccess: () => {
      toast.success('Sesión renovada automáticamente', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true
      })
    },
    onRefreshFailure: () => {
      toast.warning('Error al renovar sesión. Intenta refrescar la página.', {
        position: 'bottom-right',
        autoClose: 5000
      })
    },
    onSessionExpired: () => {
      toast.error('Tu sesión ha expirado. Serás redirigido al login.', {
        position: 'top-center',
        autoClose: 3000
      })
    }
  })

  // Mostrar información de debug en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleKeyPress = (e: KeyboardEvent) => {
        // Ctrl + Shift + T para mostrar/ocultar debug info
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
          setShowDebugInfo(prev => !prev)
        }

        // Ctrl + Shift + R para refresh manual
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
          refreshToken()
        }
      }

      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [refreshToken])

  return (
    <>
      {children}

      {/* Panel de debug en desarrollo */}
      {process.env.NODE_ENV === 'development' && showDebugInfo && (
        <div className='fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50'>
          <div className='flex justify-between items-center mb-2'>
            <h3 className='font-semibold text-sm'>Token Status</h3>
            <button
              onClick={() => setShowDebugInfo(false)}
              className='text-gray-500 hover:text-gray-700'
            >
              ✕
            </button>
          </div>

          <div className='space-y-2 text-xs'>
            <div className='flex justify-between'>
              <span>Estado:</span>
              <span className={getStatusColor()}>
                {isTokenValid ? 'Válido' : 'Inválido'}
              </span>
            </div>

            <div className='flex justify-between'>
              <span>Tiempo restante:</span>
              <span className={getStatusColor()}>
                {formatTimeRemaining()}
              </span>
            </div>

            <div className='flex justify-between'>
              <span>Necesita refresh:</span>
              <span className={needsRefresh ? 'text-yellow-500' : 'text-green-500'}>
                {needsRefresh ? 'Sí' : 'No'}
              </span>
            </div>

            <div className='flex justify-between'>
              <span>Renovando:</span>
              <span className={tokenStatus.isRefreshing ? 'text-blue-500' : 'text-gray-500'}>
                {tokenStatus.isRefreshing ? 'Sí' : 'No'}
              </span>
            </div>

            <button
              onClick={refreshToken}
              disabled={isLoading || tokenStatus.isRefreshing}
              className='w-full mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-400'
            >
              {isLoading ? 'Renovando...' : 'Renovar Token'}
            </button>
          </div>

          <div className='mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500'>
            <div>Ctrl+Shift+T: Toggle debug</div>
            <div>Ctrl+Shift+R: Refresh manual</div>
          </div>
        </div>
      )}

      {/* Indicador de renovación activa */}
      {tokenStatus.isRefreshing && (
        <div className='fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
          <span className='text-sm'>Renovando sesión...</span>
        </div>
      )}

      {/* Alerta de sesión próxima a expirar */}
      {needsRefresh && !tokenStatus.isRefreshing && (
        <div className='fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2'>
          <span className='text-sm'>
            ⚠️ Tu sesión expira en {formatTimeRemaining()}
          </span>
          <button
            onClick={refreshToken}
            className='ml-2 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs'
          >
            Renovar ahora
          </button>
        </div>
      )}
    </>
  )
}