/**
 * User Overview Dashboard Component
 * @description: Dashboard con estadísticas y resumen ejecutivo de usuarios para Super Admin
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, {useState, useEffect, useMemo, useCallback} from 'react'
import {LoadingSpinner} from '@/components/Shared/LoadingSpinner'
import UserAPI from '@/api/UserAPI'
import {useUsers} from '@/hooks/useUserManagement'
import UserListPreview from '@/components/Modules/UserManagement/UI/UserListPreview'
import {
  UsersIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import {toast} from 'react-toastify'

// Importación normal de Recharts (Next.js hace code splitting automáticamente)
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface UserDashboardStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
  roleDistribution: Record<string, number>
  companyDistribution: Record<string, number>
  recentActivity: Array<{
    userId: string
    userName: string
    action: string
    timestamp: Date | string
  }>
  monthlyGrowth: {
    newUsers: number
    activations: number
    deactivations: number
  }
  monthlyTrends?: Array<{
    month: string
    total: number
    active: number
    inactive: number
    newUsers: number
  }>
}

type DateFilter = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

export default function UserOverviewDashboard() {
  const [stats, setStats] = useState<UserDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')
  const [showFilters, setShowFilters] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Hook para obtener lista de usuarios recientes
  const {users, isLoading: usersLoading} = useUsers(
    {
      page: 1,
      limit: 10
    },
    false // No en scope de empresa
  )

  // Memoizar loadDashboardData para evitar loops infinitos en useEffect
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener datos reales del backend
      const data = await UserAPI.getUsersStats()

      // Transformar datos al formato del componente
      const transformedData: UserDashboardStats = {
        totalUsers: data.total,
        activeUsers: data.active,
        inactiveUsers: data.inactive,
        suspendedUsers: data.suspended,
        roleDistribution: data.byRole,
        companyDistribution: data.byCompany,
        recentActivity: data.recent.map(item => ({
          userId: item.userId,
          userName: item.userName,
          action: item.action,
          timestamp: item.timestamp
        })),
        monthlyGrowth: data.monthlyGrowth,
        monthlyTrends: data.monthlyTrends
      }

      setStats(transformedData)
    } catch (err: any) {
      console.error('Error loading dashboard data:', err)
      setError(
        err.response?.data?.error ||
          err.message ||
          'Error al cargar los datos del dashboard'
      )
    } finally {
      setLoading(false)
    }
  }, []) // Sin dependencias porque no usa props ni estados externos

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData, dateFilter])

  const handleExportCSV = async () => {
    if (!stats) return

    try {
      setExporting(true)
      toast.info('Generando archivo CSV...')

      // Crear contenido CSV
      let csvContent = 'Estadísticas de Usuarios - ERPSolutions\n\n'

      // Resumen general
      csvContent += 'RESUMEN GENERAL\n'
      csvContent += 'Métrica,Valor\n'
      csvContent += `Total de Usuarios,${stats.totalUsers}\n`
      csvContent += `Usuarios Activos,${stats.activeUsers}\n`
      csvContent += `Usuarios Inactivos,${stats.inactiveUsers}\n`
      csvContent += `Usuarios Suspendidos,${stats.suspendedUsers}\n`
      csvContent += `Porcentaje Activos,${(
        (stats.activeUsers / stats.totalUsers) *
        100
      ).toFixed(1)}%\n\n`

      // Crecimiento mensual
      if (stats.monthlyGrowth) {
        csvContent += 'CRECIMIENTO MENSUAL\n'
        csvContent += 'Métrica,Valor\n'
        csvContent += `Nuevos Usuarios,${stats.monthlyGrowth.newUsers}\n`
        csvContent += `Activaciones,${stats.monthlyGrowth.activations}\n`
        csvContent += `Desactivaciones,${stats.monthlyGrowth.deactivations}\n`
        csvContent += `Crecimiento,${calculateGrowthPercentage}%\n\n`
      }

      // Distribución por roles
      csvContent += 'DISTRIBUCIÓN POR ROLES\n'
      csvContent += 'Rol,Cantidad,Porcentaje\n'
      Object.entries(stats.roleDistribution).forEach(([role, count]) => {
        const percentage = ((count / stats.totalUsers) * 100).toFixed(1)
        csvContent += `${role},${count},${percentage}%\n`
      })
      csvContent += '\n'

      // Distribución por empresa
      csvContent += 'DISTRIBUCIÓN POR EMPRESA\n'
      csvContent += 'Empresa,Cantidad,Porcentaje\n'
      Object.entries(stats.companyDistribution).forEach(([company, count]) => {
        const percentage = ((count / stats.totalUsers) * 100).toFixed(1)
        csvContent += `${company},${count},${percentage}%\n`
      })
      csvContent += '\n'

      // Actividad reciente
      csvContent += 'ACTIVIDAD RECIENTE\n'
      csvContent += 'Usuario,Acción,Fecha\n'
      stats.recentActivity.slice(0, 10).forEach(activity => {
        const date = new Date(activity.timestamp).toLocaleString('es-ES')
        csvContent += `${activity.userName},${activity.action},${date}\n`
      })

      // Crear y descargar archivo
      const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'})
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      const fecha = new Date().toISOString().split('T')[0]
      link.setAttribute('href', url)
      link.setAttribute('download', `estadisticas-usuarios-${fecha}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Estadísticas exportadas correctamente')
    } catch (err) {
      console.error('Error al exportar:', err)
      toast.error('Error al exportar estadísticas')
    } finally {
      setExporting(false)
    }
  }

  const getDateFilterLabel = (filter: DateFilter): string => {
    const labels: Record<DateFilter, string> = {
      today: 'Hoy',
      week: 'Esta Semana',
      month: 'Este Mes',
      quarter: 'Este Trimestre',
      year: 'Este Año',
      all: 'Todo el Tiempo'
    }
    return labels[filter]
  }

  // ============================================================================
  // HOOKS - DEBEN ESTAR ANTES DE CUALQUIER EARLY RETURN
  // ============================================================================

  // Calcular el porcentaje de crecimiento mensual (Memoizado)
  const calculateGrowthPercentage = useMemo((): string => {
    if (!stats?.monthlyGrowth || stats.totalUsers === 0) {
      return '0.0'
    }

    const {newUsers} = stats.monthlyGrowth
    const previousTotal = stats.totalUsers - newUsers

    if (previousTotal === 0) {
      return newUsers > 0 ? '100.0' : '0.0'
    }

    const growthPercentage = (newUsers / previousTotal) * 100
    return growthPercentage.toFixed(1)
  }, [stats])

  const isPositiveGrowth = parseFloat(calculateGrowthPercentage) > 0

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

  const roleColors = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin_empresa: 'bg-blue-100 text-blue-800',
    manager: 'bg-green-100 text-green-800',
    employee: 'bg-gray-100 text-gray-800',
    viewer: 'bg-yellow-100 text-yellow-800'
  }

  const roleLabels = {
    super_admin: 'Super Admin',
    admin_empresa: 'Admin Empresa',
    manager: 'Manager',
    employee: 'Empleado',
    viewer: 'Visualizador'
  }

  const roleBarColors = {
    super_admin: 'bg-purple-600',
    admin_empresa: 'bg-blue-600',
    manager: 'bg-green-600',
    employee: 'bg-gray-600',
    viewer: 'bg-yellow-600'
  }

  // Colores para gráficos de Recharts
  const CHART_COLORS = {
    purple: '#9333ea',
    blue: '#2563eb',
    green: '#16a34a',
    yellow: '#eab308',
    red: '#dc2626',
    orange: '#ea580c',
    gray: '#6b7280',
    lightBlue: '#3b82f6',
    lightGreen: '#22c55e'
  }

  // Preparar datos para gráfico de roles (Memoizado para optimización)
  const roleChartData = useMemo(() => {
    if (!stats) return []

    return Object.entries(stats.roleDistribution)
      .map(([role, count]) => ({
        name: roleLabels[role as keyof typeof roleLabels] || role,
        value: count,
        percentage: ((count / stats.totalUsers) * 100).toFixed(1),
        color:
          role === 'super_admin'
            ? CHART_COLORS.purple
            : role === 'admin_empresa'
            ? CHART_COLORS.blue
            : role === 'manager'
            ? CHART_COLORS.green
            : role === 'employee'
            ? CHART_COLORS.gray
            : CHART_COLORS.yellow
      }))
      .sort((a, b) => b.value - a.value)
  }, [stats]) // Solo recalcula cuando stats cambia

  // Preparar datos para gráfico de estados (Memoizado para optimización)
  const statusChartData = useMemo(() => {
    if (!stats) return []

    return [
      {
        name: 'Activos',
        value: stats.activeUsers,
        color: CHART_COLORS.green
      },
      {
        name: 'Inactivos',
        value: stats.inactiveUsers,
        color: CHART_COLORS.yellow
      },
      {
        name: 'Suspendidos',
        value: stats.suspendedUsers,
        color: CHART_COLORS.red
      }
    ]
  }, [stats]) // Solo recalcula cuando stats cambia

  // Preparar datos para gráfico de empresas (top 8) (Memoizado para optimización)
  const companyChartData = useMemo(() => {
    if (!stats) return []

    return Object.entries(stats.companyDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([company, count]) => ({
        name: company.length > 15 ? company.substring(0, 15) + '...' : company,
        usuarios: count,
        fullName: company
      }))
  }, [stats]) // Solo recalcula cuando stats cambia

  // Generar datos de tendencia mock (temporal hasta tener backend) (Memoizado)
  const generateMockTrends = useMemo(() => {
    if (!stats) return []

    const months = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const baseTotal = stats.totalUsers

    return months.map((month, index) => {
      const variation = Math.floor(Math.random() * 10) - 5
      const total = Math.max(baseTotal - (6 - index) * 5 + variation, 0)
      const active = Math.floor(total * 0.85)
      const inactive = Math.floor(total * 0.12)
      const newUsers =
        index === months.length - 1
          ? stats.monthlyGrowth.newUsers
          : Math.floor(Math.random() * 8)

      return {
        month,
        total,
        active,
        inactive,
        newUsers
      }
    })
  }, [stats]) // Solo recalcula cuando stats cambia

  // Tendencias con preferencia por datos reales del backend (Memoizado)
  const trendsData = useMemo(() => {
    return stats?.monthlyTrends || generateMockTrends
  }, [stats, generateMockTrends])

  // Tooltip personalizado para los gráficos
  const CustomTooltip = ({active, payload, label}: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-medium text-gray-900'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className='text-sm' style={{color: entry.color}}>
              {entry.name}: <span className='font-semibold'>{entry.value}</span>
              {entry.payload.percentage && ` (${entry.payload.percentage}%)`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // ============================================================================
  // EARLY RETURNS - DEBEN ESTAR DESPUÉS DE TODOS LOS HOOKS
  // ============================================================================

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

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className='space-y-6'>
      {/* Barra de controles */}
      <div className='bg-white shadow rounded-lg border border-gray-200 p-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          {/* Título y descripción */}
          <div>
            <h3 className='text-lg font-medium text-gray-900'>
              Estadísticas de Usuarios
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Vista general del sistema - {getDateFilterLabel(dateFilter)}
            </p>
          </div>

          {/* Controles */}
          <div className='flex flex-wrap items-center gap-3'>
            {/* Selector de filtro de fecha */}
            <div className='relative'>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <CalendarIcon className='h-4 w-4 mr-2' />
                {getDateFilterLabel(dateFilter)}
                <FunnelIcon className='h-4 w-4 ml-2' />
              </button>

              {/* Dropdown de filtros */}
              {showFilters && (
                <div className='absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10'>
                  <div className='py-1'>
                    {(
                      [
                        'today',
                        'week',
                        'month',
                        'quarter',
                        'year',
                        'all'
                      ] as DateFilter[]
                    ).map(filter => (
                      <button
                        key={filter}
                        onClick={() => {
                          setDateFilter(filter)
                          setShowFilters(false)
                        }}
                        className={`${
                          dateFilter === filter
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        } block w-full text-left px-4 py-2 text-sm transition-colors`}
                      >
                        {getDateFilterLabel(filter)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botón de exportar */}
            <button
              onClick={handleExportCSV}
              disabled={exporting || loading}
              className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            >
              <ArrowDownTrayIcon className='h-4 w-4 mr-2' />
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>

            {/* Botón de actualizar */}
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              <ArrowPathIcon
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white overflow-hidden shadow rounded-lg border border-gray-200'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <UsersIcon className='h-6 w-6 text-blue-400' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Total Usuarios
                  </dt>
                  <dd className='flex items-baseline'>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {stats.totalUsers}
                    </div>
                    {isPositiveGrowth && (
                      <div className='ml-2 flex items-baseline text-sm font-semibold text-green-600'>
                        <ArrowTrendingUpIcon className='h-4 w-4 flex-shrink-0 self-center' />
                        <span className='sr-only'>Incremento de</span>+
                        {calculateGrowthPercentage}%
                      </div>
                    )}
                    {!isPositiveGrowth &&
                      parseFloat(calculateGrowthPercentage) === 0 && (
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
                {stats.activeUsers}
              </span>
              <span className='text-gray-500'> activos</span>
              {stats.monthlyGrowth && stats.monthlyGrowth.newUsers > 0 && (
                <>
                  <span className='text-gray-400'> • </span>
                  <span className='font-medium text-green-600'>
                    +{stats.monthlyGrowth.newUsers}
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
                    Usuarios Activos
                  </dt>
                  <dd className='flex items-baseline'>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {stats.activeUsers}
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
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
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
                    Usuarios Inactivos
                  </dt>
                  <dd className='flex items-baseline'>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {stats.inactiveUsers}
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
              <span className='font-medium text-gray-900'>
                {stats.inactiveUsers > 0 ? 'Requiere atención' : 'Todo bien'}
              </span>
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
                    Suspendidos
                  </dt>
                  <dd className='flex items-baseline'>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {stats.suspendedUsers}
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
                {stats.suspendedUsers > 0 ? 'Requiere atención' : 'Todo bien'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Interactivos */}
      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {/* Gráfico de Tendencias Mensuales */}
        <div className='bg-white shadow rounded-lg border border-gray-200 p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              Tendencia de Usuarios
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Evolución de usuarios en los últimos 6 meses
            </p>
          </div>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={trendsData}>
              <defs>
                <linearGradient id='colorTotal' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor={CHART_COLORS.blue}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor={CHART_COLORS.blue}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id='colorActive' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor={CHART_COLORS.green}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor={CHART_COLORS.green}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='month' tick={{fontSize: 12}} stroke='#9ca3af' />
              <YAxis tick={{fontSize: 12}} stroke='#9ca3af' />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize: '12px'}} />
              <Area
                type='monotone'
                dataKey='total'
                stroke={CHART_COLORS.blue}
                fillOpacity={1}
                fill='url(#colorTotal)'
                name='Total'
              />
              <Area
                type='monotone'
                dataKey='active'
                stroke={CHART_COLORS.green}
                fillOpacity={1}
                fill='url(#colorActive)'
                name='Activos'
              />
              <Line
                type='monotone'
                dataKey='newUsers'
                stroke={CHART_COLORS.purple}
                strokeWidth={2}
                name='Nuevos'
                dot={{fill: CHART_COLORS.purple, r: 4}}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Estado de Usuarios (Donut mejorado) */}
        <div className='bg-white shadow rounded-lg border border-gray-200 p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              Estado de Usuarios
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Distribución por estado actual
            </p>
          </div>
          <div className='flex flex-col items-center'>
            <ResponsiveContainer width='100%' height={240}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey='value'
                  label={false}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                          <p className='font-medium text-gray-900'>
                            {data.name}
                          </p>
                          <p className='text-sm' style={{color: data.color}}>
                            Usuarios:{' '}
                            <span className='font-semibold'>{data.value}</span>
                          </p>
                          <p className='text-xs text-gray-500'>
                            {((data.value / stats!.totalUsers) * 100).toFixed(
                              1
                            )}
                            % del total
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Leyenda mejorada con barras */}
            <div className='w-full mt-4 space-y-3'>
              {statusChartData.map((item, index) => {
                const percentage = (
                  (item.value / stats!.totalUsers) *
                  100
                ).toFixed(1)
                return (
                  <div key={index} className='flex items-center gap-3'>
                    <div
                      className='w-4 h-4 rounded-full flex-shrink-0 shadow-sm'
                      style={{backgroundColor: item.color}}
                    />
                    <div className='flex-1'>
                      <div className='flex justify-between items-center mb-1'>
                        <span className='text-sm font-medium text-gray-900'>
                          {item.name}
                        </span>
                        <span
                          className='text-sm font-semibold'
                          style={{color: item.color}}
                        >
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                      <div className='w-full bg-gray-100 rounded-full h-1.5 overflow-hidden'>
                        <div
                          className='h-1.5 rounded-full transition-all duration-500'
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Gráfico de Distribución por Roles (Barras) */}
        <div className='bg-white shadow rounded-lg border border-gray-200 p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              Usuarios por Rol
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Cantidad de usuarios por cada rol
            </p>
          </div>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={roleChartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis
                dataKey='name'
                tick={{fontSize: 11}}
                stroke='#9ca3af'
                angle={-15}
                textAnchor='end'
                height={60}
              />
              <YAxis tick={{fontSize: 12}} stroke='#9ca3af' />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey='value' name='Usuarios' radius={[8, 8, 0, 0]}>
                {roleChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Top Empresas (Barras Horizontales) */}
        <div className='bg-white shadow rounded-lg border border-gray-200 p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              Top 8 Empresas
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Empresas con más usuarios registrados
            </p>
          </div>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={companyChartData} layout='vertical'>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis type='number' tick={{fontSize: 12}} stroke='#9ca3af' />
              <YAxis
                type='category'
                dataKey='name'
                tick={{fontSize: 11}}
                stroke='#9ca3af'
                width={120}
              />
              <Tooltip
                content={({active, payload}) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                        <p className='font-medium text-gray-900'>
                          {payload[0].payload.fullName}
                        </p>
                        <p className='text-sm text-purple-600'>
                          Usuarios:{' '}
                          <span className='font-semibold'>
                            {payload[0].value}
                          </span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey='usuarios'
                fill={CHART_COLORS.purple}
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos y distribuciones */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Distribución por roles */}
        <div className='bg-white shadow rounded-lg border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>
              Distribución por Roles
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Número de usuarios por rol asignado
            </p>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              {Object.entries(stats.roleDistribution)
                .sort(([, a], [, b]) => b - a) // Ordenar por cantidad descendente
                .map(([role, count]) => {
                  const percentage = (count / stats.totalUsers) * 100
                  const roleName =
                    roleLabels[role as keyof typeof roleLabels] || role

                  return (
                    <div
                      key={role}
                      className='group hover:bg-gray-50 p-2 rounded-lg transition-colors'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              roleColors[role as keyof typeof roleColors] ||
                              roleColors.viewer
                            }`}
                          >
                            {roleName}
                          </span>
                          <span className='ml-3 text-sm font-medium text-gray-900'>
                            {count} {count === 1 ? 'usuario' : 'usuarios'}
                          </span>
                        </div>
                        <span className='text-sm font-semibold text-gray-700'>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2.5 overflow-hidden'>
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                            roleBarColors[role as keyof typeof roleBarColors] ||
                            'bg-gray-600'
                          }`}
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
              Últimas acciones realizadas por usuarios
            </p>
          </div>
          <div className='p-6'>
            {stats.recentActivity.length > 0 ? (
              <div className='flow-root'>
                <ul className='-mb-8'>
                  {stats.recentActivity.slice(0, 8).map((activity, index) => {
                    const isLogin = activity.action.includes('Inició sesión')
                    const actionColor = isLogin ? 'bg-green-500' : 'bg-blue-500'
                    const timeAgo = (() => {
                      const now = new Date()
                      const timestamp = new Date(activity.timestamp)
                      const diffInHours = Math.floor(
                        (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
                      )
                      if (diffInHours < 1) return 'Hace menos de 1 hora'
                      if (diffInHours === 1) return 'Hace 1 hora'
                      if (diffInHours < 24) return `Hace ${diffInHours} horas`
                      const diffInDays = Math.floor(diffInHours / 24)
                      if (diffInDays === 1) return 'Hace 1 día'
                      return `Hace ${diffInDays} días`
                    })()

                    return (
                      <li key={index}>
                        <div className='relative pb-8'>
                          {index !==
                            stats.recentActivity.slice(0, 8).length - 1 && (
                            <span className='absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200' />
                          )}
                          <div className='relative flex space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors'>
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full ${actionColor} flex items-center justify-center ring-8 ring-white shadow-sm`}
                              >
                                {isLogin ? (
                                  <CheckCircleIcon className='h-4 w-4 text-white' />
                                ) : (
                                  <UserGroupIcon className='h-4 w-4 text-white' />
                                )}
                              </span>
                            </div>
                            <div className='min-w-0 flex-1 pt-1.5'>
                              <div className='flex justify-between space-x-4'>
                                <div>
                                  <p className='text-sm text-gray-600'>
                                    <span className='font-semibold text-gray-900'>
                                      {activity.userName}
                                    </span>{' '}
                                    <span className='lowercase'>
                                      {activity.action}
                                    </span>
                                  </p>
                                  <p className='mt-0.5 text-xs text-gray-500'>
                                    {timeAgo}
                                  </p>
                                </div>
                                <div className='text-right text-xs text-gray-400 whitespace-nowrap'>
                                  {new Date(
                                    activity.timestamp
                                  ).toLocaleDateString('es-ES', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
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

      {/* Distribución por empresa */}
      <div className='bg-white shadow rounded-lg border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>
            Distribución por Empresa
          </h3>
          <p className='text-sm text-gray-500 mt-1'>
            Usuarios asignados a cada empresa
          </p>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {Object.entries(stats.companyDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([company, count]) => {
                const percentage = (count / stats.totalUsers) * 100
                const isSinEmpresa = company === 'Sin empresa'

                return (
                  <div
                    key={company}
                    className='bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <div className='flex items-center mb-1'>
                          <BuildingOfficeIcon
                            className={`h-5 w-5 mr-2 ${
                              isSinEmpresa ? 'text-gray-400' : 'text-purple-500'
                            }`}
                          />
                          <h4
                            className={`text-sm font-semibold truncate ${
                              isSinEmpresa ? 'text-gray-600' : 'text-gray-900'
                            }`}
                            title={company}
                          >
                            {company}
                          </h4>
                        </div>
                      </div>
                      <span className='ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                        {count}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden'>
                      <div
                        className='bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-500'
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                    <div className='flex items-center justify-between'>
                      <p className='text-xs font-medium text-gray-600'>
                        {count === 1 ? '1 usuario' : `${count} usuarios`}
                      </p>
                      <p className='text-xs font-semibold text-purple-600'>
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Resumen de crecimiento */}
      {stats.monthlyGrowth && (
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <ChartBarIcon className='h-8 w-8 text-blue-600' />
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Resumen de Crecimiento
                </h3>
                <p className='text-sm text-gray-600'>
                  Actividad del mes en curso
                </p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-3xl font-bold text-blue-600'>
                {isPositiveGrowth ? '+' : ''}
                {calculateGrowthPercentage}%
              </p>
              <p className='text-xs text-gray-500'>vs mes anterior</p>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Nuevos Usuarios
                  </p>
                  <p className='text-2xl font-bold text-green-600'>
                    +{stats.monthlyGrowth.newUsers}
                  </p>
                </div>
                <div className='h-12 w-12 bg-green-100 rounded-full flex items-center justify-center'>
                  <ArrowTrendingUpIcon className='h-6 w-6 text-green-600' />
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Activaciones
                  </p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {stats.monthlyGrowth.activations}
                  </p>
                </div>
                <div className='h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center'>
                  <CheckCircleIcon className='h-6 w-6 text-blue-600' />
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Desactivaciones
                  </p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {stats.monthlyGrowth.deactivations}
                  </p>
                </div>
                <div className='h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center'>
                  <ExclamationTriangleIcon className='h-6 w-6 text-orange-600' />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuarios recientes 
      <div className='mt-8'>
        <UserListPreview
          users={users}
          title='Usuarios Recientes'
          maxUsers={8}
          showViewAll={true}
          viewAllLink='/dashboard/users/list'
          isLoading={usersLoading}
          emptyMessage='No hay usuarios registrados'
          companyScope={false}
        />
      </div>
      */}
    </div>
  )
}
