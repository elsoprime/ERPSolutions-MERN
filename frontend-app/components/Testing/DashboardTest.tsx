/**
 * Dashboard Test Component
 * @description: Componente de prueba para verificar la carga de datos del dashboard
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React from 'react'
import {useDashboard} from '@/hooks/useDashboard'

export const DashboardTest: React.FC = () => {
  const {companies, users, stats, isLoading, error, refreshAll} = useDashboard()

  if (isLoading) {
    return (
      <div className='p-6 bg-white rounded-lg shadow'>
        <h2 className='text-lg font-semibold mb-4'>
          🔄 Cargando datos del dashboard...
        </h2>
        <div className='animate-pulse space-y-4'>
          <div className='h-4 bg-gray-200 rounded w-3/4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          <div className='h-4 bg-gray-200 rounded w-5/6'></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6 bg-red-50 border border-red-200 rounded-lg'>
        <h2 className='text-lg font-semibold text-red-800 mb-2'>
          ❌ Error al cargar datos
        </h2>
        <p className='text-red-600 mb-4'>{error.message}</p>
        <button
          onClick={refreshAll}
          className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-lg font-semibold mb-4'>📊 Estado del Dashboard</h2>

        {/* Datos Raw */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-blue-50 p-4 rounded'>
            <h3 className='font-medium text-blue-900'>Empresas Cargadas</h3>
            <p className='text-2xl font-bold text-blue-600'>
              {companies.length}
            </p>
            <p className='text-sm text-blue-700'>
              {companies.length > 0 ? 'Datos disponibles ✅' : 'Sin datos ❌'}
            </p>
          </div>

          <div className='bg-green-50 p-4 rounded'>
            <h3 className='font-medium text-green-900'>Usuarios Cargados</h3>
            <p className='text-2xl font-bold text-green-600'>{users.length}</p>
            <p className='text-sm text-green-700'>
              {users.length > 0 ? 'Datos disponibles ✅' : 'Sin datos ❌'}
            </p>
          </div>

          <div className='bg-purple-50 p-4 rounded'>
            <h3 className='font-medium text-purple-900'>Estadísticas</h3>
            <p className='text-2xl font-bold text-purple-600'>
              {stats ? 'Calculadas ✅' : 'Pendientes ❌'}
            </p>
            <p className='text-sm text-purple-700'>
              {stats
                ? `${stats.totalCompanies} empresas procesadas`
                : 'Sin procesar'}
            </p>
          </div>
        </div>

        {/* Estadísticas Procesadas */}
        {stats && (
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='font-medium mb-3'>📈 Estadísticas Procesadas</h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='text-gray-600'>Total Empresas:</span>
                <span className='ml-2 font-semibold'>
                  {stats.totalCompanies}
                </span>
              </div>
              <div>
                <span className='text-gray-600'>Empresas Activas:</span>
                <span className='ml-2 font-semibold'>
                  {stats.activeCompanies}
                </span>
              </div>
              <div>
                <span className='text-gray-600'>Total Usuarios:</span>
                <span className='ml-2 font-semibold'>{stats.totalUsers}</span>
              </div>
              <div>
                <span className='text-gray-600'>Usuarios Activos:</span>
                <span className='ml-2 font-semibold'>{stats.activeUsers}</span>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Empresas */}
        {companies.length > 0 && (
          <div className='mt-6'>
            <h3 className='font-medium mb-3'>🏢 Empresas Cargadas</h3>
            <div className='space-y-2'>
              {companies.map(company => (
                <div
                  key={company._id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded'
                >
                  <div>
                    <span className='font-medium'>{company.name}</span>
                    <span className='ml-2 text-sm text-gray-600'>
                      ({company.plan})
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      company.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {company.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controles */}
        <div className='mt-6 flex gap-3'>
          <button
            onClick={refreshAll}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            🔄 Refrescar Datos
          </button>
          <button
            onClick={() =>
              console.log('Dashboard Data:', {companies, users, stats})
            }
            className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'
          >
            📝 Log a Consola
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardTest
