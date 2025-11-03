/**
 * User Management Forms Component
 * @description: Formularios para crear, editar y gestionar usuarios multi-empresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 3.0.0 - Refactored with FormModal and Multi-Step
 */

'use client'

import React, {useState, useEffect, useMemo, useRef} from 'react'
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
} from '@/interfaces/EnhanchedCompany/MultiCompany'
import FormModal from '@/components/Shared/FormModal'
import {
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

// ====== TYPES & CONSTANTS ======
type UserFormStep = 1 | 2 | 3

interface StepConfig {
  number: UserFormStep
  title: string
  description: string
  icon: React.ComponentType<{className?: string}>
}

const USER_FORM_STEPS: StepConfig[] = [
  {
    number: 1,
    title: 'Información Básica',
    description: 'Datos personales del usuario',
    icon: UserIcon
  },
  {
    number: 2,
    title: 'Empresa y Rol',
    description: 'Asignación de empresa y rol específico',
    icon: BuildingOfficeIcon
  },
  {
    number: 3,
    title: 'Permisos',
    description: 'Configuración de permisos del usuario',
    icon: ShieldCheckIcon
  }
]

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
  className?: string
  selectedPermissions: string[]
  availablePermissions: string[]
  onPermissionChange: (permissions: string[]) => void
  isGlobal?: boolean
}

// ====== PERMISSION SELECTOR COMPONENT ======
export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  className,
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
    // ✅ Prevenir propagación del evento para evitar submit del formulario
    const isSelected = selectedPermissions.includes(permission)
    if (isSelected) {
      onPermissionChange(selectedPermissions.filter(p => p !== permission))
    } else {
      onPermissionChange([...selectedPermissions, permission])
    }
  }

  const handleCategoryToggle = (category: string) => {
    // ✅ Prevenir propagación del evento para evitar submit del formulario
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

      <div
        className={`${
          className || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
        } `}
      >
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
                    onChange={e => {
                      e.stopPropagation()
                      handleCategoryToggle(category)
                    }}
                    onClick={e => e.stopPropagation()}
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
                      onChange={e => {
                        e.stopPropagation()
                        handlePermissionToggle(permission)
                      }}
                      onClick={e => e.stopPropagation()}
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
  const {
    companies,
    isLoading: companiesLoading,
    error: companiesError
  } = useCompanies()

  // Form state
  const [currentStep, setCurrentStep] = useState<UserFormStep>(1)
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VIEWER)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // ✅ Ref para rastrear si el usuario hizo clic explícitamente en el botón de submit
  const isExplicitSubmitRef = useRef(false)

  // Load user data for editing
  useEffect(() => {
    if (mode === 'edit' && user) {
      updateField('name', user.name)
      updateField('email', user.email)
      updateField('phone', user.phone)
      // ✅ NO cargar password en modo edición

      if (user.roles.length > 0) {
        const primaryRole = user.roles[0]
        setSelectedRole(primaryRole.role)
        setSelectedPermissions(primaryRole.permissions || [])
        // ✅ Corregir carga de empresa en modo edición
        if (primaryRole.companyId) {
          // Si es un objeto, extraer el _id, si es string, usar directamente
          const companyIdValue =
            typeof primaryRole.companyId === 'object'
              ? (primaryRole.companyId as any)._id ||
                (primaryRole.companyId as any).toString()
              : primaryRole.companyId
          setSelectedCompany(companyIdValue)
        }
      }
    }
  }, [user, mode, updateField])

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      resetForm()
      setCurrentStep(1)
      setSelectedCompany('')
      setSelectedRole(UserRole.VIEWER)
      setSelectedPermissions([])
      // ✅ Limpiar explícitamente los campos sensibles
      updateField('password', '')
      updateField('email', '')
    }
  }, [isOpen, resetForm, updateField])

  // Step validation
  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1: // Información básica
        const {name, email, password, phone} = formData

        // Validar campos básicos
        if (!name?.trim() || !email?.trim()) return false

        // Validación de contraseña:
        // - En modo CREATE: obligatoria y con todos los requisitos
        // - En modo EDIT: opcional, pero si se ingresa debe cumplir requisitos
        if (mode === 'create') {
          // En crear, la contraseña es obligatoria
          if (!password || password.length < 8) return false

          // Validar requisitos de password: mayúscula, minúscula, número
          const hasUpperCase = /[A-Z]/.test(password)
          const hasLowerCase = /[a-z]/.test(password)
          const hasNumber = /\d/.test(password)

          if (!hasUpperCase || !hasLowerCase || !hasNumber) return false
        } else if (mode === 'edit' && password) {
          // En editar, si se proporciona contraseña, debe cumplir requisitos
          if (password.length < 8) return false

          const hasUpperCase = /[A-Z]/.test(password)
          const hasLowerCase = /[a-z]/.test(password)
          const hasNumber = /\d/.test(password)

          if (!hasUpperCase || !hasLowerCase || !hasNumber) return false
        }

        // Validar teléfono si está presente (formato chileno)
        if (phone && phone.trim()) {
          // Formato: +569XXXXXXXX o 9XXXXXXXX
          const phoneRegex = /^(\+?56)?9\d{8}$/
          if (!phoneRegex.test(phone.replace(/\s/g, ''))) return false
        }

        return true

      case 2: // Empresa y rol
        return Boolean(
          selectedRole &&
            (selectedRole === UserRole.SUPER_ADMIN ||
              companyScope ||
              selectedCompany)
        )
      case 3: // Permisos (requiere al menos un permiso seleccionado)
        return selectedPermissions.length > 0
      default:
        return false
    }
  }, [
    currentStep,
    formData,
    mode,
    selectedRole,
    selectedCompany,
    companyScope,
    selectedPermissions
  ])

  // Step navigation
  const handleNext = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault() // ✅ Prevenir cualquier submit accidental
    e?.stopPropagation()
    if (canProceedToNextStep && currentStep < 3) {
      setCurrentStep(prev => (prev + 1) as UserFormStep)
    }
  }

  const handlePrevious = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault() // ✅ Prevenir cualquier submit accidental
    e?.stopPropagation()
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as UserFormStep)
    }
  }

  const handleStepClick = (
    step: UserFormStep,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.preventDefault() // ✅ Prevenir cualquier submit accidental
    e?.stopPropagation()
    // Solo permitir navegar a pasos anteriores o al siguiente si es válido
    if (
      step < currentStep ||
      (step === currentStep + 1 && canProceedToNextStep)
    ) {
      setCurrentStep(step)
    }
  }

  // Form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    // ✅ PROTECCIÓN CRÍTICA: Solo ejecutar si es un submit explícito
    if (!isExplicitSubmitRef.current) {
      console.log(
        `🚫 Submit bloqueado (modo ${mode}): No fue un submit explícito`
      )
      return
    }

    // ✅ Resetear el ref después de usarlo
    isExplicitSubmitRef.current = false

    if (!validateForm()) return

    let userData: any = {
      name: formData.name!,
      email: formData.email!,
      // Solo enviar phone si no está vacío (backend requiere formato chileno si se envía)
      ...(formData.phone?.trim() && {phone: formData.phone.trim()}),
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

    // Agregar password si está presente (obligatorio en create, opcional en edit)
    // Si se envía en edit, el backend la hasheará nuevamente
    if (formData.password && formData.password.trim()) {
      userData.password = formData.password.trim()
    }

    console.log(`📤 Datos a enviar (modo ${mode}):`, {
      ...userData,
      password: userData.password ? '***hidden***' : undefined,
      permissionsCount: userData.permissions?.length || 0,
      willUpdatePassword: Boolean(userData.password)
    })

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

  // Get modal title
  const modalTitle = useMemo(() => {
    if (mode === 'create') return 'Crear Nuevo Usuario'
    if (mode === 'edit') return 'Editar Usuario'
    return 'Invitar Usuario'
  }, [mode])

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size='3xl'
      enableOverlayClose={false}
    >
      <div className='px-6 py-6'>
        {/* Step Indicator */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            {USER_FORM_STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = currentStep > step.number
              const isCurrent = currentStep === step.number
              const isClickable =
                step.number < currentStep ||
                (step.number === currentStep + 1 && canProceedToNextStep)

              return (
                <React.Fragment key={step.number}>
                  <div className='relative flex flex-col items-center'>
                    <button
                      type='button'
                      onClick={e => handleStepClick(step.number, e)}
                      disabled={!isClickable}
                      className={`
                        flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all
                        ${
                          isCompleted
                            ? 'bg-green-600 border-green-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-600/20'
                            : 'bg-white border-gray-300 text-gray-400'
                        }
                        ${
                          isClickable
                            ? 'cursor-pointer hover:scale-105'
                            : 'cursor-default'
                        }
                      `}
                    >
                      <StepIcon className='h-5 w-5' />
                    </button>
                    <div className='mt-2 text-center max-w-24'>
                      <div
                        className={`text-xs font-medium ${
                          isCurrent
                            ? 'text-blue-600'
                            : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </div>
                    </div>
                  </div>

                  {index < USER_FORM_STEPS.length - 1 && (
                    <div className='flex-1 flex items-center px-2 pb-8'>
                      <div
                        className={`h-0.5 w-full ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={e => {
            e.preventDefault() // Siempre prevenir el submit por defecto
            // Solo ejecutar handleSubmit si estamos en el paso 3 (último paso)
            if (currentStep === 3) {
              handleSubmit(e)
            }
          }}
        >
          <div className='min-h-[400px]'>
            {/* STEP 1: Información Básica */}
            {currentStep === 1 && (
              <div className='space-y-6'>
                <div className='bg-blue-50 border-l-4 border-blue-600 p-4 mb-6'>
                  <p className='text-sm text-blue-700'>
                    Completa la información personal básica del usuario
                  </p>
                </div>

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
                      autoComplete='off'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='juan.perez@empresa.com'
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
                      autoComplete='off'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='+56912345678 (formato chileno)'
                    />
                    <p className='mt-1 text-xs text-gray-500'>
                      Formato: +569XXXXXXXX (opcional, deja vacío si no aplica)
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Contraseña {mode === 'create' ? '*' : '(opcional)'}
                    </label>
                    <input
                      type='password'
                      value={formData.password || ''}
                      onChange={e => updateField('password', e.target.value)}
                      autoComplete='new-password'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder={
                        mode === 'edit'
                          ? 'Dejar vacío para mantener la actual'
                          : 'Mínimo 8 caracteres'
                      }
                      minLength={mode === 'create' ? 8 : undefined}
                    />
                    {mode === 'edit' && !formData.password && (
                      <p className='mt-1 text-xs text-gray-500'>
                        Deja este campo vacío si no deseas cambiar la contraseña
                      </p>
                    )}
                    {(mode === 'create' || formData.password) && (
                      <div className='mt-2 space-y-1'>
                        <p className='text-xs text-gray-600 font-medium'>
                          Requisitos de contraseña:
                        </p>
                        <div className='flex items-center space-x-2'>
                          <span
                            className={`text-xs ${
                              formData.password && formData.password.length >= 8
                                ? 'text-green-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {formData.password && formData.password.length >= 8
                              ? '✓'
                              : '○'}{' '}
                            Mínimo 8 caracteres
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span
                            className={`text-xs ${
                              formData.password &&
                              /[A-Z]/.test(formData.password)
                                ? 'text-green-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {formData.password &&
                            /[A-Z]/.test(formData.password)
                              ? '✓'
                              : '○'}{' '}
                            Una mayúscula
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span
                            className={`text-xs ${
                              formData.password &&
                              /[a-z]/.test(formData.password)
                                ? 'text-green-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {formData.password &&
                            /[a-z]/.test(formData.password)
                              ? '✓'
                              : '○'}{' '}
                            Una minúscula
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span
                            className={`text-xs ${
                              formData.password && /\d/.test(formData.password)
                                ? 'text-green-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {formData.password && /\d/.test(formData.password)
                              ? '✓'
                              : '○'}{' '}
                            Un número
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Empresa y Rol */}
            {currentStep === 2 && (
              <div className='space-y-6'>
                <div className='bg-blue-50 border-l-4 border-blue-600 p-4 mb-6'>
                  <p className='text-sm text-blue-700'>
                    Asigna el rol y empresa correspondiente al usuario
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Rol *
                    </label>
                    <select
                      value={selectedRole}
                      onChange={e =>
                        setSelectedRole(e.target.value as UserRole)
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                    <div className='mt-2'>
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
                        disabled={companiesLoading}
                      >
                        <option value=''>
                          {companiesLoading
                            ? 'Cargando empresas...'
                            : 'Seleccionar empresa...'}
                        </option>
                        {companies.map(company => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                      {companies.length === 0 && !companiesLoading && (
                        <p className='mt-1 text-xs text-amber-600'>
                          {companiesError
                            ? `Error al cargar empresas: ${
                                companiesError.message || 'Error desconocido'
                              }`
                            : 'No hay empresas disponibles. Crea una empresa primero.'}
                        </p>
                      )}
                      {!companiesLoading && companies.length > 0 && (
                        <p className='mt-1 text-xs text-gray-500'>
                          {companies.length} empresa(s) disponible(s)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Permisos */}
            {currentStep === 3 && (
              <div className='space-y-6'>
                <div className='bg-blue-50 border-l-4 border-blue-600 p-4 mb-6'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm text-blue-700'>
                      Configura los permisos específicos para este usuario
                    </p>
                    <span className='text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded'>
                      {selectedPermissions.length} permiso
                      {selectedPermissions.length !== 1 ? 's' : ''} seleccionado
                      {selectedPermissions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <PermissionSelector
                  selectedPermissions={selectedPermissions}
                  availablePermissions={getAvailablePermissions()}
                  onPermissionChange={setSelectedPermissions}
                  isGlobal={selectedRole === UserRole.SUPER_ADMIN}
                />

                {/* Mensaje de advertencia si no hay permisos seleccionados */}
                {selectedPermissions.length === 0 && (
                  <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>
                        <svg
                          className='h-5 w-5 text-yellow-400'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm text-yellow-700'>
                          Debes seleccionar al menos un permiso para continuar
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className='flex items-center justify-between pt-6 mt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={e => handlePrevious(e)}
              disabled={currentStep === 1}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Anterior
            </button>

            <span className='text-sm text-gray-500'>
              Paso {currentStep} de 3
            </span>

            {currentStep === 3 ? (
              <button
                type='submit'
                onClick={() => {
                  // ✅ Marcar como submit explícito
                  isExplicitSubmitRef.current = true
                }}
                disabled={isLoading || !canProceedToNextStep}
                className='px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading
                  ? 'Procesando...'
                  : mode === 'edit'
                  ? 'Actualizar'
                  : 'Crear Usuario'}
              </button>
            ) : (
              <button
                type='button'
                onClick={e => handleNext(e)}
                disabled={!canProceedToNextStep}
                className='px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Siguiente
              </button>
            )}
          </div>
        </form>
      </div>
    </FormModal>
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
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto w-full h-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white'>
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
          <div className='mb-6 '>
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
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
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
