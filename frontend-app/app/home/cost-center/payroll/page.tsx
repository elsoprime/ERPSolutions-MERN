/**
 * Autor: Esteban Soto @elsoprimeDev
 */

'use client'

import DevelopmentBlock from '@/components/UI/DevelopmentBlock'
import HeaderSection from '@/components/UI/HeaderSection'

export default function Payroll() {
  return (
    <>
      <HeaderSection
        link={'/home/warehouse'}
        nameLink={'Mi Centro de Costos'}
        sectionTitle={'Sección Nómina'}
      />

      <DevelopmentBlock />
    </>
  )
}
