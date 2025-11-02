/**
 * Generic Form Modal Component
 * @description: Modal genérico reutilizable con Headless UI para cualquier formulario
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0
 */

import {Fragment} from 'react'
import {Dialog, Transition} from '@headlessui/react'
import {XMarkIcon} from '@heroicons/react/24/outline'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
  enableOverlayClose?: boolean
  showCloseButton?: boolean
  className?: string
}

const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl'
} as const

/**
 * Modal genérico reutilizable para formularios
 */
export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title = 'Formulario',
  children,
  size = '4xl',
  enableOverlayClose = true,
  showCloseButton = true,
  className = ''
}) => {
  const handleOverlayClick = () => {
    if (enableOverlayClose) {
      onClose()
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={handleOverlayClick}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm' />
        </Transition.Child>

        {/* Modal Container */}
        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel
                className={`
                  w-full 
                  ${MODAL_SIZES[size]} 
                  transform 
                  overflow-hidden 
                  rounded-2xl 
                  bg-white 
                  text-left 
                  align-middle 
                  shadow-2xl 
                  transition-all
                  ${className}
                `}
              >
                {/* Header */}
                <div className='relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-semibold leading-6 text-white'
                  >
                    {title}
                  </Dialog.Title>

                  {/* Close Button */}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className='absolute right-4 top-4 rounded-full p-1.5 text-blue-100 hover:bg-blue-500/20 hover:text-white transition-colors'
                      aria-label='Cerrar modal'
                    >
                      <XMarkIcon className='h-5 w-5' />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className='relative'>{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default FormModal
