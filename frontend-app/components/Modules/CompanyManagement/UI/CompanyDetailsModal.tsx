/**
 * Company Details Modal Component
 * @description: Modal para ver detalles completos de una empresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, {useState, useEffect} from 'react'
import {IEnhancedCompany} from '@/interfaces/EnhanchedCompany/EnhancedCompany'
import EnhancedCompanyAPI from '@/api/EnhancedCompanyAPI'
import {
  XMarkIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface CompanyDetailsModalProps {
  isOpen: boolean
  company: IEnhancedCompany
  onClose: () => void
  onEdit: () => void
}

export default function CompanyDetailsModal({
  isOpen,
  company,
  onClose,
  onEdit
}: CompanyDetailsModalProps) {
  const [statistics, setStatistics] = useState(company?.statistics || null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    if (isOpen && company) {
      loadCompanyStatistics()
    }
  }, [isOpen, company])

  const loadCompanyStatistics = async () => {
    try {
      setLoadingStats(true)
      const stats = await EnhancedCompanyAPI.getCompanyStatistics(company._id)
      setStatistics(stats)
    } catch (error) {
      console.error('Error loading company statistics:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (!isOpen) return null

  const getStatusIcon = (status: string, subscriptionStatus?: string) => {
    if (subscriptionStatus === 'suspended') {
      return <ExclamationTriangleIcon className='w-5 h-5 text-red-500' />
    }

    switch (status) {
      case 'active':
        return <CheckCircleIcon className='w-5 h-5 text-green-500' />
      case 'inactive':
        return <ClockIcon className='w-5 h-5 text-gray-500' />
      default:
        return <ClockIcon className='w-5 h-5 text-gray-500' />
    }
  }

  const getStatusText = (status: string, subscriptionStatus?: string) => {
    if (subscriptionStatus === 'suspended') return 'Suspendida'

    switch (status) {
      case 'active':
        return 'Activa'
      case 'inactive':
        return 'Inactiva'
      default:
        return status
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    }

    const names = {
      free: 'Gratuito',
      basic: 'Básico',
      professional: 'Profesional',
      enterprise: 'Empresarial'
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[plan as keyof typeof colors] || colors.free
        }`}
      >
        {names[plan as keyof typeof names] || plan}
      </span>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-4'>
            <div
              className='w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg'
              style={{
                backgroundColor:
                  company?.settings?.branding?.primaryColor || '#3B82F6'
              }}
            >
              {company?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                {company?.name || 'Sin nombre'}
              </h2>
              <p className='text-sm text-gray-600'>
                {company?.settings?.industry || 'Sin industria'}
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            <button
              onClick={onEdit}
              className='inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors'
            >
              <PencilIcon className='w-4 h-4 mr-2' />
              Editar
            </button>

            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <XMarkIcon className='w-6 h-6 text-gray-400' />
            </button>
          </div>
        </div>

        <div className='p-6 space-y-8'>
          {/* Estado y suscripción */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='flex items-center mb-2'>
                {getStatusIcon(
                  company?.status || 'inactive',
                  company?.subscription?.status
                )}
                <h3 className='ml-2 text-sm font-medium text-gray-900'>
                  Estado
                </h3>
              </div>
              <p className='text-lg font-semibold'>
                {getStatusText(
                  company?.status || 'inactive',
                  company?.subscription?.status
                )}
              </p>
            </div>

            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='flex items-center mb-2'>
                <CurrencyDollarIcon className='w-5 h-5 text-blue-500' />
                <h3 className='ml-2 text-sm font-medium text-gray-900'>Plan</h3>
              </div>
              <div className='flex items-center space-x-2'>
                {getPlanBadge(company?.plan || 'free')}
                {company?.subscription?.autoRenew && (
                  <span className='text-xs text-gray-500'>
                    (Auto-renovación)
                  </span>
                )}
              </div>
            </div>

            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='flex items-center mb-2'>
                <CalendarIcon className='w-5 h-5 text-green-500' />
                <h3 className='ml-2 text-sm font-medium text-gray-900'>
                  Registro
                </h3>
              </div>
              <p className='text-sm text-gray-600'>
                {company?.createdAt
                  ? new Date(company.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Sin fecha'}
              </p>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Información de Contacto
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <div className='flex items-center'>
                  <EnvelopeIcon className='w-5 h-5 text-gray-400 mr-3' />
                  <span className='text-sm text-gray-900'>
                    {company?.email || 'Sin email'}
                  </span>
                </div>

                {company?.phone && (
                  <div className='flex items-center'>
                    <PhoneIcon className='w-5 h-5 text-gray-400 mr-3' />
                    <span className='text-sm text-gray-900'>
                      {company.phone}
                    </span>
                  </div>
                )}

                {company?.website && (
                  <div className='flex items-center'>
                    <GlobeAltIcon className='w-5 h-5 text-gray-400 mr-3' />
                    <a
                      href={company.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-blue-600 hover:text-blue-800'
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>

              {company?.address && (
                <div>
                  <div className='flex items-start'>
                    <MapPinIcon className='w-5 h-5 text-gray-400 mr-3 mt-0.5' />
                    <div className='text-sm text-gray-900'>
                      <p>{company.address.street || 'Sin calle'}</p>
                      <p>
                        {company.address.city || 'Sin ciudad'},{' '}
                        {company.address.state || 'Sin estado'}
                      </p>
                      <p>
                        {company.address.country || 'Sin país'}{' '}
                        {company.address.postalCode || ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas de uso */}
          {statistics?.usage && (
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Estadísticas de Uso
                </h3>
                {loadingStats && (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {/* Usuarios */}
                {statistics.usage.users && (
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center'>
                        <UserGroupIcon className='w-5 h-5 text-blue-500' />
                        <span className='ml-2 text-sm font-medium text-gray-900'>
                          Usuarios
                        </span>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {statistics.usage.users.current || 0} /{' '}
                        {statistics.usage.users.limit || 0}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${getUsageColor(
                          statistics.usage.users.percentage || 0
                        )}`}
                        style={{
                          width: `${statistics.usage.users.percentage || 0}%`
                        }}
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      {(statistics.usage.users.percentage || 0).toFixed(1)}%
                      utilizado
                    </p>
                  </div>
                )}

                {/* Productos */}
                {statistics.usage.products && (
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center'>
                        <BuildingOfficeIcon className='w-5 h-5 text-green-500' />
                        <span className='ml-2 text-sm font-medium text-gray-900'>
                          Productos
                        </span>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {statistics.usage.products.current || 0} /{' '}
                        {statistics.usage.products.limit || 0}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${getUsageColor(
                          statistics.usage.products.percentage || 0
                        )}`}
                        style={{
                          width: `${statistics.usage.products.percentage || 0}%`
                        }}
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      {(statistics.usage.products.percentage || 0).toFixed(1)}%
                      utilizado
                    </p>
                  </div>
                )}

                {/* Transacciones */}
                {statistics.usage.transactions && (
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center'>
                        <ChartBarIcon className='w-5 h-5 text-purple-500' />
                        <span className='ml-2 text-sm font-medium text-gray-900'>
                          Transacciones
                        </span>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {statistics.usage.transactions.current || 0} /{' '}
                        {statistics.usage.transactions.limit || 0}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${getUsageColor(
                          statistics.usage.transactions.percentage || 0
                        )}`}
                        style={{
                          width: `${
                            statistics.usage.transactions.percentage || 0
                          }%`
                        }}
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      {(statistics.usage.transactions.percentage || 0).toFixed(
                        1
                      )}
                      % utilizado
                    </p>
                  </div>
                )}

                {/* Almacenamiento */}
                {statistics.usage.storage && (
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center'>
                        <CurrencyDollarIcon className='w-5 h-5 text-orange-500' />
                        <span className='ml-2 text-sm font-medium text-gray-900'>
                          Storage
                        </span>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {statistics.usage.storage.current || 0} /{' '}
                        {statistics.usage.storage.limit || 0} GB
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${getUsageColor(
                          statistics.usage.storage.percentage || 0
                        )}`}
                        style={{
                          width: `${statistics.usage.storage.percentage || 0}%`
                        }}
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      {(statistics.usage.storage.percentage || 0).toFixed(1)}%
                      utilizado
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sin estadísticas disponibles */}
          {!statistics?.usage && !loadingStats && (
            <div className='text-center py-8'>
              <p className='text-gray-500'>No hay estadísticas disponibles</p>
            </div>
          )}

          {/* Configuración de negocio */}
          {company?.settings && (
            <div>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Configuración de Negocio
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Tipo de Negocio
                    </label>
                    <p className='text-sm text-gray-900 capitalize'>
                      {company.settings.businessType?.replace('_', ' ') ||
                        'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      RUT/Tax ID
                    </label>
                    <p className='text-sm text-gray-900'>
                      {company.settings.taxId || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Moneda
                    </label>
                    <p className='text-sm text-gray-900'>
                      {company.settings.currency || 'USD'}
                    </p>
                  </div>
                </div>

                <div className='space-y-3'>
                  {company.settings.fiscalYear && (
                    <div>
                      <label className='text-sm font-medium text-gray-500'>
                        Año Fiscal
                      </label>
                      <p className='text-sm text-gray-900'>
                        {new Date(
                          2024,
                          (company.settings.fiscalYear.startMonth || 1) - 1,
                          1
                        ).toLocaleDateString('es-ES', {month: 'long'})}{' '}
                        -{' '}
                        {new Date(
                          2024,
                          (company.settings.fiscalYear.endMonth || 12) - 1,
                          1
                        ).toLocaleDateString('es-ES', {month: 'long'})}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className='text-sm font-medium text-gray-500'>
                      Verificada
                    </label>
                    <p className='text-sm text-gray-900'>
                      {company.verified ? '✓ Verificada' : '⚠ Pendiente'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Características habilitadas */}
          {company?.settings?.features && (
            <div>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Características Habilitadas
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
                {Object.entries(company.settings.features).map(
                  ([feature, enabled]) => (
                    <div
                      key={feature}
                      className={`flex items-center justify-center p-3 rounded-lg border ${
                        enabled
                          ? 'border-green-200 bg-green-50 text-green-800'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}
                    >
                      <span className='text-sm font-medium capitalize'>
                        {enabled ? '✓' : '×'} {feature}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Personalización */}
          {company?.settings?.branding && (
            <div>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Personalización
              </h3>
              <div className='flex items-center space-x-6'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Colores de Marca
                  </label>
                  <div className='flex items-center space-x-3 mt-2'>
                    <div className='flex items-center space-x-2'>
                      <div
                        className='w-6 h-6 rounded-full border border-gray-300'
                        style={{
                          backgroundColor:
                            company.settings.branding.primaryColor || '#3B82F6'
                        }}
                      />
                      <span className='text-sm text-gray-900'>
                        {company.settings.branding.primaryColor || '#3B82F6'}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div
                        className='w-6 h-6 rounded-full border border-gray-300'
                        style={{
                          backgroundColor:
                            company.settings.branding.secondaryColor ||
                            '#6B7280'
                        }}
                      />
                      <span className='text-sm text-gray-900'>
                        {company.settings.branding.secondaryColor || '#6B7280'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
