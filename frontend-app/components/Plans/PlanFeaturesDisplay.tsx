import React from 'react';
import { FeatureBadge } from './FeatureBadge';

interface PlanFeatures {
    inventoryManagement: boolean;
    accounting: boolean;
    hrm: boolean;
    crm: boolean;
    projectManagement: boolean;
    reports: boolean;
    multiCurrency: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    auditLog: boolean;
    customIntegrations: boolean;
    dedicatedAccount: boolean;
}

interface PlanFeaturesDisplayProps {
    features: Partial<PlanFeatures>;
    size?: 'sm' | 'md' | 'lg';
    columns?: 1 | 2 | 3;
}

// Mapeo de claves técnicas a etiquetas legibles en español
const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
    inventoryManagement: 'Gestión de Inventario',
    accounting: 'Contabilidad',
    hrm: 'Recursos Humanos',
    crm: 'CRM',
    projectManagement: 'Gestión de Proyectos',
    reports: 'Reportes',
    multiCurrency: 'Multimoneda',
    apiAccess: 'Acceso API',
    customBranding: 'Branding Personalizado',
    prioritySupport: 'Soporte Prioritario',
    advancedAnalytics: 'Analítica Avanzada',
    auditLog: 'Registro de Auditoría',
    customIntegrations: 'Integraciones Personalizadas',
    dedicatedAccount: 'Cuenta Dedicada'
}; export const PlanFeaturesDisplay: React.FC<PlanFeaturesDisplayProps> = ({
    features,
    size = 'md',
    columns = 2
}) => {
    // Convertir el objeto de features a un array ordenado
    const featureEntries = Object.entries(FEATURE_LABELS).map(([key, label]) => ({
        key: key as keyof PlanFeatures,
        label,
        enabled: features[key as keyof PlanFeatures] || false
    }));

    const gridColumns = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Características del Plan
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {featureEntries.filter(f => f.enabled).length} de {featureEntries.length} activas
                </span>
            </div>

            <div className={`grid ${gridColumns[columns]} gap-2`}>
                {featureEntries.map(({ key, label, enabled }) => (
                    <FeatureBadge
                        key={key}
                        label={label}
                        enabled={enabled}
                        size={size}
                    />
                ))}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                Las características están definidas por el plan seleccionado y no pueden modificarse manualmente.
            </p>
        </div>
    );
};
