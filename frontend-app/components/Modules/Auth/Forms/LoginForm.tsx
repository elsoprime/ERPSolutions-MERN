import {FieldErrors, UseFormRegister} from 'react-hook-form'
import ErrorMessage from '@/components/Shared/ErrorMessage'
import {AuthForm} from '@/data/Auth'
import {UserLoginForm} from '@/schemas/userSchema'
import Link from 'next/link'

type AuthFormProps = {
  register: UseFormRegister<UserLoginForm>
  errors: FieldErrors<UserLoginForm>
  onRecoveryClick?: () => void
}

/**
 * @description Componente de formulario de inicio de sesión que utiliza react-hook-form para la gestión de formularios y validación.
 * @param {AuthFormProps} props - Props que incluyen register, errors y onRecoveryClick.
 * @returns {JSX.Element} Componente de formulario de inicio de sesión.
 * @example < LoginForm register={register} errors={errors} onRecoveryClick={handleRecoveryClick} />
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @version 1.0.0
 */
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
              className='block text-slate-600 font-bold mb-2'
              htmlFor={field.id}
            >
              {field.label}
            </label>
            {field.type === 'email' ? (
              <>
                <input
                  className={`px-3 py-2 block w-full font-roboto-light text-sm text-gray-500 border rounded-lg focus:outline-none focus:ring-orange-500 focus-border-orange-500  ${
                    errors[field.id as keyof UserLoginForm]
                      ? 'border-red-500'
                      : 'border-sky-500'
                  }`}
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.id as keyof UserLoginForm, {
                    required: field.required
                      ? `${field.label} es requerido`
                      : false,
                    pattern: {
                      value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: 'Correo Electrónico no válido'
                    }
                  })}
                />
                {errors[field.id as keyof UserLoginForm] && (
                  <ErrorMessage>
                    {errors[field.id as keyof UserLoginForm]?.message}
                  </ErrorMessage>
                )}
              </>
            ) : (
              <>
                <input
                  className={`px-3 py-2 block w-full font-roboto-light text-sm text-gray-500 border rounded-lg focus:outline-none focus:ring-orange-500 focus-border-orange-500  ${
                    errors[field.id as keyof UserLoginForm]
                      ? 'border-red-500'
                      : 'border-sky-500'
                  }`}
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.id as keyof UserLoginForm, {
                    required: field.required
                      ? `${field.label} es requerido`
                      : false
                  })}
                />
                <div className='flex flex-col items-center justify-self-start'>
                  {errors[field.id as keyof UserLoginForm] && (
                    <ErrorMessage>
                      {errors[field.id as keyof UserLoginForm]?.message}
                    </ErrorMessage>
                  )}
                  {AuthForm[0].forget && (
                    <Link
                      href='/auth/forgot-password'
                      className='my-2 text-blue-500 hover:text-orange-600 hover:underline text-sm'
                    >
                      {AuthForm[0].forget}
                    </Link>
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
