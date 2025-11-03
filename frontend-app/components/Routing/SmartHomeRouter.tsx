/**
 * Smart Home Router Component
 * @description: Componente que muestra el dashboard apropiado según el rol del usuario
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useEffect, useState} from 'react'
import {useAuth} from '@/hooks/useAuth'
import {getHighestRole} from '@/utils/roleRouting'
import {UserRole} from '@/interfaces/EnhanchedCompany/MultiCompany'
import {
  SuperAdminDashboard,
  CompanyAdminDashboard
} from '@/components/Modules/SuperAdmin'
import DashboardHeader from '@/components/Layout/DashboardHeader'
import {useRouter} from 'next/navigation'

interface SmartHomeRouterProps {
  children?: React.ReactNode
}

const SmartHomeRouter: React.FC<SmartHomeRouterProps> = ({children}) => {
  const router = useRouter()
  const {getUserData, isAuthenticated} = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleRouting = async () => {
      try {
        // Verificar si está autenticado
        //console.log('SmartHomeRouter - Checking authentication...')
        if (!isAuthenticated()) {
          //console.log('SmartHomeRouter - Not authenticated, redirecting to /')
          router.push('/')
          return
        }

        // Pequeño delay para asegurar que las cookies estén actualizadas
        await new Promise(resolve => setTimeout(resolve, 100))

        // Obtener datos del usuario
        const userData = getUserData()
        if (!userData) {
          setError('No se pudieron obtener los datos del usuario')
          setIsLoading(false)
          return
        }

        // 🔥 CAMBIO CLAVE: No redirigir desde /home, renderizar contenido directamente
        console.log(
          'SmartHomeRouter - Ready to render content for:',
          userData.name
        )
        setIsLoading(false)
      } catch (err) {
        console.error('Error en Smart Router:', err)
        setError('Error al determinar la vista apropiada')
        setIsLoading(false)
      }
    }

    handleRouting()
  }, [router, getUserData, isAuthenticated])

  // Función para renderizar el dashboard apropiado según el rol
  const renderDashboardContent = () => {
    const userData = getUserData()
    if (!userData) return null

    const highestRole = getHighestRole(userData)

    // Configuración del header según el rol
    const getHeaderProps = () => {
      switch (highestRole) {
        case UserRole.SUPER_ADMIN:
          return {
            title: 'Dashboard Super Admin',
            subtitle: 'Panel de Control Global',
            description:
              'Gestión completa del sistema ERP con acceso a todas las funcionalidades administrativas.',
            backgroundImage: 'bg-gradient-to-r from-red-600 to-purple-600'
          }
        case UserRole.ADMIN_EMPRESA:
          return {
            title: 'Dashboard Admin Empresa',
            subtitle: 'Panel de Administración',
            description: 'Gestión completa de tu empresa y usuarios.',
            backgroundImage: 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }
        case UserRole.MANAGER:
          return {
            title: 'Dashboard Manager',
            subtitle: 'Panel de Gestión',
            description: 'Supervisión y gestión de procesos operativos.',
            backgroundImage: 'bg-gradient-to-r from-green-600 to-teal-600'
          }
        case UserRole.EMPLOYEE:
          return {
            title: 'Dashboard Empleado',
            subtitle: 'Panel de Trabajo',
            description: 'Acceso a herramientas de trabajo y productividad.',
            backgroundImage: 'bg-gradient-to-r from-yellow-600 to-orange-600'
          }
        case UserRole.VIEWER:
          return {
            title: 'Dashboard Viewer',
            subtitle: 'Panel de Visualización',
            description: 'Acceso de solo lectura para visualizar información.',
            backgroundImage: 'bg-gradient-to-r from-gray-500 to-gray-600'
          }
        default:
          return {
            title: 'Dashboard',
            subtitle: 'Panel Principal',
            description: 'Bienvenido al sistema ERP.',
            backgroundImage: 'bg-gradient-to-r from-blue-500 to-purple-600'
          }
      }
    }

    const headerProps = getHeaderProps()

    return (
      <>
        <DashboardHeader {...headerProps} />

        {/* Dashboard específico por rol */}
        {highestRole === UserRole.SUPER_ADMIN && <SuperAdminDashboard />}
        {highestRole === UserRole.ADMIN_EMPRESA && <CompanyAdminDashboard />}

        {/* Dashboard genérico para otros roles */}
        {![UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA].includes(
          highestRole
        ) && (
          <div className='space-y-6'>
            {/* Welcome Card */}
            <div className='bg-white overflow-hidden shadow rounded-lg'>
              <div className='px-4 py-5 sm:p-6'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full flex items-center justify-center text-white text-xl font-bold'>
                      {userData?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className='ml-5 flex-1'>
                    <h3 className='text-lg leading-6 font-medium text-gray-900'>
                      Bienvenido, {userData?.name || 'Usuario'}
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                      Rol: {highestRole}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto'></div>
          <h2 className='mt-4 text-xl font-semibold text-gray-900'>
            Preparando tu dashboard...
          </h2>
          <p className='mt-2 text-gray-600'>
            Configurando tu experiencia personalizada
          </p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100'>
            <svg
              className='h-8 w-8 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.382 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='mt-4 text-xl font-semibold text-gray-900'>
            Error de Enrutamiento
          </h2>
          <p className='mt-2 text-gray-600'>{error}</p>
          <div className='mt-6'>
            <button
              onClick={() => window.location.reload()}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar el contenido del dashboard basado en el rol
  return renderDashboardContent()
}

export default SmartHomeRouter
