import ErrorMessage from '@/components/Shared/ErrorMessage'
import {RecoverPasswordForm} from '@/data/Auth'
import {RequestConfirmationCodeForm} from '@/schemas/userSchema'
import {FieldErrors, UseFormRegister} from 'react-hook-form'

/**
 * @description: Props para el componente RecoveryForm
 * Define las propiedades que se pasan al componente de formulario de recuperación.
 * @param {UseFormRegister<RequestConfirmationCodeForm>} register - Función para registrar los campos del formulario con React Hook Form
 * @param {FieldErrors<RequestConfirmationCodeForm>} errors - Objeto que contiene los errores de validación del formulario
 * @param {'requestCode' | 'resetPassword'} [type] - Tipo de formulario (opcional), puede ser para solicitar un código o para restablecer la contraseña
 */

type RecoveryFormProps = {
  register: UseFormRegister<RequestConfirmationCodeForm>
  errors: FieldErrors<RequestConfirmationCodeForm>
  type?: 'requestCode' | 'resetPassword' // Tipo opcional para diferentes formularios de recuperación y casos de uso que quieras implementar más adelante
}

/**
 * @description: Componente de formulario de recuperación de contraseña (Email)
 * Estructura reutilizable para diferentes tipos de formularios de recuperación
 * Cuenta con validaciones básicas y manejo de errores con React Hook Form
 * @param {RecoveryFormProps} props - Props que incluyen register, errors y type
 * @returns {JSX.Element} Componente de formulario de recuperación de contraseña
 * @example: < RecoveryForm register={register} errors={errors} type="requestCode" />
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

export default function RecoveryForm({register, errors}: RecoveryFormProps) {
  return (
    <div className='my-2'>
      {RecoverPasswordForm.map(field => (
        <div key={field.id} className='mb-4'>
          <input
            className={`px-3 py-2 block w-full font-roboto-light text-sm text-gray-500 border border-sky-500 rounded-lg focus:outline-none focus:ring-orange-500 focus-border-orange-500  ${
              errors[field.id as keyof RequestConfirmationCodeForm]
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            {...register(field.id as keyof RequestConfirmationCodeForm, {
              required: field.required ? `${field.label} es requerido` : false,
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'Correo Electrónico no válido'
              }
            })}
          />
          {errors[field.id as keyof RequestConfirmationCodeForm] && (
            <ErrorMessage>
              {errors[field.id as keyof RequestConfirmationCodeForm]?.message}
            </ErrorMessage>
          )}
        </div>
      ))}
    </div>
  )
}
