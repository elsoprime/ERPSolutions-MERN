/**
 * User Management Table Component
 * @description: Tabla para listar y gestionar usuarios con filtros y paginación
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  useUsers,
  useUserActions,
  useUserFilters
} from '@/hooks/useUserManagement'
import { useActiveCompanies } from '@/hooks/CompanyManagement/useCompanyManagement'
import { getUserData } from '@/api/AuthAPI'
import {
  StatusBadge,
  RoleBadge,
  MultiRoleBadge
} from '@/components/UI/MultiCompanyBadges'
import UserFormInline from '../Forms/UserFormInline'
import { RoleAssignmentForm } from '../Forms/RoleAssigmentForm'
import { ChangePasswordForm } from '../Forms/UserForms'
import ConfirmationDialog from '@/components/Shared/ConfirmationDialog'
import { TableControlsHeader } from '@/components/Shared/Table'
import {
  IEnhancedUser,
  IEnhancedCompany,
  UserRole,
  UserStatus
} from '@/interfaces/EnhanchedCompany/MultiCompany'
import {
  PlusIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  PencilSquareIcon,
  AdjustmentsHorizontalIcon,
  KeyIcon,
  GlobeAltIcon
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
  onDelete?: (user: IEnhancedUser) => void
  onSuspend: (user: IEnhancedUser) => void
  onReactivate: (user: IEnhancedUser) => void
  onAssignRole: (user: IEnhancedUser) => void
  onChangePassword: (user: IEnhancedUser) => void
  showActions: boolean
  companyScope: boolean
  isSelected: boolean
  onToggleSelect: () => void
  disableSelection?: boolean
  canAssignRoles?: boolean // 🔒 NUEVO: Indica si el usuario actual puede asignar roles
}

// ====== USER ROW COMPONENT ======
const UserRow: React.FC<UserRowProps> = ({
  user,
  companies,
  onEdit,
  onDelete,
  onSuspend,
  onReactivate,
  onAssignRole,
  onChangePassword,
  showActions,
  companyScope,
  isSelected,
  onToggleSelect,
  disableSelection = false, // 🔒 Por defecto no deshabilitado
  canAssignRoles = true // 🔒 Por defecto puede asignar roles
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
          } as IEnhancedCompany & { role: UserRole }
        }

        // Si es solo un ID string, buscar en la lista de companies
        const company = companies.find(c => c._id === companyId)
        return company ? { ...company, role: role.role } : null
      })
      .filter(Boolean) as (IEnhancedCompany & { role: UserRole })[]
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
          disabled={disableSelection}
          className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${disableSelection
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
            }`}
          title={
            disableSelection
              ? 'Selección deshabilitada para usuarios inactivos'
              : 'Seleccionar usuario'
          }
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
                  <GlobeAltIcon className='w-4 h-4 text-purple-500' />
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
            {/* Si está INACTIVO, sin acciones */}
            {user.status === UserStatus.INACTIVE ? (
              <span className='text-gray-400'>Sin acciones</span>
            ) : user.status === UserStatus.SUSPENDED ? (
              <>
                <button
                  onClick={() => onEdit(user)}
                  className='text-blue-600 hover:text-blue-900 p-1 rounded'
                  title='Editar usuario'
                >
                  <PencilSquareIcon className='w-4 h-4' />
                </button>
                {canAssignRoles &&
                  !user.roles.some(r => r.role === UserRole.SUPER_ADMIN) &&
                  !user.roles.some(r => [UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.VIEWER].includes(r.role)) && (
                    <button
                      onClick={() => onAssignRole(user)}
                      className='hidden sm:inline-block text-purple-600 hover:text-purple-900 p-1 rounded'
                      title='Asignar rol'
                    >
                      <AdjustmentsHorizontalIcon className='w-4 h-4' />
                    </button>
                  )}
                {!user.roles.some(r => r.role === UserRole.SUPER_ADMIN) && (
                  <button
                    onClick={() => onChangePassword(user)}
                    className='hidden sm:inline-block text-indigo-600 hover:text-indigo-900 p-1 rounded'
                    title='Cambiar contraseña'
                  >
                    <KeyIcon className='w-4 h-4' />
                  </button>
                )}
                <button
                  onClick={() => onReactivate(user)}
                  className='p-1 rounded text-green-600 hover:text-green-900'
                  title='Reactivar usuario'
                >
                  <PlayCircleIcon className='w-4 h-4' />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onEdit(user)}
                  className='text-blue-600 hover:text-blue-900 p-1 rounded'
                  title='Editar usuario'
                >
                  <PencilSquareIcon className='w-4 h-4' />
                </button>
                {canAssignRoles &&
                  !user.roles.some(r => r.role === UserRole.SUPER_ADMIN) &&
                  !user.roles.some(r => [UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.VIEWER].includes(r.role)) && (
                    <button
                      onClick={() => onAssignRole(user)}
                      className='hidden sm:inline-block text-purple-600 hover:text-purple-900 p-1 rounded'
                      title='Asignar rol'
                    >
                      <AdjustmentsHorizontalIcon className='w-4 h-4' />
                    </button>
                  )}
                {!user.roles.some(r => r.role === UserRole.SUPER_ADMIN) && (
                  <button
                    onClick={() => onChangePassword(user)}
                    className='hidden sm:inline-block text-indigo-600 hover:text-indigo-900 p-1 rounded'
                    title='Cambiar contraseña'
                  >
                    <KeyIcon className='w-4 h-4' />
                  </button>
                )}

                {/* Ocultar botón suspender y eliminar para Super Admins */}

                {!user.roles.some(r => r.role === UserRole.SUPER_ADMIN) && (
                  <button
                    onClick={() => onSuspend(user)}
                    className='p-1 rounded text-yellow-600 hover:text-yellow-900'
                    title='Suspender usuario'
                  >
                    <PauseCircleIcon className='w-4 h-4' />
                  </button>
                )}

                {!user.roles.some(r => r.role === UserRole.SUPER_ADMIN) && (
                  <button
                    onClick={() => onDelete?.(user)}
                    className='hidden sm:inline-block text-red-600 hover:text-red-900 p-1 rounded'
                    title='Eliminar usuario'
                  >
                    <TrashIcon className='w-4 h-4' />
                  </button>
                )}
              </>
            )}
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
  // Estados para modales - Separados para evitar conflictos
  const [selectedUser, setSelectedUser] = useState<IEnhancedUser | null>(null)
  const [roleAssignmentUser, setRoleAssignmentUser] = useState<IEnhancedUser | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false)
  const [userFormMode, setUserFormMode] = useState<'create' | 'edit'>('create')

  // 🆕 Estado para controlar si se está creando un Usuario
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // 🆕 Estado para controlar si se está editando un usuario inline
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<IEnhancedUser | null>(null)

  // Estados para selección múltiple
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState(5)

  // 🔒 Estado para el rol del usuario actual
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null)
  const [currentUserCompanies, setCurrentUserCompanies] = useState<string[]>([])

  // Estados para los diálogos de confirmación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showReactivateDialog, setShowReactivateDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<IEnhancedUser | null>(null)
  const [userToSuspend, setUserToSuspend] = useState<IEnhancedUser | null>(null)
  const [userToReactivate, setUserToReactivate] = useState<IEnhancedUser | null>(null)

  // Hooks
  const { filters, updateFilter, clearFilters, setPage, setLimit } =
    useUserFilters()
  const { users, pagination, isLoading, refetch } = useUsers(
    filters,
    companyScope
  )
  const { companies } = useActiveCompanies()

  // 🔍 Detectar si se está filtrando usuarios inactivos (modo solo lectura)
  const isFilteringInactive = filters.status === UserStatus.INACTIVE

  // 🔒 Obtener el rol del usuario actual al montar el componente
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = getUserData()
        console.log('🔍 UserTable - userData:', userData)

        if (userData) {
          // Verificar si tiene el formato nuevo (con array de roles)
          if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
            console.log('✅ Formato nuevo detectado - usando userData.roles')
            const globalRole = userData.roles.find((r: any) => r.roleType === 'global')
            const roleToUse = globalRole || userData.roles[0]

            setCurrentUserRole(roleToUse.role)

            const companyIds = userData.roles
              .filter((r: any) => r.companyId)
              .map((r: any) => typeof r.companyId === 'object' ? r.companyId._id : r.companyId)
              .filter(Boolean)
            setCurrentUserCompanies(companyIds)
          }
          // Formato antiguo/simplificado (propiedades directas: role, roleType, companyId)
          else if (userData.role) {
            console.log('✅ Formato antiguo detectado - usando userData.role:', userData.role)
            setCurrentUserRole(userData.role as UserRole)

            // Si tiene companyId, agregarlo al array de empresas
            if (userData.companyId) {
              const companyId = typeof userData.companyId === 'object'
                ? (userData.companyId as any)._id || (userData.companyId as any).id
                : userData.companyId
              setCurrentUserCompanies([companyId])
            }

            // Si tiene array de companies (formato alternativo)
            if (userData.companies && Array.isArray(userData.companies)) {
              const companyIds = userData.companies
                .map((c: any) => typeof c === 'object' ? c._id || c.id : c)
                .filter(Boolean)
              setCurrentUserCompanies(companyIds)
            }
          }

          console.log('🔍 UserTable - rol configurado')
        } else {
          console.warn('⚠️ UserTable - No hay userData en localStorage')
        }
      } catch (error) {
        console.error('❌ Error al obtener usuario actual:', error)
      }
    }
    fetchCurrentUser()
  }, [])  // 🔒 Determinar si el usuario actual puede asignar roles
  // Si aún no ha cargado (null), permitir por defecto para evitar parpadeo
  const canAssignRoles = currentUserRole === null
    ? true // Mientras carga, mostrar el botón
    : [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA, UserRole.MANAGER].includes(currentUserRole)

  console.log('🔍 UserTable - canAssignRoles:', canAssignRoles, 'currentUserRole:', currentUserRole)

  // Acciones de usuario
  const {
    handleUpdateUser,
    handleSuspendUser,
    handleReactivateUser,
    handleDeleteUser: deleteUser,
    isLoading: actionsLoading
  } = useUserActions()

  // Handlers
  const handleCreateUser = () => {
    setIsCreatingUser(true)
  }

  // Editar usuario -> abrir formulario inline con datos precargados
  const handleEditUser = (user: IEnhancedUser) => {
    setEditingUserId(user._id)
    setEditingUser(user)
  }

  // Eliminar usuario -> abrir diálogo de confirmación
  const handleDeleteUser = (user: IEnhancedUser) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  // Suspender usuario -> abrir diálogo de confirmación
  const handleSuspendUserClick = (user: IEnhancedUser) => {
    setUserToSuspend(user)
    setShowSuspendDialog(true)
  }

  // Reactivar usuario -> abrir diálogo de confirmación
  const handleReactivateUserClick = (user: IEnhancedUser) => {
    setUserToReactivate(user)
    setShowReactivateDialog(true)
  }

  // Confirmar eliminación de usuario
  const confirmDelete = async () => {
    if (!userToDelete) return

    await deleteUser(userToDelete._id, userToDelete.name)
    setShowDeleteDialog(false)
    setUserToDelete(null)
    refetch()
  }

  // Confirmar suspensión de usuario
  const confirmSuspend = async () => {
    if (!userToSuspend) return

    await handleSuspendUser(userToSuspend._id)
    setShowSuspendDialog(false)
    setUserToSuspend(null)
    refetch()
  }

  // Confirmar reactivación de usuario
  const confirmReactivate = async () => {
    if (!userToReactivate) return

    await handleReactivateUser(userToReactivate._id)
    setShowReactivateDialog(false)
    setUserToReactivate(null)
    refetch()
  }

  // Asignar rol a usuario
  const handleAssignRole = (user: IEnhancedUser) => {
    setRoleAssignmentUser(user)
    setShowRoleForm(true)
  }

  // Cambiar contraseña
  const handleChangePassword = (user: IEnhancedUser) => {
    setSelectedUser(user)
    setShowChangePasswordForm(true)
  }

  // Después de crear/editar usuario o asignar rol
  const handleFormSuccess = () => {
    refetch()
    setShowUserForm(false)
    setShowRoleForm(false)
    setShowChangePasswordForm(false)
    setSelectedUser(null)
    setRoleAssignmentUser(null)
    setIsCreatingUser(false)
    setEditingUserId(null)
    setEditingUser(null)
  }

  // Filas de usuario
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
        await handleUpdateUser(user._id, { status: UserStatus.ACTIVE })
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
        await handleUpdateUser(user._id, { status: UserStatus.INACTIVE })
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

  // 🆕 Handlers para el formulario inline de creación
  const handleFormCancel = () => {
    setIsCreatingUser(false)
  }

  const handleCreateFormSuccess = () => {
    setIsCreatingUser(false)
    refetch()
  }

  // 🆕 Handlers para el formulario inline de edición
  const handleEditCancel = () => {
    setEditingUserId(null)
    setEditingUser(null)
  }

  const handleEditFormSuccess = () => {
    setEditingUserId(null)
    setEditingUser(null)
    refetch()
  }

  // 🆕 Si está creando un usuario, mostrar formulario inline
  if (isCreatingUser) {
    return (
      <UserFormInline
        onCancel={handleFormCancel}
        onSuccess={handleCreateFormSuccess}
        mode='create'
        companyScope={companyScope}
      />
    )
  }

  // 🆕 Si está editando un usuario, mostrar formulario inline
  if (editingUserId && editingUser) {
    return (
      <UserFormInline
        user={editingUser}
        onCancel={handleEditCancel}
        onSuccess={handleEditFormSuccess}
        mode='edit'
        companyScope={companyScope}
      />
    )
  }

  return (
    <div className='bg-white shadow-sm rounded-lg'>
      {/* Header */}
      <TableControlsHeader
        title={companyScope ? 'Usuarios de la Empresa' : 'Gestión de Usuarios'}
        subtitle={companyScope ? "Gestión de usuarios de la empresa" : "Administración completa de usuarios del sistema"}
        totalCount={pagination?.total || 0}
        pageSize={pageSize}
        selectedCount={selectedUsers.length}
        loading={isLoading}
        onPageSizeChange={handlePageSizeChange}
        searchPlaceholder="Buscar por nombre, email..."
        searchValue={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value)
          updateFilter('search', value)
        }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        filters={[
          {
            key: 'company',
            label: 'Empresa',
            type: 'select',
            value: filters.companyId || '',
            onChange: (v) => handleFilterChange('companyId', v),
            options: [
              { value: '', label: 'Todas las empresas' },
              ...companies.map(c => ({
                value: c._id,
                label: c.name
              }))
            ],
            hidden: companyScope
          },
          {
            key: 'role',
            label: 'Rol',
            type: 'select',
            value: filters.role || '',
            onChange: (v) => handleFilterChange('role', v),
            options: [
              { value: '', label: 'Todos los roles' },
              { value: UserRole.SUPER_ADMIN, label: 'Super Administrador' },
              { value: UserRole.ADMIN_EMPRESA, label: 'Admin Empresa' },
              { value: UserRole.MANAGER, label: 'Manager' },
              { value: UserRole.EMPLOYEE, label: 'Empleado' },
              { value: UserRole.VIEWER, label: 'Visor' }
            ]
          },
          {
            key: 'status',
            label: 'Estado',
            type: 'select',
            value: filters.status || '',
            onChange: (v) => handleFilterChange('status', v),
            options: [
              { value: '', label: 'Todos los estados' },
              { value: UserStatus.ACTIVE, label: 'Activo' },
              { value: UserStatus.INACTIVE, label: 'Inactivo' }
            ]
          }
        ]}
        onClearFilters={clearAllFilters}
        filterGridCols={companyScope ? 2 : 3}
        primaryAction={showActions ? {
          label: companyScope ? 'Invitar Usuario' : 'Crear Usuario',
          icon: PlusIcon,
          onClick: handleCreateUser
        } : undefined}
        bulkActions={[
          {
            label: 'Activar',
            icon: PlayIcon,
            onClick: handleBulkActivate,
            variant: 'success',
            showOnSelection: true,
            hidden: isFilteringInactive
          },
          {
            label: 'Desactivar',
            icon: PauseIcon,
            onClick: handleBulkDeactivate,
            variant: 'warning',
            showOnSelection: true,
            hidden: isFilteringInactive
          },
          {
            label: 'Eliminar',
            icon: TrashIcon,
            onClick: handleBulkDelete,
            variant: 'danger',
            showOnSelection: true,
            hidden: isFilteringInactive
          }
        ]}
        banner={isFilteringInactive ? {
          type: 'warning',
          title: 'Modo Solo Lectura',
          message: 'Mostrando usuarios inactivos. La selección múltiple y acciones masivas están deshabilitadas.',
          dismissible: true,
          onDismiss: () => {
            // Limpiar filtro de inactivos
            handleFilterChange('status', '')
          }
        } : undefined}
      />

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
                      disabled={isFilteringInactive}
                      className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${isFilteringInactive
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                        }`}
                      title={
                        isFilteringInactive
                          ? 'Selección deshabilitada para usuarios inactivos'
                          : 'Seleccionar todos'
                      }
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
                    onSuspend={handleSuspendUserClick}
                    onReactivate={handleReactivateUserClick}
                    onAssignRole={handleAssignRole}
                    onChangePassword={handleChangePassword}
                    showActions={showActions}
                    companyScope={companyScope}
                    isSelected={selectedUsers.includes(user._id)}
                    onToggleSelect={() => toggleSelectUser(user._id)}
                    disableSelection={isFilteringInactive}
                    canAssignRoles={canAssignRoles}
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
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
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
                      className={`relative inline-flex items-center px-3 md:px-4 py-2 border text-xs md:text-sm font-medium ${pagination.page === page
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

      {/* RoleAssignmentForm con estado separado */}
      {roleAssignmentUser && (
        <RoleAssignmentForm
          userId={roleAssignmentUser._id}
          currentRoles={roleAssignmentUser.roles}
          isOpen={showRoleForm}
          onClose={() => {
            setShowRoleForm(false)
            setRoleAssignmentUser(null)
          }}
          onSuccess={handleFormSuccess}
          currentUserRole={currentUserRole || undefined}
          currentUserCompanies={currentUserCompanies}
        />
      )}

      {/* ChangePasswordForm */}
      {selectedUser && (
        <ChangePasswordForm
          userId={selectedUser._id}
          userName={selectedUser.name}
          isOpen={showChangePasswordForm}
          onClose={() => setShowChangePasswordForm(false)}
          onSuccess={handleFormSuccess}
        />
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

      {/* Diálogo de confirmación para suspender */}
      <ConfirmationDialog
        isOpen={showSuspendDialog}
        onClose={() => {
          setShowSuspendDialog(false)
          setUserToSuspend(null)
        }}
        onConfirm={confirmSuspend}
        title='Suspender Usuario'
        message='¿Estás seguro de que deseas suspender este usuario? No podrá acceder al sistema hasta que sea reactivado.'
        confirmText='Suspender'
        action='suspend'
        loading={actionsLoading}
        data={
          userToSuspend
            ? {
              name: userToSuspend.name,
              email: userToSuspend.email,
              details: `Rol: ${userToSuspend.roles[0]?.role || 'No asignado'}`
            }
            : undefined
        }
      />

      {/* Diálogo de confirmación para reactivar */}
      <ConfirmationDialog
        isOpen={showReactivateDialog}
        onClose={() => {
          setShowReactivateDialog(false)
          setUserToReactivate(null)
        }}
        onConfirm={confirmReactivate}
        title='Reactivar Usuario'
        message='¿Estás seguro de que deseas reactivar este usuario? Tendrá acceso inmediato al sistema.'
        confirmText='Reactivar'
        action='reactivate'
        loading={actionsLoading}
        data={
          userToReactivate
            ? {
              name: userToReactivate.name,
              email: userToReactivate.email,
              details: `Rol: ${userToReactivate.roles[0]?.role || 'No asignado'}`
            }
            : undefined
        }
      />
    </div>
  )
}

export default UserTable
