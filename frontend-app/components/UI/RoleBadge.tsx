/**
 * RoleBadge Component
 * @description: Badge para mostrar el rol del usuario con colores y estilos
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import {useRoles} from '@/hooks/useRoles'
import {UserRole} from '../../types/roles'

interface RoleBadgeProps {
  role?: UserRole
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showDot?: boolean
  className?: string
}

export default function RoleBadge({
  role,
  size = 'sm',
  showDot = true,
  className = ''
}: RoleBadgeProps) {
  const {getRoleInfo, userRole} = useRoles()

  const targetRole = role || userRole
  if (!targetRole) return null

  const roleInfo = getRoleInfo()
  if (!roleInfo) return null

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const dotSizeClasses = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${roleInfo.colors.bg} ${roleInfo.colors.text} ${sizeClasses[size]} ${className}`}
      title={`${roleInfo.name} - ${roleInfo.description}`}
    >
      {showDot && (
        <span
          className={`${roleInfo.colors.dot} rounded-full mr-1 ${dotSizeClasses[size]}`}
        ></span>
      )}
      {roleInfo.name}
    </span>
  )
}
