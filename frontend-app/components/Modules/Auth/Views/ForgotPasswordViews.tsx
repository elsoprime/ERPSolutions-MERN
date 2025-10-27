import Button from '@/components/Shared/Button'
import {ForgotPasswordForm} from '@/schemas/userSchema'
import {useForm} from 'react-hook-form'
import RecoveryForm from '../Forms/RecoveryForm'
import {useMutation} from '@tanstack/react-query'
import {toast} from 'react-toastify'
import {ArrowPathIcon} from '@heroicons/react/24/outline'
import {forgetPassword} from '@/api/AuthAPI'
import Link from 'next/link'
import {useState} from 'react'
import {AlreadyConfirmedState} from '../States/AlreadyConfirmedState'

/**
 * @description Componente de vista para la recuperación de contraseña.
 * Permite al usuario ingresar su correo electrónico para recibir instrucciones de recuperación.
 * Utiliza react-hook-form para la gestión del formulario y react-query para manejar la mutación de datos.
 * Muestra notificaciones de éxito o error utilizando react-toastify.
 * Redirige al usuario a la página de nueva contraseña después de enviar el formulario con éxito.
 * @returns Componente React que representa la vista de recuperación de contraseña.
 */

export default function ForgotPasswordViews() {
  const initialData: ForgotPasswordForm = {
    email: ''
  }

  const [isInstructionsSent, setIsInstructionsSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const {
    register,
    reset,
    handleSubmit,
    formState: {errors}
  } = useForm<ForgotPasswordForm>({defaultValues: initialData})

  const mutation = useMutation<string, Error, ForgotPasswordForm>({
    mutationFn: forgetPassword,
    onError: error => {
      toast.error(error.message)
    },
    onSuccess: data => {
      reset()
      setIsInstructionsSent(true)
    }
  })

  const onSubmit = (formdata: ForgotPasswordForm) => {
    setUserEmail(formdata.email)
    mutation.mutate(formdata)
  }

  return (
    <div className='relative z-10'>
      {isInstructionsSent ? (
        <AlreadyConfirmedState
          Encabezado='Instrucciones Enviadas'
          Subtitulo={`Hemos enviado las instrucciones de recuperación a ${userEmail}. Revisa tu bandeja de entrada y sigue las instrucciones.`}
          navigationPath='/auth/new-password'
        />
      ) : (
        <form
          className='px-0 md:px-6 py-3 w-80 md:w-96'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <RecoveryForm
            register={register}
            errors={errors}
            type='resetPassword'
          />
          <Button
            text={
              mutation.isPending ? (
                <span className='flex items-center justify-center gap-2'>
                  <ArrowPathIcon className='w-5 h-5 animate-spin' />
                  Enviando instrucciones...
                </span>
              ) : (
                'Recuperar Contraseña'
              )
            }
            type='submit'
            disabled={mutation.isPending}
            className='bg-gradient-to-r shadow-md from-green-500 via-green-600 to-green-700 text-white hover:transform hover:scale-105 transition-transform duration-300 disabled:opacity-70 disabled:cursor-not-allowed'
          />

          <div className='flex flex-col gap-4 items-center justify-center mt-2'>
            <Link
              className='mt-6 text-sm text-sky-500 hover:underline hover:text-orange-500 transition-colors duration-200'
              href='/'
            >
              ¿Ya Tienes una Cuenta?
            </Link>
            <Link
              className='text-sm text-sky-500 hover:underline hover:text-orange-500 transition-colors duration-200'
              href='/'
            >
              ¿No Tienes una Cuenta? Regístrate
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
