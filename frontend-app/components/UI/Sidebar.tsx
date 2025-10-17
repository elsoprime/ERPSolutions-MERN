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
        <div className=' relative py-2 px-4 lg:flex flex-col shadow-md hidden bg-contain bg-no-repeat h-full overflow-y-auto'
            style={{
                backgroundImage: `url(${BGSidebar.src})`,
                backgroundAttachment: "fixed",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="z-30 bg-gradient-to-tr bg-white/80 via-gray-50/90 to-gray-50/90 rounded-lg shadow-md p-4 mb-6">
                <Logo width={120} height={90} />
            </div>
            <div className="p-4 z-30">
                <Menu />
            </div>
            <div className="absolute inset-0 top-0 bg-gray-50/90 backdrop-blur-xs"></div>
        </div>
    )
}
