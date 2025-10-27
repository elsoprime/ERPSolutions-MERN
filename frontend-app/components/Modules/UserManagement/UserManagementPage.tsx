/**
 * User Management Main Page
 * @description: Página principal del módulo de gestión de usuarios multi-empresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useState} from 'react'
import {
  SuperAdminDashboard,
  CompanyAdminDashboard,
  UserTable
} from '@/components/Modules/UserManagement'
import {useAuth} from '@/hooks/useAuth'
import {UserRole} from '@/interfaces/MultiCompany'

type ViewMode = 'dashboard' | 'users'

export const UserManagementPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const {getUserData} = useAuth()
  const user = getUserData() // Obtener datos del usuario autenticado

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
  const isSuperAdmin = user.roles?.some(
    (role: any) =>
      role.role === UserRole.SUPER_ADMIN && role.roleType === 'global'
  )

  const isCompanyAdmin = user.roles?.some(
    (role: any) =>
      role.role === UserRole.ADMIN_EMPRESA && role.roleType === 'company'
  )

  const hasUserManagementAccess = isSuperAdmin || isCompanyAdmin

  if (!hasUserManagementAccess) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
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
              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            />
          </svg>
          <h3 className='mt-4 text-lg font-medium text-gray-900'>
            Acceso Restringido
          </h3>
          <p className='mt-2 text-gray-600'>
            No tienes permisos para acceder a la gestión de usuarios.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Navigation */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex'>
              <div className='flex-shrink-0 flex items-center'>
                <h1 className='text-xl font-semibold text-gray-900'>
                  Gestión de Usuarios
                </h1>
              </div>
              <nav className='hidden md:ml-6 md:flex md:space-x-8'>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('users')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'users'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Lista de Usuarios
                </button>
              </nav>
            </div>

            {/* User info */}
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='flex items-center space-x-2'>
                  <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium'>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className='hidden md:block'>
                    <div className='text-sm font-medium text-gray-900'>
                      {user.name}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {isSuperAdmin ? 'Super Admin' : 'Admin Empresa'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          {currentView === 'dashboard' && (
            <>
              {isSuperAdmin && <SuperAdminDashboard />}
              {!isSuperAdmin && isCompanyAdmin && <CompanyAdminDashboard />}
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

      {/* Mobile Navigation */}
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden'>
        <div className='grid grid-cols-2 h-16'>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center justify-center text-xs font-medium ${
              currentView === 'dashboard'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            <svg
              className='w-5 h-5 mb-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10z'
              />
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('users')}
            className={`flex flex-col items-center justify-center text-xs font-medium ${
              currentView === 'users'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            <svg
              className='w-5 h-5 mb-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a9 9 0 110-18 9 9 0 010 18z'
              />
            </svg>
            Usuarios
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserManagementPage
