/**
 * Multi-Company Status Badge Component
 * @description: Componente badge para mostrar estados de usuarios y empresas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import React from 'react'
import {
  UserStatus,
  CompanyStatus,
  UserRole,
  CompanyPlan
} from '@/interfaces/EnhanchedCompany/MultiCompany'

interface StatusBadgeProps {
  status: UserStatus | CompanyStatus
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
}

interface RoleBadgeProps {
  role: UserRole
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
}

interface PlanBadgeProps {
  plan: CompanyPlan
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
}

type StatusKey = 'active' | 'inactive' | 'suspended' | 'pending' | 'trial'
type RoleKey =
  | 'super_admin'
  | 'admin_empresa'
  | 'manager'
  | 'employee'
  | 'viewer'
type PlanKey = 'free' | 'basic' | 'professional' | 'enterprise'

const STATUS_STYLES: Record<StatusKey, Record<'solid' | 'outline', string>> = {
  active: {
    solid: 'bg-green-100 text-green-800 border-green-200',
    outline: 'border-green-300 text-green-700 bg-transparent'
  },
  inactive: {
    solid: 'bg-gray-100 text-gray-800 border-gray-200',
    outline: 'border-gray-300 text-gray-700 bg-transparent'
  },
  suspended: {
    solid: 'bg-red-100 text-red-800 border-red-200',
    outline: 'border-red-300 text-red-700 bg-transparent'
  },
  pending: {
    solid: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    outline: 'border-yellow-300 text-yellow-700 bg-transparent'
  },
  trial: {
    solid: 'bg-blue-100 text-blue-800 border-blue-200',
    outline: 'border-blue-300 text-blue-700 bg-transparent'
  }
}

const ROLE_STYLES: Record<RoleKey, Record<'solid' | 'outline', string>> = {
  super_admin: {
    solid: 'bg-purple-100 text-purple-800 border-purple-200',
    outline: 'border-purple-300 text-purple-700 bg-transparent'
  },
  admin_empresa: {
    solid: 'bg-blue-100 text-blue-800 border-blue-200',
    outline: 'border-blue-300 text-blue-700 bg-transparent'
  },
  manager: {
    solid: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    outline: 'border-indigo-300 text-indigo-700 bg-transparent'
  },
  employee: {
    solid: 'bg-green-100 text-green-800 border-green-200',
    outline: 'border-green-300 text-green-700 bg-transparent'
  },
  viewer: {
    solid: 'bg-gray-100 text-gray-800 border-gray-200',
    outline: 'border-gray-300 text-gray-700 bg-transparent'
  }
}

const PLAN_STYLES: Record<PlanKey, Record<'solid' | 'outline', string>> = {
  free: {
    solid: 'bg-gray-100 text-gray-800 border-gray-200',
    outline: 'border-gray-300 text-gray-700 bg-transparent'
  },
  basic: {
    solid: 'bg-blue-100 text-blue-800 border-blue-200',
    outline: 'border-blue-300 text-blue-700 bg-transparent'
  },
  professional: {
    solid: 'bg-green-100 text-green-800 border-green-200',
    outline: 'border-green-300 text-green-700 bg-transparent'
  },
  enterprise: {
    solid: 'bg-purple-100 text-purple-800 border-purple-200',
    outline: 'border-purple-300 text-purple-700 bg-transparent'
  }
}

const SIZE_STYLES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
}

const STATUS_LABELS: Record<StatusKey, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
  pending: 'Pendiente',
  trial: 'Prueba'
}

const ROLE_LABELS: Record<RoleKey, string> = {
  super_admin: 'Super Admin',
  admin_empresa: 'Admin Empresa',
  manager: 'Manager',
  employee: 'Empleado',
  viewer: 'Visualizador'
}

const PLAN_LABELS: Record<PlanKey, string> = {
  free: 'Gratuito',
  basic: 'Básico',
  professional: 'Profesional',
  enterprise: 'Empresarial'
}

export function StatusBadge({
  status,
  size = 'md',
  variant = 'solid'
}: StatusBadgeProps) {
  const baseClasses =
    'inline-flex items-center font-medium rounded-full border transition-colors'
  const sizeClasses = SIZE_STYLES[size]
  const statusKey = status as StatusKey
  const statusClasses =
    STATUS_STYLES[statusKey]?.[variant] || STATUS_STYLES.inactive[variant]

  const getStatusIcon = () => {
    switch (statusKey) {
      case 'active':
        return (
          <span className='w-2 h-2 bg-green-500 rounded-full mr-1.5'></span>
        )
      case 'inactive':
        return <span className='w-2 h-2 bg-gray-400 rounded-full mr-1.5'></span>
      case 'suspended':
        return <span className='w-2 h-2 bg-red-500 rounded-full mr-1.5'></span>
      case 'pending':
        return (
          <span className='w-2 h-2 bg-yellow-500 rounded-full mr-1.5 animate-pulse'></span>
        )
      case 'trial':
        return <span className='w-2 h-2 bg-blue-500 rounded-full mr-1.5'></span>
      default:
        return null
    }
  }

  return (
    <span className={`${baseClasses} ${sizeClasses} ${statusClasses}`}>
      {getStatusIcon()}
      {STATUS_LABELS[statusKey] || status}
    </span>
  )
}

export function RoleBadge({
  role,
  size = 'md',
  variant = 'solid'
}: RoleBadgeProps) {
  const baseClasses =
    'inline-flex items-center font-medium rounded-full border transition-colors'
  const sizeClasses = SIZE_STYLES[size]
  const roleKey = role as RoleKey
  const roleClasses =
    ROLE_STYLES[roleKey]?.[variant] || ROLE_STYLES.viewer[variant]

  const getRoleIcon = () => {
    switch (roleKey) {
      case 'super_admin':
        return <span className='mr-1.5 text-sm'>👑</span>
      case 'admin_empresa':
        return <span className='mr-1.5 text-sm'>🏢</span>
      case 'manager':
        return <span className='mr-1.5 text-sm'>👨‍💼</span>
      case 'employee':
        return <span className='mr-1.5 text-sm'>👤</span>
      case 'viewer':
        return <span className='mr-1.5 text-sm'>👁</span>
      default:
        return null
    }
  }

  return (
    <span className={`${baseClasses} ${sizeClasses} ${roleClasses}`}>
      {getRoleIcon()}
      {ROLE_LABELS[roleKey] || role}
    </span>
  )
}

export function PlanBadge({
  plan,
  size = 'md',
  variant = 'solid'
}: PlanBadgeProps) {
  const baseClasses =
    'inline-flex items-center font-medium rounded-full border transition-colors'
  const sizeClasses = SIZE_STYLES[size]
  const planKey = plan as PlanKey
  const planClasses =
    PLAN_STYLES[planKey]?.[variant] || PLAN_STYLES.free[variant]

  const getPlanIcon = () => {
    switch (planKey) {
      case 'free':
        return <span className='mr-1.5 text-sm'>🆓</span>
      case 'basic':
        return <span className='mr-1.5 text-sm'>📋</span>
      case 'professional':
        return <span className='mr-1.5 text-sm'>💼</span>
      case 'enterprise':
        return <span className='mr-1.5 text-sm'>🏭</span>
      default:
        return null
    }
  }

  return (
    <span className={`${baseClasses} ${sizeClasses} ${planClasses}`}>
      {getPlanIcon()}
      {PLAN_LABELS[planKey] || plan}
    </span>
  )
}

// Componente para mostrar múltiples roles de un usuario
interface MultiRoleBadgeProps {
  roles: UserRole[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
  maxVisible?: number
}

export function MultiRoleBadge({
  roles,
  size = 'md',
  variant = 'solid',
  maxVisible = 2
}: MultiRoleBadgeProps) {
  const visibleRoles = roles.slice(0, maxVisible)
  const hiddenCount = roles.length - maxVisible

  return (
    <div className='flex flex-wrap gap-1'>
      {visibleRoles.map((role, index) => (
        <RoleBadge
          key={`${role}-${index}`}
          role={role}
          variant={variant}
          size={size}
        />
      ))}
      {hiddenCount > 0 && (
        <span
          className={`inline-flex items-center font-medium rounded-full border bg-gray-100 text-gray-600 border-gray-200 ${SIZE_STYLES[size]}`}
        >
          +{hiddenCount} más
        </span>
      )}
    </div>
  )
}

// Componente para mostrar información de capacidad (usuarios/empresas)
interface CapacityBadgeProps {
  current: number
  limit: number | 'unlimited'
  type: 'users' | 'companies'
  size?: 'sm' | 'md' | 'lg'
}

export function CapacityBadge({
  current,
  limit,
  type,
  size = 'md'
}: CapacityBadgeProps) {
  const isUnlimited = limit === 'unlimited'
  const percentage = isUnlimited ? 0 : (current / limit) * 100
  const isNearLimit = percentage > 80
  const isAtLimit = percentage >= 100

  const getVariantClass = () => {
    if (isAtLimit) return 'bg-red-100 text-red-800 border-red-200'
    if (isNearLimit) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const typeLabel = type === 'users' ? 'usuarios' : 'empresas'
  const displayLimit = isUnlimited ? '∞' : limit

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${
        SIZE_STYLES[size]
      } ${getVariantClass()}`}
    >
      {current}/{displayLimit} {typeLabel}
    </span>
  )
}

// Componente para mostrar tiempo restante de trial
interface TrialBadgeProps {
  daysLeft: number
  size?: 'sm' | 'md' | 'lg'
}

export function TrialBadge({daysLeft, size = 'md'}: TrialBadgeProps) {
  const isExpiringSoon = daysLeft <= 3
  const hasExpired = daysLeft <= 0

  const getVariantClass = () => {
    if (hasExpired) return 'bg-red-100 text-red-800 border-red-200'
    if (isExpiringSoon) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getText = () => {
    if (hasExpired) return 'Trial expirado'
    if (daysLeft === 1) return '1 día restante'
    return `${daysLeft} días restantes`
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${
        SIZE_STYLES[size]
      } ${getVariantClass()}`}
    >
      <span className='mr-1.5 text-sm'>⏰</span>
      {getText()}
    </span>
  )
}

export default {
  StatusBadge,
  RoleBadge,
  PlanBadge,
  MultiRoleBadge,
  CapacityBadge,
  TrialBadge
}
