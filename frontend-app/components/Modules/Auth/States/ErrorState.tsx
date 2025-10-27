'use client'

import {useRouter} from 'next/navigation'
import {XCircleIcon} from '@heroicons/react/24/outline'

interface ErrorStateProps {
  error: string
}

export function ErrorState({error}: ErrorStateProps) {
  const router = useRouter()

  return (
    <div className='p-8 max-w-md w-full text-center'>
      <XCircleIcon className='w-16 h-16 text-red-500 mx-auto mb-4' />
      <h2 className='text-xl font-semibold text-gray-800 mb-4'>
        Error de validación
      </h2>
      <p className='text-red-500 mb-6'>{error}</p>
      <button
        onClick={() => router.push('/auth/request-code')}
        className='w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-md hover:bg-gradient-to-r hover:from-purple-700 hover:to-purple-900 transition-colors shadow-md'
      >
        Solicitar nuevo código
      </button>
    </div>
  )
}
