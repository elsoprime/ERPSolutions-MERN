/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import Header from '@/components/UI/HeaderSection'
import EditProductData from '@/components/Warehouse/Products/EditProductData'

type EditProductPageProps = {
  params: { productId: string }
}

export default function EditProduct({ params }: EditProductPageProps) {
  const { productId } = params
  
  return (
    <>
      <Header
        link={'/home/warehouse/products'}
        nameLink={'Listado Productos'}
        sectionTitle={'Sección Productos'}
      />
      {/* <!-- Sección de Formulario de Producto --> */}
      <EditProductData productId={productId} />
    </>
  )
}
