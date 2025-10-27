/**
 * User Management Table Component
 * @description: Tabla para listar y gestionar usuarios con filtros y paginación
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useState} from 'react'
import {
  useUsers,
  useUserActions,
  useUserFilters
} from '@/hooks/useUserManagement'
import {useCompanies} from '@/hooks/useCompanyManagement'
import {
  StatusBadge,
  RoleBadge,
  MultiRoleBadge
} from '@/components/UI/MultiCompanyBadges'
import {UserForm, RoleAssignmentForm} from './UserForms'
import {
  IEnhancedUser,
  IEnhancedCompany,
  UserRole,
  UserStatus
} from '@/interfaces/MultiCompany'

interface UserTableProps {
  companyScope?: boolean
  showActions?: boolean
  maxHeight?: string
  onUserSelect?: (user: IEnhancedUser) => void
}

interface UserRowProps {
  user: IEnhancedUser
  companies: IEnhancedCompany[]
  onEdit: (user: IEnhancedUser) => void
  onDelete: (user: IEnhancedUser) => void
  onToggleStatus: (user: IEnhancedUser) => void
  onAssignRole: (user: IEnhancedUser) => void
  showActions: boolean
  companyScope: boolean
}

// ====== USER ROW COMPONENT ======
const UserRow: React.FC<UserRowProps> = ({
  user,
  companies,
  onEdit,
  onDelete,
  onToggleStatus,
  onAssignRole,
  showActions,
  companyScope
}) => {
  const getUserCompanies = () => {
    if (companyScope) return []

    return user.roles
      .filter(role => role.companyId)
      .map(role => {
        const company = companies.find(c => c._id === role.companyId)
        return company ? {...company, role: role.role} : null
      })
      .filter(Boolean) as (IEnhancedCompany & {role: UserRole})[]
  }

  const getMainRole = () => {
    // En scope de empresa, mostrar el rol de la empresa actual
    if (companyScope && user.roles.length > 0) {
      return user.roles[0].role
    }

    // Para super admin, mostrar el rol global
    const globalRole = user.roles.find(role => role.roleType === 'global')
    if (globalRole) return globalRole.role

    // Obtener el rol más alto
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

  const getAllRoles = () => {
    return user.roles.map(role => role.role)
  }

  const userCompanies = getUserCompanies()
  const mainRole = getMainRole()
  const hasMultipleRoles = user.roles.length > 1

  return (
    <tr className='hover:bg-gray-50 transition-colors'>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 h-10 w-10'>
            <div className='h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium'>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900'>{user.name}</div>
            <div className='text-sm text-gray-500'>{user.email}</div>
          </div>
        </div>
      </td>

      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex flex-col space-y-1'>
          {hasMultipleRoles ? (
            <MultiRoleBadge roles={getAllRoles()} size='sm' maxVisible={2} />
          ) : (
            <RoleBadge role={mainRole} size='sm' />
          )}
        </div>
      </td>

      <td className='px-6 py-4 whitespace-nowrap'>
        <StatusBadge status={user.status} size='sm' />
      </td>

      {!companyScope && (
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='text-sm text-gray-900'>
            {userCompanies.length === 0 ? (
              <span className='text-gray-500'>Sin empresas</span>
            ) : userCompanies.length === 1 ? (
              <div>
                <div className='font-medium'>{userCompanies[0].name}</div>
                <div className='text-xs text-gray-500'>
                  como {userCompanies[0].role.replace('_', ' ')}
                </div>
              </div>
            ) : (
              <div>
                <div className='font-medium'>{userCompanies[0].name}</div>
                <div className='text-xs text-gray-500'>
                  +{userCompanies.length - 1} más
                </div>
              </div>
            )}
          </div>
        </td>
      )}

      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='text-sm text-gray-900'>{user.phone || '-'}</div>
      </td>

      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
        {new Date(user.createdAt).toLocaleDateString('es-ES')}
      </td>

      {showActions && (
        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => onEdit(user)}
              className='text-blue-600 hover:text-blue-900 p-1 rounded'
              title='Editar usuario'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                />
              </svg>
            </button>

            <button
              onClick={() => onAssignRole(user)}
              className='text-purple-600 hover:text-purple-900 p-1 rounded'
              title='Asignar rol'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4'
                />
              </svg>
            </button>

            <button
              onClick={() => onToggleStatus(user)}
              className={`p-1 rounded ${
                user.status === UserStatus.ACTIVE
                  ? 'text-yellow-600 hover:text-yellow-900'
                  : 'text-green-600 hover:text-green-900'
              }`}
              title={
                user.status === UserStatus.ACTIVE ? 'Desactivar' : 'Activar'
              }
            >
              {user.status === UserStatus.ACTIVE ? (
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              ) : (
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V7a3 3 0 116 0v3M9 21h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z'
                  />
                </svg>
              )}
            </button>

            <button
              onClick={() => onDelete(user)}
              className='text-red-600 hover:text-red-900 p-1 rounded'
              title='Eliminar usuario'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
            </button>
          </div>
        </td>
      )}
    </tr>
  )
}

// ====== MAIN TABLE COMPONENT ======
export const UserTable: React.FC<UserTableProps> = ({
  companyScope = false,
  showActions = true,
  maxHeight = 'max-h-96',
  onUserSelect
}) => {
  const [selectedUser, setSelectedUser] = useState<IEnhancedUser | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [userFormMode, setUserFormMode] = useState<'create' | 'edit'>('create')

  // Hooks
  const {filters, updateFilter, clearFilters, setPage, setLimit} =
    useUserFilters()
  const {users, pagination, isLoading, refetch} = useUsers(
    filters,
    companyScope
  )
  const {companies} = useCompanies()
  const {
    handleUpdateUser,
    handleDeleteUser: deleteUser,
    handleToggleUserStatus,
    isLoading: actionsLoading
  } = useUserActions()

  // Handlers
  const handleCreateUser = () => {
    setSelectedUser(null)
    setUserFormMode('create')
    setShowUserForm(true)
  }

  const handleEditUser = (user: IEnhancedUser) => {
    setSelectedUser(user)
    setUserFormMode('edit')
    setShowUserForm(true)
  }

  const handleDeleteUser = async (user: IEnhancedUser) => {
    await deleteUser(user._id, user.name)
    refetch()
  }

  const handleToggleStatus = async (user: IEnhancedUser) => {
    await handleToggleUserStatus(user)
    refetch()
  }

  const handleAssignRole = (user: IEnhancedUser) => {
    setSelectedUser(user)
    setShowRoleForm(true)
  }

  const handleFormSuccess = () => {
    refetch()
    setShowUserForm(false)
    setShowRoleForm(false)
    setSelectedUser(null)
  }

  const handleRowClick = (user: IEnhancedUser) => {
    onUserSelect?.(user)
  }

  return (
    <div className='bg-white shadow-sm border rounded-lg'>
      {/* Header y filtros */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <h2 className='text-lg font-medium text-gray-900'>
              {companyScope ? 'Usuarios de la Empresa' : 'Gestión de Usuarios'}
            </h2>
            {pagination && (
              <span className='text-sm text-gray-500'>
                {pagination.total} usuarios
              </span>
            )}
          </div>

          {showActions && (
            <button
              onClick={handleCreateUser}
              className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
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
              {companyScope ? 'Invitar Usuario' : 'Crear Usuario'}
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className='mt-4 grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <input
              type='text'
              placeholder='Buscar por nombre o email...'
              value={filters.search || ''}
              onChange={e => updateFilter('search', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <select
              value={filters.role || ''}
              onChange={e => updateFilter('role', e.target.value || undefined)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Todos los roles</option>
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>
                  {role
                    .split('_')
                    .map(
                      word =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.status || ''}
              onChange={e =>
                updateFilter('status', e.target.value || undefined)
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Todos los estados</option>
              {Object.values(UserStatus).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className='flex space-x-2'>
            <button
              onClick={clearFilters}
              className='flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
            >
              Limpiar
            </button>
            <button
              onClick={() => refetch()}
              className='flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-700'
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className={`overflow-auto ${maxHeight}`}>
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
          </div>
        ) : users.length === 0 ? (
          <div className='text-center py-12'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a9 9 0 110-18 9 9 0 010 18z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No hay usuarios
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {filters.search || filters.role || filters.status
                ? 'No se encontraron usuarios con los filtros aplicados.'
                : 'Comienza creando tu primer usuario.'}
            </p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Usuario
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Rol
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Estado
                </th>
                {!companyScope && (
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Empresas
                  </th>
                )}
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Teléfono
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Creado
                </th>
                {showActions && (
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {users.map(user => (
                <UserRow
                  key={user._id}
                  user={user}
                  companies={companies}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onToggleStatus={handleToggleStatus}
                  onAssignRole={handleAssignRole}
                  showActions={showActions}
                  companyScope={companyScope}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className='px-6 py-4 border-t border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Mostrando{' '}
              <span className='font-medium'>
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              a{' '}
              <span className='font-medium'>
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              de <span className='font-medium'>{pagination.total}</span>{' '}
              resultados
            </div>

            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className='px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Anterior
              </button>

              <span className='text-sm text-gray-700'>
                Página {pagination.page} de {pagination.pages}
              </span>

              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className='px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <UserForm
        user={selectedUser || undefined}
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        onSuccess={handleFormSuccess}
        mode={userFormMode}
        companyScope={companyScope}
      />

      {selectedUser && (
        <RoleAssignmentForm
          userId={selectedUser._id}
          currentRoles={selectedUser.roles}
          isOpen={showRoleForm}
          onClose={() => setShowRoleForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default UserTable
