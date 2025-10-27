/**
 * useAuth Hook
 * @description: Hook personalizado para manejar la autenticación y cerrar sesión
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import {useRouter} from 'next/navigation'
import {useState, useCallback} from 'react'
import {removeAuthToken} from '@/utils/cookies'
import {logout as logoutAPI, isAuthenticated, getUserData} from '@/api/AuthAPI'

interface UseAuthReturn {
  logout: () => Promise<void>
  isLoggingOut: boolean
  isAuthenticated: () => boolean
  getUserData: () => any
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true)

      // 1. Limpiar localStorage usando la función de AuthAPI
      logoutAPI()

      // 2. Limpiar cookies y sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear()
      }
      removeAuthToken()

      // 3. Hacer llamada a la API para invalidar el token (opcional)
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include' // Incluir cookies en la petición
        })
      } catch (apiError) {
        console.warn('Error al cerrar sesión en el servidor:', apiError)
      }

      // 4. Redirigir al login con un pequeño delay para mejor UX
      setTimeout(() => {
        router.push('/')
        router.refresh() // Forzar refresh para limpiar cualquier estado
      }, 500)
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error)
      router.push('/')
    } finally {
      setIsLoggingOut(false)
    }
  }, [router])

  return {
    logout,
    isLoggingOut,
    isAuthenticated,
    getUserData
  }
}
