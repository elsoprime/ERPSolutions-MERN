/**
 * Company Details Modal Component
 * @description: Modal mejorado para ver detalles completos de una empresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, { useState, useEffect } from 'react'
import { IEnhancedCompany, ICompanyChartData } from '@/interfaces/EnhanchedCompany/EnhancedCompany'
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
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface CompanyDetailsModalProps {
  isOpen: boolean
  company: IEnhancedCompany
  onClose: () => void
  onEdit?: () => void
}

// Mapeo de claves técnicas a etiquetas legibles en español
const FEATURE_LABELS: Record<string, string> = {
  inventoryManagement: 'Gestión de Inventario',
  accounting: 'Contabilidad',
  hrm: 'Recursos Humanos',
  crm: 'CRM',
  projectManagement: 'Gestión de Proyectos',
  reports: 'Reportes',
  multiCurrency: 'Multimoneda',
  apiAccess: 'Acceso API',
  customBranding: 'Branding Personalizado',
  prioritySupport: 'Soporte Prioritario',
  advancedAnalytics: 'Analítica Avanzada',
  auditLog: 'Registro de Auditoría',
  customIntegrations: 'Integraciones Personalizadas',
  dedicatedAccount: 'Cuenta Dedicada'
}

// Iconos para cada característica
const FEATURE_ICONS: Record<string, string> = {
  inventoryManagement: '📦',
  accounting: '💰',
  hrm: '👥',
  crm: '🤝',
  projectManagement: '📊',
  reports: '📈',
  multiCurrency: '💱',
  apiAccess: '🔌',
  customBranding: '🎨',
  prioritySupport: '⭐',
  advancedAnalytics: '📉',
  auditLog: '📝',
  customIntegrations: '🔗',
  dedicatedAccount: '👤'
}

export default function CompanyDetailsModal({
  isOpen,
  company,
  onClose,
  onEdit
}: CompanyDetailsModalProps) {
  const [chartData, setChartData] = useState<ICompanyChartData | null>(null)
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
      setChartData(stats)
    } catch (error) {
      console.error('Error loading company statistics:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (!isOpen) return null

  const getStatusConfig = (status: string, subscriptionStatus?: string) => {
    if (subscriptionStatus === 'suspended') {
      return {
        icon: ExclamationTriangleIcon,
        text: 'Suspendida',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      }
    }

    switch (status) {
      case 'active':
        return {
          icon: CheckCircleIcon,
          text: 'Activa',
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        }
      case 'inactive':
        return {
          icon: ClockIcon,
          text: 'Inactiva',
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        }
      default:
        return {
          icon: ClockIcon,
          text: status,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        }
    }
  }

  const getPlanConfig = (plan: string) => {
    const configs = {
      free: {
        name: 'Gratuito',
        color: 'text-gray-700',
        bg: 'bg-gray-100',
        border: 'border-gray-200',
        icon: '🆓'
      },
      basic: {
        name: 'Básico',
        color: 'text-blue-700',
        bg: 'bg-blue-100',
        border: 'border-blue-200',
        icon: '📦'
      },
      professional: {
        name: 'Profesional',
        color: 'text-purple-700',
        bg: 'bg-purple-100',
        border: 'border-purple-200',
        icon: '⭐'
      },
      enterprise: {
        name: 'Empresarial',
        color: 'text-orange-700',
        bg: 'bg-orange-100',
        border: 'border-orange-200',
        icon: '🏢'
      }
    }

    return configs[plan as keyof typeof configs] || configs.free
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    if (percentage >= 50) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getUsageTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-700'
    if (percentage >= 75) return 'text-yellow-700'
    if (percentage >= 50) return 'text-blue-700'
    return 'text-green-700'
  }

  const statusConfig = getStatusConfig(company?.status || 'inactive', company?.subscription?.status)
  const planConfig = getPlanConfig(company?.plan as string)
  const StatusIcon = statusConfig.icon

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
      <div className='bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header con diseño mejorado */}
        <div className='relative bg-gradient-to-r from-blue-600 to-purple-600 p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div
                className='w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white/20'
                style={{
                  backgroundColor: company?.settings?.branding?.primaryColor || '#3B82F6'
                }}
              >
                {company?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className='text-white'>
                <h2 className='text-2xl font-bold mb-1'>
                  {company?.name || 'Sin nombre'}
                </h2>
                <div className='flex items-center space-x-3 text-sm'>
                  <span className='flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full'>
                    <BuildingOfficeIcon className='w-4 h-4' />
                    <span>{company?.settings?.industry || 'Sin industria'}</span>
                  </span>
                  {company?.verified && (
                    <span className='flex items-center space-x-1 bg-green-500/30 px-3 py-1 rounded-full'>
                      <ShieldCheckIcon className='w-4 h-4' />
                      <span>Verificada</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className='p-2 hover:bg-white/20 rounded-lg transition-colors text-white'
            >
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>
        </div>

        {/* Content con scroll */}
        <div className='flex-1 overflow-y-auto p-6'>
          <div className='space-y-6'>
            {/* Tarjetas de estado principales */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Estado */}
              <div className={`${statusConfig.bg} ${statusConfig.border} border-2 rounded-xl p-5 transition-all hover:shadow-lg`}>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center space-x-2'>
                    <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                    <h3 className='font-semibold text-gray-900'>Estado</h3>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${statusConfig.color}`}>
                  {statusConfig.text}
                </p>
              </div>

              {/* Plan */}
              <div className={`${planConfig.bg} ${planConfig.border} border-2 rounded-xl p-5 transition-all hover:shadow-lg`}>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center space-x-2'>
                    <CreditCardIcon className={`w-6 h-6 ${planConfig.color}`} />
                    <h3 className='font-semibold text-gray-900'>Plan</h3>
                  </div>
                  <span className='text-2xl'>{planConfig.icon}</span>
                </div>
                <p className={`text-2xl font-bold ${planConfig.color}`}>
                  {planConfig.name}
                </p>
                {company?.subscription?.autoRenew && (
                  <span className='text-xs text-gray-600 mt-1 block'>
                    ✓ Auto-renovación activa
                  </span>
                )}
              </div>

              {/* Fecha de registro */}
              <div className='bg-blue-50 border-2 border-blue-200 rounded-xl p-5 transition-all hover:shadow-lg'>
                <div className='flex items-center space-x-2 mb-3'>
                  <CalendarIcon className='w-6 h-6 text-blue-600' />
                  <h3 className='font-semibold text-gray-900'>Registro</h3>
                </div>
                <p className='text-lg font-semibold text-blue-700'>
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
            <div className='bg-white border-2 border-gray-200 rounded-xl p-6'>
              <div className='flex items-center space-x-2 mb-5'>
                <EnvelopeIcon className='w-6 h-6 text-blue-600' />
                <h3 className='text-xl font-bold text-gray-900'>Información de Contacto</h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                    <EnvelopeIcon className='w-5 h-5 text-gray-400 flex-shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs text-gray-500 mb-1'>Email</p>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {company?.email || 'Sin email'}
                      </p>
                    </div>
                  </div>

                  {company?.phone && (
                    <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                      <PhoneIcon className='w-5 h-5 text-gray-400 flex-shrink-0' />
                      <div className='flex-1'>
                        <p className='text-xs text-gray-500 mb-1'>Teléfono</p>
                        <p className='text-sm font-medium text-gray-900'>{company.phone}</p>
                      </div>
                    </div>
                  )}

                  {company?.website && (
                    <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                      <GlobeAltIcon className='w-5 h-5 text-gray-400 flex-shrink-0' />
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-gray-500 mb-1'>Sitio Web</p>
                        <a
                          href={company.website}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm font-medium text-blue-600 hover:text-blue-800 truncate block'
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {company?.address && (
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <div className='flex items-start space-x-3'>
                      <MapPinIcon className='w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0' />
                      <div className='flex-1'>
                        <p className='text-xs text-gray-500 mb-2'>Dirección</p>
                        <div className='text-sm font-medium text-gray-900 space-y-1'>
                          <p>{company.address.street || 'Sin calle'}</p>
                          <p>
                            {company.address.city || 'Sin ciudad'}, {company.address.state || 'Sin estado'}
                          </p>
                          <p className='text-gray-600'>
                            {company.address.country || 'Sin país'} {company.address.postalCode || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas de uso */}
            {chartData?.resourceUsage && (
              <div className='bg-white border-2 border-gray-200 rounded-xl p-6'>
                <div className='flex items-center justify-between mb-5'>
                  <div className='flex items-center space-x-2'>
                    <ChartBarIcon className='w-6 h-6 text-purple-600' />
                    <h3 className='text-xl font-bold text-gray-900'>Uso de Recursos</h3>
                  </div>
                  {loadingStats && (
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600'></div>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {/* Usuarios */}
                  <div className='bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                      <UserGroupIcon className='w-8 h-8 text-blue-600' />
                      <span className='text-xs font-semibold text-blue-700 bg-white px-2 py-1 rounded-full'>
                        {chartData.resourceUsage.users.current} / {chartData.resourceUsage.users.limit}
                      </span>
                    </div>
                    <h4 className='text-sm font-semibold text-gray-700 mb-2'>Usuarios</h4>
                    <div className='w-full bg-white rounded-full h-3 mb-2 overflow-hidden shadow-inner'>
                      <div
                        className={`h-3 rounded-full transition-all ${getUsageColor(chartData.resourceUsage.users.percentage)}`}
                        style={{ width: `${Math.min(chartData.resourceUsage.users.percentage, 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs font-bold ${getUsageTextColor(chartData.resourceUsage.users.percentage)}`}>
                      {chartData.resourceUsage.users.percentage.toFixed(1)}% utilizado
                    </p>
                  </div>

                  {/* Productos */}
                  <div className='bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 hover:shadow-lg transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                      <BuildingOfficeIcon className='w-8 h-8 text-green-600' />
                      <span className='text-xs font-semibold text-green-700 bg-white px-2 py-1 rounded-full'>
                        {chartData.resourceUsage.products.current} / {chartData.resourceUsage.products.limit}
                      </span>
                    </div>
                    <h4 className='text-sm font-semibold text-gray-700 mb-2'>Productos</h4>
                    <div className='w-full bg-white rounded-full h-3 mb-2 overflow-hidden shadow-inner'>
                      <div
                        className={`h-3 rounded-full transition-all ${getUsageColor(chartData.resourceUsage.products.percentage)}`}
                        style={{ width: `${Math.min(chartData.resourceUsage.products.percentage, 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs font-bold ${getUsageTextColor(chartData.resourceUsage.products.percentage)}`}>
                      {chartData.resourceUsage.products.percentage.toFixed(1)}% utilizado
                    </p>
                  </div>

                  {/* Transacciones */}
                  <div className='bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                      <ChartBarIcon className='w-8 h-8 text-purple-600' />
                      <span className='text-xs font-semibold text-purple-700 bg-white px-2 py-1 rounded-full'>
                        {chartData.resourceUsage.transactions.current} / {chartData.resourceUsage.transactions.limit}
                      </span>
                    </div>
                    <h4 className='text-sm font-semibold text-gray-700 mb-2'>Transacciones</h4>
                    <div className='w-full bg-white rounded-full h-3 mb-2 overflow-hidden shadow-inner'>
                      <div
                        className={`h-3 rounded-full transition-all ${getUsageColor(chartData.resourceUsage.transactions.percentage)}`}
                        style={{ width: `${Math.min(chartData.resourceUsage.transactions.percentage, 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs font-bold ${getUsageTextColor(chartData.resourceUsage.transactions.percentage)}`}>
                      {chartData.resourceUsage.transactions.percentage.toFixed(1)}% utilizado
                    </p>
                  </div>

                  {/* Almacenamiento */}
                  <div className='bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 hover:shadow-lg transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                      <CurrencyDollarIcon className='w-8 h-8 text-orange-600' />
                      <span className='text-xs font-semibold text-orange-700 bg-white px-2 py-1 rounded-full'>
                        {chartData.resourceUsage.storage.current} / {chartData.resourceUsage.storage.limit} GB
                      </span>
                    </div>
                    <h4 className='text-sm font-semibold text-gray-700 mb-2'>Almacenamiento</h4>
                    <div className='w-full bg-white rounded-full h-3 mb-2 overflow-hidden shadow-inner'>
                      <div
                        className={`h-3 rounded-full transition-all ${getUsageColor(chartData.resourceUsage.storage.percentage)}`}
                        style={{ width: `${Math.min(chartData.resourceUsage.storage.percentage, 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs font-bold ${getUsageTextColor(chartData.resourceUsage.storage.percentage)}`}>
                      {chartData.resourceUsage.storage.percentage.toFixed(1)}% utilizado
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sin estadísticas */}
            {!chartData?.resourceUsage && !loadingStats && (
              <div className='bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center'>
                <ChartBarIcon className='w-16 h-16 text-gray-300 mx-auto mb-3' />
                <p className='text-gray-500 font-medium'>No hay estadísticas disponibles</p>
              </div>
            )}

            {/* Configuración de negocio */}
            {company?.settings && (
              <div className='bg-white border-2 border-gray-200 rounded-xl p-6'>
                <div className='flex items-center space-x-2 mb-5'>
                  <Cog6ToothIcon className='w-6 h-6 text-indigo-600' />
                  <h3 className='text-xl font-bold text-gray-900'>Configuración de Negocio</h3>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border-2 border-indigo-200'>
                    <label className='text-xs font-semibold text-indigo-600 uppercase mb-2 block'>
                      Tipo de Negocio
                    </label>
                    <p className='text-lg font-bold text-gray-900 capitalize'>
                      {company.settings.businessType?.replace('_', ' ') || 'No especificado'}
                    </p>
                  </div>

                  <div className='p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200'>
                    <label className='text-xs font-semibold text-green-600 uppercase mb-2 block'>
                      RUT/Tax ID
                    </label>
                    <p className='text-lg font-bold text-gray-900'>
                      {company.settings.taxId || 'No especificado'}
                    </p>
                  </div>

                  <div className='p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-200'>
                    <label className='text-xs font-semibold text-yellow-600 uppercase mb-2 block'>
                      Moneda
                    </label>
                    <p className='text-lg font-bold text-gray-900'>
                      {company.settings.currency || 'USD'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Características habilitadas */}
            {company?.settings?.features && (
              <div className='bg-white border-2 border-gray-200 rounded-xl p-6'>
                <div className='flex items-center justify-between mb-5'>
                  <div className='flex items-center space-x-2'>
                    <SparklesIcon className='w-6 h-6 text-yellow-600' />
                    <h3 className='text-xl font-bold text-gray-900'>Características del Plan</h3>
                  </div>
                  <span className='text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full'>
                    {Object.entries(company.settings.features).filter(([_, enabled]) => enabled).length} de{' '}
                    {Object.entries(company.settings.features).length} activas
                  </span>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
                  {Object.entries(company.settings.features).map(([feature, enabled]) => {
                    const label = FEATURE_LABELS[feature] || feature
                    const icon = FEATURE_ICONS[feature] || '✨'

                    return (
                      <div
                        key={feature}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${enabled
                            ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 text-green-800 shadow-sm hover:shadow-md'
                            : 'border-gray-200 bg-gray-50 text-gray-400'
                          }`}
                      >
                        <span className='text-2xl mb-2'>{icon}</span>
                        <span className='text-xs font-bold text-center leading-tight'>
                          {label}
                        </span>
                        <span className='text-xs mt-1'>
                          {enabled ? '✓' : '×'}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className='text-xs text-gray-500 mt-4 italic border-t border-gray-200 pt-3'>
                  💡 Las características están definidas por el plan seleccionado y no pueden modificarse manualmente.
                </p>
              </div>
            )}

            {/* Personalización */}
            {company?.settings?.branding && (
              <div className='bg-white border-2 border-gray-200 rounded-xl p-6'>
                <div className='flex items-center space-x-2 mb-5'>
                  <SparklesIcon className='w-6 h-6 text-pink-600' />
                  <h3 className='text-xl font-bold text-gray-900'>Personalización de Marca</h3>
                </div>
                <div className='flex flex-wrap items-center gap-6'>
                  <div className='flex items-center space-x-4 p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200'>
                    <div>
                      <p className='text-xs font-semibold text-pink-600 uppercase mb-2'>Color Primario</p>
                      <div className='flex items-center space-x-3'>
                        <div
                          className='w-12 h-12 rounded-lg border-2 border-white shadow-lg'
                          style={{
                            backgroundColor: company.settings.branding.primaryColor || '#3B82F6'
                          }}
                        />
                        <span className='text-sm font-mono font-bold text-gray-900'>
                          {company.settings.branding.primaryColor || '#3B82F6'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200'>
                    <div>
                      <p className='text-xs font-semibold text-purple-600 uppercase mb-2'>Color Secundario</p>
                      <div className='flex items-center space-x-3'>
                        <div
                          className='w-12 h-12 rounded-lg border-2 border-white shadow-lg'
                          style={{
                            backgroundColor: company.settings.branding.secondaryColor || '#6B7280'
                          }}
                        />
                        <span className='text-sm font-mono font-bold text-gray-900'>
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

        {/* Footer actions */}
        {onEdit && (
          <div className='p-4 bg-gray-50 border-t-2 border-gray-200'>
            <div className='flex justify-end'>
              <button
                onClick={onEdit}
                className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl'
              >
                <Cog6ToothIcon className='w-5 h-5 mr-2' />
                Editar Empresa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
