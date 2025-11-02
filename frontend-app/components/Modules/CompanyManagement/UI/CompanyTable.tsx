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
} from '@/interfaces/EnhanchedCompany/EnhancedCompany'
import EnhancedCompanyAPI from '@/api/EnhancedCompanyAPI'
import ConfirmationDialog, {
  ConfirmationDialogAction
} from '@/components/Shared/ConfirmationDialog'
import UserProgressCell from './UserProgressCell'
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
import {toast} from 'react-toastify'

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
  const [pageSize, setPageSize] = useState(5) // Estado para el tamaño de página configurable

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

      //console.log('🔍 API Response completa:', response)
      //console.log('📊 Companies data:', response.data)
      //console.log('📈 Pagination:', response.pagination)
      //console.log('🔢 Total count:', response.pagination?.total)

      // 🔍 Debug: Mostrar datos de companies en console.log solo si hay problemas
      if (response.data?.length === 0 && response.pagination?.total > 0) {
        console.log('⚠️ Posible inconsistencia en datos:', {
          dataLength: response.data?.length,
          total: response.pagination?.total,
          currentPage,
          pageSize
        })
      }

      // Usar la estructura correcta de la interfaz
      const companies = response.data || []
      const total = response.pagination?.total || companies.length

      console.log('✅ Companies procesadas:', companies.length)
      console.log('✅ Total count final:', total)

      setCompanies(companies)
      setTotalCount(total)
    } catch (error) {
      console.error('❌ Error al cargar empresas:', error)
      setCompanies([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [currentPage, searchTerm, filters, refreshTrigger, pageSize]) // Agregar pageSize a las dependencias

  // Función para manejar el cambio de tamaño de página
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Resetear a la primera página cuando cambie el tamaño
  }

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
            toast.success('Empresa suspendida correctamente', {
              position: 'top-right',
              autoClose: 3000
            })
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
            toast.success('Empresa reactivada correctamente', {
              position: 'top-right',
              autoClose: 3000
            })
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
            toast.success('Empresa eliminada correctamente', {
              position: 'top-right'
            })
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
          toast.success('Empresas suspendidas correctamente', {
            position: 'top-right',
            autoClose: 3000
          })
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
          toast.success('Empresas reactivadas correctamente', {
            position: 'top-right',
            autoClose: 3000
          })
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
    const subscriptionStatus = company.subscription?.status
    const companyStatus = company.status

    return subscriptionStatus === 'suspended' || companyStatus === 'suspended'
  }

  // 🔥 FIX: Función para sanitizar el status antes de mostrarlo
  const sanitizeStatus = (status: string, plan: string): string => {
    // Si el status es 'trial' pero el plan no es 'trial', corregir según el plan
    if (status === 'trial' && plan !== 'trial') {
      // Corrección silenciosa: Para planes free/basic/professional/enterprise,
      // el status debería ser 'active' en lugar de 'trial'
      return 'active'
    }

    // Si no se proporciona status válido, asumir 'active' para planes activos
    if (!status || status === 'undefined' || status === 'null') {
      return 'active'
    }

    return status
  }

  const getStatusBadge = (
    status: string,
    subscriptionStatus: string,
    plan?: string
  ) => {
    // 🔥 FIX: Sanitizar status antes de procesarlo
    const cleanStatus = sanitizeStatus(status || 'active', plan || 'free')

    // 🔥 FIX: Verificar estado suspendido de manera consistente
    if (subscriptionStatus === 'suspended' || cleanStatus === 'suspended') {
      return (
        <span className='px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'>
          Suspendida
        </span>
      )
    }

    switch (cleanStatus) {
      case 'active':
        return (
          <span className='px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full shadow-sm'>
            Activa
          </span>
        )
      case 'inactive':
        return (
          <span className='px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full shadow-sm'>
            Inactiva
          </span>
        )
      case 'trial':
        return (
          <span className='px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full shadow-sm'>
            En Prueba
          </span>
        )
      default:
        return (
          <span className='px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full shadow-sm'>
            {cleanStatus}
          </span>
        )
    }
  }

  const getPlanBadge = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    const colors = {
      trial: 'bg-amber-100 text-amber-800',
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    }

    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
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

  // 🔍 Debug: Mostrar estado actual en consola
  console.log('🚀 CompaniesTable Estado Actual:', {
    loading,
    totalCount,
    companiesLength: companies?.length,
    currentPage,
    searchTerm,
    filters
  })

  return (
    <div className='bg-white shadow-sm rounded-lg'>
      {/* Header y controles */}
      <div className='p-3 sm:p-4 md:p-6 border-b border-gray-200'>
        <div className='flex flex-col space-y-4'>
          {/* Título y contador */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='flex-1'>
              <h2 className='text-base sm:text-lg font-medium text-gray-900'>
                Gestión de Empresas
              </h2>
              {/* Contador de empresas y seleccionadas */}
              <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1'>
                <p className='text-xs sm:text-sm text-gray-600'>
                  {totalCount === 0 && loading
                    ? 'Cargando...'
                    : `${totalCount} empresas • ${pageSize}/página`}
                </p>
                {selectedCompanies.length > 0 && (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit'>
                    {selectedCompanies.length} seleccionadas
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controles - Layout responsive mejorado */}
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
            {/* Grupo izquierdo: Selector de página y Nueva Empresa */}
            <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
              {/* Selector de registros por página */}
              <div className='flex items-center gap-2 flex-shrink-0'>
                <label className='text-xs sm:text-sm text-gray-600 whitespace-nowrap'>
                  Mostrar:
                </label>
                <select
                  value={pageSize}
                  onChange={e => handlePageSizeChange(Number(e.target.value))}
                  className='px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[70px]'
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className='text-xs sm:text-sm text-gray-600 whitespace-nowrap hidden sm:inline'>
                  por página
                </span>
              </div>
            </div>

            {/* Grupo derecho: Acciones múltiples y controles secundarios */}
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0'>
              {/* Acciones múltiples (solo aparecen cuando hay empresas seleccionadas) */}
              {selectedCompanies.length > 0 && (
                <div className='flex gap-2 flex-wrap'>
                  <button
                    onClick={handleBulkSuspend}
                    className='inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border border-yellow-300 rounded-md text-xs sm:text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors'
                    title='Suspender empresas seleccionadas'
                  >
                    <PauseIcon className='w-4 h-4 sm:mr-2' />
                    <span className='hidden sm:inline'>Suspender</span>
                  </button>

                  <button
                    onClick={handleBulkReactivate}
                    className='inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border border-green-300 rounded-md text-xs sm:text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors'
                    title='Reactivar empresas seleccionadas'
                  >
                    <PlayIcon className='w-4 h-4 sm:mr-2' />
                    <span className='hidden sm:inline'>Reactivar</span>
                  </button>
                </div>
              )}

              {/* Botones de filtros y exportar */}
              <div className='flex gap-2'>
                <button
                  onClick={handleExport}
                  className={`inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors ${
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
                  <ArrowDownTrayIcon className='w-4 h-4 sm:mr-2' />
                  <span className='hidden sm:inline'>
                    {selectedCompanies.length > 0
                      ? `Exportar (${selectedCompanies.length})`
                      : 'Exportar'}
                  </span>
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    showFilters
                      ? 'border-blue-300 text-blue-700 bg-blue-50'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <FunnelIcon className='w-4 h-4 sm:mr-2' />
                  <span className='hidden sm:inline'>Filtros</span>
                </button>
              </div>
              {/* Botón Nueva Empresa */}
              <div className='flex gap-2'>
                <button
                  onClick={onCreateCompany}
                  className='inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto'
                >
                  <PlusIcon className='w-4 h-4 mr-2' />
                  Nueva Empresa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className='mt-4'>
          <div className='relative'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar por nombre, email, RUT...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className='mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              <div>
                <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  Plan
                </label>
                <select
                  value={filters.plan || ''}
                  onChange={e => handleFilterChange('plan', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  Estado
                </label>
                <select
                  value={filters.status || ''}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todos los estados</option>
                  <option value='active'>Activa</option>
                  <option value='inactive'>Inactiva</option>
                  <option value='suspended'>Suspendida</option>
                </select>
              </div>

              <div>
                <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  Industria
                </label>
                <select
                  value={filters.industry || ''}
                  onChange={e => handleFilterChange('industry', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
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

              <div className='flex items-end sm:col-span-2 lg:col-span-1'>
                <button
                  onClick={clearFilters}
                  className='w-full px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className='overflow-x-auto -mx-3 sm:mx-0'>
        <div className='inline-block min-w-full align-middle'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
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
                <th className='px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Empresa
                </th>
                <th className='hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Plan
                </th>
                <th className='hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Estado
                </th>
                <th className='hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Usuarios
                </th>
                <th className='hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Creada
                </th>
                <th className='px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={7} className='px-3 sm:px-6 py-8 text-center'>
                    <div className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
                      <span className='ml-2 text-sm text-gray-500'>
                        Cargando...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : !companies?.length ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-3 sm:px-6 py-8 text-center text-sm text-gray-500'
                  >
                    No se encontraron empresas
                  </td>
                </tr>
              ) : (
                companies?.map(company => (
                  <tr
                    key={company._id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-3 sm:px-6 py-4 whitespace-nowrap'>
                      <input
                        type='checkbox'
                        checked={selectedCompanies.includes(company._id)}
                        onChange={() => toggleSelectCompany(company._id)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </td>
                    <td className='px-3 sm:px-6 py-4'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10'>
                          <div
                            className='h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm'
                            style={{
                              backgroundColor:
                                company.settings?.branding?.primaryColor ||
                                '#6B7280'
                            }}
                          >
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className='ml-3 sm:ml-4 min-w-0 flex-1'>
                          <div className='text-xs sm:text-sm font-medium text-gray-900 truncate'>
                            {company.name}
                          </div>
                          <div className='text-xs text-gray-500 truncate'>
                            {company.email}
                          </div>
                          {/* Info adicional visible solo en mobile */}
                          <div className='md:hidden mt-1 flex flex-wrap gap-1'>
                            {getPlanBadge(company.plan || 'free')}
                            <span className='lg:hidden'>
                              {getStatusBadge(
                                company.status || 'active',
                                company.subscription?.status || 'active',
                                company.plan || 'free'
                              )}
                            </span>
                          </div>
                          {/* Info de usuarios visible en mobile/tablet */}
                          <div className='xl:hidden mt-2'>
                            <UserProgressCell company={company} />
                          </div>
                          <div className='text-xs text-gray-400 hidden sm:block'>
                            {company.settings?.industry || 'Sin especificar'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap'>
                      {getPlanBadge(company.plan || 'free')}
                    </td>
                    <td className='hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap'>
                      {getStatusBadge(
                        company.status || 'active',
                        company.subscription?.status || 'active',
                        company.plan || 'free'
                      )}
                    </td>
                    <td className='hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap'>
                      <UserProgressCell company={company} />
                    </td>
                    <td className='hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500'>
                      {new Date(company.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                      })}
                    </td>
                    <td className='px-3 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium'>
                      <div className='flex items-center justify-end gap-1 sm:gap-2'>
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
      </div>

      {/* Paginación mejorada */}
      {totalCount > 0 && (
        <div className='bg-white px-3 sm:px-4 md:px-6 py-3 border-t border-gray-200'>
          {/* Vista móvil */}
          <div className='flex flex-col gap-3 sm:hidden'>
            <div className='flex items-center justify-between'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <ChevronLeftIcon className='h-4 w-4 mr-1' />
                Anterior
              </button>

              <span className='px-4 text-xs text-gray-700 whitespace-nowrap'>
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className='flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Siguiente
                <ChevronRightIcon className='h-4 w-4 ml-1' />
              </button>
            </div>

            <div className='text-center'>
              <p className='text-xs text-gray-600'>
                {startIndex}-{endIndex} de {totalCount}
              </p>
            </div>
          </div>

          {/* Vista desktop */}
          <div className='hidden sm:flex sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3 md:gap-4'>
              <p className='text-xs md:text-sm text-gray-700'>
                Mostrando <span className='font-medium'>{startIndex}</span> a{' '}
                <span className='font-medium'>{endIndex}</span> de{' '}
                <span className='font-medium'>{totalCount}</span>
              </p>

              {/* Información adicional sobre el tamaño de página */}
              <div className='hidden md:block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                {pageSize} por página
              </div>
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

                {/* Números de página inteligentes */}
                {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                  let page: number

                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-3 md:px-4 py-2 border text-xs md:text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                {/* Mostrar "..." y última página si hay muchas páginas */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className='relative inline-flex items-center px-3 md:px-4 py-2 border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-700'>
                      ...
                    </span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className='relative inline-flex items-center px-3 md:px-4 py-2 border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50'
                    >
                      {totalPages}
                    </button>
                  </>
                )}

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
