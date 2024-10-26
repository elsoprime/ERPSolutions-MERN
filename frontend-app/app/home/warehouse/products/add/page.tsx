/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import Header from '@/components/Warehouse/Common/Header'
import AddProductView from '@/components/Warehouse/Products/AddProduct'

export default function AddProduct() {
  return (
    <>
      <Header
        link={'/home/warehouse/products'}
        nameLink={'Listado Productos'}
        sectionTitle={'Sección Productos'}
      />
      <AddProductView />
    </>
  )
}
