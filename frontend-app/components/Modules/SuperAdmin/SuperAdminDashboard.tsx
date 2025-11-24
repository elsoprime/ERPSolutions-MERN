/**
 * Super Admin Dashboard Component
 * @description: Dashboard principal para Super Administradores con vista global del sistema
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboard } from '@/hooks/useDashboard'
import useModuleNavigation from '@/hooks/useModuleNavigation'
import ModuleNavigation from './ModuleNavigation'
import {
  StatusBadge,
  PlanBadge,
  CapacityBadge,
  TrialBadge
} from '@/components/UI/MultiCompanyBadges'
import {
  IEnhancedCompany,

  CompanyStatus
} from '@/interfaces/EnhanchedCompany/MultiCompany'
import { IUser } from '@/api/UserAPI'
import { PlanType } from '@/types/plan'

interface QuickAction {
  id: string
  label: string
  icon: string
  description: string
  action: () => void
  variant: 'primary' | 'secondary' | 'danger'
  href?: string
}

export const SuperAdminDashboard: React.FC = () => {
  const router = useRouter()
  const { navigateToCompanies, navigateToUsers, navigateToSettings } =
    useModuleNavigation()
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '7d' | '30d' | '90d'
  >('30d')
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)

  // Usar el nuevo hook del dashboard
  const { companies, users, stats, isLoading, error, refreshAll } = useDashboard()

  // Acciones rápidas con navegación a módulos
  const quickActions: QuickAction[] = [
    {
      id: 'companies-module',
      label: 'Gestión de Empresas',
      icon: '🏢',
      description: 'Ver, crear y administrar empresas del sistema',
      action: navigateToCompanies,
      variant: 'primary',
      href: '/dashboard/companies'
    },
    {
      id: 'users-module',
      label: 'Gestión de Usuarios',
      icon: '👥',
      description: 'Administrar usuarios de todas las empresas',
      action: navigateToUsers,
      variant: 'primary',
      href: '/dashboard/users'
    },
    {
      id: 'create-company',
      label: 'Crear Empresa',
      icon: '�️',
      description: 'Registrar nueva empresa en el sistema',
      action: () => setShowCreateCompanyModal(true),
      variant: 'secondary'
    },
    {
      id: 'create-superadmin',
      label: 'Crear Super Admin',
      icon: '👑',
      description: 'Agregar nuevo super administrador',
      action: () => setShowCreateUserModal(true),
      variant: 'secondary'
    },
    {
      id: 'system-health',
      label: 'Estado del Sistema',
      icon: '📊',
      description: 'Ver métricas y rendimiento del sistema',
      action: () => router.push('/dashboard/system-health'),
      variant: 'secondary'
    },
    {
      id: 'settings',
      label: 'Configuración Global',
      icon: '⚙️',
      description: 'Configurar parámetros globales del sistema',
      action: navigateToSettings,
      variant: 'secondary'
    }
  ]

  // Empresas que requieren atención
  const companiesNeedingAttention = React.useMemo(() => {
    if (!stats?.companiesNeedingAttention) return []
    return stats.companiesNeedingAttention
  }, [stats])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='text-red-500 text-xl mb-4'>
            ⚠️ Error al cargar datos
          </div>
          <button
            onClick={refreshAll}
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Dashboard Super Admin
            </h1>
            <p className='text-gray-600'>Vista global del sistema ERP</p>
          </div>
          <div className='flex items-center space-x-3'>
            <select
              value={selectedTimeRange}
              onChange={e =>
                setSelectedTimeRange(e.target.value as '7d' | '30d' | '90d')
              }
              className='rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              aria-label='Seleccionar rango de tiempo para las estadísticas'
            >
              <option value='7d'>Últimos 7 días</option>
              <option value='30d'>Últimos 30 días</option>
              <option value='90d'>Últimos 90 días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                <span className='text-blue-600 text-lg'>🏢</span>
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Total Empresas
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {stats?.totalCompanies || 0}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <div className='flex items-center'>
              <span className='px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'>
                Activas
              </span>
              <span className='ml-2 text-sm text-gray-600'>
                {stats?.activeCompanies || 0} activas
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                <span className='text-green-600 text-lg'>👥</span>
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Total Usuarios
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {stats?.totalUsers || 0}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <div className='flex items-center'>
              <span className='px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'>
                Activos
              </span>
              <span className='ml-2 text-sm text-gray-600'>
                {stats?.activeUsers || 0} activos
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                <span className='text-purple-600 text-lg'>💼</span>
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Planes Enterprise
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {stats?.companiesByPlan?.enterprise || 0}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <div className='flex items-center space-x-2'>
              <PlanBadge plan={PlanType.PROFESSIONAL} size='sm' />
              <span className='text-sm text-gray-600'>
                {stats?.companiesByPlan?.professional || 0}
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <span className='text-yellow-600 text-lg'>⚠️</span>
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Requieren Atención
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {companiesNeedingAttention.length}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <span className='text-sm text-gray-600'>
              Empresas con problemas
            </span>
          </div>
        </div>
      </div>

      {/* Navegación de módulos */}
      <ModuleNavigation
        stats={{
          totalCompanies: stats?.totalCompanies || 0,
          totalUsers: stats?.totalUsers || 0
        }}
      />

      {/* Acciones rápidas */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h2 className='text-lg font-medium text-gray-900 mb-4'>
          Acciones Rápidas
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={action.action}
              className={`p-4 rounded-lg border-2 border-dashed transition-colors text-left ${action.variant === 'primary'
                ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                : action.variant === 'danger'
                  ? 'border-red-300 hover:border-red-400 hover:bg-red-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
            >
              <div className='flex items-center mb-2'>
                <span className='text-2xl mr-3'>{action.icon}</span>
                <span className='font-medium text-gray-900'>
                  {action.label}
                </span>
              </div>
              <p className='text-sm text-gray-600'>{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Grid de contenido principal */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Empresas que requieren atención */}
        <div className='lg:col-span-2 bg-white rounded-lg shadow-sm border p-6'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>
            Empresas que Requieren Atención
          </h2>
          {companiesNeedingAttention.length === 0 ? (
            <div className='text-center py-8'>
              <span className='text-4xl'>✅</span>
              <p className='mt-2 text-gray-600'>
                Todas las empresas están funcionando correctamente
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {companiesNeedingAttention.map((company: any) => (
                <div
                  key={company._id}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    <div>
                      <h3 className='font-medium text-gray-900'>
                        {company.name}
                      </h3>
                      <div className='flex items-center space-x-2 mt-1'>
                        <span className='px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full'>
                          {company.status}
                        </span>
                        <PlanBadge plan={company.plan} size='sm' />
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {company.status === 'suspended' ? (
                      <button className='px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium hover:bg-green-200'>
                        Reactivar
                      </button>
                    ) : (
                      <button className='px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200'>
                        Ver Detalles
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>
            Actividad Reciente
          </h2>
          <div className='space-y-4'>
            {stats?.recentActivity?.map(activity => (
              <div key={activity.id} className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 text-sm'>
                      {activity.type === 'company_created' && '🏢'}
                      {activity.type === 'user_registered' && '👤'}
                    </span>
                  </div>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-gray-900'>
                    {activity.description}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {activity.timestamp.toLocaleString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )) || (
                <div className='text-center py-4 text-gray-500'>
                  No hay actividad reciente
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Distribución de planes */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h2 className='text-lg font-medium text-gray-900 mb-4'>
          Distribución de Planes
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {stats?.companiesByPlan &&
            Object.entries(stats.companiesByPlan).map(([plan, count]) => (
              <div key={plan} className='text-center'>
                <div className='mb-2'>
                  <PlanBadge plan={plan as PlanType} size='md' />
                </div>
                <div className='text-2xl font-bold text-gray-900'>{count}</div>
                <div className='text-sm text-gray-600'>empresas</div>
              </div>
            ))}
          {(!stats?.companiesByPlan ||
            Object.keys(stats.companiesByPlan).length === 0) && (
              <div className='col-span-4 text-center py-8 text-gray-500'>
                No hay datos de planes disponibles
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
