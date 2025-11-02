'use client'

import React from 'react'
import {
  BuildingOfficeIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import {useDashboard} from '@/hooks/useDashboard'
import {LoadingSpinner} from '@/components/Shared/LoadingSpinner'

/**
 * Company Admin Dashboard Component
 * @description Dashboard específico para administradores de empresa
 * @author Esteban Soto Ojeda @elsoprimeDev
 */
export default function CompanyAdminDashboard() {
  const {users, stats, isLoading} = useDashboard()

  if (isLoading) {
    return <LoadingSpinner text='Cargando estadísticas...' fullScreen={false} />
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Dashboard - Administrador de Empresa
          </h1>
          <p className='text-gray-600 mt-1'>
            Gestiona tu empresa y usuarios de manera eficiente
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
            <BuildingOfficeIcon className='h-4 w-4 mr-1' />
            Company Admin
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Total Users */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Usuarios de la Empresa
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {users?.length || 0}
              </p>
            </div>
            <UsersIcon className='h-8 w-8 text-gray-400' />
          </div>
          <p className='text-xs text-gray-500 mt-2'>+2% desde el mes pasado</p>
        </div>

        {/* Active Projects */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Proyectos Activos
              </p>
              <p className='text-2xl font-bold text-green-600'>12</p>
            </div>
            <ArrowTrendingUpIcon className='h-8 w-8 text-gray-400' />
          </div>
          <p className='text-xs text-gray-500 mt-2'>+15% desde el mes pasado</p>
        </div>

        {/* Pending Tasks */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Tareas Pendientes
              </p>
              <p className='text-2xl font-bold text-orange-600'>8</p>
            </div>
            <ClockIcon className='h-8 w-8 text-gray-400' />
          </div>
          <p className='text-xs text-gray-500 mt-2'>Requieren atención</p>
        </div>

        {/* System Status */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Estado del Sistema
              </p>
              <div className='flex items-center space-x-2 mt-1'>
                <CheckCircleIcon className='h-5 w-5 text-green-500' />
                <span className='text-sm font-medium text-green-600'>
                  Operativo
                </span>
              </div>
            </div>
            <ChartBarIcon className='h-8 w-8 text-gray-400' />
          </div>
          <p className='text-xs text-gray-500 mt-2'>99.9% uptime</p>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Activity */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
            <ChartBarIcon className='h-5 w-5 mr-2' />
            Actividad Reciente
          </h3>
          <div className='space-y-4'>
            {stats?.recentActivity
              ?.slice(0, 5)
              .map((activity: any, index: number) => (
                <div
                  key={index}
                  className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex-shrink-0'>
                    <div className='h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      <UsersIcon className='h-4 w-4 text-blue-600' />
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {activity.title || 'Actividad de usuario'}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {activity.description || 'Acción realizada en el sistema'}
                    </p>
                  </div>
                  <div className='flex-shrink-0 text-sm text-gray-400'>
                    {activity.time || 'Hace 2h'}
                  </div>
                </div>
              )) || (
              <div className='text-center py-8 text-gray-500'>
                <ChartBarIcon className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
            <CogIcon className='h-5 w-5 mr-2' />
            Acciones Rápidas
          </h3>
          <div className='grid grid-cols-2 gap-4'>
            <button className='p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left'>
              <UsersIcon className='h-8 w-8 text-blue-600 mb-2' />
              <div className='text-sm font-medium text-gray-900'>
                Gestionar Usuarios
              </div>
              <div className='text-xs text-gray-500'>
                Crear, editar y administrar usuarios
              </div>
            </button>

            <button className='p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left'>
              <BuildingOfficeIcon className='h-8 w-8 text-green-600 mb-2' />
              <div className='text-sm font-medium text-gray-900'>
                Configurar Empresa
              </div>
              <div className='text-xs text-gray-500'>
                Actualizar datos y configuración
              </div>
            </button>

            <button className='p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left'>
              <ArrowTrendingUpIcon className='h-8 w-8 text-orange-600 mb-2' />
              <div className='text-sm font-medium text-gray-900'>
                Ver Reportes
              </div>
              <div className='text-xs text-gray-500'>
                Analizar métricas y estadísticas
              </div>
            </button>

            <button className='p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left'>
              <CogIcon className='h-8 w-8 text-purple-600 mb-2' />
              <div className='text-sm font-medium text-gray-900'>
                Configuración
              </div>
              <div className='text-xs text-gray-500'>
                Ajustar preferencias del sistema
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Company Health Status */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
          <ExclamationTriangleIcon className='h-5 w-5 mr-2' />
          Estado de la Empresa
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center p-4 bg-green-50 rounded-lg'>
            <CheckCircleIcon className='h-12 w-12 text-green-500 mx-auto mb-2' />
            <div className='text-lg font-semibold text-green-700'>
              Saludable
            </div>
            <div className='text-sm text-green-600'>
              Todos los sistemas funcionando
            </div>
          </div>

          <div className='text-center p-4 bg-blue-50 rounded-lg'>
            <ArrowTrendingUpIcon className='h-12 w-12 text-blue-500 mx-auto mb-2' />
            <div className='text-lg font-semibold text-blue-700'>
              Crecimiento
            </div>
            <div className='text-sm text-blue-600'>+15% este mes</div>
          </div>

          <div className='text-center p-4 bg-orange-50 rounded-lg'>
            <ClockIcon className='h-12 w-12 text-orange-500 mx-auto mb-2' />
            <div className='text-lg font-semibold text-orange-700'>Tareas</div>
            <div className='text-sm text-orange-600'>
              8 pendientes de revisión
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
