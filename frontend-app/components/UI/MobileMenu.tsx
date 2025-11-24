/**
 * MobileMenu Component
 * @description: Componente de menú móvil que se despliega en pantallas pequeñas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/20/solid'
import { IMenu } from '@/interfaces/IComponents'
import { useLogout } from '@/hooks/useLogout'
import { AuthLoadingState } from '@/components/Modules/Auth/States/AuthLoadingState'

interface MobileMenuProps {
  menuItems: IMenu[]
  onMenuItemClick?: (item: IMenu) => void
}

export default function MobileMenu({
  menuItems,
  onMenuItemClick
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const pathname = usePathname()
  const { handleLogout, isLoggingOut, isLogoutItem } = useLogout()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Reset expanded items when opening menu
      setExpandedItems([])
    }
  }

  const toggleExpanded = (itemId: number) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleMenuClick = async (item: IMenu) => {
    // Si es logout, ejecutar función de logout
    if (isLogoutItem(item.title, item.id)) {
      setIsOpen(false) // Cerrar menú
      await handleLogout()
      return
    }

    if (item.ISubMenu) {
      toggleExpanded(item.id)
    } else {
      setIsOpen(false)
      onMenuItemClick?.(item)
    }
  }

  const handleSubMenuClick = () => {
    setIsOpen(false)
  }

  const isActiveLink = (link: string) => {
    return pathname === link || pathname.startsWith(link + '/')
  }

  return (
    <div className='xl:hidden'>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className='inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors duration-200'
        aria-expanded='false'
      >
        <span className='sr-only'>Abrir menú principal</span>
        {isOpen ? (
          <XMarkIcon className='block h-6 w-6' aria-hidden='true' />
        ) : (
          <Bars3Icon className='block h-6 w-6' aria-hidden='true' />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-50 bg-black bg-opacity-50'
          onClick={toggleMenu}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={`
        fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>Menú</h2>
          <button
            onClick={toggleMenu}
            className='p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-50'
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        <nav className='px-4 py-6 overflow-y-auto h-full'>
          <div className='space-y-2'>
            {menuItems.map(item => (
              <div key={item.id}>
                {item.ISubMenu ? (
                  // Menu item with submenu
                  <div>
                    <button
                      onClick={() => handleMenuClick(item)}
                      className='flex items-center justify-between w-full px-3 py-2 text-left text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors duration-200'
                    >
                      <div className='flex items-center'>
                        {item.icon && <span className='mr-3'>{item.icon}</span>}
                        <span className='font-medium'>{item.title}</span>
                      </div>
                      {expandedItems.includes(item.id) ? (
                        <ChevronDownIcon className='w-5 h-5' />
                      ) : (
                        <ChevronRightIcon className='w-5 h-5' />
                      )}
                    </button>

                    {/* Submenu */}
                    {expandedItems.includes(item.id) && (
                      <div className='ml-6 mt-2 space-y-1'>
                        {item.ISubMenu.map(subItem => (
                          <Link
                            key={subItem.id}
                            href={subItem.link}
                            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${isActiveLink(subItem.link)
                                ? 'text-purple-600 bg-purple-50'
                                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                              }`}
                            onClick={handleSubMenuClick}
                          >
                            {subItem.icon && (
                              <span className='mr-3'>{subItem.icon}</span>
                            )}
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Simple menu item
                  <Link
                    href={item.link || '#'}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${isActiveLink(item.link || '')
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                      } ${isLogoutItem(item.title, item.id) && isLoggingOut
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      }`}
                    onClick={e => {
                      if (isLogoutItem(item.title, item.id)) {
                        e.preventDefault()
                        handleMenuClick(item)
                      } else {
                        setIsOpen(false)
                        onMenuItemClick?.(item)
                      }
                    }}
                  >
                    {isLogoutItem(item.title, item.id) && isLoggingOut ? (
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3' />
                    ) : (
                      item.icon && <span className='mr-3'>{item.icon}</span>
                    )}
                    <span className='font-medium'>
                      {isLogoutItem(item.title, item.id) && isLoggingOut
                        ? 'Cerrando sesión...'
                        : item.title}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Overlay de logout */}
      {isLoggingOut && <AuthLoadingState type='logout' message='Cerrando sesión...' />}
    </div>
  )
}
