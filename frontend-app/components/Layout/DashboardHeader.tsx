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
import {UserIcon} from '@heroicons/react/24/solid'
import {
  SlashIcon,
  HomeIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  UsersIcon,
  EyeIcon,
  CubeIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  CommandLineIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  FolderIcon
} from '@heroicons/react/24/outline'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  description?: string
  backgroundColor?: string
  backgroundImageUrl?: string
  showBreadcrumbs?: boolean
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  description,
  backgroundColor = 'bg-gradient-to-tl from-slate-200/20 to-blue-200/50',
  backgroundImageUrl,
  showBreadcrumbs = true
}) => {
  const {getUserData} = useAuth()
  const pathname = usePathname()
  const userData = getUserData()
  const breadcrumbs = generateBreadcrumbs(pathname, userData)

  // Mapeo de iconos
  const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
    HomeIcon,
    ChartPieIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    BuildingOffice2Icon,
    UserGroupIcon,
    UsersIcon,
    UserIcon,
    EyeIcon,
    CubeIcon,
    ShoppingCartIcon,
    ShoppingBagIcon,
    DocumentChartBarIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    CommandLineIcon,
    ChartBarIcon,
    BuildingStorefrontIcon,
    FolderIcon
  }

  const getIcon = (iconName?: string) => {
    if (!iconName) return null
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent className='h-4 w-4' /> : null
  }

  return (
    <div className='relative mb-4'>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <nav className='flex mb-4' aria-label='Breadcrumb'>
          <ol role='list' className='flex items-center space-x-4'>
            {breadcrumbs.map((crumb, index) => (
              <li key={`breadcrumb-${crumb.href}-${index}`}>
                <div className='flex items-center'>
                  {index > 0 && (
                    <SlashIcon
                      className='h-5 w-5 text-gray-400 mx-2'
                      aria-hidden='true'
                    />
                  )}
                  {crumb.isActive ? (
                    <span className='text-sm font-medium text-gray-500 capitalize flex items-center gap-2'>
                      {getIcon(crumb.icon)}
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className='text-sm font-medium text-gray-900 hover:text-gray-700 capitalize flex items-center gap-2 transition-colors'
                    >
                      {getIcon(crumb.icon)}
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
      <div
        className={`${backgroundColor} rounded-lg overflow-hidden shadow-md`}
      >
        <div className='relative overflow-hidden'>
          {/** Title section */}
          <div className='px-4 py-6 sm:px-6 lg:px-2 flex flex-col md:flex-row justify-between gap-4 items-start'>
            <div className='p-4 rounded-lg'>
              <h1 className='text-3xl md:text-5xl font-roboto-bold font-black text-gray-800 mb-2'>
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
            </div>

            {/* Role Badge */}
            <div className='p-4 flex items-center justify-items-stretch'>
              <span className='inline-flex items-center px-6 py-2 rounded-xl text-sm font-normal bg-white bg-opacity-90 text-gray-500 border border-gray-300 shadow-sm min-w-[200px]'>
                <UserIcon className='h-5 w-5 mr-2 text-gray-600' />
                {userData?.name || 'Usuario'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
