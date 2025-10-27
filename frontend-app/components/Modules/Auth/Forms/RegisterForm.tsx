/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

import ErrorMessage from '@/components/Shared/ErrorMessage'
import {AuthRegisterForm} from '@/data/Auth'
import {UserRegistrationForm} from '@/schemas/userSchema'
import {FieldErrors, UseFormRegister} from 'react-hook-form'

type RegisterFormProps = {
  register: UseFormRegister<UserRegistrationForm>
  errors: FieldErrors<UserRegistrationForm>
}

export default function RegisterForm({register, errors}: RegisterFormProps) {
  return (
    <>
      <div className='my-2'>
        {AuthRegisterForm[0].registerForm.map((field, index) => (
          <div key={index} className='mb-4'>
            <label
              htmlFor={field.id}
              className='block text-gray-500 font-bold mb-2'
            >
              {' '}
              {field.label}
            </label>
            {field.type === 'email' ? (
              <input
                id={field.id}
                type={field.type}
                className={`px-3 py-2 block w-full font-roboto-light text-sm text-gray-500 border border-sky-500 rounded-lg focus:outline-none focus:ring-orange-500 focus-border-orange-500  ${
                  errors[field.id as keyof UserRegistrationForm]
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder={field.placeholder}
                {...register(field.id as keyof UserRegistrationForm, {
                  required: field.required
                    ? `${field.label} es requerido`
                    : false,
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: 'Correo Electrónico no válido'
                  }
                })}
              />
            ) : (
              <input
                id={field.id}
                type={field.type}
                className={`px-3 py-2 block w-full font-roboto-light text-sm text-gray-500 border border-sky-500 rounded-lg focus:outline-none focus:ring-orange-500 focus-border-orange-500  ${
                  errors[field.id as keyof UserRegistrationForm]
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder={field.placeholder}
                {...register(field.id as keyof UserRegistrationForm, {
                  required: field.required
                    ? `${field.label} es requerido`
                    : false
                })}
              />
            )}
            {errors[field.id as keyof UserRegistrationForm] && (
              <ErrorMessage>
                {errors[field.id as keyof UserRegistrationForm]?.message}
              </ErrorMessage>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
