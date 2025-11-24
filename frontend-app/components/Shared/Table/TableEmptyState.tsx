/**
 * TableEmptyState Component
 * @description Estado vacío para tablas sin datos
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

'use client';

import React from 'react';
import { InboxIcon } from '@heroicons/react/24/outline';

interface TableEmptyStateProps {
    /** Título del mensaje */
    title?: string;
    /** Descripción del mensaje */
    message?: string;
    /** Icono personalizado */
    icon?: React.ComponentType<{ className?: string }>;
    /** Acción principal (ej: Crear primer registro) */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Altura mínima del contenedor */
    minHeight?: string;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
    title = 'No hay datos disponibles',
    message = 'No se encontraron registros. Intenta ajustar los filtros o crea uno nuevo.',
    icon: Icon = InboxIcon,
    action,
    minHeight = '400px',
}) => {
    return (
        <div
            className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
            style={{ minHeight }}
        >
            <Icon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 text-center max-w-md mb-6 px-4">
                {message}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default TableEmptyState;
