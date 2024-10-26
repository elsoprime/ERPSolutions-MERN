/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import { deleteProduct } from '@/api/ProductApi'
import { Product } from '@/schemas/productsSchema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  StopCircleIcon,
  TrashIcon
} from '@heroicons/react/20/solid'
import ConfirmModal from '@/components/Shared/ConfirmModal'
import { typeStatus } from '@/locale/es'
// import Products from '@/app/home/warehouse/products/page'

type TableListProps = {
  products: Product[]
  productId: Product['_id']
}

export default function TableList({ products }: TableListProps) {
  const router = useRouter()
  const page = 1

  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  )
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { mutate } = useMutation({
    mutationFn: deleteProduct,
    onError: error => {
      toast.error(error.message)
    },
    onSuccess: data => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', page] })
    }
  })

  const handleEdit = (productId: string) => {
    router.push(`/home/warehouse/products/${productId}/edit`)
  }

  const handleDelete = (id: string) => {
    setSelectedProductId(id)
    setIsModalOpen(true)
    // console.log('id', id)
  }

  const confirmDelete = () => {
    if (selectedProductId) {
      mutate(selectedProductId)
      setIsModalOpen(false)
    }
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setIsViewModalOpen(true)
  }

  const queryClient = useQueryClient()
  return (
    <>
      <div className='relative z-20 mt-5 lg:max-w-6xl xl:max-w-7xl mx-auto'>
        <ul className='bg-slate-50 rounded-md shadow-sm'>
          {products.map((product, index) => (
            <li
              key={index}
              className='px-4 py-2 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 hover:bg-gray-100 transition-colors cursor-pointer'
            >
              <div className='col-span-3 md:col-span-2'>
                <p className='text-sm text-gray-600 font-bold'>
                  {typeof product.category !== 'string'
                    ? product.category.name
                    : 'Categoría desconocida'}
                </p>
                <p className='text-xs text-gray-600 font-light'>
                  {product.name}
                </p>
              </div>
              <div className='col-span-1 md:col-span-1'>
                <p className='text-sm text-gray-600 font-bold'>Marca</p>
                <p className='text-xs text-gray-600 font-light'>
                  {product.brand}
                </p>
              </div>
              <div className='col-span-1 md:col-span-1'>
                <p className='text-sm text-gray-600 font-bold'>
                  Precio Unitario
                </p>
                <p className='text-xs text-gray-600 font-light'>
                  {product.price.toLocaleString('es-CL', {
                    style: 'currency',
                    currency: 'CLP'
                  })}{' '}
                  CLP
                </p>
              </div>
              <div className='col-span-1 md:col-span-1'>
                <p className='text-sm text-gray-600 font-bold'>SKU</p>
                <p className='text-xs text-gray-600 font-light'>
                  {product.sku}
                </p>
              </div>
              <div className='col-span-1 md:col-span-1'>
                <p className='text-sm text-gray-600 font-bold'>
                  Stock Disponible
                </p>
                <p className='text-xs text-gray-600 font-light'>
                  {product.stock}
                </p>
              </div>
              <div className='col-span-1 items-center'>
                {product.status === 'active' ? (
                  <div className='flex items-center space-x-2'>
                    <CheckCircleIcon className='w-5 h-5 text-green-500' />
                    <p className='py-2 text-xs text-center'>
                      {typeStatus[product.status]}
                    </p>
                  </div>
                ) : (
                  <div className='flex items-center space-x-2'>
                    <StopCircleIcon className='w-5 h-5 text-red-500' />
                    <p className='py-2 text-xs text-center'>
                      {typeStatus[product.status]}
                    </p>
                  </div>
                )}
              </div>
              <div className='text-xs col-span-1 lg:col-span-1'>
                <Menu as='div' className='text-left justify-end'>
                  <div className='flex items-center'>
                    <Menu.Button className='p-2 text-gray-500 hover:text-blue-700'>
                      <EllipsisHorizontalIcon className='w-5 h-5' />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'
                  >
                    <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                      <div className='py-1'>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleView(product)}
                              className={`${active
                                ? 'bg-gray-100 text-sky-900'
                                : 'text-sky-500'
                                } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            >
                              <EyeIcon className='w-5 h-5 mr-2' />
                              Ver
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleEdit(product._id)}
                              className={`${active
                                ? 'bg-gray-100 text-amber-900'
                                : 'text-amber-500'
                                } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            >
                              <PencilIcon className='w-5 h-5 mr-2' />
                              Editar
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleDelete(product._id)}
                              className={`${active
                                ? 'bg-gray-100 text-red-900'
                                : 'text-red-500'
                                } group flex rounded-md items-center w-full px-2 py-2 text-sm text-red-500`}
                            >
                              <TrashIcon className='w-5 h-5 mr-2' />
                              Eliminar
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title='Confirmar Eliminación'
        description='¿Estás seguro de que deseas eliminar este Producto? Esta acción no se puede deshacer.'
      />
    </>
  )
}
