/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

import ErrorMessage from '@/components/Shared/ErrorMessage'
import {RecoverPasswordForm} from '@/data/Auth'
import {UserFormData} from '@/schemas/userSchema'
import {FieldErrors, UseFormRegister} from 'react-hook-form'

type RecoveryFormProps = {
  register: UseFormRegister<UserFormData>
  errors: FieldErrors<UserFormData>
}
export default function RecoveryForm({register, errors}: RecoveryFormProps) {
  return (
    <div className='my-2'>
      {RecoverPasswordForm.map(field => (
        <div key={field.id} className='mb-4'>
          <input
            className={`px-3 py-2 block w-full font-roboto-light text-sm text-gray-500 border rounded-lg focus:outline-none focus:ring-orange-500 focus-border-orange-500  ${
              errors[field.id as keyof UserFormData]
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            {...register(field.id as keyof UserFormData, {
              required: field.required ? `${field.label} es requerido` : false,
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'Correo Electrónico no válido'
              }
            })}
          />
          {errors[field.id as keyof UserFormData] && (
            <ErrorMessage>
              {errors[field.id as keyof UserFormData]?.message}
            </ErrorMessage>
          )}
        </div>
      ))}
    </div>
  )
}
