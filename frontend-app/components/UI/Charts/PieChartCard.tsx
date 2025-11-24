/**
 * PieChartCard Component
 * @description Gráfica circular (Pie) o de dona (Donut) reutilizable
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

'use client';
import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { SimplePieTooltip } from './CustomTooltip';
import type { PieChartCardProps } from './types';

/**
 * Componente de gráfica circular/donut con estado de carga, error y vacío
 */
export const PieChartCard: React.FC<PieChartCardProps> = ({
    title,
    subtitle,
    data,
    height = 300,
    className = '',
    loading = false,
    error = null,
    emptyMessage = 'No hay datos disponibles',
    showRefresh = false,
    onRefresh,
    innerRadius = 0,
    outerRadius = 90,
    showLabels = false,
    showLegend = true,
    legendPosition = 'bottom',
    paddingAngle = 2,
    tooltipConfig,
    showStats = true,
}) => {
    // Calcular total
    const total = React.useMemo(() => {
        return data.reduce((sum, item) => sum + item.value, 0);
    }, [data]);

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
            <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={height}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            paddingAngle={paddingAngle}
                            dataKey="value"
                            label={showLabels}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>

                        {/* Tooltip */}
                        {tooltipConfig?.show !== false && (
                            <Tooltip
                                content={
                                    tooltipConfig?.custom !== false ? (
                                        <SimplePieTooltip total={total} />
                                    ) : undefined
                                }
                                cursor={tooltipConfig?.cursor}
                            />
                        )}

                        {/* Leyenda */}
                        {showLegend && (
                            <Legend
                                verticalAlign={
                                    legendPosition === 'top' || legendPosition === 'bottom'
                                        ? legendPosition
                                        : 'middle'
                                }
                                align={
                                    legendPosition === 'left' || legendPosition === 'right'
                                        ? legendPosition
                                        : 'center'
                                }
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>

                {/* Estadísticas con barras de progreso */}
                {showStats && (
                    <div className="w-full mt-6 space-y-3">
                        {data.map((item, index) => {
                            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';

                            return (
                                <div key={index} className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-900">
                                                {item.name}
                                            </span>
                                            <span
                                                className="text-sm font-semibold"
                                                style={{ color: item.color }}
                                            >
                                                {item.value.toLocaleString('es-CL')} ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-1.5 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Total */}
                <div className="w-full mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total:</span>
                        <span className="text-lg font-bold text-gray-900">
                            {total.toLocaleString('es-CL')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
