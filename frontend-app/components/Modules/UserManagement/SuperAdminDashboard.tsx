/**
 * Super Admin Dashboard Component
 * @description: Dashboard principal para Super Administradores con vista global del sistema
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useState} from 'react'
import {useUsers} from '@/hooks/useUserManagement'
import {useCompanies} from '@/hooks/useCompanyManagement'
import {
  StatusBadge,
  PlanBadge,
  CapacityBadge,
  TrialBadge
} from '@/components/UI/MultiCompanyBadges'
import {
  IEnhancedCompany,
  IEnhancedUser,
  CompanyPlan,
  CompanyStatus,
  UserStatus
} from '@/interfaces/MultiCompany'

interface DashboardStats {
  totalCompanies: number
  activeCompanies: number
  totalUsers: number
  activeUsers: number
  companiesByPlan: Record<CompanyPlan, number>
  recentActivity: Array<{
    id: string
    type:
      | 'company_created'
      | 'company_suspended'
      | 'plan_upgraded'
      | 'user_registered'
    description: string
    timestamp: Date
    company?: string
  }>
}

interface QuickAction {
  id: string
  label: string
  icon: string
  description: string
  action: () => void
  variant: 'primary' | 'secondary' | 'danger'
}

export const SuperAdminDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '7d' | '30d' | '90d'
  >('30d')
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)

  // Hooks para datos
  const {companies, isLoading: companiesLoading} = useCompanies()
  const {users, isLoading: usersLoading} = useUsers()

  // Calcular estadísticas
  const stats: DashboardStats = React.useMemo(() => {
    const activeCompanies = companies.filter(
      (c: IEnhancedCompany) => c.status === CompanyStatus.ACTIVE
    ).length
    const activeUsers = users.filter(
      (u: IEnhancedUser) => u.status === UserStatus.ACTIVE
    ).length

    const companiesByPlan = companies.reduce(
      (acc: Record<CompanyPlan, number>, company: IEnhancedCompany) => {
        acc[company.plan] = (acc[company.plan] || 0) + 1
        return acc
      },
      {} as Record<CompanyPlan, number>
    )

    // Simular actividad reciente (en un caso real vendría de la API)
    const recentActivity = [
      {
        id: '1',
        type: 'company_created' as const,
        description: 'Nueva empresa "TechCorp" registrada',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        company: 'TechCorp'
      },
      {
        id: '2',
        type: 'plan_upgraded' as const,
        description: 'Empresa "SoftwarePlus" actualizó a plan Professional',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        company: 'SoftwarePlus'
      },
      {
        id: '3',
        type: 'user_registered' as const,
        description: '15 nuevos usuarios registrados hoy',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
      }
    ]

    return {
      totalCompanies: companies.length,
      activeCompanies,
      totalUsers: users.length,
      activeUsers,
      companiesByPlan,
      recentActivity
    }
  }, [companies, users])

  // Acciones rápidas
  const quickActions: QuickAction[] = [
    {
      id: 'create-company',
      label: 'Crear Empresa',
      icon: '🏢',
      description: 'Registrar nueva empresa en el sistema',
      action: () => setShowCreateCompanyModal(true),
      variant: 'primary'
    },
    {
      id: 'create-superadmin',
      label: 'Crear Super Admin',
      icon: '👑',
      description: 'Agregar nuevo super administrador',
      action: () => setShowCreateUserModal(true),
      variant: 'primary'
    },
    {
      id: 'system-health',
      label: 'Estado del Sistema',
      icon: '📊',
      description: 'Ver métricas y rendimiento del sistema',
      action: () => console.log('Ver estado del sistema'),
      variant: 'secondary'
    },
    {
      id: 'maintenance-mode',
      label: 'Modo Mantenimiento',
      icon: '🔧',
      description: 'Activar/desactivar modo mantenimiento',
      action: () => console.log('Toggle maintenance mode'),
      variant: 'danger'
    }
  ]

  // Empresas que requieren atención
  const companiesNeedingAttention = React.useMemo(() => {
    return companies
      .filter((company: IEnhancedCompany) => {
        // Empresas en trial que expiran pronto
        if (company.trialEndsAt) {
          const daysLeft = Math.ceil(
            (new Date(company.trialEndsAt).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
          if (daysLeft <= 7) return true
        }

        // Empresas suspendidas
        if (company.status === CompanyStatus.SUSPENDED) return true

        // Empresas que superaron límites
        if (company.settings?.limits) {
          const userCount = users.filter((u: IEnhancedUser) =>
            u.roles.some((role: any) => role.companyId === company._id)
          ).length
          if (userCount >= company.settings.limits.maxUsers) return true
        }

        return false
      })
      .slice(0, 5) // Mostrar solo las primeras 5
  }, [companies, users])

  if (companiesLoading || usersLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
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
                  {stats.totalCompanies}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <div className='flex items-center'>
              <StatusBadge status={UserStatus.ACTIVE} size='sm' />
              <span className='ml-2 text-sm text-gray-600'>
                {stats.activeCompanies} activas
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
                  {stats.totalUsers}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <div className='flex items-center'>
              <StatusBadge status={UserStatus.ACTIVE} size='sm' />
              <span className='ml-2 text-sm text-gray-600'>
                {stats.activeUsers} activos
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
                  {stats.companiesByPlan[CompanyPlan.ENTERPRISE] || 0}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <div className='flex items-center space-x-2'>
              <PlanBadge plan={CompanyPlan.PROFESSIONAL} size='sm' />
              <span className='text-sm text-gray-600'>
                {stats.companiesByPlan[CompanyPlan.PROFESSIONAL] || 0}
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
              className={`p-4 rounded-lg border-2 border-dashed transition-colors text-left ${
                action.variant === 'primary'
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
              {companiesNeedingAttention.map((company: IEnhancedCompany) => (
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
                        <StatusBadge status={company.status} size='sm' />
                        <PlanBadge plan={company.plan} size='sm' />
                        {company.trialEndsAt && (
                          <TrialBadge
                            daysLeft={Math.ceil(
                              (new Date(company.trialEndsAt).getTime() -
                                Date.now()) /
                                (1000 * 60 * 60 * 24)
                            )}
                            size='sm'
                          />
                        )}
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
            {stats.recentActivity.map(activity => (
              <div key={activity.id} className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 text-sm'>
                      {activity.type === 'company_created' && '🏢'}
                      {activity.type === 'plan_upgraded' && '⬆️'}
                      {activity.type === 'user_registered' && '👤'}
                      {activity.type === 'company_suspended' && '⏸️'}
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
            ))}
          </div>
        </div>
      </div>

      {/* Distribución de planes */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h2 className='text-lg font-medium text-gray-900 mb-4'>
          Distribución de Planes
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {Object.entries(stats.companiesByPlan).map(([plan, count]) => (
            <div key={plan} className='text-center'>
              <div className='mb-2'>
                <PlanBadge plan={plan as CompanyPlan} size='lg' />
              </div>
              <div className='text-2xl font-bold text-gray-900'>{count}</div>
              <div className='text-sm text-gray-600'>empresas</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
