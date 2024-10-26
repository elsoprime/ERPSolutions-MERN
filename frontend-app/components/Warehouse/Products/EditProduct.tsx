/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import { ProductApi, updateProduct } from '@/api/ProductApi'
import { Product, ProductsFormData } from '@/schemas/productsSchema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import ProductForm from './Forms/ProductForm'

type EditProductProps = {
  productId: Product['_id']
  data: ProductsFormData
}

export default function EditProduct({ productId, data }: EditProductProps) {
  const { push } = useRouter()
  const page = useParams().page

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ProductsFormData>({ defaultValues: data })

  const queryClient = useQueryClient()

  const { mutate } = useMutation<string | undefined, Error, ProductApi>({
    mutationFn: ({ productId, formData }) => updateProduct({ productId, formData }),
    onError: error => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success('Producto editado correctamente')
      queryClient.invalidateQueries({ queryKey: ['products', page] })
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      reset()
      push('/home/warehouse/products')
    }
  })

  const handleEditProduct = async (formData: ProductsFormData) => {
    const data: ProductApi = {
      productId,
      formData
    }
    mutate(data)
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
        <form className='bg-gray-50 shadow-md px-6 py-3 rounded-md' onSubmit={handleSubmit(handleEditProduct)} noValidate>
          <ProductForm
            register={register}
            errors={errors}
            setValue={setValue}
            initialValues={data}
          />
          <button
            type='submit'
            className='mt-5 lg:mt-0 py-2 w-full lg:w-96 flex space-x-6 items-center justify-center text-xs bg-purple-500 text-white hover:bg-purple-600 transition-colors rounded-md shadow-sm'
          >
            Actualizar Producto
          </button>
        </form>
      </div>
    </>
  )
}
