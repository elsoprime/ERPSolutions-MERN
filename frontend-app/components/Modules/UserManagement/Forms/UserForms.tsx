/**
 * User Management Forms Component (Enhanced)
 * @description: Formulario completo para crear/editar usuarios con diseño mejorado
 * Rediseñado siguiendo el patrón de CreateCompanyForm con FormStepper y validaciones visuales
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 4.0.0 - Enhanced UI/UX with FormStepper and Visual Validation
 */

'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  useUserForm,
  useUserActions,
  useRoleAssignment
} from '@/hooks/useUserManagement'
import { useCompanies, useActiveCompanies } from '@/hooks/CompanyManagement/useCompanyManagement'
import { RoleBadge } from '@/components/UI/MultiCompanyBadges'
import ChangePasswordForm from './ChangePasswordForm'
import { rolesTranslate } from '@/locale/es'
import {
  PermissionUtils,
  GlobalPermission,
  CompanyPermission,
  ROLE_PERMISSIONS
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
import ConfirmationDialog, {
  ConfirmationDialogAction
} from '@/components/Shared/ConfirmationDialog'
import {
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'
import { usePermissionCalculator, PlanFeatureKey } from '@/hooks/usePermissionCalculator'

// ====== TYPES & CONSTANTS ======

// 🌐 Traductor de módulos del plan
const MODULE_TRANSLATIONS: Record<PlanFeatureKey, string> = {
  inventoryManagement: 'Gestión de Inventario',
  accounting: 'Contabilidad',
  hrm: 'Recursos Humanos',
  crm: 'CRM',
  projectManagement: 'Gestión de Proyectos',
  reports: 'Reportes',
  multiCurrency: 'Multimoneda',
  apiAccess: 'Acceso API',
  customBranding: 'Branding Personalizado',
  prioritySupport: 'Soporte Prioritario',
  advancedAnalytics: 'Analítica Avanzada',
  auditLog: 'Registro de Auditoría',
  customIntegrations: 'Integraciones Personalizadas',
  dedicatedAccount: 'Cuenta Dedicada'
}

type UserFormStep = 1 | 2 | 3

interface UserStepConfig {
  number: UserFormStep
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const USER_FORM_STEPS: UserStepConfig[] = [
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
  mode: 'create' | 'edit'
  companyScope?: boolean
}

interface PermissionSelectorProps {
  className?: string
  selectedPermissions: string[]
  availablePermissions: string[]
  onPermissionChange: (permissions: string[]) => void
  isGlobal?: boolean
  restrictedModules?: PlanFeatureKey[] // Módulos restringidos por el plan
  disabled?: boolean
}

// ====== PERMISSION SELECTOR COMPONENT ======
export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  className,
  selectedPermissions,
  availablePermissions,
  onPermissionChange,
  isGlobal = false,
  restrictedModules = [],
  disabled = false
}) => {
  const permissionGroups = React.useMemo(() => {
    const permissions = isGlobal
      ? PermissionUtils.getAllGlobalPermissions()
      : PermissionUtils.getAllCompanyPermissions()

    return PermissionUtils.groupPermissionsByCategory(permissions)
  }, [isGlobal])

  const getPermissionLabel = (permission: string) => {
    return PermissionUtils.getPermissionLabel(permission)
  }

  const getCategoryLabel = (category: string) => {
    return PermissionUtils.getCategoryLabel(category)
  }

  // 🎯 Mapeo de categorías de permisos a módulos del plan
  const categoryToModule: Record<string, PlanFeatureKey> = {
    // Módulos principales
    inventory: 'inventoryManagement',
    accounting: 'accounting',
    hrm: 'hrm',
    crm: 'crm',
    projects: 'projectManagement',
    reports: 'reports',

    // Ventas y Compras (requieren CRM/Contabilidad)
    sales: 'crm',
    purchases: 'accounting',

    // Características avanzadas
    api: 'apiAccess',
    analytics: 'advancedAnalytics',
    audit: 'auditLog',
    integrations: 'customIntegrations',

    // Configuraciones (no están en ningún módulo restringido - siempre disponibles)
    // users, company, settings, system, billing, support - sin restricciones de plan
  }

  // 🎯 Verificar si un permiso está restringido por el plan
  const isPermissionRestricted = (permission: string): boolean => {
    if (restrictedModules.length === 0) return false

    // Obtener la categoría del permiso (primera parte antes del punto)
    const category = permission.split('.')[0]
    const module = categoryToModule[category]

    return module ? restrictedModules.includes(module) : false
  }

  // 🎯 Verificar si una categoría completa está restringida
  const isCategoryRestricted = (category: string): boolean => {
    if (restrictedModules.length === 0) return false
    const module = categoryToModule[category]
    return module ? restrictedModules.includes(module) : false
  }

  const handlePermissionToggle = (permission: string) => {
    // No permitir cambiar permisos restringidos
    if (isPermissionRestricted(permission)) {
      return
    }

    const isSelected = selectedPermissions.includes(permission)
    if (isSelected) {
      onPermissionChange(selectedPermissions.filter(p => p !== permission))
    } else {
      onPermissionChange([...selectedPermissions, permission])
    }
  }

  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = permissionGroups[category]

    // Filtrar permisos que no estén restringidos
    const availableCategoryPermissions = categoryPermissions.filter(
      p => !isPermissionRestricted(p)
    )

    const allSelected = availableCategoryPermissions.every(p =>
      selectedPermissions.includes(p)
    )

    if (allSelected) {
      onPermissionChange(
        selectedPermissions.filter(p => !availableCategoryPermissions.includes(p))
      )
    } else {
      const newPermissions = [...selectedPermissions]
      availableCategoryPermissions.forEach(p => {
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
        className={`${className || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          } `}
      >
        {Object.entries(permissionGroups)
          .filter(([category]) => !isCategoryRestricted(category)) // 🔥 Ocultar categorías restringidas
          .map(([category, permissions]) => {
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
                  <label className='flex items-center cursor-pointer'>
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
                      disabled={disabled}
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

                <div className='space-y-1'>
                  {permissions.map(permission => {
                    const isRestricted = isPermissionRestricted(permission)
                    return (
                      <label
                        key={permission}
                        className={`flex items-center ${isRestricted || disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                          }`}
                        title={
                          isRestricted
                            ? 'Este permiso no está disponible en el plan actual'
                            : disabled
                              ? 'Calculando permisos...'
                              : ''
                        }
                      >
                        <input
                          type='checkbox'
                          checked={selectedPermissions.includes(permission)}
                          disabled={isRestricted || disabled}
                          onChange={e => {
                            e.stopPropagation()
                            handlePermissionToggle(permission)
                          }}
                          onClick={e => e.stopPropagation()}
                          className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${isRestricted || disabled ? 'cursor-not-allowed' : ''
                            }`}
                        />
                        <span
                          className={`ml-2 text-xs ${isRestricted
                            ? 'text-gray-400 line-through'
                            : 'text-gray-600'
                            }`}
                        >
                          {getPermissionLabel(permission)}
                        </span>
                        {isRestricted && (
                          <span className='ml-auto text-xs text-red-500'>
                            🔒
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

// ====== USER FORM COMPONENT (ENHANCED) ======
export const UserForm: React.FC<UserFormProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
  mode,
  companyScope = false
}) => {
  const { formData, updateField, resetForm, validateForm, isEditing } =
    useUserForm(user)
  const { handleCreateUser, handleUpdateUser, isLoading } = useUserActions()
  const {
    companies,
    isLoading: companiesLoading,
    error: companiesError
  } = useActiveCompanies() // ✅ Solo empresas ACTIVAS

  // 🎯 Hook para calcular permisos automáticamente
  const { calculatePermissions, isLoading: calculatingPermissions } =
    usePermissionCalculator()

  // Form state
  const [currentStep, setCurrentStep] = useState<UserFormStep>(1)
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VIEWER)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [restrictedModules, setRestrictedModules] = useState<PlanFeatureKey[]>(
    []
  )
  const [planInfo, setPlanInfo] = useState<{ name: string; type: string }>({
    name: '',
    type: ''
  })
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false)
  const [validationInProgress, setValidationInProgress] = useState(false)

  // ✅ Ref para rastrear si el usuario hizo clic explícitamente en el botón de submit
  const isExplicitSubmitRef = useRef(false)

  // Dialog state
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    action: ConfirmationDialogAction
    title: string
    message: string
    confirmText?: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    action: 'error',
    title: '',
    message: ''
  })

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }))
  }

  // Load user data for editing
  useEffect(() => {
    if (isOpen && mode === 'edit' && user) {
      updateField('name', user.name)
      updateField('email', user.email)
      updateField('phone', user.phone)

      if (user.roles.length > 0) {
        const primaryRole = user.roles[0]
        setSelectedRole(primaryRole.role)
        setSelectedPermissions(primaryRole.permissions || [])
        if (primaryRole.companyId) {
          const companyIdValue =
            typeof primaryRole.companyId === 'object'
              ? (primaryRole.companyId as any)._id ||
              (primaryRole.companyId as any).toString()
              : primaryRole.companyId
          setSelectedCompany(companyIdValue)
        }
      }
    }
  }, [isOpen, user, mode, updateField])

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      resetForm()
      setCurrentStep(1)
      setSelectedCompany('')
      setSelectedRole(UserRole.VIEWER)
      setSelectedPermissions([])
      setRestrictedModules([])
      setPlanInfo({ name: '', type: '' })
      updateField('password', '')
      updateField('email', '')
      setIsCurrentStepValid(false)
      setValidationInProgress(false)
    }
  }, [isOpen, resetForm, updateField])

  // 🎯 AUTO-CARGAR PERMISOS cuando cambia empresa o rol
  useEffect(() => {
    const loadPermissions = async () => {
      // Solo auto-cargar en modo creación y para roles de empresa
      if (
        mode === 'create' &&
        selectedCompany &&
        selectedRole &&
        selectedRole !== UserRole.SUPER_ADMIN
      ) {
        console.log(
          `🔄 Auto-cargando permisos para ${selectedRole} en empresa ${selectedCompany}`
        )

        const result = await calculatePermissions(selectedCompany, selectedRole)

        if (result) {
          setSelectedPermissions(result.permissions)
          setRestrictedModules(result.restrictedModules)
          setPlanInfo(result.planInfo)

          console.log('✅ Permisos auto-cargados:', {
            total: result.permissions.length,
            plan: result.planInfo.name,
            restrictedModules: result.restrictedModules.length
          })
        } else {
          console.warn('⚠️ No se pudieron cargar permisos automáticamente')
        }
      }
    }

    loadPermissions()
  }, [selectedCompany, selectedRole, mode, calculatePermissions])

  // Step validation
  const validateStep = useCallback(
    async (
      step: UserFormStep
    ): Promise<{ isValid: boolean; missingFields: string[] }> => {
      const missingFields: string[] = []

      switch (step) {
        case 1: // Información básica
          const { name, email, password, phone } = formData

          if (!name?.trim()) missingFields.push('Nombre completo')
          if (!email?.trim()) missingFields.push('Email')

          // Validación de contraseña según el modo
          if (mode === 'create') {
            // En modo creación, la contraseña es obligatoria
            if (!password || password.length < 8) {
              missingFields.push('Contraseña (mínimo 8 caracteres)')
            } else {
              const hasUpperCase = /[A-Z]/.test(password)
              const hasLowerCase = /[a-z]/.test(password)
              const hasNumber = /\d/.test(password)

              if (!hasUpperCase)
                missingFields.push('Contraseña (falta mayúscula)')
              if (!hasLowerCase)
                missingFields.push('Contraseña (falta minúscula)')
              if (!hasNumber) missingFields.push('Contraseña (falta número)')
            }
          } else if (mode === 'edit' && password && password.trim()) {
            // En modo edición, solo validar si el usuario decidió cambiar la contraseña
            if (password.length < 8) {
              missingFields.push('Contraseña (mínimo 8 caracteres)')
            } else {
              const hasUpperCase = /[A-Z]/.test(password)
              const hasLowerCase = /[a-z]/.test(password)
              const hasNumber = /\d/.test(password)

              if (!hasUpperCase)
                missingFields.push('Contraseña (falta mayúscula)')
              if (!hasLowerCase)
                missingFields.push('Contraseña (falta minúscula)')
              if (!hasNumber) missingFields.push('Contraseña (falta número)')
            }
            // Si está vacía en modo edición, es válido (no se cambiará)
          }

          if (phone && phone.trim()) {
            const phoneRegex = /^(\+?56)?9\d{8}$/
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
              missingFields.push('Teléfono (formato inválido)')
            }
          }

          return { isValid: missingFields.length === 0, missingFields }

        case 2: // Empresa y rol
          if (!selectedRole) missingFields.push('Rol')
          if (
            selectedRole !== UserRole.SUPER_ADMIN &&
            !companyScope &&
            !selectedCompany
          ) {
            missingFields.push('Empresa')
          }

          return { isValid: missingFields.length === 0, missingFields }

        case 3: // Permisos
          if (selectedPermissions.length === 0) {
            missingFields.push('Al menos un permiso')
          }

          return { isValid: missingFields.length === 0, missingFields }

        default:
          return { isValid: false, missingFields }
      }
    },
    [
      formData,
      mode,
      selectedRole,
      selectedCompany,
      companyScope,
      selectedPermissions
    ]
  )

  // Real-time validation with debounce
  const formValues = {
    formData,
    selectedRole,
    selectedCompany,
    selectedPermissions
  }
  const lastValidationTimeRef = useRef(0)

  useEffect(() => {
    const now = Date.now()
    const shouldValidate = now - lastValidationTimeRef.current > 500

    if (!shouldValidate) return

    let isMounted = true
    setValidationInProgress(true)

    const timeoutId = setTimeout(async () => {
      if (!isMounted) return

      try {
        const validation = await validateStep(currentStep)
        if (isMounted) {
          setIsCurrentStepValid(validation.isValid)
          lastValidationTimeRef.current = Date.now()
        }
      } catch (error) {
        console.error('Error en validación:', error)
        if (isMounted) {
          setIsCurrentStepValid(false)
        }
      } finally {
        if (isMounted) {
          setValidationInProgress(false)
        }
      }
    }, 300)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [formValues, currentStep, validateStep])

  // Reset validation state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setIsCurrentStepValid(false)
      setValidationInProgress(false)
    }
  }, [isOpen])

  // Step navigation
  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    try {
      setValidationInProgress(true)
      const validation = await validateStep(currentStep)

      if (validation.isValid) {
        const newStep = Math.min(currentStep + 1, 3) as UserFormStep
        setCurrentStep(newStep)
      } else {
        const missingFieldsList = validation.missingFields.join(', ')
        const message =
          validation.missingFields.length === 1
            ? `Por favor complete el campo requerido: ${missingFieldsList}`
            : `Por favor complete los siguientes campos: ${missingFieldsList}`

        setDialogState({
          isOpen: true,
          action: 'warning',
          title: 'Campos requeridos incompletos',
          message,
          confirmText: 'Entendido',
          onConfirm: closeDialog
        })
      }
    } catch (error) {
      console.error('Error en nextStep:', error)
    } finally {
      setValidationInProgress(false)
    }
  }

  const prevStep = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setCurrentStep(prev => Math.max(prev - 1, 1) as UserFormStep)
  }

  const handleStepClick = (step: UserFormStep, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (
      step < currentStep ||
      (step === currentStep + 1 && isCurrentStepValid)
    ) {
      setCurrentStep(step)
    }
  }

  // Form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!isExplicitSubmitRef.current) {
      console.log(
        `🚫 Submit bloqueado (modo ${mode}): No fue un submit explícito`
      )
      return
    }

    isExplicitSubmitRef.current = false

    // No usar validateForm() del hook porque ya tenemos validación por pasos
    // y el hook no conoce el modo (create/edit)

    let userData: any = {
      name: formData.name!,
      email: formData.email!,
      ...(formData.phone?.trim() && { phone: formData.phone.trim() }),
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

  const modalTitle = useMemo(() => {
    if (mode === 'create') return 'Crear Nuevo Usuario'
    if (mode === 'edit') return 'Editar Usuario'
    return 'Usuario'
  }, [mode])

  const handleClose = () => {
    resetForm()
    setCurrentStep(1)
    setIsCurrentStepValid(false)
    setValidationInProgress(false)
    onClose()
  }

  // Validation indicator
  const renderValidationIndicator = () => {
    if (isCurrentStepValid) {
      return (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <CheckCircleIcon className='w-5 h-5 text-green-600 mr-2' />
            <p className='text-sm text-green-800'>
              {currentStep === 1 && mode === 'edit'
                ? 'Información básica completa. Puedes continuar sin cambiar la contraseña.'
                : 'Todos los campos requeridos están completos'}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
        <div className='flex items-center'>
          <ExclamationTriangleIcon className='w-5 h-5 text-amber-600 mr-2' />
          <p className='text-sm text-amber-800'>
            {currentStep === 1 && mode === 'edit'
              ? 'Complete los campos obligatorios (nombre y email). La contraseña es opcional.'
              : 'Complete todos los campos obligatorios para continuar al siguiente paso'}
          </p>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
        size='3xl'
      >
        <form
          onSubmit={e => {
            e.preventDefault()
            if (currentStep === 3) {
              handleSubmit(e)
            }
          }}
          className='p-6'
        >
          {/* Custom User Form Stepper */}
          <div className='mb-8'>
            <div className='relative'>
              {/* Steps Container */}
              <div className='flex items-center justify-between relative'>
                {USER_FORM_STEPS.map((step, index) => {
                  const status =
                    step.number < currentStep
                      ? 'completed'
                      : step.number === currentStep
                        ? 'current'
                        : 'pending'
                  const Icon = step.icon

                  return (
                    <React.Fragment key={step.number}>
                      {/* Step Circle */}
                      <div className='flex flex-col items-center relative z-10 flex-1'>
                        <button
                          type='button'
                          onClick={e => handleStepClick(step.number, e)}
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${status === 'completed'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-lg'
                            : status === 'current'
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white shadow-xl ring-4 ring-blue-600/20 scale-110'
                              : 'bg-white border-gray-300 text-gray-400'
                            }`}
                          disabled={status === 'pending'}
                        >
                          {status === 'completed' ? (
                            <CheckIcon className='w-6 h-6' />
                          ) : (
                            <Icon className='w-6 h-6' />
                          )}
                        </button>

                        <div className='mt-2 text-center'>
                          <p
                            className={`text-xs sm:text-sm font-medium ${status === 'current'
                              ? 'text-blue-600'
                              : status === 'completed'
                                ? 'text-green-600'
                                : 'text-gray-500'
                              }`}
                          >
                            {step.title}
                          </p>
                          <p className='text-xs text-gray-500 mt-0.5 hidden sm:block'>
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Connector Line */}
                      {index < USER_FORM_STEPS.length - 1 && (
                        <div className='flex-1 h-0.5 mx-2 -mt-12'>
                          <div
                            className={`h-full transition-all duration-300 ${step.number < currentStep
                              ? 'bg-gradient-to-r from-green-500 to-green-400'
                              : 'bg-gray-300'
                              }`}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Progress Bar */}
              <div className='mt-6 h-2 bg-gray-200 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out'
                  style={{
                    width: `${((currentStep - 1) / (USER_FORM_STEPS.length - 1)) * 100
                      }%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* STEP 1: Información Básica */}
          {currentStep === 1 && (
            <div className='space-y-6'>
              {renderValidationIndicator()}

              <div className='bg-blue-50 border-l-4 border-blue-600 p-4'>
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
                    placeholder='Juan Pérez González'
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
                    Formato: +569XXXXXXXX (opcional)
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
                    <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                      <p className='text-xs text-blue-700 flex items-center'>
                        <svg
                          className='w-4 h-4 mr-1.5 flex-shrink-0'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        La contraseña actual se mantendrá sin cambios. Puedes
                        continuar al siguiente paso sin modificarla.
                      </p>
                    </div>
                  )}
                  {(mode === 'create' || formData.password) && (
                    <div className='mt-2 space-y-1'>
                      <p className='text-xs text-gray-600 font-medium'>
                        Requisitos de contraseña:
                      </p>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`text-xs ${formData.password && formData.password.length >= 8
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
                          className={`text-xs ${formData.password && /[A-Z]/.test(formData.password)
                            ? 'text-green-600'
                            : 'text-gray-500'
                            }`}
                        >
                          {formData.password && /[A-Z]/.test(formData.password)
                            ? '✓'
                            : '○'}{' '}
                          Una mayúscula
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`text-xs ${formData.password && /[a-z]/.test(formData.password)
                            ? 'text-green-600'
                            : 'text-gray-500'
                            }`}
                        >
                          {formData.password && /[a-z]/.test(formData.password)
                            ? '✓'
                            : '○'}{' '}
                          Una minúscula
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`text-xs ${formData.password && /\d/.test(formData.password)
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
              {renderValidationIndicator()}

              <div className='bg-blue-50 border-l-4 border-blue-600 p-4'>
                <p className='text-sm text-blue-700'>
                  Selecciona la empresa y el rol que tendrá este usuario
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Rol *
                  </label>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value as UserRole)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {getAvailableRoles().map(role => (
                      <option key={role} value={role}>
                        {rolesTranslate[role] || role}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRole !== UserRole.SUPER_ADMIN && !companyScope && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Empresa *
                    </label>
                    <select
                      value={selectedCompany}
                      onChange={e => setSelectedCompany(e.target.value)}
                      disabled={companiesLoading}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100'
                    >
                      <option value=''>Seleccionar empresa</option>
                      {companies?.map((company: IEnhancedCompany) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    {companiesLoading && (
                      <p className='mt-1 text-xs text-gray-500'>
                        Cargando empresas...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedRole !== UserRole.SUPER_ADMIN && companyScope && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <p className='text-sm text-blue-800'>
                    Este usuario será asignado a tu empresa automáticamente
                  </p>
                </div>
              )}

              {/* 🎯 Indicador de cálculo de permisos */}
              {calculatingPermissions && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600'></div>
                    <p className='text-sm text-blue-800 font-medium'>
                      Calculando permisos automáticamente...
                    </p>
                  </div>
                </div>
              )}

              {/* 🎯 Indicador de permisos cargados */}
              {!calculatingPermissions &&
                selectedPermissions.length > 0 &&
                mode === 'create' &&
                planInfo.name && (
                  <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                    <div className='flex items-start space-x-3'>
                      <CheckCircleIcon className='h-5 w-5 text-green-600 mt-0.5' />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-green-800'>
                          ✅ {selectedPermissions.length} permisos asignados
                          automáticamente
                        </p>
                        <p className='text-xs text-green-600 mt-1'>
                          Según el rol "{rolesTranslate[selectedRole]}" y el
                          plan "{planInfo.name}"
                        </p>
                        {restrictedModules.length > 0 && (
                          <p className='text-xs text-orange-600 mt-2'>
                            ⚠️ {restrictedModules.length} módulos no
                            disponibles en este plan
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* STEP 3: Permisos */}
          {currentStep === 3 && (
            <div className='space-y-6'>
              {renderValidationIndicator()}

              <div className='bg-blue-50 border-l-4 border-blue-600 p-4'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-blue-700'>
                    {mode === 'create'
                      ? 'Los permisos se han calculado automáticamente. Puedes ajustarlos si es necesario.'
                      : 'Configura los permisos específicos para este usuario'}
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
                restrictedModules={restrictedModules}
              />

              {selectedPermissions.length === 0 && (
                <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
                  <div className='flex items-center'>
                    <ExclamationTriangleIcon className='h-5 w-5 text-yellow-400 mr-2' />
                    <p className='text-sm text-yellow-700'>
                      Debes seleccionar al menos un permiso para continuar
                    </p>
                  </div>
                </div>
              )}

              {/* Resumen */}
              <div className='bg-gray-50 rounded-lg p-4 space-y-3'>
                <h4 className='text-sm font-semibold text-gray-900'>
                  Resumen de Usuario
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                  <div>
                    <strong>Nombre:</strong> {formData.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {formData.email}
                  </div>
                  <div>
                    <strong>Rol:</strong>{' '}
                    {rolesTranslate[selectedRole] || selectedRole}
                  </div>
                  {selectedRole !== UserRole.SUPER_ADMIN && selectedCompany && (
                    <div>
                      <strong>Empresa:</strong>{' '}
                      {
                        companies?.find(
                          (c: IEnhancedCompany) => c._id === selectedCompany
                        )?.name
                      }
                    </div>
                  )}
                  <div className='md:col-span-2'>
                    <strong>Permisos:</strong> {selectedPermissions.length}{' '}
                    seleccionados
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className='flex justify-between mt-8 pt-6 border-t border-gray-200'>
            <div>
              {currentStep > 1 && (
                <button
                  type='button'
                  onClick={e => prevStep(e)}
                  className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                >
                  Anterior
                </button>
              )}
            </div>

            <div>
              {currentStep < 3 ? (
                <button
                  type='button'
                  onClick={e => nextStep(e)}
                  disabled={!isCurrentStepValid || validationInProgress}
                  className={`px-6 py-2 rounded-md transition-colors ${isCurrentStepValid && !validationInProgress
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  title={
                    !isCurrentStepValid
                      ? 'Complete todos los campos requeridos para continuar'
                      : ''
                  }
                >
                  {validationInProgress ? 'Validando...' : 'Siguiente'}
                </button>
              ) : (
                <button
                  type='submit'
                  onClick={() => {
                    isExplicitSubmitRef.current = true
                  }}
                  disabled={isLoading || !isCurrentStepValid}
                  className={`px-6 py-2 rounded-md transition-colors ${!isLoading && isCurrentStepValid
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isLoading
                    ? 'Procesando...'
                    : mode === 'edit'
                      ? 'Actualizar Usuario'
                      : 'Crear Usuario'}
                </button>
              )}
            </div>
          </div>
        </form>
      </FormModal>

      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        action={dialogState.action}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        onConfirm={dialogState.onConfirm || closeDialog}
        onClose={closeDialog}
      />
    </>
  )
}

// Exportar componentes y constantes
export { ChangePasswordForm, MODULE_TRANSLATIONS }
export default UserForm
