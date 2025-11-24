/**
 * Autor: Esteban Soto @elsoprimeDev
 * TODO: Implementar formulario completo de editar producto
 */

import { Product } from '@/schemas/productsSchema'

type EditProductDataProps = {
  data: Product
  productId: Product['_id']
}

export default function EditProductData({ data, productId }: EditProductDataProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-4">Editar Producto</h2>
        <p className="text-gray-600 mb-2">
          Componente en desarrollo. Próximamente disponible.
        </p>
        <p className="text-sm text-gray-500">
          ID del producto: {productId}
        </p>
      </div>
    </div>
  )
}
