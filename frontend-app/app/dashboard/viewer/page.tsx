/**
 * Viewer Dashboard Page
 * @description: Dashboard para Viewers con acceso de solo lectura
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useUserProfile} from '@/hooks/useUserManagement'
import {useCurrentCompany} from '@/hooks/useCompanyManagement'
import {useAuth} from '@/hooks/useAuth'
import {getHighestRole, getDefaultRoute} from '@/utils/roleRouting'
import {UserRole} from '@/interfaces/MultiCompany'
import {StatusBadge, RoleBadge} from '@/components/UI/MultiCompanyBadges'
import {UserStatus} from '@/interfaces/MultiCompany'
import ProtectedLayout from '@/components/Layout/ProtectedLayout'
import DashboardHeader from '@/components/Layout/DashboardHeader'
import ModuleNavigationCards from '@/components/Shared/ModuleNavigationCards'

export default function ViewerDashboardPage() {
  const router = useRouter()
  const {getUserData} = useAuth()
  const {data: userProfile, isLoading: userLoading} = useUserProfile()
  const {data: currentCompany, isLoading: companyLoading} = useCurrentCompany()

  // 🔥 VERIFICACIÓN: Asegurar que el usuario debería estar en viewer
  useEffect(() => {
    const userData = getUserData()
    if (userData) {
      const highestRole = getHighestRole(userData)
      const correctRoute = getDefaultRoute(userData)

      // Si el usuario no debería estar en viewer, redirigir
      if (
        highestRole !== UserRole.VIEWER &&
        correctRoute !== '/dashboard/viewer'
      ) {
        router.push(correctRoute)
        return
      }
    }
  }, [getUserData, router])

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
        title='Dashboard Viewer'
        subtitle='Panel de Visualización'
        description='Acceso de solo lectura para visualizar información y reportes del sistema.'
        backgroundImage='bg-gradient-to-r from-gray-100 via-gray-200 to-gray-600'
      />

      {/* Welcome Card */}
      <div className='bg-white overflow-hidden shadow rounded-lg mb-8'>
        <div className='px-4 py-5 sm:p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='h-16 w-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white text-xl font-bold'>
                {userProfile?.data?.name?.charAt(0).toUpperCase() || 'V'}
              </div>
            </div>
            <div className='ml-5 flex-1'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>
                Bienvenido, {userProfile?.data?.name || 'Viewer'}
              </h3>
              <div className='mt-1 flex items-center space-x-3'>
                <RoleBadge role={UserRole.VIEWER} size='sm' />
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

      {/* Module Navigation */}
      <ModuleNavigationCards
        currentModule='viewer'
        showAllModules={true}
        maxColumns={3}
      />

      {/* Access Level Information */}
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-gray-400'
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
            <h3 className='text-sm font-medium text-gray-800'>
              Acceso de Solo Lectura
            </h3>
            <div className='mt-2 text-sm text-gray-700'>
              <p>
                Como Viewer, tienes acceso únicamente para visualizar
                información. No puedes realizar modificaciones, crear o eliminar
                datos. Para acciones adicionales, contacta a tu administrador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
