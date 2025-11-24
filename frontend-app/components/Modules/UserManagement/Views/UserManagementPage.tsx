/**
 * User Management Main Page
 * @description: Página principal del módulo de gestión de usuarios multi-empresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { UserTable } from '@/components/Modules/UserManagement'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/interfaces/EnhanchedCompany/MultiCompany'
import UserOverviewDashboard from './UserOverviewDashboard'
import {
  LockClosedIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/20/solid'
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline'

type ViewMode = 'dashboard' | 'users'

export const UserManagementPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const { getUserData } = useAuth()
  const queryClient = useQueryClient()
  const user = getUserData() // Obtener datos del usuario autenticado

  // ✅ Refrescar lista de usuarios cuando se cambia al tab "users"
  useEffect(() => {
    if (currentView === 'users') {
      // Invalidar queries de usuarios para forzar refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  }, [currentView, queryClient])

  if (!user) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Cargando...</p>
        </div>
      </div>
    )
  }

  // Determinar el tipo de usuario
  // Soporte para sistema legacy (role simple) y sistema enhanced (roles array)
  const isSuperAdmin =
    user.role === 'super_admin' || // Sistema legacy
    user.role === UserRole.SUPER_ADMIN || // Sistema legacy con enum
    user.roles?.some(
      (role: any) =>
        role.role === UserRole.SUPER_ADMIN ||
        role.role === 'super_admin' ||
        (role.roleType === 'global' && role.role === UserRole.SUPER_ADMIN)
    )

  const isCompanyAdmin =
    user.role === 'admin_empresa' || // Sistema legacy
    user.role === UserRole.ADMIN_EMPRESA || // Sistema legacy con enum
    user.roles?.some(
      (role: any) =>
        role.role === UserRole.ADMIN_EMPRESA ||
        role.role === 'admin_empresa' ||
        (role.roleType === 'company' && role.role === UserRole.ADMIN_EMPRESA)
    )

  const hasUserManagementAccess = isSuperAdmin || isCompanyAdmin

  // Debug: Mostrar información del usuario en consola
  console.log('🔍 User Management Access Check:', {
    user,
    isSuperAdmin,
    isCompanyAdmin,
    hasUserManagementAccess,
    userRole: user.role,
    userRoles: user.roles
  })

  if (!hasUserManagementAccess) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <LockClosedIcon className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-4 text-lg font-medium text-gray-900'>
            Acceso Restringido
          </h3>
          <p className='mt-2 text-gray-600'>
            No tienes permisos para acceder a la gestión de usuarios.
          </p>
          {/* Debug info */}
          <div className='mt-4 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto'>
            <p className='text-xs font-mono text-gray-600'>
              <strong>Debug Info:</strong>
              <br />
              Usuario: {user.name}
              <br />
              Email: {user.email}
              <br />
              Role (legacy): {user.role || 'N/A'}
              <br />
              Roles (enhanced): {user.roles?.length || 0} roles
              <br />
              {user.roles?.map((r: any, i: number) => (
                <span key={i}>
                  • {r.role} ({r.roleType || 'N/A'})
                  <br />
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white/80 shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto lg:mx-0 px-3 sm:px-4 md:px-6 lg:px-8'>
          <div className='py-3 sm:py-4'>
            {/* Título */}
            <div className='mb-3'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900'>
                Gestión de Usuarios
              </h3>
              <p className='text-xs sm:text-sm text-gray-600 mt-1'>
                {isSuperAdmin
                  ? 'Panel de administración de usuarios del sistema'
                  : 'Panel de administración de usuarios de tu empresa'}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className='mt-2'>
              {/* Vista móvil: Select dropdown */}
              <div className='sm:hidden'>
                <label htmlFor='view-tabs' className='sr-only'>
                  Seleccionar vista
                </label>
                <select
                  id='view-tabs'
                  name='view-tabs'
                  value={currentView}
                  onChange={e => setCurrentView(e.target.value as ViewMode)}
                  className='block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500'
                >
                  <option value='dashboard'>Dashboard</option>
                  <option value='users'>Lista de Usuarios</option>
                </select>
              </div>

              {/* Vista tablet/desktop: Tabs horizontales */}
              <nav
                className='hidden sm:flex sm:space-x-4 md:space-x-8'
                aria-label='Tabs'
              >
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${currentView === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <ChartBarIcon
                    className={`mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 ${currentView === 'dashboard'
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                  />
                  Dashboard
                </button>

                <button
                  onClick={() => setCurrentView('users')}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${currentView === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <UserGroupIcon
                    className={`mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 ${currentView === 'users'
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                  />
                  Lista de Usuarios
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='mt-4'>
        {currentView === 'dashboard' && (
          <>
            {isSuperAdmin ? (
              <UserOverviewDashboard />
            ) : (
              // Si no es Super Admin pero llegó aquí, mostrar mensaje
              <div className='flex items-center justify-center h-96'>
                <div className='text-center max-w-md'>
                  <ExclamationTriangleIcon className='mx-auto h-16 w-16 text-amber-400' />
                  <h3 className='mt-4 text-xl font-semibold text-gray-900'>
                    Vista No Disponible
                  </h3>
                  <p className='mt-2 text-gray-600'>
                    Esta vista está reservada para Super Administradores.
                  </p>
                  <p className='mt-1 text-sm text-gray-500'>
                    Los administradores de empresa deben acceder desde su panel
                    correspondiente.
                  </p>
                  <div className='mt-6'>
                    <button
                      onClick={() => setCurrentView('users')}
                      className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    >
                      <UserGroupIcon className='-ml-1 mr-2 h-5 w-5' />
                      Ver Lista de Usuarios
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {currentView === 'users' && (
          <UserTable
            companyScope={!isSuperAdmin}
            showActions={true}
            maxHeight='max-h-screen'
          />
        )}
      </div>
    </div>
  )
}

export default UserManagementPage
