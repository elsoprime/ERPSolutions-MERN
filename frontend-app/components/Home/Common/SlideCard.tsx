/**
 * Autor: Esteban Soto @elsoprimeDev
 */

'use client'
import {ModuleCardViews} from '@/data/Dashboard'
import Image from 'next/image'
import {useRouter} from 'next/navigation'

export default function SlideCard() {
  const router = useRouter()
  const handleClick = (onClick?: () => void, href?: string) => {
    if (onClick) {
      onClick() // Ejecuta la función
      console.log(onclick)
    } else if (href) {
      router.push(href) // Navega a la URL proporcionada
    }
  }

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6'>
        {ModuleCardViews.map(item => (
          <div
            key={item.id}
            className='cursor-pointer rounded-md shadow-md overflow-hidden relative transform transition-transform duration-300 ease-in-out hover:scale-105'
            onClick={() =>
              handleClick(item.IAction?.[0]?.onClick, item.IAction?.[0]?.href)
            }
          >
            <div className='relative w-full h-28'>
              <Image
                fill
                src={item.background || '/images/no-image.svg'}
                alt={item.title}
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                quality={100}
                style={{filter: 'blur(2px)'}}
                className='object-cover'
              />
            </div>
            <div className='relative flex flex-col items-center mt-6 px-4 py-2 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 rounded-b-md'>
              <Image
                src={item.image}
                alt={item.title}
                width={100}
                height={100}
                className='-mt-20 transform transition-transform duration-300 ease-in-out hover:scale-125 mb-2'
              />
              <h3 className='text-center text-lg font-bold text-purple-600'>
                {item.title}
              </h3>
              <h4 className='text-center text-gray-900 text-sm'>
                {item.subtitle}
              </h4>
              <p className='text-center text-gray-700 text-xs'>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
