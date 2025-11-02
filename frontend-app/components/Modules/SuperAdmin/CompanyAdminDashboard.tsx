/**
 * Company Admin Dashboard Component
 * @description: Dashboard para Administradores de Empresa con vista específica de su organización
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useState} from 'react'
import {useUsers} from '@/hooks/useUserManagement'
import {useCurrentCompany, useCompanyStats} from '@/hooks/useCompanyManagement'
import {
  StatusBadge,
  RoleBadge,
  PlanBadge,
  CapacityBadge,
  TrialBadge
} from '@/components/UI/MultiCompanyBadges'
import {
  IEnhancedCompany,
  IEnhancedUser,
  CompanyPlan,
  CompanyStatus,
  UserStatus,
  UserRole,
  ICompanyStats
} from '@/interfaces/EnhanchedCompany/MultiCompany'

interface CompanyDashboardStats {
  totalUsers: number
  activeUsers: number
  usersByRole: Record<UserRole, number>
  capacityUsage: {
    users: {current: number; limit: number | 'unlimited'}
    products: {current: number; limit: number | 'unlimited'}
    transactions: {current: number; limit: number | 'unlimited'}
    storage: {current: number; limit: number | 'unlimited'}
  }
  recentActivity: Array<{
    id: string
    type:
      | 'user_invited'
      | 'role_assigned'
      | 'user_deactivated'
      | 'settings_updated'
    description: string
    timestamp: Date
    user?: string
  }>
}

interface QuickCompanyAction {
  id: string
  label: string
  icon: string
  description: string
  action: () => void
  variant: 'primary' | 'secondary' | 'warning'
  disabled?: boolean
}

export const CompanyAdminDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '7d' | '30d' | '90d'
  >('30d')
  const [showInviteUserModal, setShowInviteUserModal] = useState(false)
  const [showCompanySettingsModal, setShowCompanySettingsModal] =
    useState(false)

  // Hooks para datos
  const {data: currentCompany, isLoading: companyLoading} = useCurrentCompany()
  const {data: companyStats, isLoading: statsLoading} = useCompanyStats()
  const {users, isLoading: usersLoading} = useUsers(
    {companyId: currentCompany?.data?._id},
    true // Scope de empresa
  )

  // Calcular estadísticas de la empresa
  const stats: CompanyDashboardStats = React.useMemo(() => {
    if (!currentCompany?.data || !users) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        usersByRole: {} as Record<UserRole, number>,
        capacityUsage: {
          users: {current: 0, limit: 0},
          products: {current: 0, limit: 0},
          transactions: {current: 0, limit: 0},
          storage: {current: 0, limit: 0}
        },
        recentActivity: []
      }
    }

    const company = currentCompany.data
    const activeUsers = users.filter(
      (u: IEnhancedUser) => u.status === UserStatus.ACTIVE
    ).length

    const usersByRole = users.reduce(
      (acc: Record<UserRole, number>, user: IEnhancedUser) => {
        const companyRole = user.roles.find(
          (role: any) => role.companyId === company._id
        )
        if (companyRole) {
          acc[companyRole.role] = (acc[companyRole.role] || 0) + 1
        }
        return acc
      },
      {} as Record<UserRole, number>
    )

    // Simular actividad reciente (en un caso real vendría de la API)
    const recentActivity = [
      {
        id: '1',
        type: 'user_invited' as const,
        description: 'Usuario "juan.perez@empresa.com" invitado',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        user: 'Juan Pérez'
      },
      {
        id: '2',
        type: 'role_assigned' as const,
        description: 'Rol Manager asignado a "maria.gonzalez"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        user: 'María González'
      },
      {
        id: '3',
        type: 'settings_updated' as const,
        description: 'Configuraciones de empresa actualizadas',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
      }
    ]

    const limits = company.settings?.limits
    return {
      totalUsers: users.length,
      activeUsers,
      usersByRole,
      capacityUsage: {
        users: {
          current: users.length,
          limit: limits?.maxUsers || 'unlimited'
        },
        products: {
          current: companyStats?.data?.totalProducts || 0,
          limit: limits?.maxProducts || 'unlimited'
        },
        transactions: {
          current: 0, // Temporalmente 0 hasta que tengamos datos reales
          limit: limits?.maxTransactions || 'unlimited'
        },
        storage: {
          current: companyStats?.data?.storageUsed || 0,
          limit: limits?.storageGB || 'unlimited'
        }
      },
      recentActivity
    }
  }, [currentCompany, users, companyStats])

  // Acciones rápidas
  const quickActions: QuickCompanyAction[] = React.useMemo(() => {
    if (!currentCompany?.data) return []

    const company = currentCompany.data
    const isTrialExpiringSoon = company.trialEndsAt
      ? Math.ceil(
          (new Date(company.trialEndsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        ) <= 7
      : false

    const isNearUserLimit = company.settings?.limits?.maxUsers
      ? stats.totalUsers >= company.settings.limits.maxUsers * 0.8
      : false

    return [
      {
        id: 'invite-user',
        label: 'Invitar Usuario',
        icon: '👥',
        description: 'Agregar nuevo miembro al equipo',
        action: () => setShowInviteUserModal(true),
        variant: 'primary',
        disabled: isNearUserLimit
      },
      {
        id: 'company-settings',
        label: 'Configuraciones',
        icon: '⚙️',
        description: 'Gestionar configuraciones de empresa',
        action: () => setShowCompanySettingsModal(true),
        variant: 'secondary'
      },
      {
        id: 'upgrade-plan',
        label: 'Actualizar Plan',
        icon: '⬆️',
        description: 'Mejorar las capacidades de tu empresa',
        action: () => console.log('Upgrade plan'),
        variant: 'warning',
        disabled: company.plan === CompanyPlan.ENTERPRISE
      },
      {
        id: 'reports',
        label: 'Reportes',
        icon: '📊',
        description: 'Ver reportes y métricas de la empresa',
        action: () => console.log('View reports'),
        variant: 'secondary'
      }
    ]
  }, [currentCompany, stats.totalUsers])

  // Usuarios que requieren atención
  const usersNeedingAttention = React.useMemo(() => {
    return users
      .filter((user: IEnhancedUser) => {
        // Usuarios inactivos
        if (user.status === UserStatus.INACTIVE) return true

        // Usuarios sin activar (pendientes)
        if (user.status === UserStatus.PENDING) return true

        // Usuarios sin roles asignados
        const companyRole = user.roles.find(
          (role: any) => role.companyId === currentCompany?.data?._id
        )
        if (!companyRole) return true

        return false
      })
      .slice(0, 5) // Mostrar solo los primeros 5
  }, [users, currentCompany])

  if (companyLoading || usersLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (!currentCompany?.data) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <span className='text-4xl'>🏢</span>
          <p className='mt-2 text-gray-600'>
            No se encontró información de la empresa
          </p>
        </div>
      </div>
    )
  }

  const company = currentCompany.data

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold'>
              {company.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                {company.name}
              </h1>
              <div className='flex items-center space-x-3 mt-1'>
                <StatusBadge status={company.status} size='sm' />
                <PlanBadge plan={company.plan} size='sm' />
                {company.trialEndsAt && (
                  <TrialBadge
                    daysLeft={Math.ceil(
                      (new Date(company.trialEndsAt).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )}
                    size='sm'
                  />
                )}
              </div>
            </div>
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
                <span className='text-blue-600 text-lg'>👥</span>
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
            <CapacityBadge
              current={stats.capacityUsage.users.current}
              limit={stats.capacityUsage.users.limit}
              type='users'
              size='sm'
            />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                <span className='text-green-600 text-lg'>✅</span>
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Usuarios Activos
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {stats.activeUsers}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <div className='flex items-center'>
              <StatusBadge status={UserStatus.ACTIVE} size='sm' />
              <span className='ml-2 text-sm text-gray-600'>
                {Math.round((stats.activeUsers / stats.totalUsers) * 100) || 0}%
                del total
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                <span className='text-purple-600 text-lg'>👨‍💼</span>
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Managers
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {stats.usersByRole[UserRole.MANAGER] || 0}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <div className='flex items-center space-x-2'>
              <RoleBadge role={UserRole.EMPLOYEE} size='sm' />
              <span className='text-sm text-gray-600'>
                {stats.usersByRole[UserRole.EMPLOYEE] || 0} empleados
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
                  {usersNeedingAttention.length}
                </dd>
              </dl>
            </div>
          </div>
          <div className='mt-4'>
            <span className='text-sm text-gray-600'>
              Usuarios con problemas
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
              disabled={action.disabled}
              className={`p-4 rounded-lg border-2 border-dashed transition-colors text-left ${
                action.disabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : action.variant === 'primary'
                  ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                  : action.variant === 'warning'
                  ? 'border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50'
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
        {/* Uso de capacidad */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>
            Uso de Capacidad
          </h2>
          <div className='space-y-4'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Usuarios
                </span>
                <CapacityBadge
                  current={stats.capacityUsage.users.current}
                  limit={stats.capacityUsage.users.limit}
                  type='users'
                  size='sm'
                />
              </div>
              {stats.capacityUsage.users.limit !== 'unlimited' && (
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                    style={{
                      width: `${Math.min(
                        (stats.capacityUsage.users.current /
                          (stats.capacityUsage.users.limit as number)) *
                          100,
                        100
                      )}%`
                    }}
                  ></div>
                </div>
              )}
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Productos
                </span>
                <CapacityBadge
                  current={stats.capacityUsage.products.current}
                  limit={stats.capacityUsage.products.limit}
                  type='companies'
                  size='sm'
                />
              </div>
              {stats.capacityUsage.products.limit !== 'unlimited' && (
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-green-600 h-2 rounded-full transition-all duration-300'
                    style={{
                      width: `${Math.min(
                        (stats.capacityUsage.products.current /
                          (stats.capacityUsage.products.limit as number)) *
                          100,
                        100
                      )}%`
                    }}
                  ></div>
                </div>
              )}
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Almacenamiento
                </span>
                <span className='text-sm text-gray-600'>
                  {stats.capacityUsage.storage.current}GB /{' '}
                  {stats.capacityUsage.storage.limit === 'unlimited'
                    ? '∞'
                    : `${stats.capacityUsage.storage.limit}GB`}
                </span>
              </div>
              {stats.capacityUsage.storage.limit !== 'unlimited' && (
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-purple-600 h-2 rounded-full transition-all duration-300'
                    style={{
                      width: `${Math.min(
                        (stats.capacityUsage.storage.current /
                          (stats.capacityUsage.storage.limit as number)) *
                          100,
                        100
                      )}%`
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usuarios que requieren atención */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>
            Usuarios que Requieren Atención
          </h2>
          {usersNeedingAttention.length === 0 ? (
            <div className='text-center py-8'>
              <span className='text-4xl'>✅</span>
              <p className='mt-2 text-gray-600'>
                Todos los usuarios están configurados correctamente
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {usersNeedingAttention.map((user: IEnhancedUser) => (
                <div
                  key={user._id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-medium text-gray-600'>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className='font-medium text-gray-900'>{user.name}</h3>
                      <div className='flex items-center space-x-2 mt-1'>
                        <StatusBadge status={user.status} size='sm' />
                      </div>
                    </div>
                  </div>
                  <button className='px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200'>
                    Revisar
                  </button>
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
                      {activity.type === 'user_invited' && '📧'}
                      {activity.type === 'role_assigned' && '🔑'}
                      {activity.type === 'user_deactivated' && '⏸️'}
                      {activity.type === 'settings_updated' && '⚙️'}
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

      {/* Distribución de roles */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h2 className='text-lg font-medium text-gray-900 mb-4'>
          Distribución de Roles
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <div key={role} className='text-center'>
              <div className='mb-2'>
                <RoleBadge role={role as UserRole} size='lg' />
              </div>
              <div className='text-2xl font-bold text-gray-900'>{count}</div>
              <div className='text-sm text-gray-600'>usuarios</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CompanyAdminDashboard
