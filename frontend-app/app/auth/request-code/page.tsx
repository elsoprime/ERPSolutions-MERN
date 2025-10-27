'use client'

import RequestNewCodeViews from '@/components/Modules/Auth/Views/RequestNewCodeViews'
import Logo from '@/components/Shared/Logo'
import {useRouter} from 'next/navigation'

export default function ResquestCodePage() {
  const router = useRouter()
  return (
    <div className='relative min-h-screen flex items-center justify-center bg-contain'>
      <div className='absolute inset-0 bg-gradient-to-br from-blue-500/90 via-blue-900/50 to-purple-900/60 backdrop-blur-md'></div>

      <div className='relative z-10 px-4 xl:px-0 w-full max-w-md mx-auto'>
        <div className='-mt-36 relative justify-center mb-8'>
          <Logo width={300} height={250} />
        </div>

        <div className='bg-gradient-to-t from-gray-900/10 to-gray-900/80 rounded-2xl shadow-2xl p-8 flex flex-col items-center'>
          <h2 className='text-3xl font-black bg-gradient-to-r from-white to-sky-100 text-transparent bg-clip-text mb-6 text-left'>
            Solicitar Código de Recuperación
          </h2>
          <p className='text-gray-300 mb-6 text-left'>
            Coloca tu correo electrónico para recibir
            <span className='text-lg font-bold text-purple-600'>
              {' '}
              el código de recuperación.
            </span>
          </p>
          <RequestNewCodeViews
            onAuthClick={() => router.push('/')} // Redirect to home page
            dataAOS='zoom-in-down'
          />
        </div>
      </div>
    </div>
  )
}
