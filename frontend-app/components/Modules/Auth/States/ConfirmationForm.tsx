'use client'

import {useRouter} from 'next/navigation'
import {useMutation} from '@tanstack/react-query'
import {confirmAccount} from '@/api/AuthAPI'
import {toast} from 'react-toastify'
import {ArrowPathIcon} from '@heroicons/react/24/outline'

interface ConfirmationFormProps {
  token: string
  user?: {
    email: string
    name: string
  }
}

export function ConfirmationForm({user}: ConfirmationFormProps) {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: confirmAccount,
    onSuccess: message => {
      toast.success(message || '¡Cuenta confirmada exitosamente!')
      setTimeout(() => router.push('/auth/login'), 2000)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al confirmar la cuenta')
    }
  })

  return (
    <div className='bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center'>
      <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
        Confirmar cuenta
      </h2>
      {user && (
        <div className='mb-6'>
          <p className='text-gray-600 mb-2'>
            Hola{' '}
            <span className='font-semibold text-purple-600'>{user.name}</span>,
          </p>
          <p className='text-gray-600'>estás a un paso de activar tu cuenta.</p>
          <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
            <p className='text-sm text-gray-500'>
              <span className='font-semibold'>Email:</span> {user.email}
            </p>
          </div>
        </div>
      )}
      <button
        onClick={() => mutation.mutate({token: user ? '' : ''})}
        disabled={mutation.isPending}
        className='w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
      >
        {mutation.isPending ? (
          <span className='flex items-center justify-center gap-2'>
            <ArrowPathIcon className='w-5 h-5 animate-spin' />
            Confirmando...
          </span>
        ) : (
          'Confirmar cuenta'
        )}
      </button>
    </div>
  )
}
