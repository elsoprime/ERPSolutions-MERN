/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import Image from 'next/image'
import Link from 'next/link'

type Props = {
  description: string
  link?: string
}

export default function Page404({ description, link }: Props) {
  return (
    <div className='relative min-h-screen flex flex-col items-center justify-center bg-gray-100'>
      {/* Imagen de fondo */}
      <div className='absolute inset-0'>
        <Image
          fill
          style={{ objectFit: 'cover', opacity: 0.1 }}
          src='/images/BG001.webp'
          alt='Background'

        />
      </div>
      {/* Contenido */}
      <div className='relative bg-white p-8 rounded-lg shadow-lg text-center'>
        <h1 className='text-6xl font-bold text-purple-600'>404</h1>
        <h2 className='text-2xl font-semibold text-gray-600 mt-4'>
          Página no encontrada
        </h2>
        <p className='text-gray-600 mt-2'>
          {description}
        </p>

        <Link
          href={link || '/'} // Si no se proporciona un link, se redirige a la página principal
          className='mt-6 inline-block w-full bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700 transition duration-300'
        >
          Volver
        </Link>


      </div>
    </div>
  )
}