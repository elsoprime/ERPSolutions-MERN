/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import Header from '@/components/Warehouse/Common/Header'
import EditProductData from '@/components/Warehouse/Products/EditProductData'
import {Product} from '@/schemas/productsSchema'

type EditProductPageProps = {
  data: Product
  productId: Product['_id']
}

export default function EditProduct({data, productId}: EditProductPageProps) {
  return (
    <>
      <Header
        link={'/home/warehouse/products'}
        nameLink={'Listado Productos'}
        sectionTitle={'Sección Productos'}
      />
      {/* <!-- Sección de Formulario de Producto --> */}
      <EditProductData data={data} productId={productId} />
    </>
  )
}
