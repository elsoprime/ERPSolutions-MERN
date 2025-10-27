'use client'

import {
  ArrowPathIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface LoginLoadingStateProps {
  message?: string
  type?: 'login' | 'authenticating' | 'processing'
  inline?: boolean
}

export function LoginLoadingState({
  message,
  type = 'login',
  inline = false
}: LoginLoadingStateProps) {
  const getIconAndMessage = () => {
    switch (type) {
      case 'authenticating':
        return {
          icon: <ShieldCheckIcon className='w-6 h-6 text-green-500' />,
          text: message || 'Autenticando usuario...'
        }
      case 'processing':
        return {
          icon: (
            <ArrowPathIcon className='w-6 h-6 text-blue-500 animate-spin' />
          ),
          text: message || 'Procesando solicitud...'
        }
      default:
        return {
          icon: <UserIcon className='w-6 h-6 text-purple-500' />,
          text: message || 'Iniciando sesión...'
        }
    }
  }

  const {icon, text} = getIconAndMessage()

  if (inline) {
    return (
      <div className='flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200'>
        <div className='animate-spin rounded-full h-5 w-5 border-2 border-purple-200 border-t-purple-600'></div>
        <span className='text-purple-700 font-medium'>{text}</span>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-auto'>
      <div className='flex flex-col items-center justify-center text-center'>
        {/* Spinner principal con icono */}
        <div className='relative mb-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-purple-600'></div>
          <div className='absolute inset-0 flex items-center justify-center'>
            {icon}
          </div>
        </div>

        {/* Mensaje */}
        <h3 className='text-lg font-semibold text-gray-700 mb-2'>{text}</h3>

        {/* Barra de progreso */}
        <div className='w-full bg-gray-200 rounded-full h-1 mb-3 overflow-hidden'>
          <div className='bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full w-full animate-pulse'></div>
        </div>

        <p className='text-gray-500 text-sm'>Un momento por favor...</p>
      </div>
    </div>
  )
}
