/**
 * Companies Table Component
 * @description: Tabla avanzada para listar y gestionar empresas por Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, {useState, useEffect} from 'react'
import {
  IEnhancedCompany,
  ICompanyFilters,
  SUBSCRIPTION_PLANS
} from '@/interfaces/EnhancedCompany'
import EnhancedCompanyAPI from '@/api/EnhancedCompanyAPI'
import ConfirmationDialog, {
  ConfirmationDialogAction
} from '@/components/Shared/ConfirmationDialog'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface CompaniesTableProps {
  onCreateCompany: () => void
  onEditCompany: (company: IEnhancedCompany) => void
  onViewCompany: (company: IEnhancedCompany) => void
  refreshTrigger?: number
}

export default function CompaniesTable({
  onCreateCompany,
  onEditCompany,
  onViewCompany,
  refreshTrigger = 0
}: CompaniesTableProps) {
  const [companies, setCompanies] = useState<IEnhancedCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ICompanyFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])

  // Estado para el diálogo de confirmación
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    action: ConfirmationDialogAction
    title: string
    message: string
    confirmText?: string
    company?: IEnhancedCompany
    onConfirm?: () => void
  }>({
    isOpen: false,
    action: 'warning',
    title: '',
    message: ''
  })
  const [actionLoading, setActionLoading] = useState(false)

  const pageSize = 10

  // Cargar empresas
  const loadCompanies = async () => {
    setLoading(true)
    try {
      const response = await EnhancedCompanyAPI.getAllCompanies({
        page: currentPage,
        limit: pageSize,
        filters: {
          ...filters,
          search: searchTerm
        }
      })

      console.log('Response from API:', response)
      setCompanies(response.data || [])
      setTotalCount(response.pagination?.total || 0)
    } catch (error) {
      console.error('Error al cargar empresas:', error)
      setCompanies([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [currentPage, searchTerm, filters, refreshTrigger])

  // Manejo de filtros
  const handleFilterChange = (key: keyof ICompanyFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Funciones auxiliares para el diálogo
  const openDialog = (
    action: ConfirmationDialogAction,
    title: string,
    message: string,
    company: IEnhancedCompany | null,
    onConfirm: () => void,
    confirmText?: string
  ) => {
    setDialogState({
      isOpen: true,
      action,
      title,
      message,
      confirmText,
      company: company || undefined,
      onConfirm
    })
  }

  const closeDialog = () => {
    setDialogState(prev => ({...prev, isOpen: false}))
    setActionLoading(false)
  }

  // Acciones de empresa actualizadas
  const handleSuspendCompany = async (company: IEnhancedCompany) => {
    openDialog(
      'suspend',
      'Suspender Empresa',
      `¿Está seguro de que desea suspender la empresa "${company.name}"? Esta acción impedirá que los usuarios de la empresa accedan al sistema.`,
      company,
      async () => {
        setActionLoading(true)
        try {
          const result = await EnhancedCompanyAPI.suspendCompany(company._id)
          if (result.success) {
            await loadCompanies()
            closeDialog()
          } else {
            // Mostrar error en modal en lugar de alert
            setDialogState(prev => ({
              ...prev,
              action: 'error',
              title: 'Error al Suspender',
              message: result.message || 'No se pudo suspender la empresa',
              confirmText: 'Cerrar',
              onConfirm: () => {
                closeDialog()
              }
            }))
            setActionLoading(false)
          }
        } catch (error) {
          console.error('Error al suspender empresa:', error)
          // Mostrar error en modal en lugar de alert
          setDialogState(prev => ({
            ...prev,
            action: 'error',
            title: 'Error al Suspender',
            message:
              'Error al suspender la empresa. Por favor, intente nuevamente.',
            confirmText: 'Cerrar',
            onConfirm: () => {
              closeDialog()
            }
          }))
          setActionLoading(false)
        }
      },
      'Suspender'
    )
  }

  const handleReactivateCompany = async (company: IEnhancedCompany) => {
    openDialog(
      'reactivate',
      'Reactivar Empresa',
      `¿Está seguro de que desea reactivar la empresa "${company.name}"? Los usuarios de la empresa podrán acceder nuevamente al sistema.`,
      company,
      async () => {
        setActionLoading(true)
        try {
          const result = await EnhancedCompanyAPI.reactivateCompany(company._id)
          if (result.success) {
            await loadCompanies()
            closeDialog()
          } else {
            // Mostrar error en modal en lugar de alert
            setDialogState(prev => ({
              ...prev,
              action: 'error',
              title: 'Error al Reactivar',
              message: result.message || 'No se pudo reactivar la empresa',
              confirmText: 'Cerrar',
              onConfirm: () => {
                closeDialog()
              }
            }))
            setActionLoading(false)
          }
        } catch (error) {
          console.error('Error al reactivar empresa:', error)
          // Mostrar error en modal en lugar de alert
          setDialogState(prev => ({
            ...prev,
            action: 'error',
            title: 'Error al Reactivar',
            message:
              'Error al reactivar la empresa. Por favor, intente nuevamente.',
            confirmText: 'Cerrar',
            onConfirm: () => {
              closeDialog()
            }
          }))
          setActionLoading(false)
        }
      },
      'Reactivar'
    )
  }

  const handleDeleteCompany = async (company: IEnhancedCompany) => {
    openDialog(
      'delete',
      'Eliminar Empresa',
      `¿Está seguro de que desea eliminar permanentemente la empresa "${company.name}"? Esta acción no se puede deshacer y se eliminarán todos los datos asociados.`,
      company,
      async () => {
        setActionLoading(true)
        try {
          const result = await EnhancedCompanyAPI.deleteCompany(company._id)
          if (result.success) {
            await loadCompanies()
            closeDialog()
          } else {
            // Mostrar error en modal en lugar de alert
            setDialogState(prev => ({
              ...prev,
              action: 'error',
              title: 'Error al Eliminar',
              message: result.message || 'No se pudo eliminar la empresa',
              confirmText: 'Cerrar',
              onConfirm: () => {
                closeDialog()
              }
            }))
            setActionLoading(false)
          }
        } catch (error) {
          console.error('Error al eliminar empresa:', error)
          // Mostrar error en modal en lugar de alert
          setDialogState(prev => ({
            ...prev,
            action: 'error',
            title: 'Error al Eliminar',
            message:
              'Error al eliminar la empresa. Por favor, intente nuevamente.',
            confirmText: 'Cerrar',
            onConfirm: () => {
              closeDialog()
            }
          }))
          setActionLoading(false)
        }
      },
      'Eliminar Permanentemente'
    )
  }

  // Selección múltiple
  const toggleSelectCompany = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  const toggleSelectAll = () => {
    if (!companies?.length) return

    setSelectedCompanies(
      selectedCompanies.length === companies.length
        ? []
        : companies.map(c => c._id)
    )
  }

  // Acciones múltiples
  const handleBulkSuspend = () => {
    const selectedCompaniesData = companies.filter(
      company =>
        selectedCompanies.includes(company._id) && !isCompanySuspended(company)
    )

    if (selectedCompaniesData.length === 0) {
      openDialog(
        'warning',
        'Sin Empresas Válidas',
        'No hay empresas activas seleccionadas para suspender. Por favor, seleccione empresas que no estén suspendidas.',
        null,
        () => {
          closeDialog()
        },
        'Entendido'
      )
      return
    }

    openDialog(
      'suspend',
      'Suspender Empresas Seleccionadas',
      `¿Está seguro de que desea suspender ${selectedCompaniesData.length} empresas seleccionadas? Esta acción impedirá que los usuarios de estas empresas accedan al sistema.`,
      null,
      async () => {
        setActionLoading(true)
        try {
          // Procesar cada empresa seleccionada
          for (const company of selectedCompaniesData) {
            await EnhancedCompanyAPI.suspendCompany(company._id)
          }
          await loadCompanies()
          setSelectedCompanies([])
          closeDialog()
        } catch (error) {
          console.error('Error al suspender empresas:', error)
          // Mostrar error en modal en lugar de alert
          setDialogState(prev => ({
            ...prev,
            action: 'error',
            title: 'Error en Suspensión Masiva',
            message:
              'Error al suspender algunas empresas. Por favor, intente nuevamente.',
            confirmText: 'Cerrar',
            onConfirm: () => {
              closeDialog()
            }
          }))
          setActionLoading(false)
        }
      },
      `Suspender ${selectedCompaniesData.length} Empresas`
    )
  }

  const handleBulkReactivate = () => {
    const selectedCompaniesData = companies.filter(
      company =>
        selectedCompanies.includes(company._id) && isCompanySuspended(company)
    )

    if (selectedCompaniesData.length === 0) {
      openDialog(
        'warning',
        'Sin Empresas Válidas',
        'No hay empresas suspendidas seleccionadas para reactivar. Por favor, seleccione empresas que estén suspendidas.',
        null,
        () => {
          closeDialog()
        },
        'Entendido'
      )
      return
    }

    openDialog(
      'reactivate',
      'Reactivar Empresas Seleccionadas',
      `¿Está seguro de que desea reactivar ${selectedCompaniesData.length} empresas seleccionadas? Los usuarios de estas empresas podrán acceder nuevamente al sistema.`,
      null,
      async () => {
        setActionLoading(true)
        try {
          // Procesar cada empresa seleccionada
          for (const company of selectedCompaniesData) {
            await EnhancedCompanyAPI.reactivateCompany(company._id)
          }
          await loadCompanies()
          setSelectedCompanies([])
          closeDialog()
        } catch (error) {
          console.error('Error al reactivar empresas:', error)
          // Mostrar error en modal en lugar de alert
          setDialogState(prev => ({
            ...prev,
            action: 'error',
            title: 'Error en Reactivación Masiva',
            message:
              'Error al reactivar algunas empresas. Por favor, intente nuevamente.',
            confirmText: 'Cerrar',
            onConfirm: () => {
              closeDialog()
            }
          }))
          setActionLoading(false)
        }
      },
      `Reactivar ${selectedCompaniesData.length} Empresas`
    )
  }

  // Exportar
  const handleExport = async () => {
    if (selectedCompanies.length > 0) {
      // Exportar empresas seleccionadas
      openDialog(
        'warning',
        'Exportar Empresas Seleccionadas',
        `¿Desea exportar las ${selectedCompanies.length} empresas seleccionadas a un archivo CSV?`,
        null, // 🔥 FIX: Pasar null para acciones en lote
        async () => {
          setActionLoading(true)
          try {
            // Filtrar las empresas seleccionadas para exportar
            const selectedCompaniesData = companies.filter(company =>
              selectedCompanies.includes(company._id)
            )

            // Crear blob manualmente o usar API si existe método específico
            const blob = await EnhancedCompanyAPI.exportCompaniesToCSV(filters)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = `empresas_seleccionadas_${
              new Date().toISOString().split('T')[0]
            }.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            closeDialog()
          } catch (error) {
            console.error('Error al exportar:', error)
            // Mostrar error en modal en lugar de alert
            setDialogState(prev => ({
              ...prev,
              action: 'error',
              title: 'Error en Exportación',
              message:
                'Error al exportar las empresas seleccionadas. Por favor, intente nuevamente.',
              confirmText: 'Cerrar',
              onConfirm: () => {
                closeDialog()
              }
            }))
            setActionLoading(false)
          }
        },
        'Exportar Seleccionadas'
      )
    } else {
      // Exportar todas las empresas con filtros aplicados
      openDialog(
        'warning',
        'Exportar Todas las Empresas',
        `¿Desea exportar todas las empresas ${
          Object.keys(filters).length > 0
            ? 'que coinciden con los filtros aplicados'
            : 'del sistema'
        } a un archivo CSV?`,
        null, // 🔥 FIX: Pasar null para acciones en lote
        async () => {
          setActionLoading(true)
          try {
            const blob = await EnhancedCompanyAPI.exportCompaniesToCSV(filters)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = `empresas_${
              new Date().toISOString().split('T')[0]
            }.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            closeDialog()
          } catch (error) {
            console.error('Error al exportar:', error)
            // Mostrar error en modal en lugar de alert
            setDialogState(prev => ({
              ...prev,
              action: 'error',
              title: 'Error en Exportación',
              message:
                'Error al exportar todas las empresas. Por favor, intente nuevamente.',
              confirmText: 'Cerrar',
              onConfirm: () => {
                closeDialog()
              }
            }))
            setActionLoading(false)
          }
        },
        'Exportar Todas'
      )
    }
  }

  // Cálculos de paginación
  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalCount)

  // 🔥 FIX: Función helper para determinar si una empresa está suspendida
  const isCompanySuspended = (company: IEnhancedCompany): boolean => {
    // Verificar tanto en subscription.status como en company.status
    return (
      company.subscription?.status === 'suspended' ||
      company.status === 'suspended'
    )
  }

  const getStatusBadge = (status: string, subscriptionStatus: string) => {
    // 🔥 FIX: Verificar estado suspendido de manera consistente
    if (subscriptionStatus === 'suspended' || status === 'suspended') {
      return (
        <span className='px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'>
          Suspendida
        </span>
      )
    }

    switch (status) {
      case 'active':
        return (
          <span className='px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'>
            Activa
          </span>
        )
      case 'inactive':
        return (
          <span className='px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'>
            Inactiva
          </span>
        )
      default:
        return (
          <span className='px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'>
            {status}
          </span>
        )
    }
  }

  const getPlanBadge = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[planId as keyof typeof colors] || colors.free
        }`}
      >
        {plan?.name || planId}
      </span>
    )
  }

  const getPlanUserLimit = (planId: string): number => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    return plan?.limits.maxUsers || 2 // Default al plan free (2 usuarios)
  }

  return (
    <div className='bg-white shadow-sm rounded-lg'>
      {/* Header y controles */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0'>
          <div>
            <h2 className='text-lg font-medium text-gray-900'>
              Gestión de Empresas
            </h2>
            <div className='flex items-center space-x-4 mt-1'>
              <p className='text-sm text-gray-600'>
                {totalCount} empresas registradas en el sistema
              </p>
              {selectedCompanies.length > 0 && (
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                  {selectedCompanies.length} seleccionadas
                </span>
              )}
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            {/* Acciones múltiples (solo aparecen cuando hay empresas seleccionadas) */}
            {selectedCompanies.length > 0 && (
              <>
                <button
                  onClick={handleBulkSuspend}
                  className='inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors'
                  title='Suspender empresas seleccionadas'
                >
                  <PauseIcon className='w-4 h-4 mr-2' />
                  Suspender
                </button>

                <button
                  onClick={handleBulkReactivate}
                  className='inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors'
                  title='Reactivar empresas seleccionadas'
                >
                  <PlayIcon className='w-4 h-4 mr-2' />
                  Reactivar
                </button>

                <div className='border-l border-gray-300 h-6 mx-2'></div>
              </>
            )}

            <button
              onClick={handleExport}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                selectedCompanies.length > 0
                  ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
              title={
                selectedCompanies.length > 0
                  ? `Exportar ${selectedCompanies.length} empresas seleccionadas`
                  : 'Exportar todas las empresas'
              }
            >
              <ArrowDownTrayIcon className='w-4 h-4 mr-2' />
              {selectedCompanies.length > 0
                ? `Exportar (${selectedCompanies.length})`
                : 'Exportar'}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                showFilters
                  ? 'border-blue-300 text-blue-700 bg-blue-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className='w-4 h-4 mr-2' />
              Filtros
            </button>

            <button
              onClick={onCreateCompany}
              className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors'
            >
              <PlusIcon className='w-4 h-4 mr-2' />
              Nueva Empresa
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className='mt-4'>
          <div className='relative'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar empresas por nombre, email, RUT...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Plan
                </label>
                <select
                  value={filters.plan || ''}
                  onChange={e => handleFilterChange('plan', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todos los planes</option>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Estado
                </label>
                <select
                  value={filters.status || ''}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todos los estados</option>
                  <option value='active'>Activa</option>
                  <option value='inactive'>Inactiva</option>
                  <option value='suspended'>Suspendida</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Industria
                </label>
                <select
                  value={filters.industry || ''}
                  onChange={e => handleFilterChange('industry', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todas las industrias</option>
                  <option value='Tecnología y Software'>
                    Tecnología y Software
                  </option>
                  <option value='Comercio y Retail'>Comercio y Retail</option>
                  <option value='Manufactura'>Manufactura</option>
                  <option value='Servicios Profesionales'>
                    Servicios Profesionales
                  </option>
                  <option value='Salud y Medicina'>Salud y Medicina</option>
                </select>
              </div>

              <div className='flex items-end'>
                <button
                  onClick={clearFilters}
                  className='w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                <input
                  type='checkbox'
                  checked={
                    companies?.length > 0 &&
                    selectedCompanies.length === companies.length
                  }
                  onChange={toggleSelectAll}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Empresa
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Plan
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Estado
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Usuarios
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Creada
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {loading ? (
              <tr>
                <td colSpan={7} className='px-6 py-4 text-center'>
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
                    <span className='ml-2 text-gray-500'>
                      Cargando empresas...
                    </span>
                  </div>
                </td>
              </tr>
            ) : !companies?.length ? (
              <tr>
                <td colSpan={7} className='px-6 py-4 text-center text-gray-500'>
                  No se encontraron empresas
                </td>
              </tr>
            ) : (
              companies?.map(company => (
                <tr
                  key={company._id}
                  className='hover:bg-gray-50 transition-colors'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <input
                      type='checkbox'
                      checked={selectedCompanies.includes(company._id)}
                      onChange={() => toggleSelectCompany(company._id)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-10 w-10'>
                        <div
                          className='h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm'
                          style={{
                            backgroundColor:
                              company.settings?.branding?.primaryColor ||
                              '#6B7280'
                          }}
                        >
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {company.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {company.email}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {company.settings?.industry || 'Sin especificar'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {getPlanBadge(company.plan || 'free')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {getStatusBadge(
                      company.status,
                      company.subscription?.status || 'inactive'
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {company.statistics?.userCount || 0} /{' '}
                    {getPlanUserLimit(company.plan || 'free')}
                    <div className='w-full bg-gray-200 rounded-full h-1.5 mt-1'>
                      <div
                        className='bg-blue-600 h-1.5 rounded-full'
                        style={{
                          width: `${Math.min(
                            ((company.statistics?.userCount || 0) /
                              getPlanUserLimit(company.plan || 'free')) *
                              100,
                            100
                          )}%`
                        }}
                      />
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(company.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex items-center justify-end space-x-2'>
                      <button
                        onClick={() => onViewCompany(company)}
                        className='text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors'
                        title='Ver detalles'
                      >
                        <EyeIcon className='w-4 h-4' />
                      </button>

                      <button
                        onClick={() => onEditCompany(company)}
                        className='text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition-colors'
                        title='Editar'
                      >
                        <PencilIcon className='w-4 h-4' />
                      </button>

                      {isCompanySuspended(company) ? (
                        <button
                          onClick={() => handleReactivateCompany(company)}
                          className='text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition-colors'
                          title='Reactivar'
                        >
                          <PlayIcon className='w-4 h-4' />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendCompany(company)}
                          className='text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-50 transition-colors'
                          title='Suspender'
                        >
                          <PauseIcon className='w-4 h-4' />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteCompany(company)}
                        className='text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors'
                        title='Eliminar'
                      >
                        <TrashIcon className='w-4 h-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalCount > pageSize && (
        <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Anterior
            </button>
            <button
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Siguiente
            </button>
          </div>

          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Mostrando <span className='font-medium'>{startIndex}</span> a{' '}
                <span className='font-medium'>{endIndex}</span> de{' '}
                <span className='font-medium'>{totalCount}</span> resultados
              </p>
            </div>

            <div>
              <nav
                className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                aria-label='Pagination'
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ChevronLeftIcon className='h-5 w-5' />
                </button>

                {/* Números de página */}
                {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ChevronRightIcon className='h-5 w-5' />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación */}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={dialogState.onConfirm || (() => {})}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        action={dialogState.action}
        loading={actionLoading}
        data={
          dialogState.company
            ? {
                name: dialogState.company.name,
                email: dialogState.company.email,
                details: `Plan: ${
                  dialogState.company.plan || 'free'
                } | Estado: ${dialogState.company.status}`
              }
            : undefined
        }
      />
    </div>
  )
}
