/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev6
 */

'use client'
import {UserRegistrationForm} from '@/schemas/userSchema'
import {useForm} from 'react-hook-form'
import {useEffect} from 'react'
import RegisterForm from '../Forms/RegisterForm'
import Button from '@/components/Shared/Button'
import {useMutation} from '@tanstack/react-query'
import {createAccount} from '@/api/AuthAPI'
import {toast} from 'react-toastify'
import {ArrowPathIcon} from '@heroicons/react/24/outline'

type RegisterViewProps = {
  onAuthClick: () => void
  dataAOS: string
}

export default function RegisterView({
  onAuthClick,
  dataAOS
}: RegisterViewProps) {
  const initialData: UserRegistrationForm = {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors}
  } = useForm<UserRegistrationForm>({defaultValues: initialData})

  /**
   * Crear la mutacion para registrar el usuario
   * @author Esteban Leonardo Soto @elsoprimeDev
   */
  const mutation = useMutation<string, Error, UserRegistrationForm>({
    mutationFn: createAccount,
    onError: error => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success(
        'Usuario registrado exitosamente, revisa tu email para activar tu cuenta'
      )
      reset()
      // Redirigir al login después de 800 milisegundos
      setTimeout(() => {
        onAuthClick()
      }, 800)
    }
  })

  const onSubmit = (data: UserRegistrationForm) => {
    if (data.password !== data.passwordConfirmation) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    mutation.mutate(data)
  }

  useEffect(() => {
    console.log('Registrando Usuario:', initialData)
  }, [])

  return (
    <div className='relative' data-aos={dataAOS}>
      <form
        className='px-0 lg:px-6 py-3 w-80 md:w-96'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <RegisterForm register={register} errors={errors} />
        <Button
          text={
            mutation.isPending ? (
              <span className='flex items-center justify-center gap-2'>
                <ArrowPathIcon className='w-5 h-5 animate-spin' />
                Registrando cuenta...
              </span>
            ) : (
              'Registrarse'
            )
          }
          type='submit'
          disabled={mutation.isPending}
          className='bg-gradient-to-r shadow-md from-purple-400 via-purple-600 to-purple-800 text-white hover:transform hover:scale-105 transition-transform duration-300 disabled:opacity-70 disabled:cursor-not-allowed'
        />

        <div className='flex items-center justify-center mt-2'>
          <button
            className='text-sm text-blue-500 hover:underline'
            type='button'
            onClick={onAuthClick}
          >
            ¿Ya Tienes una Cuenta?
          </button>
        </div>
      </form>
    </div>
  )
}
