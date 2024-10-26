/**
 *  Autor: Esteban Soto @elsoprimeDev
 */
'use client'
import Header from '@/components/Warehouse/Common/Header'
import WarehouseViews from '@/components/Warehouse/Views/WarehouseViews'

export default function Warehouse() {
  return (
    <>
      <Header
        link={'/home'}
        nameLink={'Dashboard'}
        sectionTitle={'Mi Almacen'}
      />

      <WarehouseViews />
    </>
  )
}
