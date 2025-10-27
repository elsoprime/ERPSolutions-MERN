'use client'
import {useState} from 'react'
import {PinInput, PinInputField} from '@chakra-ui/pin-input'
import {useMutation} from '@tanstack/react-query'
import {ConfirmToken} from '@/schemas/userSchema'
import {validateToken} from '@/api/AuthAPI'
import {toast} from 'react-toastify'
import Link from 'next/link'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

type NewPasswordTokenProps = {
  token: ConfirmToken['token']
  setToken: React.Dispatch<React.SetStateAction<ConfirmToken['token']>>
  setTokenStatus: React.Dispatch<
    React.SetStateAction<'pending' | 'loading' | 'valid' | 'invalid'>
  >
}

export default function NewPasswordToken({
  token,
  setToken,
  setTokenStatus
}: NewPasswordTokenProps) {
  const [localToken, setLocalToken] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [key, setKey] = useState(0)
  const maxAttempts = 3
  const mutation = useMutation({
    mutationFn: validateToken,
    onError: error => {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= maxAttempts) {
        setIsBlocked(true)
        toast.error(
          `Has agotado tus ${maxAttempts} intentos. Solicita un nuevo código.`
        )
        setTokenStatus('invalid')
      } else {
        const remainingAttempts = maxAttempts - newAttempts
        toast.error(
          `${error.message} Te quedan ${remainingAttempts} ${
            remainingAttempts === 1 ? 'intento' : 'intentos'
          }.`
        )
        // Limpiar campos y forzar re-render
        setLocalToken('')
        setToken('')
        setKey(prev => prev + 1)
      }
    },
    onSuccess: data => {
      toast.success(data.message)
      setAttempts(0)
      // Mostrar loading brevemente antes de cambiar a válido
      setTokenStatus('loading')
      setTimeout(() => {
        setTokenStatus('valid')
      }, 1500)
    }
  })

  const handleChange = (value: string) => {
    setLocalToken(value)
    setToken(value)
  }

  const handleComplete = (completedToken: string) => {
    if (isBlocked) {
      toast.warning('Has agotado tus intentos. Solicita un nuevo código.')
      return
    }
    mutation.mutate({token: completedToken})
  }

  return (
    <>
      <div className='bg-white/90 rounded-2xl shadow-2xl p-8 flex flex-col items-center'>
        <h2 className='text-4xl font-poppins font-black bg-gradient-to-r from-purple-600 to-orange-300 text-transparent bg-clip-text mb-6 text-center'>
          Restablece tu Contraseña
        </h2>
        <p className='text-gray-600 mb-4 text-center text-base'>
          Ingresa el código de 6 dígitos que{' '}
          <span className='block text-purple-600 font-bold'>
            recibiste en tu correo
          </span>
        </p>

        {/* Contador de intentos */}
        {attempts > 0 && !isBlocked && (
          <div className='mb-4 flex items-center justify-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg'>
            <ExclamationTriangleIcon className='w-5 h-5' />
            <span className='text-sm font-medium'>
              Intentos restantes: {maxAttempts - attempts}
            </span>
          </div>
        )}

        {/* Estado bloqueado */}
        {isBlocked && (
          <div className='mb-4 flex items-center justify-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg'>
            <ExclamationTriangleIcon className='w-5 h-5' />
            <span className='text-sm font-medium'>
              Intentos agotados. Solicita un nuevo código.
            </span>
          </div>
        )}
        <form className='flex flex-col gap-6 w-full items-center'>
          <div className='flex justify-center gap-3'>
            {mutation.isPending ? (
              <div className='flex items-center gap-2 text-purple-600'>
                <ArrowPathIcon className='w-6 h-6 animate-spin' />
                <span>Verificando código...</span>
              </div>
            ) : mutation.isSuccess ? (
              <div className='flex items-center gap-2 text-green-600 animate-bounce'>
                <CheckCircleIcon className='w-6 h-6' />
                <span>¡Código verificado!</span>
              </div>
            ) : (
              <PinInput
                key={key}
                value={localToken}
                onChange={handleChange}
                onComplete={handleComplete}
                isDisabled={mutation.isPending || isBlocked}
                manageFocus={true}
              >
                <PinInputField
                  className={`w-12 h-12 text-center text-xl font-bold rounded-lg border focus:outline-none focus:ring-2 bg-white shadow transition-all duration-300 disabled:opacity-50 ${
                    isBlocked
                      ? 'border-red-400 focus:ring-red-500 disabled:bg-red-50'
                      : 'border-purple-400 focus:ring-purple-500'
                  }`}
                />
                <PinInputField
                  className={`w-12 h-12 text-center text-xl font-bold rounded-lg border focus:outline-none focus:ring-2 bg-white shadow transition-all duration-300 disabled:opacity-50 ${
                    isBlocked
                      ? 'border-red-400 focus:ring-red-500 disabled:bg-red-50'
                      : 'border-purple-400 focus:ring-purple-500'
                  }`}
                />
                <PinInputField
                  className={`w-12 h-12 text-center text-xl font-bold rounded-lg border focus:outline-none focus:ring-2 bg-white shadow transition-all duration-300 disabled:opacity-50 ${
                    isBlocked
                      ? 'border-red-400 focus:ring-red-500 disabled:bg-red-50'
                      : 'border-purple-400 focus:ring-purple-500'
                  }`}
                />
                <PinInputField
                  className={`w-12 h-12 text-center text-xl font-bold rounded-lg border focus:outline-none focus:ring-2 bg-white shadow transition-all duration-300 disabled:opacity-50 ${
                    isBlocked
                      ? 'border-red-400 focus:ring-red-500 disabled:bg-red-50'
                      : 'border-purple-400 focus:ring-purple-500'
                  }`}
                />
                <PinInputField
                  className={`w-12 h-12 text-center text-xl font-bold rounded-lg border focus:outline-none focus:ring-2 bg-white shadow transition-all duration-300 disabled:opacity-50 ${
                    isBlocked
                      ? 'border-red-400 focus:ring-red-500 disabled:bg-red-50'
                      : 'border-purple-400 focus:ring-purple-500'
                  }`}
                />
                <PinInputField
                  className={`w-12 h-12 text-center text-xl font-bold rounded-lg border focus:outline-none focus:ring-2 bg-white shadow transition-all duration-300 disabled:opacity-50 ${
                    isBlocked
                      ? 'border-red-400 focus:ring-red-500 disabled:bg-red-50'
                      : 'border-purple-400 focus:ring-purple-500'
                  }`}
                />
              </PinInput>
            )}
          </div>
        </form>
        <div className='mt-4 py-2 text-slate-500 text-sm hover:text-purple-700 hover:cursor-pointer transition-colors'>
          <Link href='/auth/forgot-password'>¿No recibiste el código?</Link>
        </div>
      </div>
    </>
  )
}
