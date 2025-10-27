/**
 * UserProfile Component
 * @description: Componente dropdown para mostrar información del usuario y opciones de configuración
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, {useState, useRef, useEffect} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  UserCircleIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BellIcon
} from '@heroicons/react/20/solid'
import {IUserProfile, IUserMenuOption} from '@/interfaces/IComponents'
import {useAuth} from '@/hooks/useAuth'

interface UserProfileProps {
  userProfile: IUserProfile
  userMenuOptions?: IUserMenuOption[]
  onUserMenuClick?: (option: IUserMenuOption) => void
}

const defaultUserMenuOptions: IUserMenuOption[] = [
  {
    id: 'profile',
    label: 'Mi Perfil',
    icon: <UserIcon className='w-4 h-4' />,
    href: '/profile'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: <CogIcon className='w-4 h-4' />,
    href: '/settings'
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    icon: <BellIcon className='w-4 h-4' />,
    href: '/notifications'
  },
  {
    id: 'divider',
    label: '',
    divider: true
  },
  {
    id: 'logout',
    label: 'Cerrar Sesión',
    icon: <ArrowRightOnRectangleIcon className='w-4 h-4' />
  }
]

export default function UserProfile({
  userProfile,
  userMenuOptions = defaultUserMenuOptions,
  onUserMenuClick
}: UserProfileProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {logout, isLoggingOut} = useAuth()

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOptionClick = async (option: IUserMenuOption) => {
    setIsDropdownOpen(false)

    // Manejar cerrar sesión de forma especial
    if (option.id === 'logout') {
      await logout()
      return
    }

    if (option.onClick) {
      option.onClick()
    } else if (onUserMenuClick) {
      onUserMenuClick(option)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  // Filtrar opciones del menú - mostrar todas por ahora
  const filteredMenuOptions = userMenuOptions

  console.log('UserProfile Rendering:', {
    userProfile,
    isAuthenticated: userProfile.isAuthenticated,
    name: userProfile.name
  })

  if (!userProfile.isAuthenticated) {
    return (
      <div className='flex items-center space-x-3 bg-yellow-100 px-3 py-2 rounded-lg'>
        <span className='text-yellow-800 text-sm'>No autenticado</span>
        <Link
          href='/'
          className='text-yellow-700 hover:text-yellow-900 text-sm font-medium underline'
        >
          Ir al Login
        </Link>
      </div>
    )
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className='flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200'
      >
        {/* Avatar */}
        <div className='flex-shrink-0'>
          {userProfile.avatar ? (
            <Image
              src={userProfile.avatar}
              alt={userProfile.name}
              width={32}
              height={32}
              className='rounded-full object-cover'
            />
          ) : (
            <div className='w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-medium'>
                {getInitials(userProfile.name)}
              </span>
            </div>
          )}
        </div>

        {/* User info - Hidden on mobile */}
        <div className='hidden md:block text-left'>
          <p className='text-sm font-medium text-gray-700'>
            {userProfile.name}
          </p>
          <p className='text-xs text-gray-500'>
            {userProfile.role || 'Usuario'}
          </p>
        </div>

        {/* Dropdown arrow */}
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className='absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
          {/* User info header - Visible on mobile */}
          <div className='md:hidden px-4 py-3 border-b border-gray-200'>
            <p className='text-sm font-medium text-gray-900'>
              {userProfile.name}
            </p>
            <p className='text-xs text-gray-500'>{userProfile.email}</p>
            <div className='mt-2'>
              <span className='text-xs text-purple-600'>
                {userProfile.role || 'Usuario'}
              </span>
            </div>
          </div>

          {/* Menu options */}
          <div className='py-2'>
            {filteredMenuOptions.map(option => {
              if (option.divider) {
                return (
                  <div
                    key={option.id}
                    className='border-t border-gray-200 my-2'
                  />
                )
              }

              if (option.href) {
                return (
                  <Link
                    key={option.id}
                    href={option.href}
                    className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200'
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {option.icon && <span className='mr-3'>{option.icon}</span>}
                    {option.label}
                  </Link>
                )
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  disabled={option.id === 'logout' && isLoggingOut}
                  className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                    option.id === 'logout' && isLoggingOut
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.icon && (
                    <span className='mr-3'>
                      {option.id === 'logout' && isLoggingOut ? (
                        <div className='w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin'></div>
                      ) : (
                        option.icon
                      )}
                    </span>
                  )}
                  {option.id === 'logout' && isLoggingOut
                    ? 'Cerrando sesión...'
                    : option.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
