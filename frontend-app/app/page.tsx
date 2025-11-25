/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 * versión: 1.0.0
 * Descripción: Página de inicio de sesión y registro
 */
'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import AOS from 'aos'
import AuthView from '@/components/Modules/Auth/Views/AuthView'
import AuthGuard from '@/components/Modules/Auth/Protected/AuthGuard'

import RegisterView from '@/components/Modules/Auth/Views/RegisterView'
import LoginLayout from '@/components/Layout/LoginLayout'
import Logo from '@/components/Shared/Logo'

export default function Home() {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login')

  const handleViewChange = (view: 'login' | 'register') => {
    setCurrentView(view)
  }

  useEffect(() => {
    AOS.init()
  }, [])

  return (
    <AuthGuard
      requireAuth={false}
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Redirigiendo...</p>
          </div>
        </div>
      }
    >
      <div className='flex justify-center min-h-screen bg-gradient-to-tr from-slate-100 via-slate-2000 to-gray-400'>
        <LoginLayout />
        <div className='flex flex-col items-center justify-center w-full max-w-md mx-auto lg:w-2/6'>
          <Logo width={300} height={150} />
          {currentView === 'login' ? (
            <AuthView
              onRegisterClick={() => handleViewChange('register')}
              dataAOS='zoom-in'
            />
          ) : currentView === 'register' ? (
            <RegisterView
              onAuthClick={() => handleViewChange('login')}
              dataAOS='zoom-out'
            />
          ) : null}
        </div>
      </div>
    </AuthGuard>
  )
}
