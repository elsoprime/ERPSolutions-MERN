/**
 * User List Preview Component
 * @description: Vista previa compacta de usuarios para dashboard
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React from 'react'
import Link from 'next/link'
import {
  StatusBadge,
  RoleBadge,
  MultiRoleBadge
} from '@/components/UI/MultiCompanyBadges'
import {
  IEnhancedUser,
  UserRole,
  UserStatus
} from '@/interfaces/EnhanchedCompany/MultiCompany'
import {UserIcon, ArrowRightIcon, UsersIcon} from '@heroicons/react/24/outline'

interface UserListPreviewProps {
  users: IEnhancedUser[]
  title?: string
  maxUsers?: number
  showViewAll?: boolean
  viewAllLink?: string
  isLoading?: boolean
  emptyMessage?: string
  companyScope?: boolean
}

export const UserListPreview: React.FC<UserListPreviewProps> = ({
  users,
  title = 'Usuarios Recientes',
  maxUsers = 5,
  showViewAll = true,
  viewAllLink = '/dashboard/users',
  isLoading = false,
  emptyMessage = 'No hay usuarios para mostrar',
  companyScope = false
}) => {
  const displayUsers = users.slice(0, maxUsers)

  const getMainRole = (user: IEnhancedUser): UserRole => {
    if (companyScope && user.roles.length > 0) {
      return user.roles[0].role
    }

    const globalRole = user.roles.find(role => role.roleType === 'global')
    if (globalRole) return globalRole.role

    const roleHierarchy = [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE,
      UserRole.VIEWER
    ]

    for (const hierarchyRole of roleHierarchy) {
      if (user.roles.some(role => role.role === hierarchyRole)) {
        return hierarchyRole
      }
    }

    return UserRole.VIEWER
  }

  const getAllRoles = (user: IEnhancedUser): UserRole[] => {
    return user.roles.map(role => role.role)
  }

  const hasMultipleRoles = (user: IEnhancedUser): boolean => {
    return user.roles.length > 1
  }

  if (isLoading) {
    return (
      <div className='bg-white shadow rounded-lg border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
        </div>
        <div className='p-8 flex items-center justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white shadow rounded-lg border border-gray-200'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <UsersIcon className='h-5 w-5 text-gray-400' />
          <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
          {users.length > 0 && (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
              {users.length}
            </span>
          )}
        </div>

        {showViewAll && users.length > 0 && (
          <Link
            href={viewAllLink}
            className='inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors'
          >
            Ver todos
            <ArrowRightIcon className='ml-1 h-4 w-4' />
          </Link>
        )}
      </div>

      {/* Lista de usuarios */}
      <div className='divide-y divide-gray-200'>
        {displayUsers.length === 0 ? (
          <div className='px-6 py-12 text-center'>
            <UserIcon className='mx-auto h-12 w-12 text-gray-400' />
            <p className='mt-2 text-sm text-gray-500'>{emptyMessage}</p>
            {showViewAll && (
              <Link
                href={viewAllLink}
                className='mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
              >
                Gestionar Usuarios
              </Link>
            )}
          </div>
        ) : (
          displayUsers.map(user => {
            const mainRole = getMainRole(user)
            const hasMultiple = hasMultipleRoles(user)
            const allRoles = getAllRoles(user)

            return (
              <Link
                key={user._id}
                href={`${viewAllLink}?userId=${user._id}`}
                className='block hover:bg-gray-50 transition-colors'
              >
                <div className='px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    {/* Info del usuario */}
                    <div className='flex items-center space-x-3 flex-1 min-w-0'>
                      {/* Avatar */}
                      <div className='flex-shrink-0'>
                        <div className='h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm'>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Datos */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-2'>
                          <p className='text-sm font-medium text-gray-900 truncate'>
                            {user.name}
                          </p>
                          <StatusBadge status={user.status} size='sm' />
                        </div>
                        <p className='text-xs text-gray-500 truncate'>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Rol */}
                    <div className='ml-4 flex-shrink-0'>
                      {hasMultiple ? (
                        <MultiRoleBadge
                          roles={allRoles}
                          size='sm'
                          maxVisible={2}
                        />
                      ) : (
                        <RoleBadge role={mainRole} size='sm' />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Footer con "Ver más" si hay más usuarios */}
      {showViewAll && users.length > maxUsers && (
        <div className='px-6 py-3 bg-gray-50 border-t border-gray-200'>
          <Link
            href={viewAllLink}
            className='text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center'
          >
            Ver {users.length - maxUsers} usuarios más
            <ArrowRightIcon className='ml-1 h-4 w-4' />
          </Link>
        </div>
      )}
    </div>
  )
}

export default UserListPreview
