/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import { WarehouseCardData } from '@/data/Warehouse'
import { IModuleCard } from '@/interfaces/IPageComponents'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

/**
 * Componente de tarjeta para mostrar la información de un almacén
 */

export default function WarehouseCard() {
  const Router = useRouter()
  const handleClick = (onClick?: () => void, href?: string) => {
    if (onClick) {
      onClick() // Ejecuta la función
      console.log(onclick)
    } else if (href) {
      Router.push(href) // Navega a la URL proporcionada
    }
  }

  return (
    <ul className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 px-10 md:px-0'>
      {WarehouseCardData.map((featureCard: IModuleCard) => (
        <li
          key={featureCard.id}
          className='bg-gray-50 shadow-md rounded-xl p-4 mb-4  hover:bg-slate-100 hover:transform hover:scale-105 transition-transform cursor-pointer'
          onClick={() =>
            handleClick(
              featureCard.IAction?.[0]?.onClick,
              featureCard.IAction?.[0]?.href
            )
          }
        >
          <div className='flex flex-col items-center text-center'>
            <Image
              src={featureCard.image || '/no-image.svg'}
              alt={featureCard.title}
              width={80}
              height={80}
              className='w-20 h-20 object-cover rounded-full'
            />
            <h2 className='text-lg font-bold text-gray-600'>
              {featureCard.title}
            </h2>
            <p className='text-sm text-gray-700 font-light'>
              {featureCard.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
