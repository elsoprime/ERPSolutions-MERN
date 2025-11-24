/**
 * BarChartCard Component
 * @description Gráfica de barras horizontal o vertical reutilizable
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

'use client';
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { BarTooltip } from './CustomTooltip';
import { getChartColor } from './chartColors';
import type { BarChartCardProps } from './types';

/**
 * Componente de gráfica de barras con estado de carga, error y vacío
 */
export const BarChartCard: React.FC<BarChartCardProps> = ({
    title,
    subtitle,
    data,
    dataKey,
    nameKey = 'name',
    height = 300,
    className = '',
    loading = false,
    error = null,
    emptyMessage = 'No hay datos disponibles',
    showRefresh = false,
    onRefresh,
    layout = 'horizontal',
    barColor = 'blue',
    useCustomColors = false,
    showGrid = true,
    barRadius,
    xAxisConfig,
    yAxisConfig,
    tooltipConfig,
}) => {
    // Obtener color de la barra
    const defaultBarColor = getChartColor(barColor);

    // Radio de bordes por defecto (asegurar tipo correcto)
    const radius: number | [number, number, number, number] =
        barRadius !== undefined ? barRadius : [8, 8, 0, 0];

    // Renderizar estado de carga
    if (loading) {
        return (
            <div className={`bg-white shadow rounded-lg border border-gray-200 p-6 ${className}`}>
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div style={{ height: `${height}px` }} className="flex items-center justify-center">
                    <LoadingSpinner text="Cargando gráfica..." fullScreen={false} />
                </div>
            </div>
        );
    }

    // Renderizar estado de error
    if (error) {
        return (
            <div className={`bg-white shadow rounded-lg border border-gray-200 p-6 ${className}`}>
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div style={{ height: `${height}px` }} className="flex flex-col items-center justify-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                    {showRefresh && onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Reintentar
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Renderizar estado vacío
    if (!data || data.length === 0) {
        return (
            <div className={`bg-white shadow rounded-lg border border-gray-200 p-6 ${className}`}>
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div style={{ height: `${height}px` }} className="flex flex-col items-center justify-center">
                    <div className="text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Renderizar gráfica
    return (
        <div className={`bg-white shadow rounded-lg border border-gray-200 p-6 ${className}`}>
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                {showRefresh && onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
                        title="Actualizar datos"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Gráfica */}
            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={data}
                    layout={layout}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    {/* Grilla */}
                    {showGrid && (
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    )}

                    {/* Ejes */}
                    {layout === 'horizontal' ? (
                        <>
                            <XAxis
                                dataKey={nameKey}
                                tick={{ fontSize: xAxisConfig?.fontSize || 12 }}
                                stroke={xAxisConfig?.stroke || '#9ca3af'}
                                angle={xAxisConfig?.angle || 0}
                                textAnchor={xAxisConfig?.textAnchor || 'middle'}
                                height={xAxisConfig?.height || 60}
                                tickFormatter={xAxisConfig?.tickFormatter}
                            />
                            <YAxis
                                tick={{ fontSize: yAxisConfig?.fontSize || 12 }}
                                stroke={yAxisConfig?.stroke || '#9ca3af'}
                                tickFormatter={yAxisConfig?.tickFormatter}
                            />
                        </>
                    ) : (
                        <>
                            <XAxis
                                type="number"
                                tick={{ fontSize: xAxisConfig?.fontSize || 12 }}
                                stroke={xAxisConfig?.stroke || '#9ca3af'}
                                tickFormatter={xAxisConfig?.tickFormatter}
                            />
                            <YAxis
                                type="category"
                                dataKey={nameKey}
                                tick={{ fontSize: yAxisConfig?.fontSize || 11 }}
                                stroke={yAxisConfig?.stroke || '#9ca3af'}
                                width={yAxisConfig?.width || 120}
                                tickFormatter={yAxisConfig?.tickFormatter}
                            />
                        </>
                    )}

                    {/* Tooltip */}
                    {tooltipConfig?.show !== false && (
                        <Tooltip
                            content={
                                tooltipConfig?.custom !== false ? <BarTooltip /> : undefined
                            }
                            cursor={tooltipConfig?.cursor !== false ? { fill: '#f3f4f6' } : false}
                        />
                    )}

                    {/* Barras */}
                    <Bar dataKey={dataKey} radius={radius}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={useCustomColors && entry.color ? entry.color : defaultBarColor}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
