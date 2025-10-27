/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {WarehouseHeading} from '@/data/Warehouse'
import NavLink from '../Shared/NavLink'

/**
 * Section de la cabecera de la vista de almacén
 */

type HeaderProps = {
  link: string
  nameLink: string
  sectionTitle: string
}

/**
 *
 * @param param0 Cambiar esta seccion del HeaderSectión
 * Dejarla Reutilizable para todas las secciones de la aplicacion
 * @returns
 */

export default function HeaderSection({
  link,
  nameLink,
  sectionTitle
}: HeaderProps) {
  return (
    <div className='relative'>
      <NavLink link={link} backLink={nameLink} sectionTitle={sectionTitle} />
      {WarehouseHeading.map((feature, index) => (
        <div key={index} className='bg-products bg-cover rounded-lg'>
          <div className=' bg-gray-50 opacity-90 items-center h-[650px] lg:h[700px] '>
            {feature.body.map((body, index) => (
              <div key={index} className='absolute top-10 inset-0'>
                <div className='p-4 items-center'>
                  <h1 className='font-roboto-bold text-3xl md:text-5xl font-black text-center text-gray-700'>
                    {body.title}
                  </h1>
                  <h2 className='font-noto text-lg md:text-xl font-semibold text-center text-purple-600'>
                    {body.subtitle}
                  </h2>
                  <p className='font-roboto text-sm text-center text-gray-500 font-light'>
                    {body.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
