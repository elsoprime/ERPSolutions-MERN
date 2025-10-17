/**
 * Autor: Esteban Soto @elsoprimeDev
 */

'use client'

import HeaderSection from "@/components/UI/HeaderSection"




export default function Products() {

  return (
    <>
      <HeaderSection
        link={'/home/warehouse'}
        nameLink={'Mi Almacen'}
        sectionTitle={'Sección Productos'}
      />
    </>
  )
}
