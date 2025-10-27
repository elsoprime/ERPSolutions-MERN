/**
 * Company Table Component
 * @description: Tabla para gestión de empresas con funcionalidades CRUD
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {MultiCompanyAPI} from '@/api/MultiCompanyAPI'
import {IEnhancedCompany, ICompanyFilters} from '@/interfaces/MultiCompany'
import {toast} from 'react-toastify'

interface CompanyTableProps {
  companies: IEnhancedCompany[]
  totalItems: number
  onRefresh: () => void
  filters: ICompanyFilters
  onFiltersChange: (filters: ICompanyFilters) => void
}

export default function CompanyTable({
  companies,
  totalItems,
  onRefresh,
  filters,
  onFiltersChange
}: CompanyTableProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const queryClient = useQueryClient()

  // Mutation para eliminar empresa (temporal - no existe en API)
  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      throw new Error('Función eliminar empresa no implementada en API')
    },
    onSuccess: () => {
      toast.success('Empresa eliminada exitosamente')
      queryClient.invalidateQueries({queryKey: ['companies']})
      onRefresh()
    },
    onError: () => {
      toast.error('Error al eliminar la empresa')
    }
  })

  // Mutation para suspender/activar empresa
  const toggleCompanyStatusMutation = useMutation({
    mutationFn: ({companyId, status}: {companyId: string; status: string}) =>
      MultiCompanyAPI.updateCompany(companyId, {status} as any),
    onSuccess: () => {
      toast.success('Estado de empresa actualizado')
      queryClient.invalidateQueries({queryKey: ['companies']})
      onRefresh()
    },
    onError: () => {
      toast.error('Error al actualizar el estado')
    }
  })

  const handleSelectAll = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([])
    } else {
      setSelectedCompanies(companies.map(c => c._id))
    }
  }

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  const handleDeleteCompany = (companyId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
      deleteCompanyMutation.mutate(companyId)
    }
  }

  const handleToggleStatus = (companyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    toggleCompanyStatusMutation.mutate({companyId, status: newStatus})
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
            Activa
          </span>
        )
      case 'setup':
        return (
          <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'>
            Configuración
          </span>
        )
      case 'suspended':
        return (
          <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'>
            Suspendida
          </span>
        )
      default:
        return (
          <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'>
            Desconocido
          </span>
        )
    }
  }

  return (
    <div className='bg-white shadow rounded-lg'>
      {/* Header con filtros */}
      <div className='px-4 py-5 sm:p-6 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>
              Gestión de Empresas
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Total: {totalItems} empresas
            </p>
          </div>

          <div className='flex space-x-3'>
            <button className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'>
              <svg
                className='-ml-1 mr-2 h-5 w-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              Nueva Empresa
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Buscar
            </label>
            <input
              type='text'
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
              placeholder='Nombre de empresa...'
              value={filters.search || ''}
              onChange={e =>
                onFiltersChange({...filters, search: e.target.value})
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Estado
            </label>
            <select
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
              value={filters.status || ''}
              onChange={e =>
                onFiltersChange({...filters, status: e.target.value as any})
              }
            >
              <option value=''>Todos los estados</option>
              <option value='active'>Activas</option>
              <option value='setup'>En configuración</option>
              <option value='suspended'>Suspendidas</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Plan
            </label>
            <select
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
              value={filters.plan || ''}
              onChange={e =>
                onFiltersChange({...filters, plan: e.target.value as any})
              }
            >
              <option value=''>Todos los planes</option>
              <option value='basic'>Básico</option>
              <option value='professional'>Profesional</option>
              <option value='enterprise'>Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th scope='col' className='relative w-12 px-6 sm:w-16 sm:px-8'>
                <input
                  type='checkbox'
                  className='absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500'
                  checked={
                    selectedCompanies.length === companies.length &&
                    companies.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Empresa
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Plan
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Estado
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Fecha Creación
              </th>
              <th scope='col' className='relative px-6 py-3'>
                <span className='sr-only'>Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {companies.map(company => (
              <tr
                key={company._id}
                className={
                  selectedCompanies.includes(company._id) ? 'bg-gray-50' : ''
                }
              >
                <td className='relative w-12 px-6 sm:w-16 sm:px-8'>
                  <input
                    type='checkbox'
                    className='absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500'
                    checked={selectedCompanies.includes(company._id)}
                    onChange={() => handleSelectCompany(company._id)}
                  />
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 h-10 w-10'>
                      <div className='h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center'>
                        <span className='text-sm font-medium text-emerald-800'>
                          {company.name?.charAt(0).toUpperCase() || 'E'}
                        </span>
                      </div>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {company.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {company.email || 'Sin email'}
                      </div>
                    </div>
                  </div>
                </td>

                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {company.plan || 'Sin plan'}
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  {getStatusBadge(company.status)}
                </td>

                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {company.createdAt
                    ? new Date(company.createdAt).toLocaleDateString()
                    : 'N/A'}
                </td>

                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() =>
                        handleToggleStatus(company._id, company.status)
                      }
                      className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded ${
                        company.status === 'active'
                          ? 'text-red-700 bg-red-100 hover:bg-red-200'
                          : 'text-green-700 bg-green-100 hover:bg-green-200'
                      }`}
                    >
                      {company.status === 'active' ? 'Suspender' : 'Activar'}
                    </button>

                    <button
                      onClick={() => handleDeleteCompany(company._id)}
                      className='inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200'
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {companies.length === 0 && (
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
              d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
            />
          </svg>
          <h3 className='mt-2 text-sm font-medium text-gray-900'>
            Sin empresas
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            Comienza creando tu primera empresa.
          </p>
        </div>
      )}
    </div>
  )
}
