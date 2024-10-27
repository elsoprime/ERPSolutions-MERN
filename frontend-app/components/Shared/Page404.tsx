/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import Image from 'next/image'
import Link from 'next/link'

type Props = {
  description?: string
  link?: string
}

export default function Page404({
  description = 'Lo sentimos, la pagina que buscas no existe o fue movida.',
  link = '/home'
}: Props) {
  return (
    <div className='relative min-h-screen flex flex-col items-center justify-center bg-gray-100'>
      {/* Contenido */}
      <div className='relative bg-white p-8 rounded-lg shadow-lg text-center'>
        <h1 className='text-6xl font-bold text-purple-600'>404</h1>
        <h2 className='text-2xl font-semibold text-gray-600 mt-4'>
          Página no encontrada
        </h2>
        <p className='text-gray-600 mt-2'>{description}</p>

        <Link
          href={link || ''} // Usar returnPath para la ruta de retorno
          className='mt-6 inline-block w-full bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700 transition duration-300'
        >
          Volver
        </Link>
      </div>
    </div>
  )
}
