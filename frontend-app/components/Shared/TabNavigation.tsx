/**
 * TabNavigation Component
 * @description: Componente reutilizable para navegación por pestañas
 * @author: Refactored Component
 */

import React from 'react'

// Tipo para iconos de Heroicons
type HeroIcon = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
        title?: string
        titleId?: string
    } & React.RefAttributes<SVGSVGElement>
>

// Tipos para las pestañas
export interface Tab {
    id: string
    name: string
    icon?: HeroIcon
    description?: string
    badge?: string | number
    disabled?: boolean
}

// Props del componente
export interface TabNavigationProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    variant?: 'default' | 'pills' | 'underline'
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
    showIconOnMobile?: boolean
    mobileVariant?: 'dropdown' | 'scroll'
    className?: string
    containerClassName?: string
}

export default function TabNavigation({
    tabs,
    activeTab,
    onTabChange,
    variant = 'underline',
    size = 'md',
    fullWidth = false,
    showIconOnMobile = true,
    mobileVariant = 'dropdown',
    className = '',
    containerClassName = ''
}: TabNavigationProps) {
    // Estilos según el tamaño
    const sizeStyles = {
        sm: {
            text: 'text-xs',
            icon: 'h-3.5 w-3.5',
            padding: 'py-1.5 px-2',
            spacing: 'space-x-2'
        },
        md: {
            text: 'text-xs sm:text-sm',
            icon: 'h-4 w-4 sm:h-5 sm:w-5',
            padding: 'py-2 px-1',
            spacing: 'space-x-4 md:space-x-8'
        },
        lg: {
            text: 'text-sm sm:text-base',
            icon: 'h-5 w-5 sm:h-6 sm:w-6',
            padding: 'py-3 px-2',
            spacing: 'space-x-6 md:space-x-10'
        }
    }

    // Estilos según la variante
    const getVariantStyles = (isActive: boolean) => {
        const baseStyles = 'font-medium transition-colors duration-200'

        switch (variant) {
            case 'pills':
                return `${baseStyles} rounded-lg ${isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
            case 'underline':
                return `${baseStyles} border-b-2 ${isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
            default:
                return `${baseStyles} ${isActive
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`
        }
    }

    const getIconStyles = (isActive: boolean) => {
        switch (variant) {
            case 'pills':
                return isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
            case 'underline':
                return isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
            default:
                return isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
        }
    }

    // Renderizar badge si existe
    const renderBadge = (badge?: string | number) => {
        if (!badge) return null
        return (
            <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                {badge}
            </span>
        )
    }

    // Renderizar dropdown para móvil
    const renderMobileDropdown = () => (
        <div className='sm:hidden'>
            <label htmlFor='tab-select' className='sr-only'>
                Seleccionar pestaña
            </label>
            <select
                id='tab-select'
                name='tab-select'
                value={activeTab}
                onChange={e => onTabChange(e.target.value)}
                className='block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500'
            >
                {tabs.map(tab => (
                    <option key={tab.id} value={tab.id} disabled={tab.disabled}>
                        {tab.name}
                        {tab.badge ? ` (${tab.badge})` : ''}
                    </option>
                ))}
            </select>
        </div>
    )

    // Renderizar tabs con scroll horizontal para móvil
    const renderMobileScroll = () => (
        <div className='sm:hidden overflow-x-auto'>
            <nav className='flex space-x-2 px-2' aria-label='Tabs'>
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && onTabChange(tab.id)}
                            disabled={tab.disabled}
                            className={`
                group inline-flex items-center whitespace-nowrap
                ${sizeStyles[size].padding} ${sizeStyles[size].text}
                ${getVariantStyles(isActive)}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${fullWidth ? 'flex-1 justify-center' : ''}
              `}
                        >
                            {Icon && showIconOnMobile && (
                                <Icon
                                    className={`
                    ${sizeStyles[size].icon}
                    ${variant === 'pills' ? '' : 'mr-1.5'}
                    ${getIconStyles(isActive)}
                  `}
                                />
                            )}
                            <span>{tab.name}</span>
                            {renderBadge(tab.badge)}
                        </button>
                    )
                })}
            </nav>
        </div>
    )

    // Renderizar tabs para desktop
    const renderDesktopTabs = () => (
        <nav
            className={`hidden sm:flex ${sizeStyles[size].spacing} ${fullWidth ? 'justify-between' : ''
                }`}
            aria-label='Tabs'
        >
            {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                    <button
                        key={tab.id}
                        onClick={() => !tab.disabled && onTabChange(tab.id)}
                        disabled={tab.disabled}
                        title={tab.description}
                        className={`
              group inline-flex items-center whitespace-nowrap
              ${sizeStyles[size].padding} ${sizeStyles[size].text}
              ${getVariantStyles(isActive)}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${fullWidth ? 'flex-1 justify-center' : ''}
            `}
                    >
                        {Icon && (
                            <Icon
                                className={`
                  mr-1.5 sm:mr-2 ${sizeStyles[size].icon}
                  ${getIconStyles(isActive)}
                `}
                            />
                        )}
                        <span className='hidden md:inline'>{tab.name}</span>
                        <span className='md:hidden'>{tab.name}</span>
                        {renderBadge(tab.badge)}
                    </button>
                )
            })}
        </nav>
    )

    return (
        <div className={`bg-white/80 shadow-sm border-b border-gray-200 ${className}`}>
            <div className={`max-w-7xl mx-auto lg:mx-0 px-3 sm:px-4 md:px-6 lg:px-8 ${containerClassName}`}>
                <div className='py-3 sm:py-4'>
                    <div className='mt-2'>
                        {/* Vista móvil */}
                        {mobileVariant === 'dropdown'
                            ? renderMobileDropdown()
                            : renderMobileScroll()}

                        {/* Vista desktop */}
                        {renderDesktopTabs()}
                    </div>
                </div>
            </div>
        </div>
    )
}