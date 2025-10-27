/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import {useMutation} from '@tanstack/react-query'
import {UserLoginForm} from '@/schemas/userSchema'
import LoginForm from '../Forms/LoginForm'
import {useForm} from 'react-hook-form'
import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import Button from '@/components/Shared/Button'
import {authenticateUser} from '@/api/AuthAPI'
import {toast} from 'react-toastify'
import {LoginLoadingState} from '../States/LoginLoadingState'
import {getDefaultRoute} from '@/utils/roleRouting'

type AuthViewProps = {
  onRegisterClick: () => void
  dataAOS: string
}

export default function AuthView({onRegisterClick, dataAOS}: AuthViewProps) {
  const router = useRouter()

  const initialData: UserLoginForm = {
    email: '',
    password: ''
  }
  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<UserLoginForm>({defaultValues: initialData})

  const mutation = useMutation({
    mutationFn: authenticateUser,
    onSuccess: data => {
      console.log('Login exitoso:', data)
      toast.success('Credenciales válidas, bienvenido de nuevo!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      })

      // Redirigir directamente al dashboard apropiado según el rol
      setTimeout(() => {
        try {
          // 🔥 FIX: Usar la clave correcta 'USER_DATA' para coincidir con AuthAPI.ts
          const userDataStr = localStorage.getItem('USER_DATA')
          if (userDataStr) {
            const userData = JSON.parse(userDataStr)
            const targetRoute = getDefaultRoute(userData)
            console.log('Redirigiendo directamente a:', targetRoute)
            console.log('Datos del usuario:', userData)
            router.push(targetRoute)
          } else {
            // Intentar obtener datos del usuario actual si no están en localStorage
            console.log(
              'No hay datos en localStorage, intentando obtener del token...'
            )

            // Si hay token pero no datos, usar fallback
            const token = localStorage.getItem('AUTH_TOKEN_VALIDATE')
            if (token) {
              console.log('Hay token válido, redirigiendo a /home')
              router.push('/home')
            } else {
              // Fallback a dashboard si no hay datos de usuario
              console.log('Fallback: Redirigiendo a /dashboard...')
              router.push('/dashboard/viewer')
            }
          }
        } catch (error) {
          console.error('Error al obtener ruta de destino:', error)
          router.push('/dashboard/viewer')
        }
      }, 1500)
    },
    onError: (error: Error) => {
      console.error('Error en login:', error)
      // Personalizar el estilo del toast según el tipo de error
      if (
        error.message.includes('no encontrado') ||
        error.message.includes('inválidas')
      ) {
        toast.error(error.message, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
      } else if (error.message.includes('conexión')) {
        toast.error(error.message, {
          position: 'top-right',
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: true
        })
      } else {
        toast.error(error.message)
      }
    }
  })

  const onSubmit = (formData: UserLoginForm) => {
    mutation.mutate(formData)
  }

  useEffect(() => {
    console.log('Iniciando Sesión:', initialData)
  }, [])

  return (
    <>
      {/* Overlay de loading cuando está autenticando */}
      {mutation.isPending && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <LoginLoadingState
            type='authenticating'
            message='Verificando credenciales...'
          />
        </div>
      )}

      <div className='relative' data-aos={dataAOS}>
        <form
          className='px-0 lg:px-6 py-3 w-80 md:w-96'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <LoginForm register={register} errors={errors} />
          <Button
            text={mutation.isPending ? 'Autenticando...' : 'Iniciar Sesión'}
            type='submit'
            disabled={mutation.isPending}
            className={`${
              mutation.isPending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-l from-sky-600 to-sky-500 hover:transform hover:scale-105'
            } shadow-lg text-white transition-all duration-300`}
          />
          <div className='flex items-center justify-center mt-2'>
            <button
              className={`text-sm ${
                mutation.isPending
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-500 hover:text-purple-700 hover:underline hover:transform hover:scale-105'
              } transition-all duration-300`}
              type='button'
              onClick={onRegisterClick}
              disabled={mutation.isPending}
            >
              ¿No Tienes una Cuenta?
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
