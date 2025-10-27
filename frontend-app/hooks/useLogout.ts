/**
 * useLogout Hook
 * @description: Hook especializado para manejar cierre de sesión de forma centralizada
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @use: Para menús, componentes y handlers de logout reutilizables
 */

'use client'
import {useAuth} from './useAuth'
import {useCallback} from 'react'

interface UseLogoutReturn {
  /** Función para ejecutar logout completo */
  handleLogout: () => Promise<void>
  /** Estado de si se está ejecutando el logout */
  isLoggingOut: boolean
  /** Función para verificar si un item del menú es la opción de logout */
  isLogoutItem: (itemTitle: string, itemId?: number) => boolean
}

/**
 * Hook centralizado para manejar logout de manera consistente
 * Reutiliza la lógica robusta de useAuth pero la hace específica para menús
 */
export const useLogout = (): UseLogoutReturn => {
  const {logout, isLoggingOut} = useAuth()

  /**
   * Handler centralizado para ejecutar logout
   * Puede ser llamado desde cualquier menú o componente
   */
  const handleLogout = useCallback(async () => {
    try {
      console.log('🔐 Iniciando proceso de logout...')
      await logout()
      console.log('✅ Logout completado exitosamente')
    } catch (error) {
      console.error('❌ Error durante el logout:', error)
      // El useAuth ya maneja el error y redirige
    }
  }, [logout])

  /**
   * Función utilitaria para identificar si un item del menú es la opción de logout
   * Útil para aplicar lógica específica en los componentes de menú
   */
  const isLogoutItem = useCallback(
    (itemTitle: string, itemId?: number): boolean => {
      // Verificar por título
      const logoutTitles = [
        'Cerrar Sesión',
        'Cerrar sesión',
        'Logout',
        'Sign Out',
        'Salir'
      ]

      // Verificar por ID (asumiendo que el logout siempre es el último item)
      const isLastItem = itemId === 7 // ID del logout en MenuItems

      return logoutTitles.includes(itemTitle) || isLastItem
    },
    []
  )

  return {
    handleLogout,
    isLoggingOut,
    isLogoutItem
  }
}
