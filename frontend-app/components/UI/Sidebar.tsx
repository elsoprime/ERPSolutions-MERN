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
      className='relative py-2 px-4 hidden xl:flex xl:flex-col shadow-md bg-contain'
      style={{
        backgroundImage: `url(${BGSidebar.src})`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className='z-30 flex items-center justify-center'>
        <Logo width={300} height={200} />
      </div>
      <div className='p-4 z-30'>
        <Menu />
      </div>
      <div className='absolute inset-0 top-0 bg-gray-50/90 backdrop-blur-xs'></div>
    </div>
  )
}
