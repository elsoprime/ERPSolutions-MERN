/**
 * TableLoadingState Component
 * @description Skeleton loader para tablas en estado de carga
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

'use client';

import React from 'react';

interface TableLoadingStateProps {
    /** Número de filas a mostrar */
    rows?: number;
    /** Número de columnas a mostrar */
    columns?: number;
    /** Mostrar checkbox de selección */
    showCheckbox?: boolean;
    /** Altura de cada fila */
    rowHeight?: string;
}

export const TableLoadingState: React.FC<TableLoadingStateProps> = ({
    rows = 5,
    columns = 5,
    showCheckbox = true,
    rowHeight = 'h-16',
}) => {
    return (
        <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* Header Skeleton */}
                    <thead className="bg-gray-50">
                        <tr>
                            {showCheckbox && (
                                <th className="px-6 py-3 w-12">
                                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                                </th>
                            )}
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="px-6 py-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body Skeleton */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className={rowHeight}>
                                {showCheckbox && (
                                    <td className="px-6 py-4">
                                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                                    </td>
                                )}
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <div
                                            className="h-4 bg-gray-200 rounded animate-pulse"
                                            style={{
                                                width: `${Math.random() * 40 + 60}%`,
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableLoadingState;
