/**
 * useAuth Hook
 * @description: Hook personalizado para manejar la autenticación y cerrar sesión
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

interface UseAuthReturn {
  logout: () => Promise<void>
  isLoggingOut: boolean
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true)
      
      // Aquí puedes agregar la lógica específica de tu aplicación:
      
      // 1. Limpiar localStorage/sessionStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('refreshToken')
        sessionStorage.clear()
      }
      
      // 2. Hacer llamada a la API para invalidar el token (opcional)
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      } catch (apiError) {
        // Si falla la API, continúa con el logout local
        console.warn('Error al cerrar sesión en el servidor:', apiError)
      }
      
      // 3. Redirigir al login con un pequeño delay para mejor UX
      setTimeout(() => {
        router.push('/')
        router.refresh() // Forzar refresh para limpiar cualquier estado
      }, 500)
      
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error)
      // Incluso si hay error, redirigir al login
      router.push('/')
    } finally {
      setIsLoggingOut(false)
    }
  }, [router])

  return {
    logout,
    isLoggingOut
  }
}