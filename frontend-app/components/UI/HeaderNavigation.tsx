/**
 * HeaderNavigation Component
 * @description: Componente de navegación para el header que muestra los elementos principales del menú
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, {useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {ChevronDownIcon} from '@heroicons/react/20/solid'
import {IMenu} from '@/interfaces/IComponents'

interface HeaderNavigationProps {
  menuItems: IMenu[]
  onMenuItemClick?: (item: IMenu) => void
}

export default function HeaderNavigation({
  menuItems,
  onMenuItemClick
}: HeaderNavigationProps) {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  const handleMenuClick = (item: IMenu) => {
    if (item.ISubMenu) {
      setOpenDropdown(openDropdown === item.id ? null : item.id)
    } else {
      onMenuItemClick?.(item)
      setOpenDropdown(null)
    }
  }

  const isActiveLink = (link: string) => {
    return pathname === link || pathname.startsWith(link + '/')
  }

  return (
    <nav className='hidden sm:flex items-center space-x-6'>
      {menuItems.map(item => (
        <div key={item.id} className='relative'>
          {item.ISubMenu ? (
            // Menu item with submenu
            <div>
              <button
                onClick={() => handleMenuClick(item)}
                className='flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600 transition-colors duration-200'
              >
                {item.icon && <span className='mr-1'>{item.icon}</span>}
                <span>{item.title}</span>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openDropdown === item.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {openDropdown === item.id && (
                <div className='absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                  <div className='py-2'>
                    {item.ISubMenu.map(subItem => (
                      <Link
                        key={subItem.id}
                        href={subItem.link}
                        className={`flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                          isActiveLink(subItem.link)
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-700'
                        }`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {subItem.icon && (
                          <span className='mr-3'>{subItem.icon}</span>
                        )}
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Simple menu item
            <Link
              href={item.link || '#'}
              className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActiveLink(item.link || '')
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
              onClick={() => onMenuItemClick?.(item)}
            >
              {item.icon && <span className='mr-1'>{item.icon}</span>}
              <span>{item.title}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
