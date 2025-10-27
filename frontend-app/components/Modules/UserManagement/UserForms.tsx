/**
 * User Management Forms Component
 * @description: Formularios para crear, editar y gestionar usuarios multi-empresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useState, useEffect} from 'react'
import {useUserForm, useUserActions} from '@/hooks/useUserManagement'
import {useCompanies} from '@/hooks/useCompanyManagement'
import {RoleBadge, StatusBadge} from '@/components/UI/MultiCompanyBadges'
import {
  PermissionUtils,
  GlobalPermission,
  CompanyPermission
} from '@/utils/permissions'
import {
  IEnhancedUser,
  IEnhancedCompany,
  UserRole,
  UserStatus,
  ICreateUserRequest,
  IUpdateUserRequest,
  RoleType
} from '@/interfaces/MultiCompany'

interface UserFormProps {
  user?: IEnhancedUser
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  mode: 'create' | 'edit' | 'invite'
  companyScope?: boolean
}

interface RoleAssignmentProps {
  userId: string
  currentRoles: IEnhancedUser['roles']
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface PermissionSelectorProps {
  selectedPermissions: string[]
  availablePermissions: string[]
  onPermissionChange: (permissions: string[]) => void
  isGlobal?: boolean
}

// ====== PERMISSION SELECTOR COMPONENT ======
export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  selectedPermissions,
  availablePermissions,
  onPermissionChange,
  isGlobal = false
}) => {
  const permissionGroups = React.useMemo(() => {
    const permissions = isGlobal
      ? PermissionUtils.getAllGlobalPermissions()
      : PermissionUtils.getAllCompanyPermissions()

    // Agrupar permisos por categoría
    return PermissionUtils.groupPermissionsByCategory(permissions)
  }, [isGlobal])

  const getPermissionLabel = (permission: string) => {
    return PermissionUtils.getPermissionLabel(permission)
  }

  const getCategoryLabel = (category: string) => {
    return PermissionUtils.getCategoryLabel(category)
  }

  const handlePermissionToggle = (permission: string) => {
    const isSelected = selectedPermissions.includes(permission)
    if (isSelected) {
      onPermissionChange(selectedPermissions.filter(p => p !== permission))
    } else {
      onPermissionChange([...selectedPermissions, permission])
    }
  }

  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = permissionGroups[category]
    const allSelected = categoryPermissions.every(p =>
      selectedPermissions.includes(p)
    )

    if (allSelected) {
      // Deseleccionar todos los permisos de la categoría
      onPermissionChange(
        selectedPermissions.filter(p => !categoryPermissions.includes(p))
      )
    } else {
      // Seleccionar todos los permisos de la categoría
      const newPermissions = [...selectedPermissions]
      categoryPermissions.forEach(p => {
        if (!newPermissions.includes(p)) {
          newPermissions.push(p)
        }
      })
      onPermissionChange(newPermissions)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-medium text-gray-900'>
          {isGlobal ? 'Permisos Globales' : 'Permisos de Empresa'}
        </h4>
        <span className='text-xs text-gray-500'>
          {selectedPermissions.length} seleccionados
        </span>
      </div>

      <div className='space-y-3'>
        {Object.entries(permissionGroups).map(([category, permissions]) => {
          const allSelected = permissions.every(p =>
            selectedPermissions.includes(p)
          )
          const someSelected = permissions.some(p =>
            selectedPermissions.includes(p)
          )

          return (
            <div
              key={category}
              className='border border-gray-200 rounded-lg p-3'
            >
              <div className='flex items-center justify-between mb-2'>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={allSelected}
                    ref={input => {
                      if (input)
                        input.indeterminate = someSelected && !allSelected
                    }}
                    onChange={() => handleCategoryToggle(category)}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='ml-2 text-sm font-medium text-gray-700'>
                    {getCategoryLabel(category)}
                  </span>
                </label>
                <span className='text-xs text-gray-500'>
                  {
                    permissions.filter(p => selectedPermissions.includes(p))
                      .length
                  }
                  /{permissions.length}
                </span>
              </div>

              <div className='ml-6 space-y-1'>
                {permissions.map(permission => (
                  <label key={permission} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => handlePermissionToggle(permission)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-sm text-gray-600'>
                      {getPermissionLabel(permission)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ====== USER FORM COMPONENT ======
export const UserForm: React.FC<UserFormProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
  mode,
  companyScope = false
}) => {
  const {formData, updateField, resetForm, validateForm, isEditing} =
    useUserForm(user)
  const {handleCreateUser, handleUpdateUser, isLoading} = useUserActions()
  const {companies} = useCompanies()

  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VIEWER)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  useEffect(() => {
    if (mode === 'edit' && user) {
      // Prellenar datos para edición
      updateField('name', user.name)
      updateField('email', user.email)
      updateField('phone', user.phone)

      if (user.roles.length > 0) {
        const primaryRole = user.roles[0]
        setSelectedRole(primaryRole.role)
        setSelectedPermissions(primaryRole.permissions || [])
        if (primaryRole.companyId) {
          setSelectedCompany(primaryRole.companyId)
        }
      }
    }
  }, [user, mode, updateField])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
      setSelectedCompany('')
      setSelectedRole(UserRole.VIEWER)
      setSelectedPermissions([])
    }
  }, [isOpen, resetForm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    let userData: any = {
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone || '',
      role: selectedRole,
      permissions: selectedPermissions,
      companyId:
        companyScope || selectedRole === UserRole.SUPER_ADMIN
          ? undefined
          : selectedCompany,
      roleType:
        selectedRole === UserRole.SUPER_ADMIN
          ? RoleType.GLOBAL
          : RoleType.COMPANY
    }

    // Solo agregar password para crear usuarios
    if (mode === 'create' && formData.password) {
      userData.password = formData.password
    }

    const success =
      mode === 'edit' && user
        ? await handleUpdateUser(user._id, userData as IUpdateUserRequest)
        : await handleCreateUser(userData)

    if (success) {
      onSuccess?.()
      onClose()
    }
  }

  const getAvailableRoles = () => {
    if (companyScope) {
      // En scope de empresa, no mostrar SUPER_ADMIN
      return [
        UserRole.ADMIN_EMPRESA,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
        UserRole.VIEWER
      ]
    }
    return Object.values(UserRole)
  }

  const getAvailablePermissions = (): string[] => {
    return selectedRole === UserRole.SUPER_ADMIN
      ? PermissionUtils.getAllGlobalPermissions()
      : PermissionUtils.getAllCompanyPermissions()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              {mode === 'create' && 'Crear Usuario'}
              {mode === 'edit' && 'Editar Usuario'}
              {mode === 'invite' && 'Invitar Usuario'}
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <span className='sr-only'>Cerrar</span>
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Información básica */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nombre completo *
                </label>
                <input
                  type='text'
                  value={formData.name || ''}
                  onChange={e => updateField('name', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Ej: Juan Pérez'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email *
                </label>
                <input
                  type='email'
                  value={formData.email || ''}
                  onChange={e => updateField('email', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='juan.perez@empresa.com'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Teléfono
                </label>
                <input
                  type='tel'
                  value={formData.phone || ''}
                  onChange={e => updateField('phone', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='+56 9 1234 5678'
                />
              </div>

              {mode === 'create' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Contraseña *
                  </label>
                  <input
                    type='password'
                    value={formData.password || ''}
                    onChange={e => updateField('password', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Mínimo 8 caracteres'
                    required
                    minLength={8}
                  />
                </div>
              )}
            </div>

            {/* Rol y empresa */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Rol *
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as UserRole)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                >
                  {getAvailableRoles().map(role => (
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
                <div className='mt-1'>
                  <RoleBadge role={selectedRole} size='sm' />
                </div>
              </div>

              {!companyScope && selectedRole !== UserRole.SUPER_ADMIN && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Empresa *
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={e => setSelectedCompany(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  >
                    <option value=''>Seleccionar empresa...</option>
                    {companies.map(company => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Permisos */}
            <div>
              <PermissionSelector
                selectedPermissions={selectedPermissions}
                availablePermissions={getAvailablePermissions()}
                onPermissionChange={setSelectedPermissions}
                isGlobal={selectedRole === UserRole.SUPER_ADMIN}
              />
            </div>

            {/* Botones */}
            <div className='flex items-center justify-end space-x-3 pt-6 border-t'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading
                  ? 'Procesando...'
                  : mode === 'edit'
                  ? 'Actualizar'
                  : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ====== ROLE ASSIGNMENT COMPONENT ======
export const RoleAssignmentForm: React.FC<RoleAssignmentProps> = ({
  userId,
  currentRoles,
  isOpen,
  onClose,
  onSuccess
}) => {
  const {companies} = useCompanies()
  const {handleCreateUser} = useUserActions() // Reutilizamos para asignación de roles

  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VIEWER)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              Asignar Nuevo Rol
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <span className='sr-only'>Cerrar</span>
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Roles actuales */}
          <div className='mb-6'>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>
              Roles Actuales
            </h4>
            <div className='space-y-2'>
              {currentRoles.map((roleAssignment, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-2 bg-gray-50 rounded'
                >
                  <div className='flex items-center space-x-2'>
                    <RoleBadge role={roleAssignment.role} size='sm' />
                    {roleAssignment.companyId && (
                      <span className='text-sm text-gray-600'>
                        en{' '}
                        {companies.find(c => c._id === roleAssignment.companyId)
                          ?.name || 'Empresa'}
                      </span>
                    )}
                  </div>
                  <button className='text-red-600 hover:text-red-800 text-sm'>
                    Revocar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Empresa
              </label>
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                <option value=''>Seleccionar empresa...</option>
                {companies.map(company => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Rol
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as UserRole)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                {[
                  UserRole.ADMIN_EMPRESA,
                  UserRole.MANAGER,
                  UserRole.EMPLOYEE,
                  UserRole.VIEWER
                ].map(role => (
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

            <PermissionSelector
              selectedPermissions={selectedPermissions}
              availablePermissions={PermissionUtils.getAllCompanyPermissions()}
              onPermissionChange={setSelectedPermissions}
              isGlobal={false}
            />

            <div className='flex items-center justify-end space-x-3 pt-4 border-t'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors'
              >
                Asignar Rol
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default {
  UserForm,
  RoleAssignmentForm,
  PermissionSelector
}
