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
import {
  UserForm,
  RoleAssignmentForm,
  ChangePasswordForm
} from '../Forms/UserForms'
import ConfirmationDialog from '@/components/Shared/ConfirmationDialog'
import {
  IEnhancedUser,
  IEnhancedCompany,
  UserRole,
  UserStatus
} from '@/interfaces/EnhanchedCompany/MultiCompany'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  PencilIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

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
  onChangePassword: (user: IEnhancedUser) => void
  showActions: boolean
  companyScope: boolean
  isSelected: boolean
  onToggleSelect: () => void
}

// ====== USER ROW COMPONENT ======
const UserRow: React.FC<UserRowProps> = ({
  user,
  companies,
  onEdit,
  onDelete,
  onToggleStatus,
  onAssignRole,
  onChangePassword,
  showActions,
  companyScope,
  isSelected,
  onToggleSelect
}) => {
  const getUserCompanies = () => {
    if (companyScope) return []

    return user.roles
      .filter(role => role.companyId)
      .map(role => {
        // Si companyId es un objeto poblado (tiene name), usarlo directamente
        const companyId = role.companyId as any
        if (typeof companyId === 'object' && companyId.name) {
          return {
            _id: companyId._id || companyId.id,
            name: companyId.name,
            slug: companyId.slug,
            role: role.role
          } as IEnhancedCompany & {role: UserRole}
        }

        // Si es solo un ID string, buscar en la lista de companies
        const company = companies.find(c => c._id === companyId)
        return company ? {...company, role: role.role} : null
      })
      .filter(Boolean) as (IEnhancedCompany & {role: UserRole})[]
  }

  const hasGlobalRole = () => {
    return user.roles.some(role => role.roleType === 'global')
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
      <td className='px-3 sm:px-6 py-4 whitespace-nowrap'>
        <input
          type='checkbox'
          checked={isSelected}
          onChange={onToggleSelect}
          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
        />
      </td>
      <td className='px-3 sm:px-6 py-4'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10'>
            <div className='h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs sm:text-sm'>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className='ml-3 sm:ml-4 min-w-0 flex-1'>
            <div className='text-xs sm:text-sm font-medium text-gray-900 truncate'>
              {user.name}
            </div>
            <div className='text-xs text-gray-500 truncate'>{user.email}</div>
            {/* Info adicional visible solo en mobile */}
            <div className='md:hidden mt-1 flex flex-wrap gap-1'>
              {hasMultipleRoles ? (
                <MultiRoleBadge
                  roles={getAllRoles()}
                  size='sm'
                  maxVisible={2}
                />
              ) : (
                <RoleBadge role={mainRole} size='sm' />
              )}
              <span className='lg:hidden'>
                <StatusBadge status={user.status} size='sm' />
              </span>
            </div>
            {/* Info de teléfono visible en mobile/tablet */}
            {user.phone && (
              <div className='lg:hidden mt-1 text-xs text-gray-500'>
                📞 {user.phone}
              </div>
            )}
            {/* Info de empresa visible en mobile cuando no es companyScope */}
            {!companyScope && (
              <div className='xl:hidden mt-1 text-xs text-gray-500'>
                {userCompanies.length === 0 ? (
                  hasGlobalRole() ? (
                    <span className='text-purple-600 font-medium'>
                      🌐 Acceso Global
                    </span>
                  ) : (
                    <span className='text-gray-400'>Sin empresas</span>
                  )
                ) : (
                  <span>
                    🏢 {userCompanies[0].name}
                    {userCompanies.length > 1 &&
                      ` +${userCompanies.length - 1}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className='hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap'>
        <div className='flex flex-col space-y-1'>
          {hasMultipleRoles ? (
            <MultiRoleBadge roles={getAllRoles()} size='sm' maxVisible={2} />
          ) : (
            <RoleBadge role={mainRole} size='sm' />
          )}
        </div>
      </td>

      <td className='hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap'>
        <StatusBadge status={user.status} size='sm' />
      </td>

      {!companyScope && (
        <td className='hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap'>
          <div className='text-sm text-gray-900'>
            {userCompanies.length === 0 ? (
              hasGlobalRole() ? (
                <div className='flex items-center space-x-1'>
                  <svg
                    className='w-4 h-4 text-purple-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span className='font-medium text-purple-600'>
                    Acceso Global
                  </span>
                </div>
              ) : (
                <span className='text-gray-500'>Sin empresas</span>
              )
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

      <td className='hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap'>
        <div className='text-sm text-gray-900'>{user.phone || '-'}</div>
      </td>

      <td className='hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
        {new Date(user.createdAt).toLocaleDateString('es-ES')}
      </td>

      {showActions && (
        <td className='px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
          <div className='flex items-center justify-end space-x-2'>
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
              className='hidden sm:inline-block text-purple-600 hover:text-purple-900 p-1 rounded'
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
              onClick={() => onChangePassword(user)}
              className='hidden sm:inline-block text-indigo-600 hover:text-indigo-900 p-1 rounded'
              title='Cambiar contraseña'
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
                  d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
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
              className='hidden sm:inline-block text-red-600 hover:text-red-900 p-1 rounded'
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
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false)
  const [userFormMode, setUserFormMode] = useState<'create' | 'edit'>('create')

  // Estados para selección múltiple
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState(5)

  // Estados para los diálogos de confirmación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showToggleStatusDialog, setShowToggleStatusDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<IEnhancedUser | null>(null)
  const [userToToggle, setUserToToggle] = useState<IEnhancedUser | null>(null)

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

  const handleDeleteUser = (user: IEnhancedUser) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    await deleteUser(userToDelete._id, userToDelete.name)
    setShowDeleteDialog(false)
    setUserToDelete(null)
    refetch()
  }

  const handleToggleStatus = (user: IEnhancedUser) => {
    setUserToToggle(user)
    setShowToggleStatusDialog(true)
  }

  const confirmToggleStatus = async () => {
    if (!userToToggle) return

    await handleToggleUserStatus(userToToggle)
    setShowToggleStatusDialog(false)
    setUserToToggle(null)
    refetch()
  }

  const handleAssignRole = (user: IEnhancedUser) => {
    setSelectedUser(user)
    setShowRoleForm(true)
  }

  const handleChangePassword = (user: IEnhancedUser) => {
    setSelectedUser(user)
    setShowChangePasswordForm(true)
  }

  const handleFormSuccess = () => {
    refetch()
    setShowUserForm(false)
    setShowRoleForm(false)
    setShowChangePasswordForm(false)
    setSelectedUser(null)
  }

  const handleRowClick = (user: IEnhancedUser) => {
    onUserSelect?.(user)
  }

  // Selección múltiple
  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleSelectAll = () => {
    if (!users?.length) return
    setSelectedUsers(
      selectedUsers.length === users.length ? [] : users.map(u => u._id)
    )
  }

  // Acciones masivas
  const handleBulkActivate = async () => {
    const selectedUsersData = users.filter(u => selectedUsers.includes(u._id))

    if (selectedUsersData.length === 0) return

    for (const user of selectedUsersData) {
      // Solo activar si está inactivo
      if (user.status !== UserStatus.ACTIVE) {
        await handleUpdateUser(user._id, {status: UserStatus.ACTIVE})
      }
    }
    setSelectedUsers([])
    refetch()
  }

  const handleBulkDeactivate = async () => {
    const selectedUsersData = users.filter(u => selectedUsers.includes(u._id))

    if (selectedUsersData.length === 0) return

    for (const user of selectedUsersData) {
      // Solo desactivar si está activo
      if (user.status === UserStatus.ACTIVE) {
        await handleUpdateUser(user._id, {status: UserStatus.INACTIVE})
      }
    }
    setSelectedUsers([])
    refetch()
  }

  const handleBulkDelete = async () => {
    const selectedUsersData = users.filter(u => selectedUsers.includes(u._id))
    for (const user of selectedUsersData) {
      // No permitir eliminar super admins
      if (user.roles.some(r => r.role === UserRole.SUPER_ADMIN)) continue
      await deleteUser(user._id, user.name)
    }
    setSelectedUsers([])
    refetch()
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setLimit(newSize)
    setPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key as any, value || undefined)
    setPage(1)
  }

  const clearAllFilters = () => {
    clearFilters()
    setSearchTerm('')
  }

  return (
    <div className='bg-white shadow-sm rounded-lg'>
      {/* Header */}
      <div className='p-4 sm:p-6 border-b border-gray-200'>
        {/* Título y estadísticas */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
          <div>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
              {companyScope ? 'Usuarios de la Empresa' : 'Gestión de Usuarios'}
            </h2>
            <p className='mt-1 text-xs sm:text-sm text-gray-500'>
              {isLoading
                ? 'Cargando...'
                : `${pagination?.total || 0} usuarios • ${pageSize}/página`}
            </p>
          </div>

          {/* Indicador de selección */}
          {selectedUsers.length > 0 && (
            <div className='text-sm text-blue-600 font-medium'>
              {selectedUsers.length} usuario(s) seleccionado(s)
            </div>
          )}
        </div>

        {/* Controles - Layout responsive mejorado */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
          {/* Grupo izquierdo: Selector de página */}
          <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
            {/* Selector de registros por página */}
            <div className='flex items-center gap-2 flex-shrink-0'>
              <label className='text-xs sm:text-sm text-gray-600 whitespace-nowrap'>
                Mostrar:
              </label>
              <select
                value={pageSize}
                onChange={e => handlePageSizeChange(Number(e.target.value))}
                className='px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[70px]'
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className='text-xs sm:text-sm text-gray-600 whitespace-nowrap hidden sm:inline'>
                por página
              </span>
            </div>
          </div>

          {/* Grupo derecho: Acciones múltiples y controles secundarios */}
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0'>
            {/* Acciones múltiples (solo aparecen cuando hay usuarios seleccionados) */}
            {selectedUsers.length > 0 && (
              <div className='flex gap-2 flex-wrap'>
                <button
                  onClick={handleBulkActivate}
                  className='inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border border-green-300 rounded-md text-xs sm:text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors'
                  title='Activar usuarios seleccionados'
                >
                  <PlayIcon className='w-4 h-4 sm:mr-2' />
                  <span className='hidden sm:inline'>Activar</span>
                </button>

                <button
                  onClick={handleBulkDeactivate}
                  className='inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border border-yellow-300 rounded-md text-xs sm:text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors'
                  title='Desactivar usuarios seleccionados'
                >
                  <PauseIcon className='w-4 h-4 sm:mr-2' />
                  <span className='hidden sm:inline'>Desactivar</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className='inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border border-red-300 rounded-md text-xs sm:text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors'
                  title='Eliminar usuarios seleccionados'
                >
                  <TrashIcon className='w-4 h-4 sm:mr-2' />
                  <span className='hidden sm:inline'>Eliminar</span>
                </button>
              </div>
            )}

            {/* Botones de filtros */}
            <div className='flex gap-2'>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  showFilters
                    ? 'border-blue-300 text-blue-700 bg-blue-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className='w-4 h-4 sm:mr-2' />
                <span className='hidden sm:inline'>Filtros</span>
              </button>
            </div>

            {/* Botón Nuevo Usuario */}
            {showActions && (
              <div className='flex gap-2'>
                <button
                  onClick={handleCreateUser}
                  className='inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto'
                >
                  <PlusIcon className='w-4 h-4 mr-2' />
                  {companyScope ? 'Invitar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className='mt-4'>
          <div className='relative'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar por nombre, email...'
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                updateFilter('search', e.target.value)
              }}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className='mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg'>
            <div
              className={`grid grid-cols-1 ${
                companyScope
                  ? 'sm:grid-cols-2 lg:grid-cols-3'
                  : 'sm:grid-cols-2 lg:grid-cols-4'
              } gap-3 sm:gap-4`}
            >
              {!companyScope && (
                <div>
                  <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                    Empresa
                  </label>
                  <select
                    value={filters.companyId || ''}
                    onChange={e =>
                      handleFilterChange('companyId', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value=''>Todas las empresas</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  Rol
                </label>
                <select
                  value={filters.role || ''}
                  onChange={e => handleFilterChange('role', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todos los roles</option>
                  <option value={UserRole.SUPER_ADMIN}>
                    Super Administrador
                  </option>
                  <option value={UserRole.ADMIN_EMPRESA}>Admin Empresa</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.EMPLOYEE}>Empleado</option>
                  <option value={UserRole.VIEWER}>Visor</option>
                </select>
              </div>

              <div>
                <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  Estado
                </label>
                <select
                  value={filters.status || ''}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todos los estados</option>
                  <option value={UserStatus.ACTIVE}>Activo</option>
                  <option value={UserStatus.INACTIVE}>Inactivo</option>
                </select>
              </div>

              <div
                className={`flex items-end ${
                  companyScope
                    ? 'sm:col-span-2 lg:col-span-1'
                    : 'sm:col-span-2 lg:col-span-1'
                }`}
              >
                <button
                  onClick={clearAllFilters}
                  className='w-full px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className='overflow-x-auto -mx-3 sm:mx-0'>
        <div className='inline-block min-w-full align-middle'>
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
                  <th className='px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    <input
                      type='checkbox'
                      checked={
                        users?.length > 0 &&
                        selectedUsers.length === users.length
                      }
                      onChange={toggleSelectAll}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </th>
                  <th className='px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Usuario
                  </th>
                  <th className='hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Rol
                  </th>
                  <th className='hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Estado
                  </th>
                  {!companyScope && (
                    <th className='hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Empresas
                    </th>
                  )}
                  <th className='hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Teléfono
                  </th>
                  <th className='hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Creado
                  </th>
                  {showActions && (
                    <th className='px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
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
                    onChangePassword={handleChangePassword}
                    showActions={showActions}
                    companyScope={companyScope}
                    isSelected={selectedUsers.includes(user._id)}
                    onToggleSelect={() => toggleSelectUser(user._id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Paginación mejorada */}
      {pagination && pagination.total > 0 && (
        <div className='bg-white px-3 sm:px-4 md:px-6 py-3 border-t border-gray-200'>
          {/* Vista móvil */}
          <div className='flex flex-col gap-3 sm:hidden'>
            <div className='flex items-center justify-between'>
              <button
                onClick={() => setPage(Math.max(pagination.page - 1, 1))}
                disabled={pagination.page === 1}
                className='flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <ChevronLeftIcon className='h-4 w-4 mr-1' />
                Anterior
              </button>

              <span className='px-4 text-xs text-gray-700 whitespace-nowrap'>
                {pagination.page} / {pagination.pages}
              </span>

              <button
                onClick={() =>
                  setPage(Math.min(pagination.page + 1, pagination.pages))
                }
                disabled={pagination.page === pagination.pages}
                className='flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Siguiente
                <ChevronRightIcon className='h-4 w-4 ml-1' />
              </button>
            </div>

            <div className='text-center'>
              <p className='text-xs text-gray-600'>
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                de {pagination.total}
              </p>
            </div>
          </div>

          {/* Vista desktop */}
          <div className='hidden sm:flex sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3 md:gap-4'>
              <p className='text-xs md:text-sm text-gray-700'>
                Mostrando{' '}
                <span className='font-medium'>
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                a{' '}
                <span className='font-medium'>
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{' '}
                de <span className='font-medium'>{pagination.total}</span>
              </p>

              {/* Información adicional sobre el tamaño de página */}
              <div className='hidden md:block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                {pageSize} por página
              </div>
            </div>

            <div>
              <nav
                className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                aria-label='Pagination'
              >
                <button
                  onClick={() => setPage(Math.max(pagination.page - 1, 1))}
                  disabled={pagination.page === 1}
                  className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ChevronLeftIcon className='h-5 w-5' />
                </button>

                {/* Números de página inteligentes */}
                {Array.from({length: Math.min(pagination.pages, 5)}, (_, i) => {
                  let page: number

                  if (pagination.pages <= 5) {
                    page = i + 1
                  } else if (pagination.page <= 3) {
                    page = i + 1
                  } else if (pagination.page >= pagination.pages - 2) {
                    page = pagination.pages - 4 + i
                  } else {
                    page = pagination.page - 2 + i
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setPage(page)}
                      className={`relative inline-flex items-center px-3 md:px-4 py-2 border text-xs md:text-sm font-medium ${
                        pagination.page === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                {/* Mostrar "..." y última página si hay muchas páginas */}
                {pagination.pages > 5 &&
                  pagination.page < pagination.pages - 2 && (
                    <>
                      <span className='relative inline-flex items-center px-3 md:px-4 py-2 border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-700'>
                        ...
                      </span>
                      <button
                        onClick={() => setPage(pagination.pages)}
                        className='relative inline-flex items-center px-3 md:px-4 py-2 border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50'
                      >
                        {pagination.pages}
                      </button>
                    </>
                  )}

                <button
                  onClick={() =>
                    setPage(Math.min(pagination.page + 1, pagination.pages))
                  }
                  disabled={pagination.page === pagination.pages}
                  className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ChevronRightIcon className='h-5 w-5' />
                </button>
              </nav>
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
        <>
          <RoleAssignmentForm
            userId={selectedUser._id}
            currentRoles={selectedUser.roles}
            isOpen={showRoleForm}
            onClose={() => setShowRoleForm(false)}
            onSuccess={handleFormSuccess}
          />

          <ChangePasswordForm
            userId={selectedUser._id}
            userName={selectedUser.name}
            isOpen={showChangePasswordForm}
            onClose={() => setShowChangePasswordForm(false)}
            onSuccess={handleFormSuccess}
          />
        </>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setUserToDelete(null)
        }}
        onConfirm={confirmDelete}
        title='Eliminar Usuario'
        message='¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'
        confirmText='Eliminar'
        action='delete'
        loading={actionsLoading}
        data={
          userToDelete
            ? {
                name: userToDelete.name,
                email: userToDelete.email,
                details: `Rol: ${userToDelete.roles[0]?.role || 'No asignado'}`
              }
            : undefined
        }
      />

      {/* Diálogo de confirmación para cambiar estado */}
      <ConfirmationDialog
        isOpen={showToggleStatusDialog}
        onClose={() => {
          setShowToggleStatusDialog(false)
          setUserToToggle(null)
        }}
        onConfirm={confirmToggleStatus}
        title={
          userToToggle?.status === UserStatus.ACTIVE
            ? 'Desactivar Usuario'
            : 'Activar Usuario'
        }
        message={
          userToToggle?.status === UserStatus.ACTIVE
            ? '¿Estás seguro de que deseas desactivar este usuario? No podrá acceder al sistema hasta que sea reactivado.'
            : '¿Estás seguro de que deseas activar este usuario? Tendrá acceso inmediato al sistema.'
        }
        confirmText={
          userToToggle?.status === UserStatus.ACTIVE ? 'Desactivar' : 'Activar'
        }
        action={
          userToToggle?.status === UserStatus.ACTIVE ? 'suspend' : 'reactivate'
        }
        loading={actionsLoading}
        data={
          userToToggle
            ? {
                name: userToToggle.name,
                email: userToToggle.email,
                details: `Estado actual: ${
                  userToToggle.status === UserStatus.ACTIVE
                    ? 'Activo'
                    : 'Inactivo'
                }`
              }
            : undefined
        }
      />
    </div>
  )
}

export default UserTable
