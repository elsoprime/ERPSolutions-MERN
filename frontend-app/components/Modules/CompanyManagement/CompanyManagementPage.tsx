/**
 * Company Management Page
 * @description: Página principal de gestión de empresas con tabs para diferentes funcionalidades
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {MultiCompanyAPI} from '@/api/MultiCompanyAPI'
import {ICompanyFilters} from '@/interfaces/MultiCompany'
import {LoadingSpinner} from '@/components/Shared/LoadingSpinner'
import ErrorMessage from '@/components/Shared/ErrorMessage'
import CompanyTable from './CompanyTable'
import CompanyOverviewDashboard from './CompanyOverviewDashboard'

type TabType = 'overview' | 'companies' | 'analytics'

export default function CompanyManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [filters, setFilters] = useState<ICompanyFilters>({})

  // Query para obtener empresas
  const {
    data: companiesData,
    isLoading: companiesLoading,
    error: companiesError,
    refetch: refetchCompanies
  } = useQuery({
    queryKey: ['companies', filters],
    queryFn: () => MultiCompanyAPI.getAllCompanies(filters)
  })

  const tabs = [
    {
      id: 'overview' as TabType,
      name: 'Resumen General',
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      )
    },
    {
      id: 'companies' as TabType,
      name: 'Lista de Empresas',
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
          />
        </svg>
      )
    },
    {
      id: 'analytics' as TabType,
      name: 'Analytics',
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      )
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CompanyOverviewDashboard />

      case 'companies':
        if (companiesLoading) return <LoadingSpinner />
        if (companiesError)
          return <ErrorMessage>Error al cargar empresas</ErrorMessage>

        return (
          <CompanyTable
            companies={companiesData?.data || []}
            totalItems={companiesData?.pagination?.total || 0}
            onRefresh={refetchCompanies}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )

      case 'analytics':
        return (
          <div className='bg-white shadow rounded-lg p-6'>
            <div className='text-center py-12'>
              <svg
                className='mx-auto h-12 w-12 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
              <h3 className='mt-2 text-sm font-medium text-gray-900'>
                Analytics de Empresas
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                Próximamente: Métricas avanzadas y reportes de empresas
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className='space-y-6'>
      {/* Navigation Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  )
}
