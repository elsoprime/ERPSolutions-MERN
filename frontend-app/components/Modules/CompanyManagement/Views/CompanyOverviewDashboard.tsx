/**
 * Company Overview Dashboard Component
 * @description: Dashboard con estadísticas y resumen ejecutivo para Super Admin
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, {useState, useEffect} from 'react'
import EnhancedCompanyAPI from '@/api/EnhancedCompanyAPI'
import {LoadingSpinner} from '@/components/Shared/LoadingSpinner'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalCompanies: number
  activeCompanies: number
  suspendedCompanies: number
  trialCompanies: number
  planDistribution: Record<string, number>
  industryDistribution: Record<string, number>
  recentActivity: Array<{
    companyId: string
    companyName: string
    action: string
    timestamp: Date
  }>
  monthlyGrowth?: {
    newCompanies: number
    upgrades: number
    cancellations: number
  }
}

export default function CompanyOverviewDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await EnhancedCompanyAPI.getCompaniesSummary()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text='Cargando estadísticas...' fullScreen={false} />
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <ExclamationTriangleIcon className='mx-auto h-12 w-12 text-red-400' />
        <h3 className='mt-2 text-sm font-medium text-gray-900'>
          Error de carga
        </h3>
        <p className='mt-1 text-sm text-gray-500'>{error}</p>
        <div className='mt-6'>
          <button
            onClick={loadDashboardData}
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  // Calcular el porcentaje de crecimiento mensual
  const calculateGrowthPercentage = (): string => {
    if (!stats.monthlyGrowth || stats.totalCompanies === 0) {
      return '0.0'
    }

    const {newCompanies} = stats.monthlyGrowth
    const previousTotal = stats.totalCompanies - newCompanies

    if (previousTotal === 0) {
      return newCompanies > 0 ? '100.0' : '0.0'
    }

    const growthPercentage = (newCompanies / previousTotal) * 100
    return growthPercentage.toFixed(1)
  }

  const growthPercentage = calculateGrowthPercentage()
  const isPositiveGrowth = parseFloat(growthPercentage) > 0

  const getStatusIcon = (status: 'active' | 'warning' | 'error') => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className='w-5 h-5 text-green-500' />
      case 'warning':
        return <ExclamationTriangleIcon className='w-5 h-5 text-yellow-500' />
      case 'error':
        return <ExclamationTriangleIcon className='w-5 h-5 text-red-500' />
      default:
        return <ClockIcon className='w-5 h-5 text-gray-500' />
    }
  }

  const planColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-orange-100 text-orange-800'
  }

  return (
    <div className='space-y-8'>
      {/* Estadísticas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white overflow-hidden shadow rounded-lg border border-gray-200'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <BuildingOfficeIcon className='h-6 w-6 text-blue-400' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Total Empresas
                  </dt>
                  <dd className='flex items-baseline'>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {stats.totalCompanies}
                    </div>
                    {isPositiveGrowth && (
                      <div className='ml-2 flex items-baseline text-sm font-semibold text-green-600'>
                        <ArrowTrendingUpIcon className='h-4 w-4 flex-shrink-0 self-center' />
                        <span className='sr-only'>Incremento de</span>+
                        {growthPercentage}%
                      </div>
                    )}
                    {!isPositiveGrowth &&
                      parseFloat(growthPercentage) === 0 && (
                        <div className='ml-2 flex items-baseline text-sm font-semibold text-gray-500'>
                          <span className='sr-only'>Sin cambios</span>
                          0.0%
                        </div>
                      )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-5 py-3'>
            <div className='text-sm'>
              <span className='font-medium text-gray-900'>
                {stats.activeCompanies}
              </span>
              <span className='text-gray-500'> activas</span>
              {stats.monthlyGrowth && stats.monthlyGrowth.newCompanies > 0 && (
                <>
                  <span className='text-gray-400'> • </span>
                  <span className='font-medium text-green-600'>
                    +{stats.monthlyGrowth.newCompanies}
                  </span>
                  <span className='text-gray-500'> este mes</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg border border-gray-200'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <CheckCircleIcon className='h-6 w-6 text-green-400' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Empresas Activas
                  </dt>
                  <dd className='flex items-baseline'>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {stats.activeCompanies}
                    </div>
                    <div className='ml-2 flex items-baseline text-sm font-semibold text-green-600'>
                      {getStatusIcon('active')}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-5 py-3'>
            <div className='text-sm'>
              <span className='font-medium text-gray-900'>
                {((stats.activeCompanies / stats.totalCompanies) * 100).toFixed(
                  1
                )}
                %
              </span>
              <span className='text-gray-500'> del total</span>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg border border-gray-200'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <ClockIcon className='h-6 w-6 text-yellow-400' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    En Período Prueba
                  </dt>
                  <dd className='flex items-baseline'>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {stats.trialCompanies}
                    </div>
                    <div className='ml-2 flex items-baseline text-sm font-semibold text-yellow-600'>
                      {getStatusIcon('warning')}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-5 py-3'>
            <div className='text-sm'>
              <span className='font-medium text-gray-900'>7</span>
              <span className='text-gray-500'> días promedio restantes</span>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg border border-gray-200'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <ExclamationTriangleIcon className='h-6 w-6 text-red-400' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Suspendidas
                  </dt>
                  <dd className='flex items-baseline'>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {stats.suspendedCompanies}
                    </div>
                    <div className='ml-2 flex items-baseline text-sm font-semibold text-red-600'>
                      {getStatusIcon('error')}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-5 py-3'>
            <div className='text-sm'>
              <span className='font-medium text-gray-900'>
                {stats.suspendedCompanies > 0
                  ? 'Requiere atención'
                  : 'Todo bien'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y distribuciones */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Distribución por planes */}
        <div className='bg-white shadow rounded-lg border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>
              Distribución por Planes
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Número de empresas por plan de suscripción
            </p>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              {Object.entries(stats.planDistribution).map(([plan, count]) => {
                const percentage = (count / stats.totalCompanies) * 100
                const planName = plan.charAt(0).toUpperCase() + plan.slice(1)

                return (
                  <div key={plan}>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            planColors[plan as keyof typeof planColors] ||
                            planColors.free
                          }`}
                        >
                          {planName}
                        </span>
                        <span className='ml-3 text-sm text-gray-900'>
                          {count} empresas
                        </span>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className='bg-white shadow rounded-lg border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>
              Actividad Reciente
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Últimas acciones realizadas en el sistema
            </p>
          </div>
          <div className='p-6'>
            {stats.recentActivity.length > 0 ? (
              <div className='flow-root'>
                <ul className='-mb-8'>
                  {stats.recentActivity.slice(0, 5).map((activity, index) => (
                    <li key={index}>
                      <div className='relative pb-8'>
                        {index !==
                          stats.recentActivity.slice(0, 5).length - 1 && (
                          <span className='absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200' />
                        )}
                        <div className='relative flex space-x-3'>
                          <div>
                            <span className='h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white'>
                              <BuildingOfficeIcon className='h-4 w-4 text-white' />
                            </span>
                          </div>
                          <div className='min-w-0 flex-1 pt-1.5 flex justify-between space-x-4'>
                            <div>
                              <p className='text-sm text-gray-500'>
                                <span className='font-medium text-gray-900'>
                                  {activity.companyName}
                                </span>{' '}
                                {activity.action}
                              </p>
                            </div>
                            <div className='text-right text-sm whitespace-nowrap text-gray-500'>
                              {new Date(activity.timestamp).toLocaleDateString(
                                'es-ES',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className='text-center py-6'>
                <ClockIcon className='mx-auto h-12 w-12 text-gray-400' />
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  No hay actividad reciente
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  Las actividades aparecerán aquí cuando ocurran
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Distribución por industria */}
      <div className='bg-white shadow rounded-lg border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>
            Distribución por Industria
          </h3>
          <p className='text-sm text-gray-500 mt-1'>
            Sectores más populares entre las empresas registradas
          </p>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Object.entries(stats.industryDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([industry, count]) => {
                const percentage = (count / stats.totalCompanies) * 100

                return (
                  <div key={industry} className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='text-sm font-medium text-gray-900 truncate'>
                        {industry}
                      </h4>
                      <span className='text-sm text-gray-500'>{count}</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2 mb-1'>
                      <div
                        className='bg-green-600 h-2 rounded-full'
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                    <p className='text-xs text-gray-500'>
                      {percentage.toFixed(1)}% del total
                    </p>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Botón de actualización */}
      <div className='text-center'>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <div className='animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full' />
              Actualizando...
            </>
          ) : (
            <>
              <ChartBarIcon className='-ml-1 mr-2 h-4 w-4' />
              Actualizar Datos
            </>
          )}
        </button>
      </div>
    </div>
  )
}
