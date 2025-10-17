/**
 * Header Component
 * @description: This component is responsible for rendering the header of the application.
 * It includes the logo, navigation links, and user profile information.
 * @author: Esteban Soto Ojeda @elsoprimeDev
 *  */

'use client'
import React from 'react'
import Logo from '@/components/Shared/Logo'
import HeaderNavigation from './HeaderNavigation'
import UserProfile from './UserProfile'
import MobileMenu from './MobileMenu'
import { MenuItems } from '@/data/Menu'
import { IUserProfile, IMenu } from '@/interfaces/IComponents'

// Datos de ejemplo para el usuario - en producción esto vendría de un contexto o API
const mockUserProfile: IUserProfile = {
    id: 'user-123',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    role: 'Administrador',
    isAuthenticated: true,
    avatar: undefined // Puedes agregar una imagen aquí
}

interface HeaderProps {
    userProfile?: IUserProfile
    onMenuItemClick?: (item: IMenu) => void
    onUserMenuClick?: (option: any) => void
}

export default function Header({
    userProfile = mockUserProfile,
    onMenuItemClick,
    onUserMenuClick
}: HeaderProps) {

    return (
        <header className='py-4 px-6 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200 '>
            <div className='flex items-center justify-end mx-auto'>

                {/* Right side - User Profile & Mobile Menu */}
                <div className='flex items-center space-x-4'>
                    <UserProfile
                        userProfile={userProfile}
                        onUserMenuClick={onUserMenuClick}
                    />

                    <MobileMenu
                        menuItems={MenuItems}
                        onMenuItemClick={onMenuItemClick}
                    />
                </div>
            </div>
        </header>
    )
}