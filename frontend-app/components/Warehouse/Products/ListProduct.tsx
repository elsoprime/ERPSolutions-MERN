/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {Product} from '@/schemas/productsSchema'
import {InformationCircleIcon} from '@heroicons/react/20/solid'
import TableList from '../Common/TableList'

/**
 * Definiendo la Vista para la lista de productos
 */

type ProductProps = {
  products: Product[]
  productId: Product['_id']
}

export default function ListProduct({products, productId}: ProductProps) {
  if (products.length === 0) {
    return (
      <div className='flex items-center justify-center p-6 mt-5 container md:mx-auto relative z-20 bg-gray-50 h-full shadow-md max-w-5xl rounded-md'>
        <div className='text-center'>
          <h3 className='text-2xl text-gray-500'>
            Comienza a Registrar tus{' '}
            <span className='font-black text-purple-500'>Productos</span>
          </h3>
          <p className='text-sky-600 flex items-center'>
            <InformationCircleIcon className='w-20 h-20 text-sky-400 mx-auto' />
            No hay productos registrados
          </p>
        </div>
      </div>
    )
  }
  if (products) return <TableList products={products} productId={productId} />
}
