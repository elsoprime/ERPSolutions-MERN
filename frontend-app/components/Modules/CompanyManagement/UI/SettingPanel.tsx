/**
 * System Settings Panel
 * @description: Panel de configuraciones globales del sistema
 * @author: Esteban Soto Ojeda (@elsoprimeDev)
 */

'use client'
import React from 'react'
import {
    ChartBarIcon,
    CogIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { useSystemHealth } from '@/hooks/useSystemHealth'
import { HealthStatus } from '@/types/healthCheck'

interface SystemSettingsPanelProps {
    onOpenPlanManagement: () => void
}

export default function SystemSettingsPanel({
    onOpenPlanManagement
}: SystemSettingsPanelProps) {
    // Health Check Hook
    const { data: healthData, isLoading: isLoadingHealth } = useSystemHealth()

    // Función auxiliar para obtener ícono y color según el estado
    const getHealthStatusDisplay = (status?: HealthStatus) => {
        if (isLoadingHealth || !status) {
            return { icon: '⏳', color: 'text-gray-400' }
        }

        switch (status) {
            case HealthStatus.HEALTHY:
                return { icon: '✓', color: 'text-green-600' }
            case HealthStatus.DEGRADED:
                return { icon: '⚠', color: 'text-yellow-600' }
            case HealthStatus.UNHEALTHY:
                return { icon: '✗', color: 'text-red-600' }
            default:
                return { icon: '?', color: 'text-gray-400' }
        }
    }

    return (
        <div className='space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-lg shadow p-4 sm:p-6'>
                <h2 className='text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4'>
                    Configuraciones Globales
                </h2>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                    {/* Configuración de Planes */}
                    <div className='bg-gray-50 rounded-lg p-3 sm:p-4'>
                        <div className='flex items-center mb-2 sm:mb-3'>
                            <div className='w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                                <ChartBarIcon className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600' />
                            </div>
                            <h3 className='ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-900'>
                                Gestión de Planes
                            </h3>
                        </div>
                        <p className='text-xs text-gray-600 mb-2 sm:mb-3'>
                            Configurar límites y características de los planes de suscripción
                        </p>
                        <button
                            onClick={onOpenPlanManagement}
                            className='text-xs text-blue-600 hover:text-blue-800 font-medium'
                        >
                            Configurar →
                        </button>
                    </div>

                    {/* Configuración de Sistemas */}
                    <div className='bg-gray-50 rounded-lg p-3 sm:p-4'>
                        <div className='flex items-center mb-2 sm:mb-3'>
                            <div className='w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                                <CogIcon className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600' />
                            </div>
                            <h3 className='ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-900'>
                                Configuración Sistema
                            </h3>
                        </div>
                        <p className='text-xs text-gray-600 mb-2 sm:mb-3'>
                            Configuraciones globales de la plataforma
                        </p>
                        <button className='text-xs text-green-600 hover:text-green-800 font-medium'>
                            Configurar →
                        </button>
                    </div>

                    {/* Monitoreo y Logs */}
                    <div className='bg-gray-50 rounded-lg p-3 sm:p-4'>
                        <div className='flex items-center mb-2 sm:mb-3'>
                            <div className='w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                                <BuildingOfficeIcon className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600' />
                            </div>
                            <h3 className='ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-900'>
                                Logs y Auditoría
                            </h3>
                        </div>
                        <p className='text-xs text-gray-600 mb-2 sm:mb-3'>
                            Revisar logs de actividad y auditoría del sistema
                        </p>
                        <button className='text-xs text-purple-600 hover:text-purple-800 font-medium'>
                            Ver logs →
                        </button>
                    </div>
                </div>

                {/* Estadísticas rápidas - Estado del Sistema */}
                <div className='mt-6 sm:mt-8 border-t border-gray-200 pt-4 sm:pt-6'>
                    <div className='flex items-center justify-between mb-3 sm:mb-4'>
                        <h3 className='text-xs sm:text-sm font-medium text-gray-900'>
                            Estado del Sistema
                        </h3>
                        {isLoadingHealth && (
                            <span className='text-xs text-gray-500'>Verificando...</span>
                        )}
                        {!isLoadingHealth && healthData && (
                            <span className='text-xs text-gray-500'>
                                Actualizado:{' '}
                                {new Date(healthData.timestamp).toLocaleTimeString('es-ES')}
                            </span>
                        )}
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'>
                        {/* Base de Datos */}
                        <div className='text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
                            <div
                                className={`text-2xl font-bold ${getHealthStatusDisplay(healthData?.services.database.status)
                                        .color
                                    }`}
                            >
                                {
                                    getHealthStatusDisplay(healthData?.services.database.status)
                                        .icon
                                }
                            </div>
                            <div className='text-xs text-gray-600 mt-1'>Base de Datos</div>
                            {healthData?.services.database.responseTime && (
                                <div className='text-xs text-gray-400 mt-0.5'>
                                    {healthData.services.database.responseTime}ms
                                </div>
                            )}
                        </div>

                        {/* API Server */}
                        <div className='text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
                            <div
                                className={`text-2xl font-bold ${getHealthStatusDisplay(healthData?.services.api.status).color
                                    }`}
                            >
                                {getHealthStatusDisplay(healthData?.services.api.status).icon}
                            </div>
                            <div className='text-xs text-gray-600 mt-1'>API Server</div>
                            {healthData?.services.api.responseTime !== undefined && (
                                <div className='text-xs text-gray-400 mt-0.5'>
                                    {healthData.services.api.responseTime}ms
                                </div>
                            )}
                        </div>

                        {/* File Storage */}
                        <div className='text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
                            <div
                                className={`text-2xl font-bold ${getHealthStatusDisplay(healthData?.services.storage.status)
                                        .color
                                    }`}
                            >
                                {
                                    getHealthStatusDisplay(healthData?.services.storage.status)
                                        .icon
                                }
                            </div>
                            <div className='text-xs text-gray-600 mt-1'>File Storage</div>
                            {healthData?.services.storage.responseTime && (
                                <div className='text-xs text-gray-400 mt-0.5'>
                                    {healthData.services.storage.responseTime}ms
                                </div>
                            )}
                        </div>

                        {/* Email Service */}
                        <div className='text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
                            <div
                                className={`text-2xl font-bold ${getHealthStatusDisplay(healthData?.services.email.status)
                                        .color
                                    }`}
                            >
                                {getHealthStatusDisplay(healthData?.services.email.status).icon}
                            </div>
                            <div className='text-xs text-gray-600 mt-1'>Email Service</div>
                            {healthData?.services.email.responseTime !== undefined && (
                                <div className='text-xs text-gray-400 mt-0.5'>
                                    {healthData.services.email.responseTime}ms
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mensaje de estado general */}
                    {healthData && (
                        <div className='mt-4 text-center'>
                            <span
                                className={`text-xs font-medium ${healthData.status === HealthStatus.HEALTHY
                                        ? 'text-green-600'
                                        : healthData.status === HealthStatus.DEGRADED
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                    }`}
                            >
                                {healthData.status === HealthStatus.HEALTHY &&
                                    '✓ Todos los servicios operativos'}
                                {healthData.status === HealthStatus.DEGRADED &&
                                    `⚠ ${healthData.overall.degraded} servicio(s) con problemas`}
                                {healthData.status === HealthStatus.UNHEALTHY &&
                                    `✗ ${healthData.overall.unhealthy} servicio(s) no disponible(s)`}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}