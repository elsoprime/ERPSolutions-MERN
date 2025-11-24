/**
 * TableErrorState Component
 * @description Estado de error para tablas
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

'use client';

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface TableErrorStateProps {
    /** Título del error */
    title?: string;
    /** Mensaje de error */
    message?: string;
    /** Acción para reintentar */
    onRetry?: () => void;
    /** Label del botón de reintentar */
    retryLabel?: string;
    /** Altura mínima del contenedor */
    minHeight?: string;
}

export const TableErrorState: React.FC<TableErrorStateProps> = ({
    title = 'Error al cargar datos',
    message = 'Ocurrió un error al cargar los datos. Por favor, intenta nuevamente.',
    onRetry,
    retryLabel = 'Reintentar',
    minHeight = '400px',
}) => {
    return (
        <div
            className="flex flex-col items-center justify-center bg-red-50 rounded-lg border-2 border-red-200"
            style={{ minHeight }}
        >
            <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">{title}</h3>
            <p className="text-sm text-red-700 text-center max-w-md mb-6 px-4">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    {retryLabel}
                </button>
            )}
        </div>
    );
};

export default TableErrorState;
