'use client'

import {useRouter} from 'next/navigation'
import {XCircleIcon} from '@heroicons/react/24/outline'

type InvalidTokenStateProps = {
  description?: string
  pathname: string
}

export function InvalidTokenState({
  pathname,
  description
}: InvalidTokenStateProps) {
  const router = useRouter()

  return (
    <div className='max-w-md w-full text-center'>
      <XCircleIcon className='w-16 h-16 text-red-500 mx-auto mb-4' />
      <h2 className='text-xl font-semibold text-gray-800 mb-4'>
        Token no válido
      </h2>
      <p className='text-gray-600 mb-6'>
        {description ||
          'El enlace de confirmación ha expirado o no es válido. Por favor, solicita un nuevo código para continuar.'}
      </p>
      <button
        onClick={() => router.push(pathname || '/auth/forgot-password')}
        className='w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'
      >
        Solicitar nuevo código
      </button>
    </div>
  )
}
