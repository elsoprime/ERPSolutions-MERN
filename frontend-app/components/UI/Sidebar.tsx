import Logo from '@/components/Shared/Logo'
import Menu from './Menu'
import BGSidebar from '@/public/images/BGSidebar.webp'

/**
 * @description Componente Sidebar del Dashbaord
 * @Autor Esteban Soto Ojeda
 */

interface LogoProps {
  width?: number
  height?: number
}

export default function Sidebar() {
  return (
    <div
      className='hidden sticky top-0 py-2 px-4 lg:flex flex-col shadow-md bg-white overflow-hidden h-screen'
      style={{
        backgroundImage: `url(${BGSidebar.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay con z-index 0 - detrás del contenido pero encima del fondo */}
      <div
        className='absolute inset-0 bg-gray-50/90 backdrop-blur-xs'
        style={{zIndex: 0}}
      ></div>

      <div className='relative z-10 flex items-center justify-center'>
        <Logo width={300} height={200} />
      </div>
      <div className='relative z-10 p-4 flex-1 overflow-y-auto'>
        <Menu />
      </div>
    </div>
  )
}
