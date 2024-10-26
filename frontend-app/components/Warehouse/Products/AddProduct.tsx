/** Autor: @elsoprimeDev */

'use client'

import { PlusIcon } from '@heroicons/react/20/solid'
import React from 'react'
import ProductForm from './Forms/ProductForm'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { ProductsFormData } from '@/schemas/productsSchema'
import { createProduct, ProductApi } from '@/api/ProductApi'
import { useRouter } from 'next/navigation'

export default function AddProductView() {
  const router = useRouter()
  // Inicializar Valores del Producto
  const initialValues: ProductsFormData = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    category: '' // Add the missing category property
  }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ProductsFormData>({ defaultValues: initialValues })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createProduct,
    onError: error => {
      toast.error(error.message)
      console.error('Desde mutationFn onError:', error)
    },
    onSuccess: data => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      router.push('/home/warehouse/products')
    }
  })

  // Manejar el envío del formulario
  const handleAddProduct = async (formData: ProductsFormData) => {
    const data: ProductApi = {
      formData
    }
    mutation.mutate(data)
    reset()
  }

  return (
    <>
      {/* <!-- Sección de Formulario de Producto --> */}
      <div className='max-w-7xl mx-auto -mt-36 relative z-10 '>
        <h2 className='text-3xl px-6 py-2 mb-2 text-gray-600'>
          Formulario de{' '}
          <span className='font-bold text-purple-500'>Productos</span>
        </h2>
        <p className='text-lg px-6 mb-2 font-light text-amber-600'>Agrega un nuevo producto a tu Inventario</p>
        <form className='bg-gray-50 shadow-md px-6 py-3 rounded-md' onSubmit={handleSubmit(handleAddProduct)} noValidate>
          <ProductForm
            register={register}
            errors={errors}
            setValue={setValue}
            initialValues={initialValues}
          />
          <button
            type='submit'
            className='mt-5 lg:mt-0 py-2 w-full lg:w-96 flex space-x-6 items-center justify-center text-xs bg-purple-500 text-white hover:bg-purple-600 transition-colors rounded-md shadow-sm'
          >
            <PlusIcon className='h-5 w-5' />
            Crear Producto
          </button>
        </form>
      </div>
    </>
  )
}
