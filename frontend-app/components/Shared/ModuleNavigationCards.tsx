/**
 * Module Navigation Cards Component
 * @description: Tarjetas inteligentes para navegar entre módulos según permisos del rol
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from '@/hooks/useAuth'
import {getHighestRole, hasRouteAccess} from '@/utils/roleRouting'
import {UserRole} from '@/interfaces/EnhanchedCompany/MultiCompany'

interface ModuleCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  requiredRoles?: UserRole[]
  isReadOnly?: boolean
}

interface ModuleNavigationProps {
  currentModule?: string
  showAllModules?: boolean
  maxColumns?: number
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  href,
  icon,
  color,
  requiredRoles = [],
  isReadOnly = false
}) => {
  const {getUserData} = useAuth()
  const router = useRouter()

  const userData = getUserData()
  const userRole = getHighestRole(userData)

  // Verificar si el usuario tiene acceso
  const hasAccess =
    requiredRoles.length === 0 || requiredRoles.includes(userRole)

  // Verificar si puede acceder a la ruta específica
  const canAccessRoute = hasRouteAccess(userData, href)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (!hasAccess || !canAccessRoute) {
      // Mostrar mensaje de acceso denegado
      alert(`Acceso denegado: No tienes permisos para acceder a ${title}`)
      return
    }

    router.push(href)
  }

  // Estilos condicionados según acceso
  const cardStyles =
    hasAccess && canAccessRoute
      ? `bg-white hover:bg-gray-50 border-gray-200 hover:border-${color}-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer`
      : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'

  const textStyles =
    hasAccess && canAccessRoute ? 'text-gray-900' : 'text-gray-500'

  const iconStyles =
    hasAccess && canAccessRoute ? `text-${color}-600` : 'text-gray-400'

  return (
    <div
      onClick={handleClick}
      className={`overflow-hidden shadow rounded-lg border p-5 ${cardStyles}`}
    >
      <div className='flex items-center'>
        <div className='flex-shrink-0'>
          <div className={`h-6 w-6 ${iconStyles}`}>{icon}</div>
        </div>
        <div className='ml-5 w-0 flex-1'>
          <dl>
            <dt className={`text-sm font-medium truncate ${textStyles}`}>
              {title}
            </dt>
            <dd className={`text-lg font-medium ${textStyles}`}>
              {description}
            </dd>
          </dl>
        </div>
        {!hasAccess && (
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-red-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 15v2m0 0v2m0-2h2m-2 0H10m8-9a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
        )}
        {isReadOnly && hasAccess && (
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-gray-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
          </div>
        )}
      </div>
      {hasAccess && canAccessRoute && (
        <div className='mt-3'>
          <span
            className={`text-sm font-medium text-${color}-600 hover:text-${color}-500`}
          >
            Ir a {title} →
          </span>
        </div>
      )}
      {!hasAccess && (
        <div className='mt-3'>
          <span className='text-sm font-medium text-red-500'>
            Acceso restringido
          </span>
        </div>
      )}
    </div>
  )
}

const ModuleNavigationCards: React.FC<ModuleNavigationProps> = ({
  currentModule,
  showAllModules = true,
  maxColumns = 4
}) => {
  const {getUserData} = useAuth()
  const userData = getUserData()
  const userRole = getHighestRole(userData)

  // Definir todos los módulos disponibles
  const allModules = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios',
      href: '/users',
      color: 'blue',
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER
      ],
      isReadOnly: userRole === UserRole.VIEWER,
      icon: (
        <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a9 9 0 110-18 9 9 0 010 18z'
          />
        </svg>
      )
    },
    {
      title: 'Gestión de Empresas',
      description: 'Administrar empresas y configuraciones',
      href: '/companies',
      color: 'emerald',
      requiredRoles: [UserRole.SUPER_ADMIN],
      isReadOnly: false,
      icon: (
        <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
          />
        </svg>
      )
    },
    {
      title: 'Inventario',
      description: 'Gestionar productos',
      href: '/inventory',
      color: 'green',
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
        UserRole.VIEWER
      ],
      isReadOnly: userRole === UserRole.VIEWER,
      icon: (
        <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          />
        </svg>
      )
    },
    {
      title: 'Reportes',
      description: 'Ver informes',
      href: '/reports',
      color: 'purple',
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
        UserRole.VIEWER
      ],
      isReadOnly:
        userRole === UserRole.VIEWER || userRole === UserRole.EMPLOYEE,
      icon: (
        <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      )
    },
    {
      title: 'Configuraciones',
      description: 'Ajustes del sistema',
      href: '/settings',
      color: 'gray',
      requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA],
      icon: (
        <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
        </svg>
      )
    },
    {
      title: 'Ventas',
      description: 'Gestionar ventas',
      href: '/sales',
      color: 'emerald',
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE
      ],
      isReadOnly: userRole === UserRole.VIEWER,
      icon: (
        <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
          />
        </svg>
      )
    },
    {
      title: 'Compras',
      description: 'Gestionar compras',
      href: '/purchases',
      color: 'orange',
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE
      ],
      isReadOnly: userRole === UserRole.VIEWER,
      icon: (
        <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01'
          />
        </svg>
      )
    },
    {
      title: 'Analytics',
      description: 'Métricas y análisis',
      href: '/analytics',
      color: 'pink',
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER
      ],
      isReadOnly: userRole === UserRole.VIEWER,
      icon: (
        <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      )
    }
  ]

  // Filtrar módulos según acceso del usuario
  const accessibleModules = showAllModules
    ? allModules
    : allModules.filter(
        module =>
          module.requiredRoles.length === 0 ||
          module.requiredRoles.includes(userRole)
      )

  // Filtrar módulo actual si está especificado
  const filteredModules = currentModule
    ? accessibleModules.filter(module => !module.href.includes(currentModule))
    : accessibleModules

  // Determinar grid columns
  const gridCols = Math.min(maxColumns, filteredModules.length)
  const gridClass =
    {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    }[gridCols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className='mb-8'>
      <div className='mb-6'>
        <h2 className='text-lg font-medium text-gray-900 mb-2'>
          Módulos Disponibles
        </h2>
        <p className='text-sm text-gray-600'>
          Accede a los diferentes módulos del sistema según tus permisos
        </p>
      </div>

      <div className={`grid gap-6 ${gridClass}`}>
        {filteredModules.map((module, index) => (
          <ModuleCard
            key={`${module.title.replace(/\s+/g, '-').toLowerCase()}-${index}`}
            title={module.title}
            description={module.description}
            href={module.href}
            icon={module.icon}
            color={module.color}
            requiredRoles={module.requiredRoles}
            isReadOnly={module.isReadOnly}
          />
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className='text-center py-12'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
            />
          </svg>
          <h3 className='mt-2 text-sm font-medium text-gray-900'>
            No hay módulos disponibles
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            No tienes acceso a módulos adicionales con tu rol actual
          </p>
        </div>
      )}
    </div>
  )
}

export default ModuleNavigationCards
