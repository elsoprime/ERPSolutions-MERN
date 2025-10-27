/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {Dialog, Transition} from '@headlessui/react'
import {Fragment} from 'react'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/20/solid'

type ConfirmModalProps = {
  type?: 'warning' | 'info' | 'confirmation' | 'error'
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  buttonActionText?: string
  buttonCancelText?: string
}

const typeStyles = {
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
  info: 'bg-blue-500 text-white hover:bg-blue-600',
  confirmation: 'bg-green-700 text-white hover:bg-green-800',
  error: 'bg-red-500 text-white hover:bg-red-600'
}

export default function AlertDialog({
  type,
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  buttonActionText,
  buttonCancelText
}: ConfirmModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

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
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                <Dialog.Title
                  as='h3'
                  className={`flex flex-row gap-4 text-lg font-medium leading-6 ${
                    type === 'error'
                      ? 'text-red-600'
                      : type === 'warning'
                      ? 'text-yellow-600'
                      : type === 'info'
                      ? 'text-blue-600'
                      : 'text-green-600'
                  }`}
                >
                  {type === 'error' ? (
                    <ExclamationTriangleIcon
                      className='h-6 w-6 text-red-600'
                      aria-hidden='true'
                    />
                  ) : type === 'warning' ? (
                    <ExclamationTriangleIcon className='h-6 w-6 text-yellow-600' />
                  ) : type === 'info' ? (
                    <InformationCircleIcon className='h-6 w-6 text-blue-600' />
                  ) : type === 'confirmation' ? (
                    <CheckCircleIcon
                      className='h-6 w-6 text-green-600'
                      aria-hidden='true'
                    />
                  ) : (
                    <CheckCircleIcon
                      className='h-6 w-6 text-green-600'
                      aria-hidden='true'
                    />
                  )}
                  {title}
                </Dialog.Title>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>{description}</p>
                </div>

                <div className='mt-4 flex '>
                  <button
                    type='button'
                    className={`inline-flex w-96 justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      typeStyles[type || 'confirmation']
                    }`}
                    onClick={onConfirm}
                  >
                    {buttonActionText || 'Si'}
                  </button>
                  <button
                    type='button'
                    className='ml-2 inline-flex w-96 justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
                    onClick={onClose}
                  >
                    {buttonCancelText || 'No'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
