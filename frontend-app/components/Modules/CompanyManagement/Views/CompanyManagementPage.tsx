/**
 * Company Management Page
 * @description: Página principal para gestión de empresas por Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, { useState } from 'react'
import { IEnhancedCompany } from '@/interfaces/EnhanchedCompany/EnhancedCompany'
import CompaniesTable from '../UI/CompanyTable'
import CompanyDetailsModal from '../UI/CompanyDetailsModal'
import CompanyOverviewDashboard from './CompanyOverviewDashboard'
import PlanManagementModal from '@/components/Modules/Settings/PlanManagementModal'
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import DashboardHeader from '@/components/Layout/DashboardHeader'
import TabNavigation from '@/components/Shared/TabNavigation'
import SystemSettingsPanel from '../UI/SettingPanel'

export default function CompanyManagementPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPlanManagement, setShowPlanManagement] = useState(false)
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

  // Ver detalles de la empresa
  const handleViewCompany = (company: IEnhancedCompany) => {
    setSelectedCompany(company)
    setShowDetailsModal(true)
  }

  const closeModals = () => {
    setShowDetailsModal(false)
    setShowPlanManagement(false)
    setSelectedCompany(null)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}

      <DashboardHeader
        title='Gestión de Empresas'
        subtitle='Panel de administración de Empresas'
        description='Administración completa de las empresas registradas en el sistema'
      />
      {/* Tabs */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant='underline'
        size='md'
      />

      {/* Content */}
      <div className='py-4 sm:py-6 md:py-4'>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-lg shadow p-4 sm:p-6'>
              <h2 className='text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4'>
                Panel de Control Global
              </h2>
              <p className='text-sm lg:text-xs text-gray-600 mb-4 sm:mb-6'>
                Resumen ejecutivo de todas las empresas registradas en el
                sistema
              </p>
              <CompanyOverviewDashboard />
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className='space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
              {/* Tabla de Empresas - Maneja creación y edición inline */}
              <CompaniesTable
                onViewCompany={handleViewCompany}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SystemSettingsPanel
            onOpenPlanManagement={() => setShowPlanManagement(true)}
          />
        )}
      </div>


      {/* Modal de Detalles de Empresa */}
      {showDetailsModal && selectedCompany && (
        <CompanyDetailsModal
          isOpen={showDetailsModal}
          company={selectedCompany}
          onClose={closeModals}
        />
      )}

      {/* Modal de Gestión de Planes */}
      {showPlanManagement && (
        <PlanManagementModal
          isOpen={showPlanManagement}
          onClose={closeModals}
        />
      )}
    </div>
  )
}
