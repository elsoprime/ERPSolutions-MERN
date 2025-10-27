import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  WalletIcon
} from '@heroicons/react/20/solid'

interface NavbarProps {
  title?: string
  description?: string
  importData?: () => void
  exportData?: () => void
  newAction?: () => void
  labelNewAction?: string
}

export default function Navbar({
  title,
  description,
  importData,
  exportData
}: NavbarProps) {
  return (
    <nav className=' grid grid-cols-1 md:grid-cols-8 gap-4 bg-gradient-to-tr from-purple-600 to-indigo-600 p-6 rounded-lg shadow-md mb-6'>
      {/* Sección izquierda: Título y descripción */}
      <div className='col-span-1 md:col-span-3'>
        <div className='text-white flex items-center gap-3 justify-center md:justify-start'>
          <WalletIcon className='h-8 w-8 drop-shadow-lg' />
          <h1 className='text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-lg'>
            {title}
          </h1>
        </div>
        <p className='text-base text-white font-medium opacity-90 mt-2 drop-shadow-lg'>
          {description}
        </p>
        <span className='text-white inline-block sm:w-auto lg:w-[200px] text-center bg-white/20 px-4 py-2 rounded-full text-xs font-normal tracking-wide mt-2 shadow'>
          Panel de Administración
        </span>
      </div>

      {/* Sección derecha: Botones */}
      <div className='col-span-1 md:col-span-5 items-center justify-end flex gap-4 mt-4 md:mt-0'>
        <button
          className='w-full sm:w-auto bg-white text-gray-500 px-4 py-2 text-sm rounded-md shadow hover:bg-gray-100 border hover:border-purple-400 transition-colors duration-150'
          onClick={importData}
        >
          <ArrowUpTrayIcon className='h-4 w-4 inline-block mr-1' />
          Importar
        </button>
        <button
          className='w-full sm:w-auto bg-white text-gray-500 px-4 py-2 text-sm rounded-md shadow hover:bg-gray-100 border hover:border-purple-400 transition-colors duration-150'
          onClick={exportData}
        >
          <ArrowDownTrayIcon className='h-4 w-4 inline-block mr-1' />
          Exportar
        </button>
      </div>
    </nav>
  )
}
