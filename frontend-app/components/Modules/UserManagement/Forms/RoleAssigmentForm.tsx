/**
 * RoleAssignmentForm Component
 * @description Formulario para asignar roles a usuarios con cálculo automático de permisos según plan
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { FormModal } from '@/components/Shared/FormModal'


import { useActiveCompanies } from '@/hooks/CompanyManagement/useCompanyManagement'
import { useRoleAssignment } from '@/hooks/useUserManagement'
import { usePermissionCalculator, PlanFeatureKey } from '@/hooks/usePermissionCalculator'
import { IEnhancedUser, RoleType, UserRole } from '@/interfaces/EnhanchedCompany/MultiCompany'
import { PermissionUtils, ROLE_PERMISSIONS } from '@/utils/permissions'
import { PermissionSelector, MODULE_TRANSLATIONS } from './UserForms'
import { RoleBadge } from '@/components/UI/MultiCompanyBadges'
import { rolesTranslate } from '@/locale/es'
import ConfirmationDialog from '@/components/Shared/ConfirmationDialog'

// ====== INTERFACES ======
interface RoleAssignmentProps {
    userId: string
    currentRoles: IEnhancedUser['roles']
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    currentUserRole?: UserRole // 🔒 Rol del usuario actual (quien asigna)
    currentUserCompanies?: string[] // 🔒 Empresas del usuario actual
}

// ====== COMPONENT ======
export const RoleAssignmentForm: React.FC<RoleAssignmentProps> = ({
    userId,
    currentRoles,
    isOpen,
    onClose,
    onSuccess,
    currentUserRole,
    currentUserCompanies = []
}) => {
    const { companies } = useActiveCompanies()
    const { handleAssignRole, handleRevokeRole, isLoading } = useRoleAssignment()
    const { calculatePermissions, isLoading: calculatingPermissions } = usePermissionCalculator()

    // 🎯 Estados para info del plan de la empresa seleccionada
    const [restrictedModules, setRestrictedModules] = useState<PlanFeatureKey[]>([])
    const [planInfo, setPlanInfo] = useState<{ name: string; type: string } | null>(null)

    // 🔒 Filtrar empresas según permisos del usuario actual
    const availableCompanies = useMemo(() => {
        if (!currentUserRole || currentUserRole === UserRole.SUPER_ADMIN || currentUserCompanies.length === 0) {
            return companies
        }
        return companies.filter(company => currentUserCompanies.includes(company._id))
    }, [companies, currentUserRole, currentUserCompanies])

    // 🔒 Obtener roles disponibles según jerarquía del usuario actual
    const availableRoles = useMemo(() => {
        const allRoles = [
            UserRole.ADMIN_EMPRESA,
            UserRole.MANAGER,
            UserRole.EMPLOYEE,
            UserRole.VIEWER
        ]

        if (!currentUserRole || currentUserRole === UserRole.SUPER_ADMIN) {
            return allRoles
        }

        if (currentUserRole === UserRole.ADMIN_EMPRESA) {
            return [UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.VIEWER]
        }

        if (currentUserRole === UserRole.MANAGER) {
            return [UserRole.EMPLOYEE, UserRole.VIEWER]
        }

        return []
    }, [currentUserRole])

    // 🔒 Filtrar roles según capacidad multi-empresa del usuario objetivo
    const filteredRoles = useMemo(() => {
        if (currentRoles.length === 0) {
            return availableRoles
        }

        const hasMultipleCompanyRoles = currentRoles.filter(r => r.roleType === RoleType.COMPANY).length > 0

        if (hasMultipleCompanyRoles) {
            const existingRole = currentRoles.find(r => r.isActive && r.roleType === RoleType.COMPANY)?.role

            if (existingRole === UserRole.EMPLOYEE || existingRole === UserRole.VIEWER) {
                return []
            }

            if (existingRole === UserRole.ADMIN_EMPRESA) {
                return availableRoles.filter(r =>
                    r === UserRole.ADMIN_EMPRESA || r === UserRole.MANAGER
                )
            }

            if (existingRole === UserRole.MANAGER) {
                return availableRoles.filter(r => r === UserRole.MANAGER)
            }
        }

        return availableRoles
    }, [availableRoles, currentRoles])

    const [selectedCompany, setSelectedCompany] = useState<string>('')
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VIEWER)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [showConfirmRevoke, setShowConfirmRevoke] = useState(false)
    const [roleToRevoke, setRoleToRevoke] = useState<number | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    // 🎯 Inicializar con el primer rol activo del usuario (si existe)
    useEffect(() => {
        if (isOpen && !isInitialized) {
            if (currentRoles.length > 0) {
                const firstActiveRole = currentRoles.find(role => role.isActive)

                if (firstActiveRole) {
                    if (firstActiveRole.companyId) {
                        const companyIdValue =
                            typeof firstActiveRole.companyId === 'object'
                                ? (firstActiveRole.companyId as any)._id ||
                                (firstActiveRole.companyId as any).id ||
                                (firstActiveRole.companyId as any).toString()
                                : firstActiveRole.companyId

                        setSelectedCompany(companyIdValue)
                    }

                    setSelectedRole(firstActiveRole.role as UserRole)

                    if (firstActiveRole.permissions && firstActiveRole.permissions.length > 0) {
                        setSelectedPermissions(firstActiveRole.permissions)
                    } else {
                        const defaultPerms = PermissionUtils.getDefaultPermissions(firstActiveRole.role as UserRole)
                        setSelectedPermissions(defaultPerms)
                    }

                    setIsInitialized(true)
                } else {
                    const defaultPerms = PermissionUtils.getDefaultPermissions(UserRole.VIEWER)
                    setSelectedPermissions(defaultPerms)
                    setIsInitialized(true)
                }
            } else {
                const defaultPerms = PermissionUtils.getDefaultPermissions(UserRole.VIEWER)
                setSelectedPermissions(defaultPerms)
                setIsInitialized(true)
            }
        }

        if (!isOpen) {
            if (isInitialized) {
                setIsInitialized(false)
            }
        }
    }, [isOpen, isInitialized, currentRoles])

    // 🎯 Auto-cargar permisos cuando cambia empresa o rol
    useEffect(() => {
        const loadPermissions = async () => {
            if (selectedCompany && selectedRole && isInitialized) {
                console.log(
                    `🔄 RoleAssignment - Cargando permisos para ${selectedRole} en empresa ${selectedCompany}`
                )

                const result = await calculatePermissions(selectedCompany, selectedRole)

                if (result) {
                    setSelectedPermissions(result.permissions)
                    setRestrictedModules(result.restrictedModules)
                    setPlanInfo(result.planInfo)

                    console.log('✅ RoleAssignment - Permisos cargados:', {
                        total: result.permissions.length,
                        plan: result.planInfo.name,
                        restrictedModules: result.restrictedModules.length,
                        empresa: selectedCompany
                    })
                } else {
                    console.warn('⚠️ RoleAssignment - No se pudieron cargar permisos')
                    const defaultPerms = PermissionUtils.getDefaultPermissions(selectedRole)
                    setSelectedPermissions(defaultPerms)
                    setRestrictedModules([])
                    setPlanInfo(null)
                }
            }
        }

        loadPermissions()
    }, [selectedCompany, selectedRole, isInitialized, calculatePermissions])

    // 🔍 Permisos disponibles basados en el plan
    const availablePermissions = useMemo(() => {
        if (selectedPermissions.length > 0) {
            return selectedPermissions
        }

        const roleKey = selectedRole as keyof typeof ROLE_PERMISSIONS
        return ROLE_PERMISSIONS[roleKey] || []
    }, [selectedPermissions, selectedRole])

    // 🔍 Verificar si el usuario ya tiene un rol en la empresa seleccionada
    const hasRoleInCompany = useMemo(() => {
        if (!selectedCompany) return false
        return currentRoles.some(
            role => role.companyId === selectedCompany && role.isActive
        )
    }, [selectedCompany, currentRoles])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedCompany || !selectedRole || selectedPermissions.length === 0) {
            return
        }

        const roleData = {
            roleType: RoleType.COMPANY,
            role: selectedRole,
            companyId: selectedCompany,
            permissions: selectedPermissions
        }

        const success = await handleAssignRole(userId, roleData)

        if (success) {
            handleClose()
            onSuccess?.()
        }
    }

    const handleRevokeClick = (index: number) => {
        setRoleToRevoke(index)
        setShowConfirmRevoke(true)
    }

    const confirmRevoke = async () => {
        if (roleToRevoke === null) return

        const success = await handleRevokeRole(userId, roleToRevoke)

        if (success) {
            setShowConfirmRevoke(false)
            setRoleToRevoke(null)
            onSuccess?.()
        }
    }

    const handleClose = () => {
        setSelectedCompany('')
        setSelectedRole(UserRole.VIEWER)
        setSelectedPermissions([])
        setShowConfirmRevoke(false)
        setRoleToRevoke(null)
        setIsInitialized(false)
        onClose()
    }

    return (
        <>
            <FormModal
                isOpen={isOpen}
                onClose={handleClose}
                title='Asignar Nuevo Rol'
                size='5xl'
            >
                <form onSubmit={handleSubmit} className='p-6'>
                    {/* Roles actuales */}
                    <div className='mb-6'>
                        <h4 className='text-sm font-medium text-gray-700 mb-3'>
                            Roles Actuales
                        </h4>
                        {currentRoles.length === 0 ? (
                            <div className='text-sm text-gray-500 italic'>
                                No hay roles asignados
                            </div>
                        ) : (
                            <div className='space-y-2'>
                                {currentRoles.map((roleAssignment, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'
                                    >
                                        <div className='flex items-center space-x-2'>
                                            <RoleBadge role={roleAssignment.role} size='sm' />
                                            {roleAssignment.companyId && (
                                                <span className='text-sm text-gray-600'>
                                                    en{' '}
                                                    {companies.find(c => c._id === roleAssignment.companyId)?.name || 'Empresa'}
                                                </span>
                                            )}
                                            {roleAssignment.permissions && roleAssignment.permissions.length > 0 && (
                                                <span className='text-xs text-gray-500'>
                                                    ({roleAssignment.permissions.length} permisos)
                                                </span>
                                            )}
                                            {!roleAssignment.isActive && (
                                                <span className='text-xs text-red-600 font-medium'>
                                                    (Inactivo)
                                                </span>
                                            )}
                                        </div>
                                        {roleAssignment.isActive && (
                                            <button
                                                type='button'
                                                onClick={() => handleRevokeClick(index)}
                                                disabled={isLoading}
                                                className='text-red-600 hover:text-red-800 text-sm font-medium transition-colors disabled:opacity-50'
                                            >
                                                Revocar
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className='bg-blue-50 border-l-4 border-blue-600 p-4 mb-6'>
                        <p className='text-sm text-blue-700'>
                            Selecciona la empresa y el rol adicional para este usuario. Los
                            permisos se cargarán automáticamente según el rol seleccionado.
                        </p>
                    </div>

                    {hasRoleInCompany && (
                        <div className='bg-amber-50 border-l-4 border-amber-400 p-4 mb-6'>
                            <p className='text-sm text-amber-800'>
                                ⚠️ El usuario ya tiene un rol activo en la empresa seleccionada.
                                Revoca el rol actual antes de asignar uno nuevo.
                            </p>
                        </div>
                    )}

                    <div className='space-y-4'>
                        {/** Selección de empresas y Roles */}
                        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {/** Selección de Empresa */}
                            <div>
                                <label
                                    htmlFor='role-assignment-company'
                                    className='block text-sm font-medium text-gray-700 mb-1'
                                >
                                    Empresa <span className='text-red-500'>*</span>
                                </label>
                                <select
                                    id='role-assignment-company'
                                    value={selectedCompany}
                                    onChange={e => setSelectedCompany(e.target.value)}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                    aria-label='Seleccionar empresa'
                                    disabled={isLoading}
                                >
                                    <option value=''>Seleccionar empresa...</option>
                                    {availableCompanies.map(company => (
                                        <option key={company._id} value={company._id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                                {availableCompanies.length === 0 && (
                                    <p className='mt-1 text-xs text-red-500'>
                                        No tienes permisos para asignar roles en ninguna empresa
                                    </p>
                                )}
                            </div>

                            {/** Selección de Rol */}
                            <div>
                                <label
                                    htmlFor='role-assignment-role'
                                    className='block text-sm font-medium text-gray-700 mb-1'
                                >
                                    Rol <span className='text-red-500'>*</span>
                                </label>
                                <select
                                    id='role-assignment-role'
                                    value={selectedRole}
                                    onChange={e => setSelectedRole(e.target.value as UserRole)}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                    aria-label='Seleccionar rol'
                                    disabled={isLoading || filteredRoles.length === 0}
                                >
                                    {filteredRoles.map(role => (
                                        <option key={role} value={role}>
                                            {rolesTranslate[role] || role}
                                        </option>
                                    ))}
                                </select>
                                {availableRoles.length === 0 && (
                                    <p className='mt-1 text-xs text-red-500'>
                                        Tu rol no tiene permisos para asignar roles
                                    </p>
                                )}
                                {filteredRoles.length === 0 && availableRoles.length > 0 && (
                                    <p className='mt-1 text-xs text-amber-600'>
                                        ⚠️ Este usuario no puede tener roles adicionales. Los roles Employee y Viewer solo pueden asignarse a una empresa.
                                    </p>
                                )}
                                {filteredRoles.length > 0 && (
                                    <p className='mt-1 text-xs text-gray-500'>
                                        Los permisos se ajustarán automáticamente según el rol
                                        seleccionado
                                    </p>
                                )}
                            </div>
                        </div>

                        {/** Indicador de información del plan */}
                        {planInfo && selectedCompany && (
                            <div className='bg-green-50 border border-green-200 p-3 rounded-md'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <svg
                                            className='w-5 h-5 text-green-600'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                            />
                                        </svg>
                                        <div>
                                            <p className='text-sm font-medium text-green-800'>
                                                {planInfo.name}
                                            </p>
                                            <p className='text-xs text-green-600'>
                                                {selectedPermissions.length} permisos disponibles para este rol
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/** Advertencia de módulos restringidos */}
                        {restrictedModules.length > 0 && selectedCompany && (
                            <div className='bg-amber-50 border border-amber-200 p-3 rounded-md'>
                                <div className='flex items-start gap-2'>
                                    <svg
                                        className='w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                                        />
                                    </svg>
                                    <div>
                                        <p className='text-sm font-medium text-amber-800'>
                                            Módulos restringidos por el plan
                                        </p>
                                        <p className='text-xs text-amber-600 mt-1'>
                                            Los siguientes módulos no están disponibles: {restrictedModules.map(m => MODULE_TRANSLATIONS[m]).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/** Indicador de carga */}
                        {calculatingPermissions && (
                            <div className='bg-blue-50 border border-blue-200 p-3 rounded-md'>
                                <div className='flex items-center gap-2'>
                                    <svg
                                        className='animate-spin h-5 w-5 text-blue-600'
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle
                                            className='opacity-25'
                                            cx='12'
                                            cy='12'
                                            r='10'
                                            stroke='currentColor'
                                            strokeWidth='4'
                                        ></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    <p className='text-sm text-blue-700'>
                                        Calculando permisos según el plan de la empresa...
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <div className='flex items-center justify-between mb-3'>
                                <h4 className='text-sm font-medium text-gray-700'>
                                    Permisos{' '}
                                    <span className='text-xs text-gray-500 font-normal'>
                                        ({selectedPermissions.length} seleccionados)
                                    </span>
                                </h4>
                                <button
                                    type='button'
                                    onClick={() => {
                                        const defaultPerms = PermissionUtils.getDefaultPermissions(selectedRole)
                                        setSelectedPermissions(defaultPerms)
                                    }}
                                    className='text-xs text-blue-600 hover:text-blue-800 font-medium'
                                    disabled={isLoading || calculatingPermissions}
                                >
                                    Restaurar permisos por defecto
                                </button>
                            </div>

                            <PermissionSelector
                                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
                                selectedPermissions={selectedPermissions}
                                availablePermissions={availablePermissions as string[]}
                                onPermissionChange={setSelectedPermissions}
                                isGlobal={false}
                                restrictedModules={restrictedModules}
                                disabled={calculatingPermissions}
                            />

                            {selectedPermissions.length === 0 && (
                                <p className='mt-2 text-sm text-amber-600'>
                                    ⚠️ Selecciona al menos un permiso para continuar
                                </p>
                            )}
                        </div>
                    </div>

                    <div className='flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200'>
                        <button
                            type='button'
                            onClick={handleClose}
                            disabled={isLoading}
                            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50'
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={
                                isLoading ||
                                calculatingPermissions ||
                                !selectedCompany ||
                                !selectedRole ||
                                selectedPermissions.length === 0 ||
                                hasRoleInCompany
                            }
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${!isLoading &&
                                !calculatingPermissions &&
                                selectedCompany &&
                                selectedRole &&
                                selectedPermissions.length > 0 &&
                                !hasRoleInCompany
                                ? 'text-white bg-blue-600 hover:bg-blue-700'
                                : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? 'Asignando...' : calculatingPermissions ? 'Calculando...' : 'Asignar Rol'}
                        </button>
                    </div>
                </form>
            </FormModal>

            {/* Dialog de confirmación para revocar */}
            <ConfirmationDialog
                isOpen={showConfirmRevoke}
                onClose={() => {
                    setShowConfirmRevoke(false)
                    setRoleToRevoke(null)
                }}
                onConfirm={confirmRevoke}
                title='Revocar Rol'
                message='¿Estás seguro de que deseas revocar este rol? El usuario perderá todos los permisos asociados en esta empresa.'
                confirmText='Revocar'
                action='delete'
                loading={isLoading}
            />
        </>
    )
}

export default RoleAssignmentForm
