import {useRouter} from 'next/navigation'
import {FieldErrors, useForm, UseFormRegister} from 'react-hook-form'
import {useMutation} from '@tanstack/react-query'
import {toast} from 'react-toastify'
import ErrorMessage from '@/components/Shared/ErrorMessage'
import {NewPasswordFormData} from '@/data/Auth'
import {ChangePasswordForm, ConfirmToken} from '@/schemas/userSchema'
import {C} from 'node_modules/framer-motion/dist/types.d-BJcRxCew'
import {updatePasswordWithToken} from '@/api/AuthAPI'

type NewPasswordFormProps = {
  token: ConfirmToken['token']
  register: UseFormRegister<ChangePasswordForm>
  errors: FieldErrors<ChangePasswordForm>
  onPasswordChanged?: () => void
}

export default function NewPasswordForm({
  token,
  onPasswordChanged
}: NewPasswordFormProps) {
  const navigate = useRouter()

  // Definir los valores iniciales del formulario
  const initialValues: ChangePasswordForm = {
    password: '',
    passwordConfirmation: ''
  }

  // Configurar React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: {errors}
  } = useForm<ChangePasswordForm>({
    defaultValues: initialValues
  })

  // Manejar el envío del formulario con TanStack Query
  const mutation = useMutation({
    mutationFn: updatePasswordWithToken,
    onError: error => {
      toast.error(error.message)
    },
    onSuccess: data => {
      toast.success(data)
      reset()

      // Si hay callback de éxito, ejecutarlo
      if (onPasswordChanged) {
        onPasswordChanged()
      } else {
        // Comportamiento por defecto: redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate.push('/')
        }, 2000)
      }
    }
  })

  // Función para manejar el envío del formulario
  const handleNewPasswordSubmit = (formData: ChangePasswordForm) => {
    mutation.mutate({formData, token})
  }

  const password = watch('password', '')

  return (
    <>
      <form onSubmit={handleSubmit(handleNewPasswordSubmit)} noValidate>
        <div className='my-2'>
          {NewPasswordFormData.map((field, index) => (
            <div key={index} className='mb-4'>
              <label
                htmlFor={field.id}
                className='block text-gray-500 font-semibold mb-2'
              >
                {' '}
                {field.label}
              </label>
              {field.type === 'password' && (
                <input
                  id={field.id}
                  type={field.type}
                  className={`px-3 py-2 block w-full font-roboto-light text-sm text-gray-500 border border-sky-500 rounded-lg focus:outline-none focus:ring-orange-500 focus-border-orange-500  ${
                    errors[field.id as keyof ChangePasswordForm]
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder={field.placeholder}
                  {...register(field.id as keyof ChangePasswordForm, {
                    required: field.required
                      ? `${field.label} es requerido`
                      : false
                  })}
                />
              )}
              {errors[field.id as keyof ChangePasswordForm] && (
                <ErrorMessage>
                  {errors[field.id as keyof ChangePasswordForm]?.message}
                </ErrorMessage>
              )}
            </div>
          ))}
        </div>
        <div className='mt-6'>
          <button
            type='submit'
            disabled={mutation.isPending}
            className='w-full bg-gradient-to-r shadow-md from-green-500 via-green-600 to-green-700 text-white py-2 px-6 rounded-lg hover:transform hover:scale-105 transition-transform duration-300 disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-sm mt-4'
          >
            {mutation.isPending
              ? 'Actualizando contraseña...'
              : 'Actualizar Contraseña'}
          </button>
        </div>
      </form>
    </>
  )
}
