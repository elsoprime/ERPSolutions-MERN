/**
 * @description A block component indicating that a feature is under development.
 *  Traduccion: Un componente de bloque que indica que una función está en desarrollo.
 * @returns
 */

import Image from 'next/image'
import bgImage from '@/public/LogoERP.webp'

export default function DevelopmentBlock() {
  return (
    <section className='max-w-5xl mx-auto -mt-60 relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 py-16 px-6 sm:px-12 lg:px-24 border border-indigo-400'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        {/* Mensaje principal */}
        <div className='flex flex-col justify-center h-full'>
          <h2 className='text-4xl sm:text-5xl font-extrabold text-white mb-6 drop-shadow-lg'>
            ¡Próximamente nuevas funcionalidades!
          </h2>
          <p className='text-lg text-indigo-100 mb-8'>
            Estamos trabajando para ofrecerte herramientas avanzadas que
            optimicen la gestión y el crecimiento de tu empresa. Nuestro equipo
            de desarrollo está implementando soluciones innovadoras para
            potenciar tu experiencia en ERP Solutions.
          </p>
          <ul className='space-y-5'>
            {[
              'Automatización inteligente de procesos empresariales',
              'Paneles de control interactivos y personalizables',
              'Integración con sistemas y servicios líderes del mercado',
              'Seguridad y rendimiento de nivel empresarial'
            ].map((item, idx) => (
              <li key={idx} className='flex items-center gap-3'>
                <span className='h-4 w-4 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md' />
                <span className='text-indigo-100 font-medium text-base'>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Imagen ilustrativa */}
        <div className='relative aspect-video rounded-xl overflow-hidden shadow-xl ring-2 ring-indigo-500 bg-cover flex items-center justify-center'>
          <Image
            src={bgImage}
            alt='Logo ERP Solutions en desarrollo'
            fill
            className='object-contain opacity-90'
            priority
          />
          <div className='absolute bottom-4 right-4 bg-indigo-700/80 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg'>
            ERP Solutions - Innovando para tu empresa
          </div>
        </div>
      </div>
    </section>
  )
}
