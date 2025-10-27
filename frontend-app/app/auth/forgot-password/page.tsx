'use client'
import ForgotPasswordViews from '@/components/Modules/Auth/Views/ForgotPasswordViews'
import bgImage from '@/public/images/BG004.webp'
import Logo from '@/components/Shared/Logo'

export default function ChangePasswordPage() {
  return (
    <div
      className='relative min-h-screen flex items-center justify-center bg-contain'
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className='absolute inset-0 bg-gradient-to-br from-black via-blue-600/20  to-blue-900/70 backdrop-blur-md'></div>

      <div className='relative z-10 px-4 xl:px-0 w-full max-w-md mx-auto'>
        <div className='-mt-36 relative justify-center mb-8'>
          <Logo width={300} height={250} />
        </div>
        <div className='bg-gradient-to-t from-white to-gray-100 rounded-2xl shadow-2xl p-8 flex flex-col items-center'>
          <h2 className='text-3xl font-black bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text mb-6 text-left'>
            Recuperación de Contraseña
          </h2>
          <p className='text-gray-600 text-center mb-6'>
            Coloca tu correo electrónico para recibir
            <span className='block text-lg font-bold text-purple-600'>
              {' '}
              las instrucciones.
            </span>
          </p>
          <ForgotPasswordViews />
        </div>
      </div>
    </div>
  )
}
