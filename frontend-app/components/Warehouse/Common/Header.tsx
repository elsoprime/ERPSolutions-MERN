/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {WarehouseHeading} from '@/data/Warehouse'
import NavLink from './NavLink'

/**
 * Section de la cabecera de la vista de almacén
 */

type HeaderProps = {
  link: string
  nameLink: string
  sectionTitle: string
}

export default function Header({link, nameLink, sectionTitle}: HeaderProps) {
  return (
    <div className='relative'>
      <NavLink link={link} backLink={nameLink} sectionTitle={sectionTitle} />
      {WarehouseHeading.map((feature, index) => (
        <div key={index} className='bg-products bg-cover rounded-lg'>
          <div className=' bg-gray-50 opacity-90 items-center h-[350px]'>
            {feature.body.map((body, index) => (
              <div key={index} className='absolute top-10 inset-0'>
                <div className='p-4 items-center'>
                  <h1 className='text-3xl md:text-5xl font-bold text-center text-gray-700'>
                    {body.title}
                  </h1>
                  <h2 className='text-lg md:text-xl text-center text-purple-600'>
                    {body.subtitle}
                  </h2>
                  <p className='text-sm text-center text-gray-900 font-light'>
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
