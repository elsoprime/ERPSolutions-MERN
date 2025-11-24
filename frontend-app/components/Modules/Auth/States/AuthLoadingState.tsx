'use client'

import {
  ShieldCheckIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface AuthLoadingStateProps {
  message?: string
  type?: 'login' | 'authenticating' | 'validating' | 'logout' | 'processing'
}

/**
 * Componente reutilizable para mostrar estados de carga durante procesos de autenticación
 * @description Muestra un overlay con spinner y mensaje personalizado para login, logout y otros procesos
 * @param {string} message - Mensaje personalizado a mostrar
 * @param {'login' | 'authenticating' | 'validating' | 'logout' | 'processing'} type - Tipo de proceso
 * @author Esteban Soto Ojeda @elsoprimeDev
 * @version 2.0.0
 */
export function AuthLoadingState({
  message = 'Iniciando sesión...',
  type = 'login'
}: AuthLoadingStateProps) {
  const getIconAndColor = () => {
    switch (type) {
      case 'authenticating':
        return {
          icon: <ShieldCheckIcon className='w-8 h-8 text-green-500' />,
          spinnerColor: 'border-t-green-600',
          gradientColor: 'from-green-500 to-emerald-500',
          dotsColor: 'bg-green-500'
        }
      case 'validating':
        return {
          icon: <ShieldCheckIcon className='w-8 h-8 text-blue-500' />,
          spinnerColor: 'border-t-blue-600',
          gradientColor: 'from-blue-500 to-sky-500',
          dotsColor: 'bg-blue-500'
        }
      case 'logout':
        return {
          icon: (
            <ArrowRightOnRectangleIcon className='w-8 h-8 text-red-500' />
          ),
          spinnerColor: 'border-t-red-600',
          gradientColor: 'from-red-500 to-rose-500',
          dotsColor: 'bg-red-500'
        }
      case 'processing':
        return {
          icon: <ArrowPathIcon className='w-8 h-8 text-blue-500' />,
          spinnerColor: 'border-t-blue-600',
          gradientColor: 'from-blue-500 to-sky-500',
          dotsColor: 'bg-blue-500'
        }
      default:
        return {
          icon: <UserIcon className='w-8 h-8 text-purple-500' />,
          spinnerColor: 'border-t-purple-600',
          gradientColor: 'from-purple-500 to-blue-500',
          dotsColor: 'bg-purple-500'
        }
    }
  }

  const getMessage = () => {
    switch (type) {
      case 'authenticating':
        return message || 'Autenticando usuario...'
      case 'validating':
        return message || 'Validando credenciales...'
      case 'logout':
        return message || 'Cerrando sesión...'
      case 'processing':
        return message || 'Procesando solicitud...'
      default:
        return message || 'Iniciando sesión...'
    }
  }

  const { icon, spinnerColor, gradientColor, dotsColor } = getIconAndColor()

  return (
    <>
      {/* Overlay de fondo */}
      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'>
        {/* Popup central */}
        <div className='bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full transform animate-pulse-scale'>
          <div className='flex flex-col items-center justify-center text-center'>
            {/* Icono con animación */}
            <div className='mb-6 relative'>
              <div
                className={`animate-spin rounded-full h-16 w-16 border-4 border-gray-200 ${spinnerColor}`}
              ></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                {icon}
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
              <div
                className={`bg-gradient-to-r ${gradientColor} h-1.5 rounded-full animate-pulse-width`}
              ></div>
            </div>

            {/* Puntos animados */}
            <div className='flex space-x-1'>
              <div
                className={`w-2 h-2 ${dotsColor} rounded-full animate-bounce`}
              ></div>
              <div
                className={`w-2 h-2 ${dotsColor} rounded-full animate-bounce`}
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className={`w-2 h-2 ${dotsColor} rounded-full animate-bounce`}
                style={{ animationDelay: '0.2s' }}
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
