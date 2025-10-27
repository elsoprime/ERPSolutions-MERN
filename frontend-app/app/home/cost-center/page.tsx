/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import CostCenterManagement from '@/components/Modules/CostCenterrManagement/Views/CostCenterManagement'
import HeaderSection from '@/components/UI/HeaderSection'

export default function page() {
  return (
    <>
      <HeaderSection
        link={'/home'}
        nameLink={'Dashboard'}
        sectionTitle={'Mi Almacen'}
      />
      <CostCenterManagement />
    </>
  )
}
