/**
 * Autor: Esteban Soto @elsoprimeDev
 */

'use client'

import DevelopmentBlock from '@/components/UI/DevelopmentBlock'
import HeaderSection from '@/components/UI/HeaderSection'

export default function Products() {
  return (
    <>
      <HeaderSection
        link={'/home/warehouse'}
        nameLink={'Mi Almacen'}
        sectionTitle={'Sección Productos'}
      />

      <DevelopmentBlock />
    </>
  )
}
