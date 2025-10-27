/**
 *  Autor: Esteban Soto @elsoprimeDev
 */
'use client'
import HeaderSection from '@/components/UI/HeaderSection'
import WarehouseViews from '@/components/Modules/WarehouseManagement/Views/WarehouseViews'

export default function Warehouse() {
  return (
    <>
      <HeaderSection
        link={'/home'}
        nameLink={'Dashboard'}
        sectionTitle={'Mi Almacen'}
      />

      <WarehouseViews />
    </>
  )
}
