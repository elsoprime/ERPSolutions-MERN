/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {IWareHouseCard} from '@/interfaces/IPageComponents'
import WarehouseCard from '../Common/Card'

type WarehouseViewsProps = {
  data: IWareHouseCard[]
}

export default function WarehouseViews() {
  //Definir si los Modulos esta Activos

  return (
    <>
      {/* <!-- Sección de Card del Módulos --> */}
      <div className='relative -mt-20'>
        <div className='md:max-w-7xl xl:max-w-full mx-auto py-6 sm:px-6 lg:px-8 bg-gray-50 lg:rounded-md xl:rounded-none shadow-sm'>
          <WarehouseCard />
        </div>
      </div>
    </>
  )
}
