/**
 * Change Password Form Component
 * @description: Formulario dedicado para cambio de contraseña de usuario
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

'use client'

import React, {useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {toast} from 'react-toastify'
import MultiCompanyAPI from '@/api/MultiCompanyAPI'
import FormModal from '@/components/Shared/FormModal'
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface ChangePasswordFormProps {
  userId: string
  userName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: 'Mínimo 8 caracteres',
    test: pwd => pwd.length >= 8
  },
  {
    label: 'Al menos una mayúscula',
    test: pwd => /[A-Z]/.test(pwd)
  },
  {
    label: 'Al menos una minúscula',
    test: pwd => /[a-z]/.test(pwd)
  },
  {
    label: 'Al menos un número',
    test: pwd => /\d/.test(pwd)
  }
]

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  userId,
  userName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient()

  // Form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Mutation para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: async (passwords: {
      currentPassword: string
      newPassword: string
      confirmPassword: string
    }) => {
      return await MultiCompanyAPI.changeUserPassword(userId, passwords)
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada exitosamente')
      queryClient.invalidateQueries({queryKey: ['users']})
      resetForm()
      onSuccess?.()
      onClose()
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || 'Error al cambiar la contraseña'
      toast.error(errorMessage)
    }
  })

  const resetForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones del lado del cliente
    if (!currentPassword.trim()) {
      toast.error('La contraseña actual es requerida')
      return
    }

    if (!newPassword.trim()) {
      toast.error('La nueva contraseña es requerida')
      return
    }

    if (!confirmPassword.trim()) {
      toast.error('La confirmación de contraseña es requerida')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('La nueva contraseña y la confirmación no coinciden')
      return
    }

    // Validar requisitos
    const allRequirementsMet = PASSWORD_REQUIREMENTS.every(req =>
      req.test(newPassword)
    )

    if (!allRequirementsMet) {
      toast.error('La nueva contraseña no cumple con todos los requisitos')
      return
    }

    if (currentPassword === newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual')
      return
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword
    })
  }

  const getPasswordStrength = (
    password: string
  ): {
    level: number
    label: string
    color: string
  } => {
    const metRequirements = PASSWORD_REQUIREMENTS.filter(req =>
      req.test(password)
    ).length

    if (metRequirements === 0)
      return {level: 0, label: '', color: 'bg-gray-300'}
    if (metRequirements === 1)
      return {level: 25, label: 'Débil', color: 'bg-red-500'}
    if (metRequirements === 2)
      return {level: 50, label: 'Regular', color: 'bg-yellow-500'}
    if (metRequirements === 3)
      return {level: 75, label: 'Buena', color: 'bg-blue-500'}
    return {level: 100, label: 'Fuerte', color: 'bg-green-500'}
  }

  const passwordStrength = getPasswordStrength(newPassword)

  if (!isOpen) return null

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title='Cambiar Contraseña'
      size='lg'
    >
      <form onSubmit={handleSubmit} className='p-6'>
        {/* Header Info */}
        <div className='mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded'>
          <div className='flex items-start'>
            <KeyIcon className='w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0' />
            <div>
              <h4 className='text-sm font-medium text-blue-900'>
                Cambiar contraseña para: {userName}
              </h4>
              <p className='text-xs text-blue-700 mt-1'>
                Se requiere la contraseña actual para realizar este cambio
              </p>
            </div>
          </div>
        </div>

        <div className='space-y-5'>
          {/* Current Password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Contraseña Actual *
            </label>
            <div className='relative'>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ingresa la contraseña actual'
                autoComplete='current-password'
              />
              <button
                type='button'
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
              >
                {showCurrentPassword ? (
                  <EyeSlashIcon className='w-5 h-5' />
                ) : (
                  <EyeIcon className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Nueva Contraseña *
            </label>
            <div className='relative'>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ingresa la nueva contraseña'
                autoComplete='new-password'
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
              >
                {showNewPassword ? (
                  <EyeSlashIcon className='w-5 h-5' />
                ) : (
                  <EyeIcon className='w-5 h-5' />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className='mt-2'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-gray-600'>
                    Fortaleza de contraseña:
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.level === 100
                        ? 'text-green-600'
                        : passwordStrength.level >= 75
                        ? 'text-blue-600'
                        : passwordStrength.level >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{width: `${passwordStrength.level}%`}}
                  />
                </div>
              </div>
            )}

            {/* Password Requirements */}
            <div className='mt-3 space-y-1'>
              <p className='text-xs font-medium text-gray-600'>
                Requisitos de contraseña:
              </p>
              {PASSWORD_REQUIREMENTS.map((req, index) => {
                const isMet = req.test(newPassword)
                return (
                  <div key={index} className='flex items-center space-x-2'>
                    {isMet ? (
                      <CheckCircleIcon className='w-4 h-4 text-green-600' />
                    ) : (
                      <XCircleIcon className='w-4 h-4 text-gray-400' />
                    )}
                    <span
                      className={`text-xs ${
                        isMet ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {req.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Confirmar Nueva Contraseña *
            </label>
            <div className='relative'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  confirmPassword &&
                  newPassword &&
                  confirmPassword !== newPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder='Confirma la nueva contraseña'
                autoComplete='new-password'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className='w-5 h-5' />
                ) : (
                  <EyeIcon className='w-5 h-5' />
                )}
              </button>
            </div>
            {confirmPassword &&
              newPassword &&
              confirmPassword !== newPassword && (
                <p className='mt-1 text-xs text-red-600 flex items-center'>
                  <XCircleIcon className='w-4 h-4 mr-1' />
                  Las contraseñas no coinciden
                </p>
              )}
            {confirmPassword &&
              newPassword &&
              confirmPassword === newPassword && (
                <p className='mt-1 text-xs text-green-600 flex items-center'>
                  <CheckCircleIcon className='w-4 h-4 mr-1' />
                  Las contraseñas coinciden
                </p>
              )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200'>
          <button
            type='button'
            onClick={handleClose}
            disabled={changePasswordMutation.isPending}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={
              changePasswordMutation.isPending ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              !PASSWORD_REQUIREMENTS.every(req => req.test(newPassword))
            }
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
          >
            {changePasswordMutation.isPending ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                Cambiando...
              </>
            ) : (
              <>
                <KeyIcon className='w-4 h-4 mr-2' />
                Cambiar Contraseña
              </>
            )}
          </button>
        </div>
      </form>
    </FormModal>
  )
}

export default ChangePasswordForm
