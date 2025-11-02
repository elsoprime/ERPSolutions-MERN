/**
 * Manager Dashboard Page
 * @description: Dashboard para Managers con acceso limitado
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React from 'react'
import {useUserProfile} from '@/hooks/useUserManagement'
import {useCurrentCompany} from '@/hooks/useCompanyManagement'
import {StatusBadge, RoleBadge} from '@/components/UI/MultiCompanyBadges'
import {UserRole, UserStatus} from '@/interfaces/EnhanchedCompany/MultiCompany'
import ProtectedLayout from '@/components/Layout/ProtectedLayout'
import DashboardHeader from '@/components/Layout/DashboardHeader'
import ModuleNavigationCards from '@/components/Shared/ModuleNavigationCards'

export default function ManagerDashboardPage() {
  const {data: userProfile, isLoading: userLoading} = useUserProfile()
  const {data: currentCompany, isLoading: companyLoading} = useCurrentCompany()

  if (userLoading || companyLoading) {
    return (
      <ProtectedLayout>
        <div className='flex items-center justify-center min-h-96'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600'></div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <DashboardHeader
        title='Dashboard Manager'
        subtitle='Panel de Control Gerencial'
        description='Gestión operativa y supervisión de equipos'
        backgroundImage='bg-gradient-to-r from-green-600 to-teal-600'
      />

      {/* Welcome Card */}
      <div className='bg-white overflow-hidden shadow rounded-lg mb-8'>
        <div className='px-4 py-5 sm:p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold'>
                {userProfile?.data?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
            </div>
            <div className='ml-5 flex-1'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>
                Bienvenido, {userProfile?.data?.name || 'Manager'}
              </h3>
              <div className='mt-1 flex items-center space-x-3'>
                <RoleBadge role={UserRole.MANAGER} size='sm' />
                <StatusBadge status={UserStatus.ACTIVE} size='sm' />
              </div>
              {currentCompany?.data && (
                <p className='mt-2 text-sm text-gray-500'>
                  {currentCompany.data.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8'>
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-6 w-6 text-blue-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a9 9 0 110-18 9 9 0 010 18z'
                  />
                </svg>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Gestionar Usuarios
                  </dt>
                  <dd className='text-lg font-medium text-gray-900'>
                    Ver Equipo
                  </dd>
                </dl>
              </div>
            </div>
            <div className='mt-3'>
              <a
                href='/users'
                className='text-sm font-medium text-blue-600 hover:text-blue-500'
              >
                Ir a Usuarios →
              </a>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-6 w-6 text-green-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                  />
                </svg>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Inventario
                  </dt>
                  <dd className='text-lg font-medium text-gray-900'>
                    Gestionar Stock
                  </dd>
                </dl>
              </div>
            </div>
            <div className='mt-3'>
              <a
                href='/inventory'
                className='text-sm font-medium text-green-600 hover:text-green-500'
              >
                Ir a Inventario →
              </a>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-6 w-6 text-purple-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Reportes
                  </dt>
                  <dd className='text-lg font-medium text-gray-900'>
                    Ver Métricas
                  </dd>
                </dl>
              </div>
            </div>
            <div className='mt-3'>
              <a
                href='/reports'
                className='text-sm font-medium text-purple-600 hover:text-purple-500'
              >
                Ir a Reportes →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <ModuleNavigationCards
        currentModule='manager'
        showAllModules={true}
        maxColumns={4}
      />

      {/* Coming Soon Message */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-blue-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-blue-800'>
              Dashboard Manager en Desarrollo
            </h3>
            <div className='mt-2 text-sm text-blue-700'>
              <p>
                Este dashboard está siendo desarrollado con funcionalidades
                específicas para Managers. Próximamente incluirá métricas de
                equipo, gestión de inventario y reportes operativos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
