/**
 * RoleGuard Component
 * @description: Componente para proteger contenido basado en roles y permisos
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import {ReactNode} from 'react'
import {useRoles} from '@/hooks/useRoles'
import {Permission} from '../../../../types/roles'

interface RoleGuardProps {
  children: ReactNode
  requiredPermissions?: Permission[]
  requiredAnyPermission?: Permission[]
  allowedRoutes?: string[]
  fallback?: ReactNode
  showFallback?: boolean
}

export default function RoleGuard({
  children,
  requiredPermissions = [],
  requiredAnyPermission = [],
  allowedRoutes = [],
  fallback = null,
  showFallback = false
}: RoleGuardProps) {
  const {hasAllPermissions, hasAnyPermission, canAccessRoute} = useRoles()

  // Verificar permisos requeridos
  if (requiredPermissions.length > 0) {
    if (!hasAllPermissions(requiredPermissions)) {
      return showFallback ? <>{fallback}</> : null
    }
  }

  // Verificar al menos uno de los permisos
  if (requiredAnyPermission.length > 0) {
    if (!hasAnyPermission(requiredAnyPermission)) {
      return showFallback ? <>{fallback}</> : null
    }
  }

  // Verificar acceso a rutas
  if (allowedRoutes.length > 0) {
    const hasRouteAccess = allowedRoutes.some(route => canAccessRoute(route))
    if (!hasRouteAccess) {
      return showFallback ? <>{fallback}</> : null
    }
  }

  return <>{children}</>
}
