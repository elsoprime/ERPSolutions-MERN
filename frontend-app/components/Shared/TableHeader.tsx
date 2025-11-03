/**
 * Table Header Component
 * @description: Componente reutilizable para encabezados de tablas con filtros, búsqueda y acciones
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {ReactNode} from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

// ====== TYPES ======
export interface FilterConfig {
  id: string
  label: string
  options: Array<{value: string; label: string}>
  value: string
  onChange: (value: string) => void
}

export interface BulkAction {
  id: string
  label: string
  icon?: React.ComponentType<{className?: string}>
  onClick: () => void
  variant?: 'primary' | 'warning' | 'success' | 'danger'
  hidden?: boolean
}

export interface TableHeaderProps {
  // Título y contador
  title: string
  subtitle?: string
  totalCount: number
  pageSize: number
  loading?: boolean
  selectedCount?: number

  // Búsqueda
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void

  // Selector de página
  showPageSizeSelector?: boolean
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]

  // Filtros
  showFilters?: boolean
  onToggleFilters?: () => void
  filtersOpen?: boolean
  filters?: FilterConfig[]
  onClearFilters?: () => void
  customFiltersContent?: ReactNode

  // Acciones principales
  primaryAction?: {
    label: string
    icon?: React.ComponentType<{className?: string}>
    onClick: () => void
  }

  // Acciones masivas (bulk actions)
  bulkActions?: BulkAction[]

  // Exportar
  showExport?: boolean
  onExport?: () => void
  exportLabel?: string

  // Contenido personalizado adicional
  extraActions?: ReactNode
}

// ====== VARIANT STYLES ======
const getVariantStyles = (variant: BulkAction['variant'] = 'primary') => {
  const styles = {
    primary: 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100',
    warning:
      'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100',
    success: 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100',
    danger: 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
  }
  return styles[variant]
}

// ====== MAIN COMPONENT ======
export const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  subtitle,
  totalCount,
  pageSize,
  loading = false,
  selectedCount = 0,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  showPageSizeSelector = true,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 15, 25, 50],
  showFilters = false,
  onToggleFilters,
  filtersOpen = false,
  filters = [],
  onClearFilters,
  customFiltersContent,
  primaryAction,
  bulkActions = [],
  showExport = false,
  onExport,
  exportLabel,
  extraActions
}) => {
  return (
    <div className='p-3 sm:p-4 md:p-6 border-b border-gray-200'>
      <div className='flex flex-col space-y-4'>
        {/* Título y contador */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div className='flex-1'>
            <h2 className='text-base sm:text-lg font-medium text-gray-900'>
              {title}
            </h2>
            {/* Contador y selección */}
            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1'>
              <p className='text-xs sm:text-sm text-gray-600'>
                {totalCount === 0 && loading
                  ? 'Cargando...'
                  : subtitle || `${totalCount} registros • ${pageSize}/página`}
              </p>
              {selectedCount > 0 && (
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit'>
                  {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controles - Layout responsive */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
          {/* Grupo izquierdo: Selector de página */}
          <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
            {showPageSizeSelector && onPageSizeChange && (
              <div className='flex items-center gap-2 flex-shrink-0'>
                <label className='text-xs sm:text-sm text-gray-600 whitespace-nowrap'>
                  Mostrar:
                </label>
                <select
                  value={pageSize}
                  onChange={e => onPageSizeChange(Number(e.target.value))}
                  className='px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[70px]'
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className='text-xs sm:text-sm text-gray-600 whitespace-nowrap hidden sm:inline'>
                  por página
                </span>
              </div>
            )}
          </div>

          {/* Grupo derecho: Acciones múltiples y controles secundarios */}
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0'>
            {/* Acciones masivas (solo aparecen cuando hay selección) */}
            {selectedCount > 0 && bulkActions.length > 0 && (
              <div className='flex gap-2 flex-wrap'>
                {bulkActions
                  .filter(action => !action.hidden)
                  .map(action => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.id}
                        onClick={action.onClick}
                        className={`inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors ${getVariantStyles(
                          action.variant
                        )}`}
                      >
                        {Icon && <Icon className='w-4 h-4 sm:mr-2' />}
                        <span className='hidden sm:inline'>{action.label}</span>
                      </button>
                    )
                  })}
              </div>
            )}

            {/* Botones de filtros y exportar */}
            <div className='flex gap-2'>
              {showExport && onExport && (
                <button
                  onClick={onExport}
                  className={`inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    selectedCount > 0
                      ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                  title={
                    selectedCount > 0
                      ? `Exportar ${selectedCount} registros seleccionados`
                      : 'Exportar todos los registros'
                  }
                >
                  <ArrowDownTrayIcon className='w-4 h-4 sm:mr-2' />
                  <span className='hidden sm:inline'>
                    {exportLabel ||
                      (selectedCount > 0
                        ? `Exportar (${selectedCount})`
                        : 'Exportar')}
                  </span>
                </button>
              )}

              {showFilters && onToggleFilters && (
                <button
                  onClick={onToggleFilters}
                  className={`inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    filtersOpen
                      ? 'border-blue-300 text-blue-700 bg-blue-50'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <FunnelIcon className='w-4 h-4 sm:mr-2' />
                  <span className='hidden sm:inline'>Filtros</span>
                </button>
              )}

              {/* Acciones extra personalizadas */}
              {extraActions}
            </div>

            {/* Botón de acción principal */}
            {primaryAction && (
              <div className='flex gap-2'>
                <button
                  onClick={primaryAction.onClick}
                  className='inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto'
                >
                  {primaryAction.icon ? (
                    <primaryAction.icon className='w-4 h-4 mr-2' />
                  ) : (
                    <PlusIcon className='w-4 h-4 mr-2' />
                  )}
                  {primaryAction.label}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className='mt-4'>
        <div className='relative'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
      </div>

      {/* Panel de filtros */}
      {filtersOpen && (
        <div className='mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg'>
          {customFiltersContent ? (
            customFiltersContent
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              {filters.map(filter => (
                <div key={filter.id}>
                  <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                    {filter.label}
                  </label>
                  <select
                    value={filter.value}
                    onChange={e => filter.onChange(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {onClearFilters && (
                <div className='flex items-end sm:col-span-2 lg:col-span-1'>
                  <button
                    onClick={onClearFilters}
                    className='w-full px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TableHeader
