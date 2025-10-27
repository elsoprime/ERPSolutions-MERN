/**
 * @description: Página principal de Categorías del Almacén
 * @version: 1.0.0
 * @created: 2024-06-15
 * @author: Esteban Soto @elsoprimeDev
 */

'use client'
import HeaderSection from '@/components/UI/HeaderSection'
import CategoryManagement from '@/components/Modules/WarehouseManagement/Views/CategoryManagement'
import Navbar from '@/components/Modules/WarehouseManagement/UI/Navbar'

export default function Categories() {
  return (
    <>
      <HeaderSection
        link={'/home/warehouse'}
        nameLink={'Mi Almacen'}
        sectionTitle={'Sección Categorias'}
      />

      {/* <!-- Sección de Busqueda de Productos --> */}
      <div className='relative z-10 -mt-96 flex flex-col gap-4 mx-auto px-4 mb-12'>
        <CategoryManagement />
      </div>
    </>
  )
}
