/**
 * @fileoverview Plan Management Modal Component
 * @description Modal para gestionar planes de suscripción (CRUD completo)
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

'use client';

import React, { useState, useMemo } from 'react';
import { FormModal } from '@/components/Shared/FormModal';
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '@/hooks/usePlans';
import { IPlan, PlanType, PlanStatus, CreatePlanDTO } from '@/types/plan';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

interface PlanManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal principal de gestión de planes
 */
export const PlanManagementModal: React.FC<PlanManagementModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [activeView, setActiveView] = useState<'list' | 'create' | 'edit'>('list');
    const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);

    // React Query hooks
    const { data: plans, isLoading } = usePlans();
    const createMutation = useCreatePlan();
    const updateMutation = useUpdatePlan();
    const deleteMutation = useDeletePlan();

    // Handlers
    const handleCreate = () => {
        setSelectedPlan(null);
        setActiveView('create');
    };

    const handleEdit = (plan: IPlan) => {
        setSelectedPlan(plan);
        setActiveView('edit');
    };

    const handleDelete = async (planId: string) => {
        if (window.confirm('¿Estás seguro de eliminar este plan?')) {
            await deleteMutation.mutateAsync(planId);
        }
    };

    const handleBack = () => {
        setActiveView('list');
        setSelectedPlan(null);
    };

    const handleSubmit = async (planData: CreatePlanDTO) => {
        try {
            if (activeView === 'create') {
                await createMutation.mutateAsync(planData);
            } else if (activeView === 'edit' && selectedPlan?._id) {
                await updateMutation.mutateAsync({
                    id: selectedPlan._id,
                    data: planData,
                });
            }
            handleBack();
        } catch (error) {
            console.error('Error al guardar plan:', error);
        }
    };

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={
                activeView === 'list'
                    ? 'Gestión de Planes de Suscripción'
                    : activeView === 'create'
                        ? 'Crear Nuevo Plan'
                        : 'Editar Plan'
            }
            size="6xl"
        >
            <div className="p-6">
                {activeView === 'list' && (
                    <PlanListView
                        plans={plans ?? []}
                        isLoading={isLoading}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}

                {(activeView === 'create' || activeView === 'edit') && (
                    <PlanFormView
                        plan={selectedPlan}
                        onSubmit={handleSubmit}
                        onCancel={handleBack}
                        isSubmitting={createMutation.isPending || updateMutation.isPending}
                    />
                )}
            </div>
        </FormModal>
    );
};

/**
 * Vista de lista de planes
 */
interface PlanListViewProps {
    plans: IPlan[];
    isLoading: boolean;
    onCreate: () => void;
    onEdit: (plan: IPlan) => void;
    onDelete: (planId: string) => void;
}

const PlanListView: React.FC<PlanListViewProps> = ({
    plans,
    isLoading,
    onCreate,
    onEdit,
    onDelete,
}) => {
    const planTypeLabels: Record<PlanType, string> = {
        [PlanType.FREE]: 'Gratuito',
        [PlanType.BASIC]: 'Básico',
        [PlanType.PROFESSIONAL]: 'Profesional',
        [PlanType.ENTERPRISE]: 'Empresarial',
    };

    const statusLabels: Record<PlanStatus, { label: string; color: string }> = {
        [PlanStatus.ACTIVE]: { label: 'Activo', color: 'text-green-600 bg-green-50' },
        [PlanStatus.INACTIVE]: { label: 'Inactivo', color: 'text-gray-600 bg-gray-50' },
        [PlanStatus.DEPRECATED]: { label: 'Obsoleto', color: 'text-red-600 bg-red-50' },
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Cargando planes...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header con botón crear */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                    Gestiona los planes de suscripción disponibles en el sistema
                </p>
                <button
                    onClick={onCreate}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Crear Plan
                </button>
            </div>

            {/* Grid de planes */}
            {plans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">No hay planes registrados</p>
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Crear primer plan
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan._id}
                            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                        >
                            {/* Header del plan */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                                    <span className="text-sm text-gray-500">{planTypeLabels[plan.type]}</span>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${statusLabels[plan.status].color
                                        }`}
                                >
                                    {statusLabels[plan.status].label}
                                </span>
                            </div>

                            {/* Descripción */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>

                            {/* Precio */}
                            <div className="mb-4 pb-4 border-b border-gray-100">
                                <div className="flex items-baseline">
                                    <span className="text-2xl font-bold text-gray-900">
                                        ${plan.price.monthly}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-1">/ mes</span>
                                </div>
                                {plan.price.annual > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        ${plan.price.annual} / año ({plan.price.annualDiscount}% descuento)
                                    </div>
                                )}
                            </div>

                            {/* Límites destacados */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-xs text-gray-600">
                                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                                    {plan.limits.maxUsers} usuarios
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                                    {plan.limits.maxCompanies} empresa(s)
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                                    {plan.limits.storageLimit} MB almacenamiento
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit(plan)}
                                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <PencilIcon className="w-4 h-4 mr-1" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => plan._id && onDelete(plan._id)}
                                    className="px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 transition-colors"
                                    title="Eliminar plan"
                                    aria-label="Eliminar plan"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Vista de formulario para crear/editar plan
 */
interface PlanFormViewProps {
    plan: IPlan | null;
    onSubmit: (planData: CreatePlanDTO) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const PlanFormView: React.FC<PlanFormViewProps> = ({
    plan,
    onSubmit,
    onCancel,
    isSubmitting,
}) => {
    const [formData, setFormData] = useState<CreatePlanDTO>(
        plan ?? {
            name: '',
            description: '',
            type: PlanType.FREE,
            status: PlanStatus.ACTIVE,
            price: {
                monthly: 0,
                annual: 0,
                currency: 'USD',
                annualDiscount: 0,
            },
            limits: {
                maxUsers: 1,
                maxCompanies: 1,
                storageLimit: 100,
                monthlyTransactions: 100,
                monthlyDocuments: 50,
                maxProducts: 100,
            },
            features: {
                userManagement: false,
                customRoles: false,
                inventory: false,
                sales: false,
                purchases: false,
                accounting: false,
                advancedReports: false,
                apiAccess: false,
                prioritySupport: false,
                cloudStorage: false,
                autoBackup: false,
                multiCurrency: false,
                thirdPartyIntegrations: false,
                advancedAudit: false,
            },
            isRecommended: false,
            displayOrder: 1,
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Información Básica</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Plan *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Plan Premium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Plan *
                        </label>
                        <select
                            required
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({ ...formData, type: e.target.value as PlanType })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={PlanType.FREE}>Gratuito</option>
                            <option value={PlanType.BASIC}>Básico</option>
                            <option value={PlanType.PROFESSIONAL}>Profesional</option>
                            <option value={PlanType.ENTERPRISE}>Empresarial</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción *
                        </label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe las características principales del plan"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({ ...formData, status: e.target.value as PlanStatus })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={PlanStatus.ACTIVE}>Activo</option>
                            <option value={PlanStatus.INACTIVE}>Inactivo</option>
                            <option value={PlanStatus.DEPRECATED}>Obsoleto</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Orden de visualización
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.displayOrder}
                            onChange={(e) =>
                                setFormData({ ...formData, displayOrder: parseInt(e.target.value) })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Precios */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Precios</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio Mensual ($)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price.monthly}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    price: { ...formData.price, monthly: parseFloat(e.target.value) },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio Anual ($)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price.annual}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    price: { ...formData.price, annual: parseFloat(e.target.value) },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descuento Anual (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.price.annualDiscount}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    price: { ...formData.price, annualDiscount: parseInt(e.target.value) },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                        <input
                            type="text"
                            value={formData.price.currency}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    price: { ...formData.price, currency: e.target.value },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Límites */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Límites del Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Máximo de Usuarios
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.limits.maxUsers}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    limits: { ...formData.limits, maxUsers: parseInt(e.target.value) },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Máximo de Empresas
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.limits.maxCompanies}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    limits: { ...formData.limits, maxCompanies: parseInt(e.target.value) },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Almacenamiento (MB)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.limits.storageLimit}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    limits: { ...formData.limits, storageLimit: parseInt(e.target.value) },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transacciones Mensuales
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.limits.monthlyTransactions}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    limits: {
                                        ...formData.limits,
                                        monthlyTransactions: parseInt(e.target.value),
                                    },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Documentos Mensuales
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.limits.monthlyDocuments}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    limits: {
                                        ...formData.limits,
                                        monthlyDocuments: parseInt(e.target.value),
                                    },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Máximo de Productos
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.limits.maxProducts}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    limits: { ...formData.limits, maxProducts: parseInt(e.target.value) },
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Características */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Características del Plan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(formData.features).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        features: { ...formData.features, [key]: e.target.checked },
                                    })
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                {key
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/^./, (str) => str.toUpperCase())}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Opciones adicionales */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.isRecommended}
                        onChange={(e) =>
                            setFormData({ ...formData, isRecommended: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        Marcar como plan recomendado
                    </span>
                </label>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Guardando...' : plan ? 'Actualizar Plan' : 'Crear Plan'}
                </button>
            </div>
        </form>
    );
};

export default PlanManagementModal;
