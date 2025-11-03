/**
 * Auth Loading Screen Component
 * @description: Pantalla de carga profesional para verificación de autenticación
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

'use client'

import React from 'react'

interface AuthLoadingScreenProps {
  message?: string
}

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  message = 'Verificando autenticación'
}) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000'></div>
      </div>

      {/* Main content */}
      <div className='relative z-10'>
        <div className='text-center'>
          {/* Logo/Brand area */}
          <div className='mb-8 relative'>
            <div className='absolute inset-0 blur-3xl opacity-30'>
              <div className='w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-400 rounded-full'></div>
            </div>
            <div className='relative'>
              <div className='w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-500 rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300'>
                <svg
                  className='w-16 h-16 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Animated spinner */}
          <div className='relative mb-8'>
            <div className='w-24 h-24 mx-auto relative'>
              {/* Outer ring */}
              <div className='absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin'></div>
              {/* Middle ring */}
              <div className='absolute inset-2 border-4 border-transparent border-t-indigo-400 border-l-pink-400 rounded-full animate-spin-slow'></div>
              {/* Inner ring */}
              <div className='absolute inset-4 border-4 border-transparent border-b-purple-600 rounded-full animate-spin-reverse'></div>
              {/* Center dot */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse'></div>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse'>
              {message}
            </h2>
            <p className='text-gray-600 text-sm font-medium'>
              Estamos preparando todo para ti
            </p>
          </div>

          {/* Loading dots */}
          <div className='flex justify-center items-center space-x-2 mt-6'>
            <div className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'></div>
            <div className='w-2 h-2 bg-indigo-500 rounded-full animate-bounce animation-delay-200'></div>
            <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-400'></div>
          </div>

          {/* Progress bar */}
          <div className='mt-8 w-64 mx-auto'>
            <div className='h-1 bg-gray-200 rounded-full overflow-hidden'>
              <div className='h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full animate-progress'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default AuthLoadingScreen
