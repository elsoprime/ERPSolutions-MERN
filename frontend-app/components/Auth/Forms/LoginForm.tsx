/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

import {FieldErrors, UseFormRegister} from 'react-hook-form'
import ErrorMessage from '@/components/Shared/ErrorMessage'
import {AuthForm} from '@/data/Auth'
import {UserFormData} from '@/schemas/userSchema'

type AuthFormProps = {
  register: UseFormRegister<UserFormData>
  errors: FieldErrors<UserFormData>
  onRecoveryClick?: () => void
}
export default function LoginForm({
  register,
  errors,
  onRecoveryClick
}: AuthFormProps) {
  return (
    <>
      <div className='my-2'>
        {AuthForm[0].userForm.map((field, index) => (
          <div key={index} className='mb-4'>
            <label
              className='block text-gray-500 font-bold mb-2'
              htmlFor={field.id}
            >
              {field.label}
            </label>
            {field.type === 'email' ? (
              <>
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
                    required: field.required
                      ? `${field.label} es requerido`
                      : false,
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
              </>
            ) : (
              <>
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
                    required: field.required
                      ? `${field.label} es requerido`
                      : false
                  })}
                />
                <div className='flex items-center justify-between'>
                  {errors[field.id as keyof UserFormData] && (
                    <ErrorMessage>
                      {errors[field.id as keyof UserFormData]?.message}
                    </ErrorMessage>
                  )}
                  {AuthForm[0].forget && (
                    <button
                      type='button'
                      className='text-gray-500 text-sm py-2 hover:purple-600 hover:underline'
                      onClick={onRecoveryClick}
                    >
                      {AuthForm[0].forget}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
