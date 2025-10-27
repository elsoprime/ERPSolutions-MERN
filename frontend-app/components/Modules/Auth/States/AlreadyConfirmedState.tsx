// Components/Modules/Auth/States/AlreadyConfirmedState.tsx
'use client'

import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {CheckCircleIcon} from '@heroicons/react/24/outline'

interface AlreadyConfirmedStateProps {
  Encabezado?: string
  Subtitulo?: string
  navigationPath?: string
  user?: {
    email: string
    name: string
  }
}

export function AlreadyConfirmedState({
  user,
  Encabezado,
  Subtitulo,
  navigationPath
}: AlreadyConfirmedStateProps) {
  const router = useRouter()

  useEffect(() => {
    // Redirigir al login después de 3 segundos
    const timer = setTimeout(() => {
      router.push(navigationPath || '/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router, navigationPath])

  return (
    <div className='max-w-md w-full text-center'>
      <CheckCircleIcon className='w-16 h-16 text-green-500 mx-auto mb-4' />
      <h2 className='text-xl font-semibold text-gray-800 mb-2'>
        {Encabezado || 'Cuenta Ya Confirmada'}
      </h2>
      {user && (
        <p className='text-gray-600 mb-4'>
          Hola <span className='font-semibold'>{user.name}</span>, tu cuenta ya
          está activa.
        </p>
      )}
      <p className='text-gray-500 mb-4'>
        {Subtitulo ||
          'Serás redirigido al inicio de sesión en unos segundos...'}
      </p>
      <div className='flex justify-center'>
        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600'></div>
      </div>
    </div>
  )
}
