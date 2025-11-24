/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

import Button from '@/components/Shared/Button'
import { RequestConfirmationCodeForm } from '@/schemas/userSchema'
import { useForm } from 'react-hook-form'
import RecoveryForm from '../Forms/RecoveryForm'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { requestConfirmationCode } from '@/api/AuthAPI'

type RequestCodeProps = {
  onAuthClick: () => void
  dataAOS: string
}

export default function RequestNewCodeViews({
  onAuthClick,
  dataAOS
}: RequestCodeProps) {
  const router = useRouter()
  const initialData: RequestConfirmationCodeForm = {
    email: ''
  }

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RequestConfirmationCodeForm>({ defaultValues: initialData })

  const mutation = useMutation<string, Error, RequestConfirmationCodeForm>({
    mutationFn: requestConfirmationCode,
    onError: error => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success(
        'Se ha enviado un correo con las instrucciones de recuperación'
      )
      setTimeout(() => {
        router.push('/auth/confirm-account')
      }, 1000)
    }
  })

  const onSubmit = (data: RequestConfirmationCodeForm) => {
    mutation.mutate(data)
  }

  return (
    <div className='relative z-10' data-aos={dataAOS}>
      <form
        className='px-0 md:px-6 py-3 w-80 md:w-96'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <RecoveryForm register={register} errors={errors} type='requestCode' />
        <Button
          text={
            mutation.isPending ? (
              <span className='flex items-center justify-center gap-2'>
                <ArrowPathIcon className='w-5 h-5 animate-spin' />
                Enviando Codigo...
              </span>
            ) : (
              'Enviar Código de Confirmación'
            )
          }
          type='submit'
          disabled={mutation.isPending}
          className='bg-gradient-to-r shadow-md from-green-500 via-green-600 to-green-700 text-white hover:transform hover:scale-105 transition-transform duration-300 disabled:opacity-70 disabled:cursor-not-allowed'
        />

        <div className='flex flex-col gap-2 items-center justify-center mt-2'>
          <button
            className='text-sm text-sky-500 hover:underline hover:text-white transition-colors duration-200'
            type='button'
            onClick={onAuthClick}
          >
            ¿Ya Tienes una Cuenta?
          </button>
          <button
            className='text-sm text-sky-500 hover:underline hover:text-white transition-colors duration-200'
            type='button'
            onClick={onAuthClick}
          >
            ¿Olvidaste tu Contraseña? Restablecer
          </button>
        </div>
      </form>
    </div>
  )
}
