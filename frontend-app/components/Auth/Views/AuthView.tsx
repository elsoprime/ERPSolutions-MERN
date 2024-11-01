/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import {UserFormData} from '@/schemas/userSchema'
import LoginForm from '../Forms/LoginForm'
import {useForm} from 'react-hook-form'
import {useEffect} from 'react'
import Button from '@/components/Shared/Button'
import Image from 'next/image'

type AuthViewProps = {
  onRegisterClick: () => void
  onRecoveryClick?: () => void
  dataAOS: string
}

export default function AuthView({
  onRegisterClick,
  onRecoveryClick,
  dataAOS
}: AuthViewProps) {
  const initialData: UserFormData = {
    email: '',
    password: ''
  }
  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<UserFormData>({defaultValues: initialData})

  const onSubmit = (data: UserFormData) => {
    console.log('Iniciando Sesión:', initialData)
  }

  useEffect(() => {
    console.log('Iniciando Sesión:', initialData)
  }, [])

  return (
    <div className='relative' data-aos={dataAOS}>
      <div className='flex items-center justify-center'>
        <Image src='/Selgesur.webp' width={250} height={100} alt='Logo' />
      </div>
      <form
        className='px-6 py-3 w-80 md:w-96 shadow-md rounded-lg'
        onClick={handleSubmit(onSubmit)}
        noValidate
      >
        <LoginForm
          register={register}
          errors={errors}
          onRecoveryClick={onRecoveryClick}
        />
        <Button
          text='Iniciar Sesión'
          type='submit'
          className='bg-gradient-to-tr shadow-md from-sky-400 via-sky-600 to-sky-800 text-white hover:transform hover:scale-105 transition-transform duration-300'
        />
        <div className='flex items-center justify-center mt-2'>
          <button
            className='text-sm text-gray-500 hover:text-purple-700 hover:underline hover:transform hover:scale-105 transition-transform duration-300'
            type='button'
            onClick={onRegisterClick}
          >
            ¿No Tienes una Cuenta?
          </button>
        </div>
      </form>
    </div>
  )
}
