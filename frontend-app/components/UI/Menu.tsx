import {MenuItems} from '@/data/Menu'
import {ChevronUpIcon, ChevronDownIcon} from '@heroicons/react/20/solid'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useState, useMemo, useEffect} from 'react'
import {IMenu, ISubMenu} from '@/interfaces/IComponents'
import {useAuth} from '@/hooks/useAuth'
import {useLogout} from '@/hooks/useLogout'
import {getHighestRole} from '@/utils/roleRouting'
import {UserRole} from '@/interfaces/MultiCompany'

/**
 *
 * @description Component to render the sidebar menu with role-based visibility
 * @returns {JSX.Element} JSX.Element
 * @Autor Esteban Soto Ojeda @elsoprimeDev
 */

export default function Menu(): JSX.Element {
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null)
  const pathname = usePathname()
  const {getUserData} = useAuth()
  const {handleLogout, isLoggingOut, isLogoutItem} = useLogout()

  // Obtener rol del usuario actual
  const userData = getUserData()
  const userRole = getHighestRole(userData)

  // Debug: Log del rol actual (remover en producción)
  useEffect(() => {
    console.log('Menu - User Role:', {
      userData: userData?.name,
      role: userData?.role,
      highestRole: userRole
    })
  }, [userData, userRole])

  // Función para verificar si el usuario tiene acceso a un elemento del menú
  const hasAccess = (item: IMenu | ISubMenu): boolean => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true // Si no hay roles requeridos, todos tienen acceso
    }
    return item.requiredRoles.includes(userRole)
  }

  // Función para manejar la apertura y cierre de los submenús
  const toggleSubMenu = (id: number) => {
    setOpenSubMenu(prevOpen => (prevOpen === id ? null : id))
  }

  // Función para determinar si un elemento del menú está activo
  const isItemActive = (item: IMenu | ISubMenu): boolean => {
    if (item.link) {
      return (
        pathname === item.link ||
        (item.link !== '/home' && pathname.startsWith(item.link))
      )
    }

    if ('ISubMenu' in item && item.ISubMenu) {
      return item.ISubMenu.some(subItem => isItemActive(subItem))
    }

    return false
  }

  // Filtrar elementos del menú basado en roles y procesarlos
  const processedMenuItems = useMemo(() => {
    return MenuItems.filter(item => hasAccess(item)) // Filtrar por rol
      .map(item => {
        const processedItem = {...item}
        processedItem.isActive = isItemActive(processedItem)

        if (processedItem.ISubMenu) {
          // Filtrar submenús por rol también
          processedItem.ISubMenu = processedItem.ISubMenu.filter(subItem =>
            hasAccess(subItem)
          ).map(subItem => ({
            ...subItem,
            isActive: isItemActive(subItem)
          }))
        }

        return processedItem
      })
  }, [pathname])

  // Función para manejar clicks en elementos del menú
  const handleMenuItemClick = async (item: IMenu, e: React.MouseEvent) => {
    // Si es el item de logout, ejecutar función de logout en lugar de navegar
    if (isLogoutItem(item.title, item.id)) {
      e.preventDefault() // Prevenir navegación del Link
      await handleLogout()
      return
    }
  }

  const renderMenuItem = (item: IMenu, i: number) => {
    const hasSubMenu = item.ISubMenu && item.ISubMenu.length > 0
    const isSubMenuOpen = openSubMenu === item.id
    const isLastItem = i === processedMenuItems.length - 1 // Detectar último elemento

    // Para el último elemento (Cerrar Sesión), no aplicar lógica de activo
    const isItemActiveForStyling = isLastItem ? false : item.isActive

    // Modificamos las clases para manejar hover solo en elementos no activos
    const baseClasses =
      'flex items-center w-full justify-between px-2 py-2 text-sm font-regular rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100'
    const activeClasses = isItemActiveForStyling
      ? 'bg-purple-600 text-white'
      : 'text-gray-600 hover:bg-white/10 hover:text-gray-600 transition-colors duration-200 font-light'

    // Clases especiales para el último elemento
    const lastItemClasses = isLastItem
      ? 'mt-auto border-t border-gray-200 pt-4'
      : ''

    if (hasSubMenu) {
      return (
        <div key={item.id} className={`relative ${lastItemClasses}`}>
          <button
            onClick={() => toggleSubMenu(item.id)}
            className={`${baseClasses} ${activeClasses} ${
              // Añadimos una clase condicional para manejar el hover
              isItemActiveForStyling ? '' : 'group'
            }`}
          >
            <span className='flex items-center'>
              {item.icon}
              <span className='ml-2'>{item.title}</span>
            </span>
            <span>
              {isSubMenuOpen ? (
                <ChevronUpIcon className='h-5 w-5' />
              ) : (
                <ChevronDownIcon className='h-5 w-5' />
              )}
            </span>
          </button>

          {isSubMenuOpen && item.ISubMenu && (
            <div className='pl-6 my-2 space-y-1'>
              {item.ISubMenu.map(subItem => (
                <Link
                  key={subItem.id}
                  href={subItem.link}
                  className={`block px-2 py-2 text-sm rounded-md
                                        ${
                                          subItem.isActive
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'text-gray-500 hover:bg-white/10 hover:text-purple-800 transition-colors duration-200'
                                        }`}
                >
                  <span className='flex items-center'>
                    {subItem.icon}
                    <span className='ml-2'>{subItem.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={item.id} className={lastItemClasses}>
        <Link
          href={item.link || ''}
          className={`${
            isLastItem ? '' : 'mt-4'
          } ${baseClasses} ${activeClasses} ${
            isLogoutItem(item.title, item.id) && isLoggingOut
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
          onClick={e => handleMenuItemClick(item, e)}
        >
          <span className='flex items-center'>
            {isLogoutItem(item.title, item.id) && isLoggingOut ? (
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2' />
            ) : (
              item.icon
            )}
            <span className='ml-2'>
              {isLogoutItem(item.title, item.id) && isLoggingOut
                ? 'Cerrando sesión...'
                : item.title}
            </span>
          </span>
        </Link>
      </div>
    )
  }

  return (
    <nav className='flex flex-col h-full space-y-2'>
      {processedMenuItems.map(renderMenuItem)}
    </nav>
  )
}
