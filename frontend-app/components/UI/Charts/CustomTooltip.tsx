/**
 * Custom Tooltip Component for Charts
 * @description Tooltip reutilizable y personalizable para todas las gráficas
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import React from 'react';
import { TooltipPayload } from './types';

/**
 * Props del tooltip personalizado
 */
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color?: string;
        dataKey?: string;
        payload?: TooltipPayload;
    }>;
    label?: string;
    /** Formato personalizado para el valor */
    valueFormatter?: (value: number) => string;
    /** Mostrar porcentaje si está disponible */
    showPercentage?: boolean;
}

/**
 * Tooltip personalizado para gráficas de Recharts
 * Proporciona un diseño consistente y profesional
 */
export const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
    valueFormatter,
    showPercentage = false,
}) => {
    // Si no está activo o no hay datos, no mostrar nada
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    // Formato por defecto para números
    const defaultFormatter = (value: number): string => {
        return value.toLocaleString('es-CL');
    };

    const formatter = valueFormatter || defaultFormatter;

    return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            {/* Etiqueta principal (ej: mes, categoría) */}
            {label && (
                <p className="font-medium text-gray-900 mb-2 border-b border-gray-100 pb-1">
                    {label}
                </p>
            )}

            {/* Datos de las series */}
            <div className="space-y-1">
                {payload.map((entry, index) => {
                    const percentage = entry.payload?.percentage;

                    return (
                        <div key={index} className="flex items-center justify-between gap-3">
                            {/* Indicador de color */}
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-gray-700">{entry.name}:</span>
                            </div>

                            {/* Valor */}
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold" style={{ color: entry.color }}>
                                    {formatter(entry.value)}
                                </span>
                                {showPercentage && percentage && (
                                    <span className="text-xs text-gray-500">
                                        ({percentage})
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Información adicional del payload si existe */}
            {payload[0]?.payload?.fullName && payload[0].payload.fullName !== payload[0].payload.name && (
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                    {payload[0].payload.fullName}
                </p>
            )}
        </div>
    );
};

/**
 * Tooltip simple para gráficas de Pie/Donut
 */
interface SimplePieTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload?: {
            name: string;
            value: number;
            color: string;
            percentage?: string;
        };
    }>;
    total?: number;
}

export const SimplePieTooltip: React.FC<SimplePieTooltipProps> = ({
    active,
    payload,
    total,
}) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;
    if (!data) return null;

    const percentage = total
        ? ((data.value / total) * 100).toFixed(1)
        : data.percentage;

    return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{data.name}</p>
            <p className="text-sm mt-1" style={{ color: data.color }}>
                Valor: <span className="font-semibold">{data.value.toLocaleString('es-CL')}</span>
            </p>
            {percentage && (
                <p className="text-xs text-gray-500 mt-1">
                    {percentage}% del total
                </p>
            )}
        </div>
    );
};

/**
 * Tooltip para gráficas de barras con información extendida
 */
interface BarTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload?: {
            name: string;
            fullName?: string;
            value: number;
            color?: string;
        };
    }>;
    label?: string;
}

export const BarTooltip: React.FC<BarTooltipProps> = ({
    active,
    payload,
    label,
}) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;
    if (!data) return null;

    return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">
                {data.fullName || data.name || label}
            </p>
            <p className="text-sm mt-1" style={{ color: data.color }}>
                {payload[0].name}: <span className="font-semibold">{data.value.toLocaleString('es-CL')}</span>
            </p>
        </div>
    );
};
