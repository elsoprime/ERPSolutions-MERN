/**
 * User Overview Dashboard Component
 * @description: Dashboard con estadísticas y resumen ejecutivo de usuarios para Super Admin
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner'
import UserAPI from '@/api/UserAPI'
import { useUsers } from '@/hooks/useUserManagement'
import UserListPreview from '@/components/Modules/UserManagement/UI/UserListPreview'
import {
  UsersIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

// Componentes de gráficas reutilizables
import {
  PieChartCard,
  AreaChartCard,
  BarChartCard,
} from '@/components/UI/Charts'

// Transformadores de datos
import {
  transformStatusDistribution,
  transformRoleDistribution,
  transformCompanyDistribution,
  transformMonthlyTrends,
} from '@/utils/userChartTransformers'

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
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
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

    const { newUsers } = stats.monthlyGrowth
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

  // Preparar datos para gráficos usando transformadores
  const statusChartData = useMemo(() => {
    if (!stats) return []
    return transformStatusDistribution(
      stats.activeUsers,
      stats.inactiveUsers,
      stats.suspendedUsers
    )
  }, [stats])

  const roleChartData = useMemo(() => {
    if (!stats) return []
    return transformRoleDistribution(stats.roleDistribution)
  }, [stats])

  const companyChartData = useMemo(() => {
    if (!stats) return []
    return transformCompanyDistribution(stats.companyDistribution, 8)
  }, [stats])

  const trendsData = useMemo(() => {
    if (!stats?.monthlyTrends) return []
    return transformMonthlyTrends(stats.monthlyTrends)
  }, [stats])

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
                        className={`${dateFilter === filter
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
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-6'>
        {/* Gráfico de Tendencias Mensuales - MEJORADO CON AREACHARTCARD */}
        <AreaChartCard
          title="Tendencia de Usuarios"
          subtitle="Evolución de usuarios en los últimos 6 meses"
          data={trendsData}
          xAxisKey="month"
          dataKeys={[
            { key: 'total', name: 'Total', color: 'blue' },
            { key: 'active', name: 'Activos', color: 'green' },
            { key: 'newUsers', name: 'Nuevos', color: 'purple', type: 'line' },
          ]}
          height={300}
          gradientFill={true}
          showGrid={true}
          showLegend={true}
        />

        {/* Gráfico de Estado de Usuarios - MEJORADO CON PIECHARTCARD */}
        <PieChartCard
          title="Estado de Usuarios"
          subtitle="Distribución por estado actual"
          data={statusChartData}
          height={300}
          innerRadius={60}
          outerRadius={90}
          showStats={true}
          showLegend={false}
        />

        {/* Gráfico de Distribución por Roles - MEJORADO CON BARCHARTCARD */}
        <BarChartCard
          title="Usuarios por Rol"
          subtitle="Cantidad de usuarios por cada rol"
          data={roleChartData}
          dataKey="value"
          nameKey="name"
          height={300}
          showGrid={true}
          layout="horizontal"
          useCustomColors={true}
        />

        {/* Gráfico de Top Empresas - MEJORADO CON BARCHARTCARD */}
        <BarChartCard
          title="Top 8 Empresas"
          subtitle="Empresas con más usuarios registrados"
          data={companyChartData}
          dataKey="value"
          nameKey="name"
          height={300}
          showGrid={true}
          layout="horizontal"
          barColor="purple"
        />
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
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors] ||
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
                          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${roleBarColors[role as keyof typeof roleBarColors] ||
                            'bg-gray-600'
                            }`}
                          style={{ width: `${percentage}%` }}
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
                            className={`h-5 w-5 mr-2 ${isSinEmpresa ? 'text-gray-400' : 'text-purple-500'
                              }`}
                          />
                          <h4
                            className={`text-sm font-semibold truncate ${isSinEmpresa ? 'text-gray-600' : 'text-gray-900'
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
                        style={{ width: `${percentage}%` }}
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
