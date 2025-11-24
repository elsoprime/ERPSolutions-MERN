/**
 * Role-Based Navigation Component
 * @description: Componente de navegación inteligente basado en roles
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  getHighestRole,
  hasRouteAccess,
  getCompanyContext
} from '@/utils/roleRouting'
import { RoleBadge } from '@/components/UI/MultiCompanyBadges'
import { UserRole } from '@/interfaces/EnhanchedCompany/MultiCompany'
import { AuthLoadingState } from '@/components/Modules/Auth/States/AuthLoadingState'

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  requiredRoles: UserRole[]
  description?: string
}

const RoleBasedNavigation: React.FC = () => {
  const pathname = usePathname()
  const { getUserData, logout, isLoggingOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const userData = getUserData()
  const userRole = getHighestRole(userData)
  const companyContext = getCompanyContext(userData)

  // Definir elementos de navegación
  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/home',
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
            d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
          />
        </svg>
      ),
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
        UserRole.VIEWER
      ],
      description: 'Panel principal'
    },
    {
      name: 'Gestión de Usuarios',
      href: '/users',
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
            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a9 9 0 110-18 9 9 0 010 18z'
          />
        </svg>
      ),
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER
      ],
      description: 'Administrar usuarios y roles'
    },
    {
      name: 'Gestión de Empresas',
      href: '/companies',
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
            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0H3m0 0v-2a2 2 0 012-2h14a2 2 0 012 2v2'
          />
        </svg>
      ),
      requiredRoles: [UserRole.SUPER_ADMIN],
      description: 'Administrar empresas del sistema'
    },
    {
      name: 'Inventario',
      href: '/inventory',
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
            d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          />
        </svg>
      ),
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE
      ],
      description: 'Gestionar productos y stock'
    },
    {
      name: 'Ventas',
      href: '/sales',
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
            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
          />
        </svg>
      ),
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE
      ],
      description: 'Gestionar ventas y facturación'
    },
    {
      name: 'Compras',
      href: '/purchases',
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
            d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
          />
        </svg>
      ),
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE
      ],
      description: 'Gestionar compras y proveedores'
    },
    {
      name: 'Reportes',
      href: '/reports',
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
      ),
      requiredRoles: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
        UserRole.VIEWER
      ],
      description: 'Ver reportes y analytics'
    },
    {
      name: 'Configuraciones',
      href: '/settings',
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
      requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA],
      description: 'Configurar sistema y empresa'
    }
  ]

  // Filtrar elementos de navegación según permisos
  const availableItems = navigationItems.filter(
    item =>
      item.requiredRoles.includes(userRole) &&
      hasRouteAccess(userData, item.href)
  )

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className='bg-white shadow-sm border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          {/* Logo y Navegación Principal */}
          <div className='flex'>
            <div className='flex-shrink-0 flex items-center'>
              <Link href='/home' className='text-xl font-bold text-gray-900'>
                ERP Solutions
              </Link>
              {companyContext.currentCompanyId &&
                !companyContext.isGlobalUser && (
                  <span className='ml-2 text-sm text-gray-500'>• Empresa</span>
                )}
            </div>

            {/* Navegación Desktop */}
            <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
              {availableItems.map(item => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    title={item.description}
                  >
                    <span className='mr-2'>{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Información del Usuario */}
          <div className='hidden sm:ml-6 sm:flex sm:items-center space-x-4'>
            <div className='flex items-center space-x-3'>
              <RoleBadge role={userRole} size='sm' />
              <div className='text-sm'>
                <p className='text-gray-900 font-medium'>
                  {userData?.name || 'Usuario'}
                </p>
                <p className='text-gray-500'>{userData?.email || ''}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className='bg-gray-100 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              title={isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            >
              {isLoggingOut ? (
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-current' />
              ) : (
                <svg
                  className='h-5 w-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Botón menú móvil */}
          <div className='sm:hidden flex items-center'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
            >
              <svg
                className='h-6 w-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {isMobileMenuOpen && (
        <div className='sm:hidden'>
          <div className='pt-2 pb-3 space-y-1'>
            {availableItems.map(item => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className='flex items-center'>
                    <span className='mr-3'>{item.icon}</span>
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Usuario móvil */}
          <div className='pt-4 pb-3 border-t border-gray-200'>
            <div className='flex items-center px-4'>
              <div className='flex-1'>
                <div className='text-base font-medium text-gray-800'>
                  {userData?.name || 'Usuario'}
                </div>
                <div className='text-sm text-gray-500'>
                  {userData?.email || ''}
                </div>
                <div className='mt-1'>
                  <RoleBadge role={userRole} size='sm' />
                </div>
              </div>
            </div>
            <div className='mt-3 space-y-1'>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className='block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de logout */}
      {isLoggingOut && <AuthLoadingState type='logout' message='Cerrando sesión...' />}
    </nav>
  )
}

export default RoleBasedNavigation
