/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev6
 */

'use client'
import {UserFormData} from '@/schemas/userSchema'
import {useForm} from 'react-hook-form'
import {useEffect} from 'react'
import RegisterForm from '../Forms/RegisterForm'
import Button from '@/components/Shared/Button'
import Image from 'next/image'

type RegisterViewProps = {
  onAuthClick: () => void
  dataAOS: string
}

export default function RegisterView({
  onAuthClick,
  dataAOS
}: RegisterViewProps) {
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
    console.log('Registrando Usuario:', initialData)
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
        <RegisterForm register={register} errors={errors} />
        <Button
          text='Registrarse'
          type='submit'
          className='bg-gradient-to-tr shadow-md from-purple-400 via-purple-600 to-purple-800 text-white hover:transform hover:scale-105 transition-transform duration-300'
        />

        <div className='flex items-center justify-center mt-2'>
          <button
            className='text-sm text-gray-500'
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
