/**
 * TableControlsHeader Component
 * @description Header reutilizable con controles, búsqueda y filtros para tablas
 * @author Esteban Soto Ojeda @elsoprimeDev
 * @version 1.0.0
 * @created 10/11/2025
 */

'use client';

import React, { useState } from 'react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import type { TableControlsHeaderProps, ActionVariant } from './types';

/**
 * Componente principal de controles de tabla
 */
export const TableControlsHeader: React.FC<TableControlsHeaderProps> = ({
    // Header
    title,
    subtitle,
    totalCount,
    pageSize,
    selectedCount = 0,
    loading = false,

    // Paginación
    onPageSizeChange,
    pageSizeOptions = [5, 10, 15, 25, 50],

    // Búsqueda
    searchPlaceholder = 'Buscar...',
    searchValue,
    onSearchChange,
    hideSearch = false,

    // Filtros
    showFilters = false,
    onToggleFilters,
    filters = [],
    onClearFilters,
    filterGridCols = 3,

    // Acciones
    primaryAction,
    bulkActions = [],
    secondaryActions = [],

    // Banners
    banner,

    // Customización
    className = '',
    compact = false,
    hideCount = false,
    hidePageSize = false,
}) => {
    const [dismissedBanner, setDismissedBanner] = useState(false);

    /**
     * Obtener clases CSS según variante de acción
     */
    const getActionClasses = (variant: ActionVariant = 'secondary'): string => {
        const baseClasses = 'inline-flex items-center justify-center px-3 py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors';

        const variantClasses = {
            primary: 'border-transparent text-white bg-blue-600 hover:bg-blue-700 shadow-sm',
            secondary: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
            success: 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100',
            warning: 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100',
            danger: 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100',
            info: 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100',
        };

        return `${baseClasses} ${variantClasses[variant]}`;
    };

    /**
     * Obtener clases CSS según tipo de banner
     */
    const getBannerClasses = (type: string): string => {
        const classes = {
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            success: 'bg-green-50 border-green-200 text-green-800',
        };
        return classes[type as keyof typeof classes] || classes.info;
    };

    /**
     * Filtrar acciones visibles según condiciones
     */
    const getVisibleActions = (actions: typeof bulkActions) => {
        return actions.filter(action => {
            if (action.hidden) return false;
            if (action.showOnSelection && selectedCount === 0) return false;
            return true;
        });
    };

    const visibleBulkActions = getVisibleActions(bulkActions);
    const visibleSecondaryActions = getVisibleActions(secondaryActions);

    /**
     * Renderizar un botón de acción
     */
    const renderActionButton = (action: typeof bulkActions[0], key: string) => {
        const Icon = action.icon;
        const label = action.showCount && selectedCount > 0
            ? `${action.label} (${selectedCount})`
            : action.label;

        return (
            <button
                key={key}
                onClick={action.onClick}
                disabled={action.disabled}
                title={action.title}
                className={`${getActionClasses(action.variant)} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    } flex-1 sm:flex-none`}
            >
                {Icon && <Icon className="w-4 h-4 sm:mr-2" />}
                <span className="hidden sm:inline">{label}</span>
            </button>
        );
    };

    /**
     * Renderizar campo de filtro
     */
    const renderFilter = (filter: typeof filters[0]) => {
        if (filter.hidden) return null;

        const colSpanClass = filter.colSpan
            ? `col-span-${filter.colSpan}`
            : '';

        return (
            <div key={filter.key} className={colSpanClass}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                </label>

                {filter.type === 'select' && (
                    <select
                        value={filter.value as string}
                        onChange={(e) => filter.onChange(e.target.value)}
                        disabled={filter.disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        {filter.options?.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                )}

                {filter.type === 'text' && (
                    <input
                        type="text"
                        value={filter.value as string}
                        onChange={(e) => filter.onChange(e.target.value)}
                        disabled={filter.disabled}
                        placeholder={filter.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                )}

                {filter.type === 'date' && (
                    <input
                        type="date"
                        value={filter.value as string}
                        onChange={(e) => filter.onChange(e.target.value)}
                        disabled={filter.disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                )}

                {filter.type === 'checkbox' && (
                    <div className="flex items-center h-10">
                        <input
                            type="checkbox"
                            checked={filter.value === 'true'}
                            onChange={(e) => filter.onChange(e.target.checked ? 'true' : 'false')}
                            disabled={filter.disabled}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                        <span className="ml-2 text-sm text-gray-700">{filter.placeholder}</span>
                    </div>
                )}
            </div>
        );
    };

    const paddingClass = compact ? 'p-3 sm:p-4' : 'p-3 sm:p-4 md:p-6';

    return (
        <div className={`bg-white shadow-sm rounded-t-lg border-b border-gray-200 ${className}`}>
            <div className={paddingClass}>
                <div className="flex flex-col space-y-4">

                    {/* Banner Informativo */}
                    {banner && !dismissedBanner && (
                        <div className={`p-3 border rounded-lg flex items-start gap-2 ${getBannerClasses(banner.type)}`}>
                            {banner.icon && (
                                <banner.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className="text-sm font-medium">{banner.title}</p>
                                <p className="text-xs mt-1">{banner.message}</p>
                            </div>
                            {banner.dismissible && (
                                <button
                                    onClick={() => {
                                        setDismissedBanner(true);
                                        banner.onDismiss?.();
                                    }}
                                    className="flex-shrink-0 hover:opacity-70"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Título y Contador */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                            <h2 className="text-base sm:text-lg font-medium text-gray-900">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {subtitle}
                                </p>
                            )}

                            {/* Contador y Badge de Selección */}
                            {!hideCount && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {loading
                                            ? 'Cargando...'
                                            : `${totalCount.toLocaleString('es-CL')} registros • ${pageSize}/página`}
                                    </p>
                                    {selectedCount > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                                            {selectedCount} seleccionados
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controles - Layout Responsive */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

                        {/* Grupo Izquierdo: Selector de Tamaño de Página */}
                        {!hidePageSize && (
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <label className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                        Mostrar:
                                    </label>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                        className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[70px]"
                                        aria-label="Seleccionar número de registros por página"
                                    >
                                        {pageSizeOptions.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap hidden sm:inline">
                                        por página
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Grupo Derecho: Acciones */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">

                            {/* Acciones Masivas */}
                            {visibleBulkActions.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                    {visibleBulkActions.map((action, index) =>
                                        renderActionButton(action, `bulk-${index}`)
                                    )}
                                </div>
                            )}

                            {/* Acciones Secundarias */}
                            <div className="flex gap-2">
                                {visibleSecondaryActions.map((action, index) =>
                                    renderActionButton(action, `secondary-${index}`)
                                )}

                                {/* Botón de Filtros */}
                                {onToggleFilters && filters.length > 0 && (
                                    <button
                                        onClick={onToggleFilters}
                                        className={`inline-flex items-center justify-center flex-1 sm:flex-none px-3 py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors ${showFilters
                                                ? 'border-blue-300 text-blue-700 bg-blue-50'
                                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                            }`}
                                    >
                                        <FunnelIcon className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Filtros</span>
                                    </button>
                                )}

                                {/* Acción Principal */}
                                {primaryAction && !primaryAction.hidden && (
                                    <button
                                        onClick={primaryAction.onClick}
                                        disabled={primaryAction.disabled}
                                        title={primaryAction.title}
                                        className={`${getActionClasses(primaryAction.variant || 'primary')} ${primaryAction.disabled ? 'opacity-50 cursor-not-allowed' : ''
                                            } w-full sm:w-auto`}
                                    >
                                        {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
                                        {primaryAction.label}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Barra de Búsqueda */}
                    {!hideSearch && (
                        <div className="mt-4">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchValue}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Panel de Filtros */}
                    {showFilters && filters.length > 0 && (
                        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${filterGridCols} gap-3 sm:gap-4`}>
                                {filters.map(renderFilter)}
                            </div>

                            {/* Botón Limpiar Filtros */}
                            {onClearFilters && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={onClearFilters}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableControlsHeader;
