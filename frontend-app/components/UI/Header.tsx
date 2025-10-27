/**
 * Header Component
 * @description: This component is responsible for rendering the header of the application.
 * It includes the logo, navigation links, and user profile information.
 * @author: Esteban Soto Ojeda @elsoprimeDev
 *  */

'use client'
import React, {useEffect, useState} from 'react'
import Logo from '@/components/Shared/Logo'
import UserProfile from './UserProfile'
import MobileMenu from './MobileMenu'
import {MenuItems} from '@/data/Menu'
import {IUserProfile, IMenu} from '@/interfaces/IComponents'
import {getUserData} from '@/api/AuthAPI'

import {
  createDemoUserFromToken,
  testCurrentToken
} from '@/utils/testTokenDecoding'
import {UserRole} from '../../types/roles'

interface HeaderProps {
  userProfile?: IUserProfile
  onMenuItemClick?: (item: IMenu) => void
  onUserMenuClick?: (option: any) => void
}

export default function Header({
  userProfile,
  onMenuItemClick,
  onUserMenuClick
}: HeaderProps) {
  // Usar datos estáticos como fallback para asegurar que siempre se muestre algo
  const fallbackProfile: IUserProfile = {
    id: 'user-demo',
    name: 'Usuario Demo',
    email: 'demo@empresa.com',
    role: 'admin' as UserRole,
    isAuthenticated: true
  }

  const [currentUserProfile, setCurrentUserProfile] =
    useState<IUserProfile>(fallbackProfile)
  const [isLoading, setIsLoading] = useState(false) // Cambiar a false para mostrar inmediatamente

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Test del token actual para debugging
        console.log('=== DEBUGGING TOKEN CURRENT ===')
        testCurrentToken()

        const localUserData = getUserData()
        console.log('Header - Datos del localStorage:', localUserData)

        if (localUserData && localUserData.email) {
          console.log('Header - Usando datos reales del localStorage')

          // Validar que el role sea un UserRole válido
          const validRoles: UserRole[] = [
            'super_admin',
            'admin',
            'manager',
            'employee',
            'viewer'
          ]
          const userRole =
            localUserData.role &&
            validRoles.includes(localUserData.role as UserRole)
              ? (localUserData.role as UserRole)
              : ('viewer' as UserRole)

          setCurrentUserProfile({
            id: localUserData.id || 'user-unknown',
            name: localUserData.name || localUserData.email || 'Usuario',
            email: localUserData.email || '',
            role: userRole,
            isAuthenticated: true,
            avatar: localUserData.avatar,
            company: localUserData.company,
            lastLogin: localUserData.lastLogin
              ? new Date(localUserData.lastLogin)
              : new Date()
          })
        } else {
          console.log(
            'Header - No hay datos en localStorage, creando desde token...'
          )

          // Usar la función mejorada para crear datos del usuario
          const userFromToken = createDemoUserFromToken()
          console.log('Header - Datos creados desde token:', userFromToken)

          setCurrentUserProfile(userFromToken)
        }
      } catch (error) {
        console.error('Error al cargar perfil de usuario:', error)
        // Mantener el perfil fallback si hay error
      }
    }

    loadUserProfile()
  }, [])

  // Usar el perfil pasado como prop, el cargado del estado, o el fallback
  const profileToUse = userProfile || currentUserProfile

  return (
    <header className='py-4 px-6 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200 '>
      <div className='flex items-center justify-between xl:justify-end mx-auto'>
        <Logo width={80} height={40} className='xl:hidden' />

        {/* Right side - User Profile & Mobile Menu */}
        <div className='flex items-center space-x-4'>
          <UserProfile
            userProfile={profileToUse}
            onUserMenuClick={onUserMenuClick}
          />

          <MobileMenu menuItems={MenuItems} onMenuItemClick={onMenuItemClick} />
        </div>
      </div>
    </header>
  )
}
