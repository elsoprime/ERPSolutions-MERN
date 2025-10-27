/**
 * Confirmation Dialog Component
 * @description: Componente de diálogo reutilizable para confirmaciones de acciones
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Dialog, Transition} from '@headlessui/react'
import {
  ExclamationTriangleIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import {Fragment} from 'react'

export type ConfirmationDialogAction =
  | 'delete'
  | 'suspend'
  | 'reactivate'
  | 'edit'
  | 'view'
  | 'warning'
  | 'success'
  | 'error'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  action?: ConfirmationDialogAction
  loading?: boolean
  data?: any // Para pasar datos adicionales si es necesario
}

const getActionConfig = (action: ConfirmationDialogAction) => {
  const configs = {
    delete: {
      icon: TrashIcon,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      defaultConfirmText: 'Eliminar'
    },
    suspend: {
      icon: PauseIcon,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      defaultConfirmText: 'Suspender'
    },
    reactivate: {
      icon: PlayIcon,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      defaultConfirmText: 'Reactivar'
    },
    edit: {
      icon: PencilIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      defaultConfirmText: 'Editar'
    },
    view: {
      icon: EyeIcon,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      buttonColor: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
      defaultConfirmText: 'Ver'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      defaultConfirmText: 'Continuar'
    },
    success: {
      icon: CheckCircleIcon,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      defaultConfirmText: 'Aceptar'
    },
    error: {
      icon: XCircleIcon,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      defaultConfirmText: 'Entendido'
    }
  }

  return configs[action] || configs.warning
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Cancelar',
  action = 'warning',
  loading = false,
  data
}: ConfirmationDialogProps) {
  const config = getActionConfig(action)
  const Icon = config.icon

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                {/* Icono y título */}
                <div className='flex items-center space-x-4 mb-4'>
                  <div
                    className={`flex-shrink-0 w-12 h-12 mx-auto flex items-center justify-center rounded-full ${config.bgColor} ${config.borderColor} border`}
                  >
                    <Icon
                      className={`w-6 h-6 ${config.iconColor}`}
                      aria-hidden='true'
                    />
                  </div>
                  <div className='flex-1'>
                    <Dialog.Title
                      as='h3'
                      className='text-lg font-medium leading-6 text-gray-900'
                    >
                      {title}
                    </Dialog.Title>
                  </div>
                </div>

                {/* Mensaje */}
                <div className='mb-6'>
                  <div className='text-sm text-gray-500'>
                    {typeof message === 'string' ? <p>{message}</p> : message}
                  </div>
                </div>

                {/* Información adicional si hay data */}
                {data && (
                  <div
                    className={`mb-4 p-3 rounded-md ${config.bgColor} ${config.borderColor} border`}
                  >
                    <div className='text-sm'>
                      {typeof data === 'string' && (
                        <p className='font-medium'>{data}</p>
                      )}
                      {typeof data === 'object' && data.name && (
                        <div>
                          <p className='font-medium text-gray-900'>
                            {data.name}
                          </p>
                          {data.email && (
                            <p className='text-gray-600'>{data.email}</p>
                          )}
                          {data.details && (
                            <p className='text-gray-500 mt-1'>{data.details}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className='flex space-x-3 justify-end'>
                  <button
                    type='button'
                    className='inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    onClick={onClose}
                    disabled={loading}
                  >
                    {cancelText}
                  </button>
                  <button
                    type='button'
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonColor}`}
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className='flex items-center'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Procesando...
                      </div>
                    ) : (
                      confirmText || config.defaultConfirmText
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
