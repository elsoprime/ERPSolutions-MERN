/**
 * Company Management Page
 * @description: Página principal para gestión de empresas por Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, {useState, useEffect} from 'react'
import {IEnhancedCompany} from '@/interfaces/EnhancedCompany'
import CompaniesTable from './CompaniesTable'
import CreateCompanyForm from './CreateCompanyForm'
import EditCompanyForm from './EditCompanyForm'
import CompanyDetailsModal from './CompanyDetailsModal'
import CompanyOverviewDashboard from './CompanyOverviewDashboard'
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function CompanyManagementPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCompany, setSelectedCompany] =
    useState<IEnhancedCompany | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Tabs de navegación
  const tabs = [
    {
      id: 'overview',
      name: 'Resumen',
      icon: ChartBarIcon,
      description: 'Panel de control y estadísticas generales'
    },
    {
      id: 'companies',
      name: 'Empresas',
      icon: BuildingOfficeIcon,
      description: 'Gestionar todas las empresas del sistema'
    },
    {
      id: 'settings',
      name: 'Configuración',
      icon: CogIcon,
      description: 'Configuraciones globales del sistema'
    }
  ]

  // Handlers
  const handleCreateCompany = () => {
    setShowCreateForm(true)
  }

  const handleEditCompany = (company: IEnhancedCompany) => {
    setSelectedCompany(company)
    setShowEditForm(true)
  }

  const handleViewCompany = (company: IEnhancedCompany) => {
    setSelectedCompany(company)
    setShowDetailsModal(true)
  }

  const handleCompanyCreated = (newCompany: IEnhancedCompany) => {
    setRefreshTrigger(prev => prev + 1)
    // Opcional: Mostrar notificación de éxito
  }

  const handleCompanyUpdated = (updatedCompany: IEnhancedCompany) => {
    setRefreshTrigger(prev => prev + 1)
    // Opcional: Mostrar notificación de éxito
  }

  const closeModals = () => {
    setShowCreateForm(false)
    setShowEditForm(false)
    setShowDetailsModal(false)
    setSelectedCompany(null)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-black text-purple-800'>
                  Gestión de Empresas
                </h1>
                <p className='mt-1 text-sm text-gray-400'>
                  Panel de administración para el Super Administrador
                </p>
              </div>

              <div className='flex items-center space-x-4'>
                <div className='hidden md:flex items-center space-x-2 text-sm text-gray-500'>
                  <UserGroupIcon className='w-4 h-4' />
                  <span className='text-purple-500 font-bold'>
                    Super Administrador
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className='mt-6'>
              <nav className='flex space-x-8' aria-label='Tabs'>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon
                      className={`mr-2 h-5 w-5 ${
                        activeTab === tab.id
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='mx-auto px-4 sm:px-6 lg:px-0 py-8'>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Panel de Control Global
              </h2>
              <p className='text-gray-600 mb-6'>
                Resumen ejecutivo de todas las empresas registradas en el
                sistema
              </p>

              <CompanyOverviewDashboard />
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h2 className='text-lg font-medium text-gray-900'>
                      Lista de Empresas
                    </h2>
                    <p className='text-sm text-gray-600 mt-1'>
                      Administra todas las empresas registradas en el sistema
                    </p>
                  </div>
                </div>
              </div>

              <CompaniesTable
                onCreateCompany={handleCreateCompany}
                onEditCompany={handleEditCompany}
                onViewCompany={handleViewCompany}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Configuraciones Globales
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {/* Configuración de Planes */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center mb-3'>
                    <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <ChartBarIcon className='w-4 h-4 text-blue-600' />
                    </div>
                    <h3 className='ml-3 text-sm font-medium text-gray-900'>
                      Gestión de Planes
                    </h3>
                  </div>
                  <p className='text-xs text-gray-600 mb-3'>
                    Configurar límites y características de los planes de
                    suscripción
                  </p>
                  <button className='text-xs text-blue-600 hover:text-blue-800 font-medium'>
                    Configurar →
                  </button>
                </div>

                {/* Configuración de Sistemas */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center mb-3'>
                    <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                      <CogIcon className='w-4 h-4 text-green-600' />
                    </div>
                    <h3 className='ml-3 text-sm font-medium text-gray-900'>
                      Configuración Sistema
                    </h3>
                  </div>
                  <p className='text-xs text-gray-600 mb-3'>
                    Configuraciones globales de la plataforma
                  </p>
                  <button className='text-xs text-green-600 hover:text-green-800 font-medium'>
                    Configurar →
                  </button>
                </div>

                {/* Monitoreo y Logs */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center mb-3'>
                    <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                      <BuildingOfficeIcon className='w-4 h-4 text-purple-600' />
                    </div>
                    <h3 className='ml-3 text-sm font-medium text-gray-900'>
                      Logs y Auditoría
                    </h3>
                  </div>
                  <p className='text-xs text-gray-600 mb-3'>
                    Revisar logs de actividad y auditoría del sistema
                  </p>
                  <button className='text-xs text-purple-600 hover:text-purple-800 font-medium'>
                    Ver logs →
                  </button>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className='mt-8 border-t border-gray-200 pt-6'>
                <h3 className='text-sm font-medium text-gray-900 mb-4'>
                  Estado del Sistema
                </h3>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600'>✓</div>
                    <div className='text-xs text-gray-600 mt-1'>
                      Base de Datos
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600'>✓</div>
                    <div className='text-xs text-gray-600 mt-1'>API Server</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600'>✓</div>
                    <div className='text-xs text-gray-600 mt-1'>
                      File Storage
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-yellow-600'>⚠</div>
                    <div className='text-xs text-gray-600 mt-1'>
                      Email Service
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateForm && (
        <CreateCompanyForm
          isOpen={showCreateForm}
          onClose={closeModals}
          onSuccess={handleCompanyCreated}
        />
      )}

      {showEditForm && selectedCompany && (
        <EditCompanyForm
          isOpen={showEditForm}
          company={selectedCompany}
          onClose={closeModals}
          onSuccess={handleCompanyUpdated}
        />
      )}

      {showDetailsModal && selectedCompany && (
        <CompanyDetailsModal
          isOpen={showDetailsModal}
          company={selectedCompany}
          onClose={closeModals}
          onEdit={() => {
            setShowDetailsModal(false)
            setShowEditForm(true)
          }}
        />
      )}
    </div>
  )
}
