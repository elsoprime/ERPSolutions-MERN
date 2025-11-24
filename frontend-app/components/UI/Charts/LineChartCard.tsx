/**
 * LineChartCard Component
 * @description Gráfica de líneas para tendencias y comparaciones multi-series
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

'use client';
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { CustomTooltip } from './CustomTooltip';
import { getChartColor } from './chartColors';
import type { LineChartCardProps } from './types';

/**
 * Componente de gráfica de líneas con estado de carga, error y vacío
 */
export const LineChartCard: React.FC<LineChartCardProps> = ({
    title,
    subtitle,
    data,
    dataKeys,
    xAxisKey,
    height = 300,
    className = '',
    loading = false,
    error = null,
    emptyMessage = 'No hay datos disponibles',
    showRefresh = false,
    onRefresh,
    showGrid = true,
    showLegend = true,
    showDots = true,
    curveType = 'monotone',
    xAxisConfig,
    yAxisConfig,
    tooltipConfig,
}) => {
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
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    {/* Grilla */}
                    {showGrid && (
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    )}

                    {/* Ejes */}
                    <XAxis
                        dataKey={xAxisKey}
                        tick={{ fontSize: xAxisConfig?.fontSize || 12 }}
                        stroke={xAxisConfig?.stroke || '#9ca3af'}
                        angle={xAxisConfig?.angle || 0}
                        textAnchor={xAxisConfig?.textAnchor || 'middle'}
                        height={xAxisConfig?.height}
                        tickFormatter={xAxisConfig?.tickFormatter}
                    />
                    <YAxis
                        tick={{ fontSize: yAxisConfig?.fontSize || 12 }}
                        stroke={yAxisConfig?.stroke || '#9ca3af'}
                        tickFormatter={yAxisConfig?.tickFormatter}
                    />

                    {/* Tooltip */}
                    {tooltipConfig?.show !== false && (
                        <Tooltip
                            content={
                                tooltipConfig?.custom !== false ? (
                                    <CustomTooltip
                                        valueFormatter={
                                            tooltipConfig?.formatter
                                                ? (value) => {
                                                    const result = tooltipConfig.formatter!(value, '', {} as any);
                                                    return typeof result === 'string' ? result : String(result);
                                                }
                                                : undefined
                                        }
                                    />
                                ) : undefined
                            }
                            cursor={tooltipConfig?.cursor !== false ? { stroke: '#9ca3af', strokeDasharray: '3 3' } : false}
                        />
                    )}

                    {/* Leyenda */}
                    {showLegend && (
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                    )}

                    {/* Series de líneas */}
                    {dataKeys.map((series) => {
                        const color = getChartColor(series.color);

                        return (
                            <Line
                                key={series.key}
                                type={curveType}
                                dataKey={series.key}
                                stroke={color}
                                strokeWidth={series.strokeWidth || 2}
                                name={series.name}
                                dot={showDots ? { fill: color, r: 4 } : false}
                                activeDot={showDots ? { r: 6 } : false}
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
