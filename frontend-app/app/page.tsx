/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */
'use client'
import Image from 'next/image'
import {useEffect, useState} from 'react'
import AOS from 'aos'
import AuthView from '@/components/Auth/Views/AuthView'
import RecoveryView from '@/components/Auth/Views/RecoveryView'
import RegisterView from '@/components/Auth/Views/RegisterView'
import AuthBackground from '@/components/Layout/Background/AuthBackground'

export default function Home() {
  const [currentView, setCurrentView] = useState<
    'login' | 'register' | 'recovery'
  >('login')

  const handleViewChange = (view: 'login' | 'register' | 'recovery') => {
    setCurrentView(view)
  }

  useEffect(() => {
    AOS.init()
  }, [])

  return (
    <>
      <div className='flex justify-center min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200'>
        <AuthBackground />
        <div className='flex flex-col items-center justify-center w-full max-w-md mx-auto lg:w-2/6'>
          {currentView === 'login' ? (
            <AuthView
              onRegisterClick={() => handleViewChange('register')}
              onRecoveryClick={() => handleViewChange('recovery')}
              dataAOS='zoom-in'
            />
          ) : currentView === 'register' ? (
            <RegisterView
              onAuthClick={() => handleViewChange('login')}
              dataAOS='flip-up'
            />
          ) : (
            <RecoveryView
              onAuthClick={() => handleViewChange('login')}
              dataAOS='flip-left'
            />
          )}
        </div>
      </div>
    </>
  )
}
