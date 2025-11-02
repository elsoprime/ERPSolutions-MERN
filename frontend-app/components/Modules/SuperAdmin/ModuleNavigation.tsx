/**
 * Module Navigation Component
 * @description: Navegación rápida a los módulos principales del sistema
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface ModuleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  stats?: {
    count: number
    label: string
  }
  status?: 'active' | 'beta' | 'coming-soon'
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  href,
  stats,
  status = 'active'
}) => {
  const router = useRouter()

  const handleClick = () => {
    if (status === 'active') {
      router.push(href)
    }
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 border-dashed p-6 transition-all duration-200
        ${status === 'active' 
          ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer' 
          : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
        }
      `}
      onClick={handleClick}
    >
      {/* Status badge */}
      {status !== 'active' && (
        <span className={`
          absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full
          ${status === 'beta' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-gray-100 text-gray-600'
          }
        `}>
          {status === 'beta' ? 'Beta' : 'Próximamente'}
        </span>
      )}

      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center mb-3'>
            <div className='flex-shrink-0 mr-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                {icon}
              </div>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
              <p className='text-sm text-gray-600 mt-1'>{description}</p>
            </div>
          </div>

          {stats && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>{stats.label}</span>
                <span className='text-2xl font-bold text-blue-600'>{stats.count}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      {status === 'active' && (
        <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100' />
      )}
    </div>
  )
}

interface ModuleNavigationProps {
  stats?: {
    totalCompanies?: number
    totalUsers?: number
  }
}

export const ModuleNavigation: React.FC<ModuleNavigationProps> = ({ stats }) => {
  const modules = [
    {
      title: 'Gestión de Empresas',
      description: 'Administrar empresas, planes y configuraciones',
      icon: <BuildingOfficeIcon className='w-6 h-6 text-blue-600' />,
      href: '/dashboard/companies',
      stats: stats?.totalCompanies ? {
        count: stats.totalCompanies,
        label: 'Empresas registradas'
      } : undefined,
      status: 'active' as const
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios de todas las empresas',
      icon: <UsersIcon className='w-6 h-6 text-green-600' />,
      href: '/dashboard/users',
      stats: stats?.totalUsers ? {
        count: stats.totalUsers,
        label: 'Usuarios totales'
      } : undefined,
      status: 'active' as const
    },
    {
      title: 'Analytics y Reportes',
      description: 'Métricas detalladas y reportes del sistema',
      icon: <ChartBarIcon className='w-6 h-6 text-purple-600' />,
      href: '/dashboard/analytics',
      status: 'beta' as const
    },
    {
      title: 'Configuración Global',
      description: 'Configurar parámetros globales del sistema',
      icon: <CogIcon className='w-6 h-6 text-gray-600' />,
      href: '/dashboard/settings',
      status: 'active' as const
    },
    {
      title: 'Auditoría y Logs',
      description: 'Registro de actividades y auditoría',
      icon: <DocumentTextIcon className='w-6 h-6 text-orange-600' />,
      href: '/dashboard/audit',
      status: 'coming-soon' as const
    },
    {
      title: 'Seguridad',
      description: 'Gestión de roles, permisos y seguridad',
      icon: <ShieldCheckIcon className='w-6 h-6 text-red-600' />,
      href: '/dashboard/security',
      status: 'coming-soon' as const
    }
  ]

  return (
    <div className='bg-white rounded-lg shadow-sm border p-6'>
      <div className='mb-6'>
        <h2 className='text-lg font-medium text-gray-900'>Módulos del Sistema</h2>
        <p className='text-sm text-gray-600 mt-1'>
          Acceso rápido a todas las funcionalidades administrativas
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </div>
    </div>
  )
}

export default ModuleNavigation