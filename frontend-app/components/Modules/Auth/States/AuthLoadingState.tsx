'use client'

import {ShieldCheckIcon, UserIcon} from '@heroicons/react/24/outline'

interface AuthLoadingStateProps {
  message?: string
  type?: 'login' | 'authenticating' | 'validating'
}

export function AuthLoadingState({
  message = 'Iniciando sesión...',
  type = 'login'
}: AuthLoadingStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'authenticating':
        return <ShieldCheckIcon className='w-8 h-8 text-green-500' />
      case 'validating':
        return <ShieldCheckIcon className='w-8 h-8 text-blue-500' />
      default:
        return <UserIcon className='w-8 h-8 text-purple-500' />
    }
  }

  const getMessage = () => {
    switch (type) {
      case 'authenticating':
        return message || 'Autenticando usuario...'
      case 'validating':
        return message || 'Validando credenciales...'
      default:
        return message || 'Iniciando sesión...'
    }
  }

  return (
    <>
      {/* Overlay de fondo */}
      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'>
        {/* Popup central */}
        <div className='bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full transform animate-pulse-scale'>
          <div className='flex flex-col items-center justify-center text-center'>
            {/* Icono con animación */}
            <div className='mb-6 relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-purple-600'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                {getIcon()}
              </div>
            </div>

            {/* Mensaje principal */}
            <h2 className='text-xl font-semibold text-gray-800 mb-3'>
              {getMessage()}
            </h2>

            {/* Submensaje */}
            <p className='text-gray-500 text-sm mb-6'>
              Por favor, espera un momento mientras procesamos tu solicitud
            </p>

            {/* Barra de progreso animada */}
            <div className='w-full bg-gray-200 rounded-full h-1.5 mb-4 overflow-hidden'>
              <div className='bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full animate-pulse-width'></div>
            </div>

            {/* Puntos animados */}
            <div className='flex space-x-1'>
              <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'></div>
              <div
                className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'
                style={{animationDelay: '0.1s'}}
              ></div>
              <div
                className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'
                style={{animationDelay: '0.2s'}}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS personalizado para animaciones */}
      <style jsx>{`
        @keyframes pulse-scale {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes pulse-width {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .animate-pulse-width {
          animation: pulse-width 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
