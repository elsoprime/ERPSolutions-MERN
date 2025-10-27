'use client'
import {useEffect, useState} from 'react'
import {PinInput, PinInputField} from '@chakra-ui/pin-input'
import {useMutation} from '@tanstack/react-query'
import bgImage from '@/public/images/BG004.webp'
import Logo from '@/components/Shared/Logo'
import {ConfirmToken} from '@/schemas/userSchema'
import {confirmAccount} from '@/api/AuthAPI'
import {toast} from 'react-toastify'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {ArrowPathIcon, CheckCircleIcon} from '@heroicons/react/24/outline'

type ConfirmViewProps = {
  token?: string
}

export default function ConfirmView({token: initialToken}: ConfirmViewProps) {
  const [token, setToken] = useState<ConfirmToken['token']>(initialToken || '')
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
  const router = useRouter()

  /**
   * Validar el token al cargar el componente
   * @author Esteban Leonardo Soto @elsoprimeDev
   */
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-token/${initialToken}`)
        if (!response.ok) {
          throw new Error('Token inválido')
        }
        setIsTokenValid(true)
      } catch (error) {
        setIsTokenValid(false)
        router.push('/auth/invalid-token')
      }
    }

    if (initialToken) {
      validateToken()
    }
  }, [initialToken])

  const mutation = useMutation({
    mutationFn: confirmAccount,
    onError: error => {
      toast.error(error.message)
      setToken('') // Limpiar el token en caso de error
    },
    onSuccess: data => {
      toast.success(data || 'Cuenta confirmada exitosamente')
      // Mostrar animación de éxito por 2 segundos antes de redirigir
      setTimeout(() => {
        router.push('/') // Redirigir al login después de la confirmación
      }, 2000)
    }
  })

  const handleChange = (token: ConfirmToken['token']) => {
    setToken(token)
  }
  const handleComplete = (token: ConfirmToken['token']) =>
    mutation.mutate({token})

  return (
    <div
      className='relative min-h-screen flex items-center justify-center bg-contain'
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className='absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/40 to-gray-900/60 backdrop-blur-md'></div>

      <div className='relative z-10 px-4 xl:px-0 w-full max-w-md mx-auto'>
        {/**Logo Personlizado */}
        <div className='-mt-36 relative justify-center mb-8'>
          <Logo width={300} height={250} />
        </div>

        <div className='bg-white/90 rounded-2xl shadow-2xl p-8 flex flex-col items-center'>
          <h2 className='text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text mb-6 text-center'>
            Confirmar Código
          </h2>
          <p className='text-gray-600 mb-8 text-center text-base'>
            Ingresa el código de 6 dígitos que recibiste en tu correo para
            activar tu cuenta.
          </p>
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
                  value={token}
                  onChange={handleChange}
                  onComplete={handleComplete}
                  isDisabled={mutation.isPending}
                >
                  <PinInputField className='w-12 h-12 text-center text-xl font-bold rounded-lg border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow placeholder-white transition-all duration-300 disabled:opacity-50' />
                  <PinInputField className='w-12 h-12 text-center text-xl font-bold rounded-lg border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow placeholder-white transition-all duration-300 disabled:opacity-50' />
                  <PinInputField className='w-12 h-12 text-center text-xl font-bold rounded-lg border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow placeholder-white transition-all duration-300 disabled:opacity-50' />
                  <PinInputField className='w-12 h-12 text-center text-xl font-bold rounded-lg border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow placeholder-white transition-all duration-300 disabled:opacity-50' />
                  <PinInputField className='w-12 h-12 text-center text-xl font-bold rounded-lg border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow placeholder-white transition-all duration-300 disabled:opacity-50' />
                  <PinInputField className='w-12 h-12 text-center text-xl font-bold rounded-lg border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow placeholder-white transition-all duration-300 disabled:opacity-50' />
                </PinInput>
              )}
            </div>
          </form>
          <div className='mt-4 py-2 text-slate-500 text-sm hover:text-purple-700 hover:cursor-pointer transition-colors'>
            <Link href='/auth/request-new-code'>¿No recibiste el código?</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
