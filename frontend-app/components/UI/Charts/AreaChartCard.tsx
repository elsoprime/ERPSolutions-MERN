/**
 * AreaChartCard Component
 * @description Gráfica de área con gradientes para tendencias temporales
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

'use client';
import React from 'react';
import {
    AreaChart,
    Area,
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
import { getChartColor, getGradientConfig } from './chartColors';
import type { AreaChartCardProps } from './types';

/**
 * Componente de gráfica de área con estado de carga, error y vacío
 */
export const AreaChartCard: React.FC<AreaChartCardProps> = ({
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
    gradientFill = true,
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
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
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
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    {/* Definir gradientes si está habilitado */}
                    {gradientFill && (
                        <defs>
                            {dataKeys.map((series) => {
                                const gradient = getGradientConfig(series.color);
                                return (
                                    <linearGradient
                                        key={`gradient-${series.key}`}
                                        id={`color${series.key}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="5%" stopColor={gradient.start} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={gradient.start} stopOpacity={0} />
                                    </linearGradient>
                                );
                            })}
                        </defs>
                    )}

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
                    )}                    {/* Leyenda */}
                    {showLegend && (
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                    )}

                    {/* Series de datos */}
                    {dataKeys.map((series) => {
                        const color = getChartColor(series.color);
                        const fillColor = gradientFill ? `url(#color${series.key})` : color;

                        // Si el tipo es línea, renderizar como Line
                        if (series.type === 'line') {
                            return (
                                <Line
                                    key={series.key}
                                    type="monotone"
                                    dataKey={series.key}
                                    stroke={color}
                                    strokeWidth={series.strokeWidth || 2}
                                    name={series.name}
                                    dot={{ fill: color, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            );
                        }

                        // Por defecto, renderizar como Area
                        return (
                            <Area
                                key={series.key}
                                type="monotone"
                                dataKey={series.key}
                                stroke={color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={fillColor}
                                name={series.name}
                            />
                        );
                    })}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
