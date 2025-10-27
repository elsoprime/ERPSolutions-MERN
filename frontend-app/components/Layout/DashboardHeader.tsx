/**
 * Dashboard Header Section Component
 * @description: Componente de cabecera para las páginas de dashboard
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React from 'react'
import {useAuth} from '@/hooks/useAuth'
import {getHighestRole, generateBreadcrumbs} from '@/utils/roleRouting'
import {usePathname} from 'next/navigation'
import Link from 'next/link'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  description?: string
  backgroundImage?: string
  showBreadcrumbs?: boolean
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  description,
  backgroundImage = 'bg-gradient-to-r from-blue-600 to-purple-600',
  showBreadcrumbs = true
}) => {
  const {getUserData} = useAuth()
  const pathname = usePathname()
  const userData = getUserData()
  const userRole = getHighestRole(userData)
  const breadcrumbs = generateBreadcrumbs(pathname, userData)

  return (
    <div className='relative mb-8'>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <nav className='flex mb-4' aria-label='Breadcrumb'>
          <ol role='list' className='flex items-center space-x-4'>
            {breadcrumbs.map((crumb, index) => (
              <li key={`breadcrumb-${crumb.href}-${index}`}>
                <div className='flex items-center'>
                  {index > 0 && (
                    <svg
                      className='flex-shrink-0 h-5 w-5 text-gray-400 mr-4'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      aria-hidden='true'
                    >
                      <path d='m5.555 17.776 4-16 .894.448-4 16-.894-.448z' />
                    </svg>
                  )}
                  {crumb.isActive ? (
                    <span className='text-sm font-medium text-gray-500 capitalize'>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className='text-sm font-medium text-gray-900 hover:text-gray-700 capitalize'
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Card */}
      <div className={`${backgroundImage} rounded-lg overflow-hidden`}>
        <div className='bg-white bg-opacity-90 backdrop-blur-sm'>
          <div className='px-6 py-8 sm:px-8 sm:py-12'>
            <div className='max-w-4xl mx-auto text-center'>
              <h1 className='text-3xl md:text-5xl font-black text-gray-800 mb-2'>
                {title}
              </h1>
              {subtitle && (
                <h2 className='text-lg md:text-xl font-semibold text-purple-600 mb-4'>
                  {subtitle}
                </h2>
              )}
              {description && (
                <p className='text-sm md:text-base text-gray-600 font-light max-w-2xl mx-auto'>
                  {description}
                </p>
              )}

              {/* Role Badge */}
              <div className='mt-6 flex justify-center'>
                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-gray-700 border border-gray-300'>
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  {userData?.name || 'Usuario'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
