/**
 * User Form - Inline Version (Without Stepper)
 * @description: Formulario inline para crear/editar usuarios sin modal y sin steps
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
    useUserForm,
    useUserActions
} from '@/hooks/useUserManagement'
import { useActiveCompanies } from '@/hooks/CompanyManagement/useCompanyManagement'
import {
    IEnhancedUser,
    IEnhancedCompany,
    UserRole,
    RoleType
} from '@/interfaces/EnhanchedCompany/MultiCompany'
import { rolesTranslate } from '@/locale/es'
import {
    PermissionUtils,
    ROLE_PERMISSIONS
} from '@/utils/permissions'
import ConfirmationDialog, {
    ConfirmationDialogAction
} from '@/components/Shared/ConfirmationDialog'
import {
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/20/solid'
import { usePermissionCalculator, PlanFeatureKey } from '@/hooks/usePermissionCalculator'

// ====== TYPES & INTERFACES ======
interface UserFormInlineProps {
    user?: IEnhancedUser
    onCancel: () => void
    onSuccess?: () => void
    mode: 'create' | 'edit'
    companyScope?: boolean
}

interface PermissionSelectorProps {
    className?: string
    selectedPermissions: string[]
    availablePermissions: string[] // Permisos disponibles para el rol
    onPermissionChange: (permissions: string[]) => void
    isGlobal?: boolean
    restrictedModules?: PlanFeatureKey[]
    showOnlyAvailable?: boolean // Mostrar solo permisos disponibles para el rol
    mandatoryPermissions?: string[] // NUEVO: Permisos obligatorios del rol (bloqueados)
    optionalPermissions?: string[] // NUEVO: Permisos opcionales del plan
}

// ====== PERMISSION SELECTOR COMPONENT ======
export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
    className,
    selectedPermissions,
    availablePermissions,
    onPermissionChange,
    isGlobal = false,
    restrictedModules = [],
    showOnlyAvailable = true,
    mandatoryPermissions = [], // Permisos obligatorios (bloqueados)
    optionalPermissions = [] // Permisos opcionales adicionales
}) => {
    // 🐛 DEBUG: Log cuando cambian los permisos seleccionados
    React.useEffect(() => {
        console.log('🔄 PermissionSelector - selectedPermissions cambió:', {
            count: selectedPermissions.length,
            permissions: selectedPermissions,
            restrictedModulesCount: restrictedModules.length,
            availablePermissionsCount: availablePermissions.length
        })
    }, [selectedPermissions, restrictedModules, availablePermissions.length])

    // Verificar si un permiso está restringido por el plan
    const isPermissionRestricted = React.useCallback((permission: string): boolean => {
        if (restrictedModules.length === 0) return false

        const categoryToModule: Record<string, PlanFeatureKey> = {
            inventory: 'inventoryManagement',
            accounting: 'accounting',
            hrm: 'hrm',
            crm: 'crm',
            projects: 'projectManagement',
            reports: 'reports',
            api: 'apiAccess',
            analytics: 'advancedAnalytics',
            audit: 'auditLog',
            integrations: 'customIntegrations'
        }

        const category = permission.split('.')[0]
        const moduleKey = categoryToModule[category]
        return moduleKey ? restrictedModules.includes(moduleKey) : false
    }, [restrictedModules])

    const permissionGroups = React.useMemo(() => {
        // Determinar qué permisos mostrar
        let permissionsToShow: string[]

        if (showOnlyAvailable && availablePermissions.length > 0) {
            // Mostrar SOLO los permisos disponibles para el rol
            permissionsToShow = availablePermissions
            console.log('🔍 PermissionSelector - Mostrando SOLO permisos del rol:', {
                isGlobal,
                totalPermissions: permissionsToShow.length,
                availablePermissions: permissionsToShow
            })
        } else {
            // Mostrar TODOS los permisos (comportamiento anterior)
            permissionsToShow = isGlobal
                ? PermissionUtils.getAllGlobalPermissions()
                : PermissionUtils.getAllCompanyPermissions()
            console.log('🔍 PermissionSelector - Mostrando TODOS los permisos:', {
                isGlobal,
                totalPermissions: permissionsToShow.length
            })
        }

        // FILTRAR permisos restringidos (ocultarlos completamente)
        // PERO: Si el permiso está en mandatoryPermissions, NO ocultarlo (es obligatorio y ya está en el plan)
        const filteredPermissions = permissionsToShow.filter(permission => {
            // Si es obligatorio (ya calculado y asignado), SIEMPRE mostrarlo
            if (mandatoryPermissions.includes(permission)) {
                return true
            }

            // Si no es obligatorio, verificar si está restringido
            const isRestricted = isPermissionRestricted(permission)
            return !isRestricted // Solo mostrar los NO restringidos
        })

        console.log('🔍 PermissionSelector - Después de filtrar restringidos:', {
            antes: permissionsToShow.length,
            despues: filteredPermissions.length,
            mandatoryShown: permissionsToShow.filter(p => mandatoryPermissions.includes(p)).length,
            restrictedHidden: permissionsToShow.length - filteredPermissions.length
        })

        return PermissionUtils.groupPermissionsByCategory(filteredPermissions)
    }, [isGlobal, availablePermissions, showOnlyAvailable, restrictedModules, mandatoryPermissions])

    const getPermissionLabel = (permission: string) => {
        return PermissionUtils.getPermissionLabel(permission)
    }

    const getCategoryLabel = (category: string) => {
        return PermissionUtils.getCategoryLabel(category)
    }

    // Verificar si un permiso es obligatorio (del rol) y debe estar bloqueado
    const isPermissionMandatory = (permission: string): boolean => {
        return mandatoryPermissions.includes(permission)
    }

    const handlePermissionToggle = (permission: string) => {
        // No permitir cambiar permisos obligatorios o restringidos
        if (isPermissionMandatory(permission) || isPermissionRestricted(permission)) return

        const isSelected = selectedPermissions.includes(permission)
        if (isSelected) {
            onPermissionChange(selectedPermissions.filter(p => p !== permission))
        } else {
            onPermissionChange([...selectedPermissions, permission])
        }
    }

    const handleCategoryToggle = (category: string) => {
        const categoryPermissions = permissionGroups[category]
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

            <div className={`${className || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
                {Object.entries(permissionGroups).map(([category, permissions]) => {
                    const allSelected = permissions.every(p =>
                        selectedPermissions.includes(p)
                    )
                    const someSelected = permissions.some(p =>
                        selectedPermissions.includes(p)
                    )
                    // Verificar si TODOS los permisos de la categoría son obligatorios
                    const allMandatory = permissions.every(p => isPermissionMandatory(p))

                    return (
                        <div
                            key={category}
                            className='border border-gray-200 rounded-lg p-3'
                        >
                            <div className='flex items-center justify-between mb-2'>
                                <label className={`flex items-center ${allMandatory ? 'cursor-default' : 'cursor-pointer'
                                    }`}>
                                    <input
                                        type='checkbox'
                                        checked={allSelected}
                                        disabled={allMandatory}
                                        ref={input => {
                                            if (input)
                                                input.indeterminate = someSelected && !allSelected
                                        }}
                                        onChange={e => {
                                            e.stopPropagation()
                                            handleCategoryToggle(category)
                                        }}
                                        onClick={e => e.stopPropagation()}
                                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${allMandatory ? 'cursor-not-allowed' : ''
                                            }`}
                                    />
                                    <span className={`ml-2 text-sm font-medium ${allMandatory ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                        {getCategoryLabel(category)}
                                        {allMandatory && <span className='ml-1 text-xs text-blue-600' title='Todos los permisos son obligatorios'>✓</span>}
                                    </span>
                                </label>
                                <span className='text-xs text-gray-500'>
                                    {permissions.filter(p => selectedPermissions.includes(p)).length}/{permissions.length}
                                </span>
                            </div>

                            <div className='space-y-1'>
                                {permissions.map(permission => {
                                    const isMandatory = isPermissionMandatory(permission)
                                    // Los permisos restringidos ya están filtrados y no se muestran

                                    return (
                                        <label
                                            key={permission}
                                            className={`flex items-center ${isMandatory ? 'cursor-default bg-blue-50 px-2 py-1 rounded' : 'cursor-pointer'
                                                }`}
                                            title={
                                                isMandatory
                                                    ? 'Permiso obligatorio del rol - No se puede desactivar'
                                                    : 'Click para seleccionar/deseleccionar'
                                            }
                                        >
                                            <input
                                                type='checkbox'
                                                checked={selectedPermissions.includes(permission)}
                                                disabled={isMandatory}
                                                onChange={e => {
                                                    e.stopPropagation()
                                                    handlePermissionToggle(permission)
                                                }}
                                                onClick={e => e.stopPropagation()}
                                                className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${isMandatory ? 'cursor-not-allowed' : ''
                                                    }`}
                                            />
                                            <span className={`ml-2 text-xs ${isMandatory ? 'text-blue-700 font-medium' : 'text-gray-600'
                                                }`}>
                                                {getPermissionLabel(permission)}
                                            </span>
                                            {isMandatory && (
                                                <span className='ml-auto text-xs text-blue-600' title='Obligatorio'>✓</span>
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

// ====== MAIN USER FORM INLINE COMPONENT ======
export default function UserFormInline({
    user,
    onCancel,
    onSuccess,
    mode,
    companyScope = false
}: UserFormInlineProps) {
    // Hooks
    const { formData, updateField, resetForm } = useUserForm(user)
    const { handleCreateUser, handleUpdateUser, isLoading } = useUserActions()
    const {
        companies,
        isLoading: companiesLoading
    } = useActiveCompanies()
    const { calculatePermissions, getAvailableModules, isLoading: calculatingPermissions } = usePermissionCalculator()

    // Form state
    const [selectedCompany, setSelectedCompany] = useState<string>('')
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VIEWER)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [restrictedModules, setRestrictedModules] = useState<PlanFeatureKey[]>([])
    const [planInfo, setPlanInfo] = useState<{ name: string; type: string }>({ name: '', type: '' })
    const [isFormValid, setIsFormValid] = useState(false)
    const [validationInProgress, setValidationInProgress] = useState(false)

    // Ref para submit explícito
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
        if (mode === 'edit' && user) {
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
    }, [user, mode, updateField])

    // 🔍 OBTENER MÓDULOS DISPONIBLES cuando cambia empresa (para filtrar roles)
    useEffect(() => {
        const fetchAvailableModules = async () => {
            // Solo en modo creación y con empresa seleccionada
            if (mode !== 'create' || !selectedCompany) {
                setRestrictedModules([])
                return
            }

            // Para roles globales no filtrar
            if (selectedRole === UserRole.SUPER_ADMIN) {
                setRestrictedModules([])
                return
            }

            console.log('🔍 Obteniendo módulos disponibles para filtrar roles...')

            try {
                // Obtener módulos disponibles de la empresa
                const availableModules = await getAvailableModules(selectedCompany)

                // Todos los módulos posibles
                const allModules: PlanFeatureKey[] = [
                    'inventoryManagement',
                    'accounting',
                    'hrm',
                    'crm',
                    'projectManagement',
                    'reports',
                    'multiCurrency',
                    'apiAccess',
                    'customBranding',
                    'prioritySupport',
                    'advancedAnalytics',
                    'auditLog',
                    'customIntegrations',
                    'dedicatedAccount'
                ]

                // Calcular módulos restringidos
                const restricted = allModules.filter(m => !availableModules.includes(m))
                setRestrictedModules(restricted)

                console.log('✅ Módulos para filtrado:', {
                    available: availableModules.length,
                    restricted: restricted.length,
                    restrictedModules: restricted
                })
            } catch (error) {
                console.error('❌ Error obteniendo módulos disponibles:', error)
            }
        }

        fetchAvailableModules()
    }, [selectedCompany, mode, getAvailableModules])

    // 🎯 AUTO-CALCULAR PERMISOS cuando cambia empresa o rol
    useEffect(() => {
        const autoCalculatePermissions = async () => {
            console.log('🔍 useEffect disparado - Auto-calcular permisos:', {
                mode,
                selectedRole,
                selectedCompany,
                hasCalculatePermissions: !!calculatePermissions
            })

            // Solo auto-calcular en modo creación
            if (mode !== 'create') {
                console.log('⏭️ Modo no es "create", saltando auto-cálculo')
                return
            }

            // No calcular para roles globales
            if (selectedRole === UserRole.SUPER_ADMIN) {
                console.log('⏭️ Rol es SUPER_ADMIN, saltando auto-cálculo')
                return
            }

            // Necesitamos empresa y rol
            if (!selectedCompany || !selectedRole) {
                console.log('⏭️ Falta empresa o rol, saltando auto-cálculo:', {
                    selectedCompany,
                    selectedRole
                })
                return
            }

            console.log('🚀 Iniciando auto-cálculo de permisos...')

            try {
                const result = await calculatePermissions(selectedCompany, selectedRole)

                if (result) {
                    console.log('📦 Resultado de calculatePermissions:', {
                        permissionsCount: result.permissions.length,
                        permissions: result.permissions,
                        restrictedModulesCount: result.restrictedModules.length,
                        restrictedModules: result.restrictedModules,
                        planInfo: result.planInfo
                    })

                    setSelectedPermissions(result.permissions)
                    console.log('✅ setSelectedPermissions llamado con:', result.permissions.length, 'permisos')

                    setRestrictedModules(result.restrictedModules)
                    console.log('✅ setRestrictedModules llamado con:', result.restrictedModules.length, 'módulos')

                    setPlanInfo(result.planInfo)
                    console.log('✅ setPlanInfo llamado con:', result.planInfo)

                    console.log(
                        `✅ Permisos auto-calculados en UserFormInline:`,
                        {
                            role: selectedRole,
                            company: selectedCompany,
                            permissions: result.permissions.length,
                            plan: result.planInfo.name,
                            restrictedModules: result.restrictedModules.length
                        }
                    )
                } else {
                    console.warn('⚠️ calculatePermissions retornó null')
                }
            } catch (error) {
                console.error('❌ Error auto-calculando permisos:', error)
            }
        }

        autoCalculatePermissions()
    }, [selectedCompany, selectedRole, mode, calculatePermissions])

    // Validación del formulario
    const validateForm = useCallback((): {
        isValid: boolean
        missingFields: string[]
    } => {
        const missingFields: string[] = []
        const { name, email, password, phone } = formData

        // Validación de información básica
        if (!name?.trim()) missingFields.push('Nombre completo')
        if (!email?.trim()) missingFields.push('Email')

        // Validación de contraseña
        if (mode === 'create') {
            if (!password || password.length < 8) {
                missingFields.push('Contraseña (mínimo 8 caracteres)')
            } else {
                const hasUpperCase = /[A-Z]/.test(password)
                const hasLowerCase = /[a-z]/.test(password)
                const hasNumber = /\d/.test(password)

                if (!hasUpperCase) missingFields.push('Contraseña (falta mayúscula)')
                if (!hasLowerCase) missingFields.push('Contraseña (falta minúscula)')
                if (!hasNumber) missingFields.push('Contraseña (falta número)')
            }
        } else if (mode === 'edit' && password && password.trim()) {
            if (password.length < 8) {
                missingFields.push('Contraseña (mínimo 8 caracteres)')
            } else {
                const hasUpperCase = /[A-Z]/.test(password)
                const hasLowerCase = /[a-z]/.test(password)
                const hasNumber = /\d/.test(password)

                if (!hasUpperCase) missingFields.push('Contraseña (falta mayúscula)')
                if (!hasLowerCase) missingFields.push('Contraseña (falta minúscula)')
                if (!hasNumber) missingFields.push('Contraseña (falta número)')
            }
        }

        // Validación de teléfono
        if (phone && phone.trim()) {
            const phoneRegex = /^(\+?56)?9\d{8}$/
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                missingFields.push('Teléfono (formato inválido)')
            }
        }

        // Validación de empresa y rol
        if (!selectedRole) missingFields.push('Rol')
        if (
            selectedRole !== UserRole.SUPER_ADMIN &&
            !companyScope &&
            !selectedCompany
        ) {
            missingFields.push('Empresa')
        }

        // Validación de permisos
        if (selectedPermissions.length === 0) {
            missingFields.push('Al menos un permiso')
        }

        return { isValid: missingFields.length === 0, missingFields }
    }, [formData, mode, selectedRole, selectedCompany, companyScope, selectedPermissions])

    // Validación en tiempo real
    const formValues = {
        formData,
        selectedRole,
        selectedCompany,
        selectedPermissions
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setValidationInProgress(true)
            const validation = validateForm()
            setIsFormValid(validation.isValid)
            setValidationInProgress(false)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [formValues, validateForm])

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isExplicitSubmitRef.current) {
            return
        }

        isExplicitSubmitRef.current = false

        const validation = validateForm()
        if (!validation.isValid) {
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
            return
        }

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

        const success =
            mode === 'edit' && user
                ? await handleUpdateUser(user._id, userData)
                : await handleCreateUser(userData)

        if (success) {
            onSuccess?.()
        }
    }

    /**
     * Obtiene los roles disponibles para asignar según el usuario actual
     * 
     * 🔒 RESTRICCIONES POR JERARQUÍA:
     * - Super Admin: Puede asignar todos los roles
     * - Admin Empresa: Solo manager, employee, viewer (en SU empresa)
     * - Manager: Solo employee, viewer (en SU empresa)
     * - Employee/Viewer: NO pueden crear usuarios
     * 
     * ✅ Compatible con sistema de módulos restringidos existente
     */
    const getAvailableRoles = () => {
        // Roles base según contexto
        let baseRoles = companyScope
            ? [
                UserRole.ADMIN_EMPRESA,
                UserRole.MANAGER,
                UserRole.EMPLOYEE,
                UserRole.VIEWER
            ]
            : Object.values(UserRole)

        // 🔒 FILTRO 1: Jerarquía de roles (nuevo)
        // Verificar si hay sesión y aplicar filtro jerárquico
        // TODO: Implementar cuando esté disponible la sesión del usuario actual
        // Por ahora, mantener comportamiento original para compatibilidad

        // 🔒 FILTRO 2: Módulos restringidos por plan (existente)
        // Si no hay módulos restringidos, mostrar todos los roles
        if (restrictedModules.length === 0) {
            return baseRoles
        }

        // Mapeo de roles a módulos requeridos
        const roleModuleRequirements: Record<UserRole, PlanFeatureKey[]> = {
            [UserRole.SUPER_ADMIN]: [], // Super admin no requiere módulos específicos
            [UserRole.ADMIN_EMPRESA]: [], // Admin empresa siempre disponible (usa módulos base)
            [UserRole.MANAGER]: ['inventoryManagement', 'reports'], // Requiere inventario y reportes
            [UserRole.EMPLOYEE]: ['inventoryManagement'], // Requiere inventario
            [UserRole.VIEWER]: [] // Viewer siempre disponible (solo lectura)
        }

        // Filtrar roles cuyos módulos requeridos NO estén restringidos
        const availableRoles = baseRoles.filter(role => {
            const requiredModules = roleModuleRequirements[role] || []
            // Si el rol no requiere módulos específicos, siempre está disponible
            if (requiredModules.length === 0) return true
            // Si algún módulo requerido está restringido, ocultar el rol
            const hasRestrictedModule = requiredModules.some(module =>
                restrictedModules.includes(module)
            )
            return !hasRestrictedModule
        })

        console.log('🎭 Roles filtrados:', {
            baseRoles: baseRoles.length,
            availableRoles: availableRoles.length,
            restrictedModules: restrictedModules.length,
            hidden: baseRoles.filter(r => !availableRoles.includes(r))
        })

        return availableRoles
    }

    /**
     * Obtiene los permisos disponibles para el rol seleccionado
     * Retorna TODOS los permisos del rol (sin filtrar por plan)
     * El filtrado se hace en PermissionSelector usando restrictedModules
     */
    const getAvailablePermissions = (): string[] => {
        // Si no hay rol seleccionado, retornar todos los permisos
        if (!selectedRole) {
            return selectedRole === UserRole.SUPER_ADMIN
                ? PermissionUtils.getAllGlobalPermissions()
                : PermissionUtils.getAllCompanyPermissions()
        }

        // Retornar los permisos por defecto del rol desde ROLE_PERMISSIONS
        const rolePermissions = ROLE_PERMISSIONS[selectedRole] || []

        console.log('📋 getAvailablePermissions para rol:', {
            role: selectedRole,
            rolePermissions: rolePermissions.length,
            permissions: rolePermissions
        })

        return rolePermissions
    }

    /**
     * Obtiene los permisos OBLIGATORIOS del rol (bloqueados, no se pueden quitar)
     * Estos son los permisos que fueron calculados automáticamente
     */
    const getMandatoryPermissions = (): string[] => {
        // En modo creación, los permisos calculados son obligatorios
        if (mode === 'create' && selectedPermissions.length > 0) {
            return selectedPermissions
        }
        return []
    }

    /**
     * Obtiene los permisos OPCIONALES disponibles en el plan
     * Son permisos adicionales que el SuperAdmin puede agregar si están en el plan
     */
    const getOptionalPermissions = (): string[] => {
        // Por ahora retornamos array vacío
        // En el futuro podríamos mostrar permisos adicionales del plan
        return []
    }

    // Indicador de validación
    const renderValidationIndicator = () => {
        if (isFormValid) {
            return (
                <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
                    <div className='flex items-center'>
                        <CheckCircleIcon className='w-5 h-5 text-green-600 mr-2' />
                        <p className='text-sm text-green-800'>
                            {mode === 'edit'
                                ? 'Formulario completo. Puedes actualizar el usuario.'
                                : 'Todos los campos requeridos están completos'}
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6'>
                <div className='flex items-center'>
                    <ExclamationTriangleIcon className='w-5 h-5 text-amber-600 mr-2' />
                    <p className='text-sm text-amber-800'>
                        {mode === 'edit'
                            ? 'Complete los campos obligatorios (nombre y email). La contraseña es opcional.'
                            : 'Complete todos los campos obligatorios para crear el usuario'}
                    </p>
                </div>
            </div>
        )
    }

    const modalTitle = mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'

    return (
        <>
            <div className='bg-white shadow-sm rounded-lg animate-fade-in'>
                {/* Header */}
                <div className='px-4 py-2 border-b border-gray-200'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h2 className='text-xl font-bold text-gray-900'>{modalTitle}</h2>
                            <p className='text-xs text-gray-600 mt-1'>
                                {mode === 'create'
                                    ? 'Complete todos los campos para registrar un nuevo usuario'
                                    : 'Modifique los campos necesarios para actualizar el usuario'}
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className='text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full'
                            type='button'
                            title='Cancelar y volver'
                        >
                            <XMarkIcon className='w-6 h-6' />
                        </button>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className='p-4'>
                    {/* Indicador de validación */}
                    {renderValidationIndicator()}

                    {/* Layout de 2 Columnas: Izquierda (Info + Empresa) | Derecha (Permisos) */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* COLUMNA IZQUIERDA: Información Básica + Empresa y Rol */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* SECCIÓN 1: Información Básica */}
                            <div className='space-y-4'>
                                <div className='border-b border-gray-200 pb-2'>
                                    <h3 className='text-lg font-medium text-gray-900'>
                                        📋 Información Básica
                                    </h3>
                                    <p className='text-sm text-gray-600 mt-1'>
                                        Datos personales del usuario
                                    </p>
                                </div>
                                {/* Formulario */}
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
                                            placeholder='+56912345678'
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
                                                    La contraseña actual se mantendrá sin cambios
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
                        </div>

                        {/* SECCIÓN 2: Empresa y Rol */}
                        <div className='lg:col-span-2 space-y-6'>
                            <div className='border-b border-gray-200 pb-2'>
                                <h3 className='text-lg font-medium text-gray-900'>
                                    🏢 Empresa y Rol
                                </h3>
                                <p className='text-sm text-gray-600 mt-1'>
                                    Asignación de empresa y rol específico
                                </p>
                            </div>

                            <div className='grid grid-cols-1 gap-4'>
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
                                    <p className='text-xs text-blue-600 mt-2'>
                                        Empresa: {selectedCompany || 'ninguna'} | Rol: {selectedRole}
                                    </p>
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
                                                    ✅ {selectedPermissions.length} permisos asignados automáticamente
                                                </p>
                                                <p className='text-xs text-green-600 mt-1'>
                                                    Según el rol &quot;{rolesTranslate[selectedRole]}&quot; y el plan &quot;{planInfo.name}&quot;
                                                </p>
                                                {restrictedModules.length > 0 && (
                                                    <p className='text-xs text-orange-600 mt-2'>
                                                        ⚠️ {restrictedModules.length} módulos no disponibles en este plan
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>


                        {/* Permisos */}
                        <div className="lg:col-span-4">
                            <div className='space-y-6'>
                                <div className='border-b border-gray-200 pb-2'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <h3 className='text-lg font-medium text-gray-900'>
                                                🔐 Permisos
                                            </h3>
                                            <p className='text-sm text-gray-600 mt-1'>
                                                {mode === 'create'
                                                    ? 'Los permisos obligatorios están bloqueados según el rol. Puedes agregar permisos adicionales si el plan lo permite.'
                                                    : 'Configuración de permisos del usuario'}
                                            </p>
                                        </div>
                                        <span className='text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded'>
                                            {selectedPermissions.length} permiso{selectedPermissions.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <PermissionSelector
                                    className='grid grid-cols-3 gap-4'
                                    selectedPermissions={selectedPermissions}
                                    availablePermissions={getAvailablePermissions()}
                                    onPermissionChange={setSelectedPermissions}
                                    isGlobal={selectedRole === UserRole.SUPER_ADMIN}
                                    restrictedModules={restrictedModules}
                                    showOnlyAvailable={true}
                                    mandatoryPermissions={getMandatoryPermissions()}
                                    optionalPermissions={getOptionalPermissions()}
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
                            </div>
                        </div>


                    </div>

                    {/* Botones de acción */}
                    <div className='flex items-center justify-between pt-6 border-t border-gray-200'>
                        <button
                            type='button'
                            onClick={onCancel}
                            disabled={isLoading}
                            className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50'
                        >
                            Cancelar
                        </button>

                        <div className='flex items-center gap-3'>
                            {validationInProgress && (
                                <div className='flex items-center gap-2 text-xs text-blue-600'>
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                    <span>Validando...</span>
                                </div>
                            )}

                            <button
                                type='submit'
                                onClick={() => {
                                    isExplicitSubmitRef.current = true
                                }}
                                disabled={isLoading || !isFormValid}
                                className={`px-6 py-2 rounded-md transition-colors ${!isLoading && isFormValid
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
                        </div>
                    </div>

                    {/* Ayuda contextual */}
                    <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
                        <div className='flex items-start gap-2'>
                            <svg
                                className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                />
                            </svg>
                            <div className='text-xs text-blue-800'>
                                <p className='font-medium'>
                                    Complete todos los campos requeridos marcados con *
                                </p>
                                <p className='text-xs mt-1 text-blue-600'>
                                    {mode === 'edit'
                                        ? 'Solo modifique los campos que desea actualizar'
                                        : 'Asegúrese de configurar correctamente los permisos del usuario'}
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Dialog de confirmación */}
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
