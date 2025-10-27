/**
 * Company Overview Dashboard
 * @description: Dashboard resumen con métricas de empresas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React from 'react'
import {useQuery} from '@tanstack/react-query'
import {MultiCompanyAPI} from '@/api/MultiCompanyAPI'

export default function CompanyOverviewDashboard() {
  const {data: companiesData, isLoading: companiesLoading} = useQuery({
    queryKey: ['companies-overview'],
    queryFn: () => MultiCompanyAPI.getAllCompanies({})
  })

  const stats = [
    {
      name: 'Total Empresas',
      value: companiesData?.data?.length || 0,
      icon: (
        <svg
          className='w-6 h-6'
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
      ),
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      name: 'Empresas Activas',
      value:
        companiesData?.data?.filter(
          (company: any) => company.status === 'active'
        ).length || 0,
      icon: (
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      ),
      color: 'text-green-600 bg-green-100'
    },
    {
      name: 'En Configuración',
      value:
        companiesData?.data?.filter(
          (company: any) => company.status === 'setup'
        ).length || 0,
      icon: (
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
        </svg>
      ),
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      name: 'Suspendidas',
      value:
        companiesData?.data?.filter(
          (company: any) => company.status === 'suspended'
        ).length || 0,
      icon: (
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728'
          />
        </svg>
      ),
      color: 'text-red-600 bg-red-100'
    }
  ]

  if (companiesLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='animate-pulse'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='h-8 w-8 bg-gray-300 rounded'></div>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                    <div className='h-6 bg-gray-300 rounded w-1/2 mt-2'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map(stat => (
          <div
            key={stat.name}
            className='bg-white overflow-hidden shadow rounded-lg'
          >
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className={`p-2 rounded-md ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>
                      {stat.name}
                    </dt>
                    <dd className='text-3xl font-semibold text-gray-900'>
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Companies */}
      <div className='bg-white shadow rounded-lg'>
        <div className='px-4 py-5 sm:p-6'>
          <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
            Empresas Recientes
          </h3>

          {companiesData?.data?.slice(0, 5).map((company: any) => (
            <div
              key={company._id}
              className='flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0'
            >
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
                    {company.industry || 'Sin especificar'}
                  </div>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : company.status === 'setup'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {company.status === 'active'
                    ? 'Activa'
                    : company.status === 'setup'
                    ? 'Configuración'
                    : 'Suspendida'}
                </span>
              </div>
            </div>
          ))}

          {(!companiesData?.data || companiesData.data.length === 0) && (
            <div className='text-center py-6'>
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
      </div>
    </div>
  )
}
