/**
 * User Progress Cell Component
 * @description: Celda de progreso de usuarios para la tabla de empresas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React from 'react'
import {IEnhancedCompany} from '@/interfaces/EnhanchedCompany/EnhancedCompany'
import {
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface UserProgressCellProps {
  company: IEnhancedCompany
}

export default function UserProgressCell({company}: UserProgressCellProps) {
  // Obtener datos de usuarios del backend
  const getUserCount = (): number => {
    return (company as any).stats?.totalUsers || 0
  }

  const getUserLimit = (): number => {
    return (company as any).settings?.limits?.maxUsers || 2
  }

  const current = getUserCount()
  const limit = getUserLimit()
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0

  // Determinar color según el nivel de uso
  const getColorClasses = () => {
    if (percentage >= 100) {
      return {
        bg: 'bg-red-50',
        text: 'text-red-900',
        bar: 'bg-red-600',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-800'
      }
    }
    if (percentage >= 90) {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-900',
        bar: 'bg-orange-600',
        border: 'border-orange-200',
        badge: 'bg-orange-100 text-orange-800'
      }
    }
    if (percentage >= 75) {
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-900',
        bar: 'bg-yellow-600',
        border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800'
      }
    }
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      bar: 'bg-blue-600',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800'
    }
  }

  const colors = getColorClasses()
  const isAtLimit = percentage >= 100
  const isNearLimit = percentage >= 90 && percentage < 100

  return (
    <div className='flex flex-col gap-2'>
      {/* Header con iconos y números */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-1.5'>
          <UserGroupIcon className={`w-4 h-4 ${colors.text}`} />
          <span className={`font-semibold text-sm ${colors.text}`}>
            {current} / {limit}
          </span>
        </div>

        {/* Badge de porcentaje */}
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}
        >
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Barra de progreso mejorada */}
      <div className='relative w-full'>
        <div className='w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner'>
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
              colors.bar
            } ${percentage >= 100 ? 'animate-pulse' : ''}`}
            style={{
              width: `${percentage}%`
            }}
          />
        </div>

        {/* Marcador visual de 75% y 90% */}
        <div className='absolute top-0 left-[75%] w-px h-2.5 bg-white opacity-30' />
        <div className='absolute top-0 left-[90%] w-px h-2.5 bg-white opacity-40' />
      </div>

      {/* Advertencias cuando está cerca o en el límite */}
      {(isAtLimit || isNearLimit) && (
        <div className={`flex items-center gap-1 text-xs ${colors.text}`}>
          <ExclamationTriangleIcon className='w-3 h-3' />
          <span className='font-medium'>
            {isAtLimit
              ? 'Límite alcanzado'
              : `${limit - current} usuarios disponibles`}
          </span>
        </div>
      )}

      {/* Información adicional (disponible en hover) */}
      <div className='hidden group-hover:block text-xs text-gray-500'>
        {current === 0 ? (
          <span>Sin usuarios vinculados</span>
        ) : current === 1 ? (
          <span>1 usuario activo</span>
        ) : (
          <span>{current} usuarios activos</span>
        )}
      </div>
    </div>
  )
}
