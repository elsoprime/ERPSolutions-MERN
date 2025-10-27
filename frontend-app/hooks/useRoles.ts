/**
 * useRoles Hook
 * @description: Hook personalizado para gestionar roles y permisos
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import {getUserData} from '@/api/AuthAPI'
import {
  UserRole,
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRoute,
  getRoleInfo
} from '../types/roles'

interface UseRolesReturn {
  userRole: UserRole | null
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canAccessRoute: (route: string) => boolean
  getRoleInfo: () => ReturnType<typeof getRoleInfo> | null
  isLoading: boolean
}

export const useRoles = (): UseRolesReturn => {
  const userData = getUserData()
  const userRole = (userData?.role as UserRole) || null

  return {
    userRole,
    hasPermission: (permission: Permission) => {
      if (!userRole) return false
      return hasPermission(userRole, permission)
    },
    hasAnyPermission: (permissions: Permission[]) => {
      if (!userRole) return false
      return hasAnyPermission(userRole, permissions)
    },
    hasAllPermissions: (permissions: Permission[]) => {
      if (!userRole) return false
      return hasAllPermissions(userRole, permissions)
    },
    canAccessRoute: (route: string) => {
      if (!userRole) return false
      return canAccessRoute(userRole, route)
    },
    getRoleInfo: () => {
      if (!userRole) return null
      return getRoleInfo(userRole)
    },
    isLoading: false // Podrías agregar lógica de loading aquí si es necesario
  }
}
