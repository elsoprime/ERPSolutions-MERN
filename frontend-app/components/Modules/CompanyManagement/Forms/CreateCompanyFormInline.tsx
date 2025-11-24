/**
 * Create Company Form - Inline Version
 * @description: Formulario inline para crear empresas sin modal
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

'use client'
import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { IEnhancedCompany } from '@/interfaces/EnhanchedCompany/EnhancedCompany'
import { CreateCompanyFormData } from '@/schemas/EnhancedCompanySchemas'
import { useCreateCompanyForm } from '@/hooks/CompanyManagement/useCreateCompanyForm'
import FormStepper from '@/components/Shared/FormStepper'
import { FORM_STEPS } from '@/interfaces/EnhanchedCompany/CreateCompanyFormTypes'
import {
    INDUSTRIES,
    CURRENCIES
} from '@/interfaces/EnhanchedCompany/EnhancedCompany'
import { getTranslatedBusinessTypes } from '@/utils/formOptions'
import { PlanFeaturesDisplay } from '@/components/Plans/PlanFeaturesDisplay'
import {
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/20/solid'

/**
 * Props del componente inline
 */
export interface CreateCompanyFormInlineProps {
    onCancel: () => void
    onSuccess: (company: IEnhancedCompany) => void
    initialValues?: Partial<CreateCompanyFormData>
}

/**
 * Componente de formulario inline (sin modal)
 */
export default function CreateCompanyFormInline({
    onCancel,
    onSuccess,
    initialValues
}: CreateCompanyFormInlineProps) {
    const formState = useCreateCompanyForm({
        onSuccess,
        initialValues
    })

    // Opciones de tipo de negocio
    const businessTypeOptions = getTranslatedBusinessTypes()

    // Renderizar indicador de validación mejorado
    const renderValidationIndicator = () => {
        if (formState.isCurrentStepValid) {
            return (
                <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
                    <div className='flex items-center'>
                        <CheckCircleIcon className='w-5 h-5 text-green-600 mr-2' />
                        <p className='text-sm text-green-800'>
                            Todos los campos requeridos están completos
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6'>
                <div className='flex items-center'>
                    <ExclamationTriangleIcon className='w-5 h-5 text-amber-600 mr-2' />
                    <p className='text-sm text-amber-800'>
                        Complete todos los campos obligatorios para continuar al siguiente paso
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='bg-white shadow-sm rounded-lg animate-fade-in'>
            {/* Header con título y botón cancelar */}
            <div className='px-4 py-2 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-xl font-bold text-gray-900'>
                            Nueva Empresa
                        </h2>
                        <p className='text-xs text-gray-600 mt-1'>
                            Complete los {FORM_STEPS.length} pasos para registrar una nueva empresa en el sistema
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className='text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full'
                        type='button'
                        title='Cancelar y volver'
                    >
                        <XMarkIcon className='w-6 h-6' />
                    </button>
                </div>

                {/* Stepper de pasos */}
                <div className='mt-2'>
                    <FormStepper
                        steps={FORM_STEPS}
                        currentStep={formState.currentStep}
                        onStepClick={formState.goToStep}
                        showProgress={true}
                    />
                </div>
            </div>

            {/* Contenido del formulario */}
            <form
                onSubmit={formState.handleSubmit}
                onKeyDown={(e) => {
                    // Prevenir submit con Enter en cualquier paso que no sea el final
                    if (e.key === 'Enter') {
                        const target = e.target as HTMLElement
                        const isTextarea = target.tagName === 'TEXTAREA'
                        const isFinalStep = formState.currentStep === 4
                        const isSubmitButton = target.getAttribute('type') === 'submit'

                        if (!isTextarea && !isFinalStep && !isSubmitButton) {
                            e.preventDefault()
                            e.stopPropagation()
                        }
                    }
                }}
                className='p-4'
            >
                {/* PASO 1: Información Básica */}
                {formState.currentStep === 1 && (
                    <div className='space-y-6'>
                        {/* Indicador de validación mejorado */}
                        {renderValidationIndicator()}
                        {/* Información Básica */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Nombre de la Empresa *
                                </label>
                                <input
                                    type='text'
                                    {...formState.register('name')}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                                    placeholder='Ej: Mi Empresa SPA'
                                />
                                {formState.errors.name && (
                                    <p className='text-red-500 text-xs mt-1'>
                                        {formState.errors.name.message}
                                    </p>
                                )}
                                {formState.slugPreview && (
                                    <p className='text-gray-500 text-xs mt-1'>
                                        Slug:{' '}
                                        <code className='bg-gray-100 px-1 rounded'>
                                            {formState.slugPreview}
                                        </code>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Email de Contacto *
                                </label>
                                <input
                                    type='email'
                                    {...formState.register('email')}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    placeholder='contacto@miempresa.com'
                                />
                                {formState.errors.email && (
                                    <p className='text-red-500 text-xs mt-1'>
                                        {formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Teléfono
                                </label>
                                <input
                                    type='tel'
                                    {...formState.register('phone')}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    placeholder='+56 9 1234 5678'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Sitio Web
                                </label>
                                <input
                                    type='url'
                                    {...formState.register('website')}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    placeholder='https://www.miempresa.com'
                                />
                                {formState.errors.website && (
                                    <p className='text-red-500 text-xs mt-1'>
                                        {formState.errors.website.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className='block text-xs font-medium text-gray-700 mb-2'>
                                Descripción
                            </label>
                            <textarea
                                {...formState.register('description')}
                                rows={3}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Breve descripción de la empresa...'
                            />
                        </div>

                        {/* Dirección */}
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Calle *
                                </label>
                                <input
                                    type='text'
                                    {...formState.register('address.street')}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    placeholder='Calle y número'
                                />
                                {formState.errors.address?.street && (
                                    <p className='text-red-500 text-xs mt-1'>
                                        {formState.errors.address.street.message}
                                    </p>
                                )}
                            </div>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                <div>
                                    <label className='block text-xs font-medium text-gray-700 mb-2'>
                                        Ciudad *
                                    </label>
                                    <input
                                        type='text'
                                        {...formState.register('address.city')}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='Ciudad'
                                    />
                                    {formState.errors.address?.city && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {formState.errors.address.city.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className='block text-xs font-medium text-gray-700 mb-2'>
                                        Estado/Región *
                                    </label>
                                    <input
                                        type='text'
                                        {...formState.register('address.state')}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='Región'
                                    />
                                    {formState.errors.address?.state && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {formState.errors.address.state.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className='block text-xs font-medium text-gray-700 mb-2'>
                                        País *
                                    </label>
                                    <input
                                        type='text'
                                        {...formState.register('address.country')}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='País'
                                    />
                                    {formState.errors.address?.country && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {formState.errors.address.country.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className='block text-xs font-medium text-gray-700 mb-2'>
                                        Código Postal *
                                    </label>
                                    <input
                                        type='text'
                                        {...formState.register('address.postalCode')}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='Código postal'
                                    />
                                    {formState.errors.address?.postalCode && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {formState.errors.address.postalCode.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 2: Configuración de Negocio */}
                {formState.currentStep === 2 && (
                    <div className='space-y-6'>
                        {/* Indicador de validación mejorado */}
                        {renderValidationIndicator()}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Tipo de Negocio *
                                </label>
                                <select
                                    {...formState.register('settings.businessType')}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value=''>Seleccionar tipo</option>
                                    {businessTypeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {formState.errors.settings?.businessType && (
                                    <p className='text-red-500 text-xs mt-1'>
                                        {formState.errors.settings.businessType.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Industria *
                                </label>
                                <select
                                    {...formState.register('settings.industry')}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value=''>Seleccionar industria</option>
                                    {INDUSTRIES.map(industry => (
                                        <option key={industry} value={industry}>
                                            {industry}
                                        </option>
                                    ))}
                                </select>
                                {formState.errors.settings?.industry && (
                                    <p className='text-red-500 text-xs mt-1'>
                                        {formState.errors.settings.industry.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    RUT/Tax ID *
                                </label>
                                <input
                                    type='text'
                                    {...formState.register('settings.taxId')}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    placeholder='12.345.678-9'
                                />
                                {formState.errors.settings?.taxId && (
                                    <p className='text-red-500 text-xs mt-1'>
                                        {formState.errors.settings.taxId.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Moneda *
                                </label>
                                <select
                                    {...formState.register('settings.currency')}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    {CURRENCIES.map(currency => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.symbol} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Año Fiscal */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2'>
                                Año Fiscal
                            </h3>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-xs font-medium text-gray-700 mb-2'>
                                        Mes de Inicio *
                                    </label>
                                    <select
                                        {...formState.register('settings.fiscalYear.startMonth', {
                                            valueAsNumber: true
                                        })}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month}>
                                                {new Date(2024, month - 1, 1).toLocaleDateString(
                                                    'es-ES',
                                                    { month: 'long' }
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-xs font-medium text-gray-700 mb-2'>
                                        Mes de Fin *
                                    </label>
                                    <select
                                        {...formState.register('settings.fiscalYear.endMonth', {
                                            valueAsNumber: true
                                        })}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month}>
                                                {new Date(2024, month - 1, 1).toLocaleDateString(
                                                    'es-ES',
                                                    { month: 'long' }
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 3: Plan de Suscripción */}
                {formState.currentStep === 3 && (
                    <div className='space-y-6'>
                        {/* Indicador de validación mejorado */}
                        {renderValidationIndicator()}

                        <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2'>
                            Seleccione el Plan de Suscripción
                        </h3>

                        {formState.plansLoading ? (
                            <div className='text-center py-8'>
                                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
                                <p className='mt-4 text-xs text-gray-600'>Cargando planes disponibles...</p>
                            </div>
                        ) : formState.availablePlans.length === 0 ? (
                            <div className='text-center py-8 text-gray-500'>
                                <p className='text-xs'>No hay planes disponibles</p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                                {formState.availablePlans.map(plan => (
                                    <div
                                        key={plan._id}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative ${formState.selectedPlanId === plan._id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => {
                                            formState.setSelectedPlanId(plan._id)
                                            formState.setValue('subscription.planId', plan._id, {
                                                shouldValidate: true,
                                                shouldDirty: true
                                            })
                                        }}
                                    >
                                        {plan.isRecommended && (
                                            <div className='absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
                                                ⭐ Recomendado
                                            </div>
                                        )}
                                        <div className='text-center'>
                                            <h4 className='font-semibold text-lg'>{plan.name}</h4>
                                            <p className='text-sm text-gray-600 mt-1'>
                                                {plan.description}
                                            </p>
                                            <div className='mt-3 space-y-1'>
                                                <p className='text-xs text-gray-500'>Límites:</p>
                                                <p className='text-xs'>👥 {plan.limits.maxUsers} usuarios</p>
                                                <p className='text-xs'>📦 {plan.limits.maxProducts} productos</p>
                                                <p className='text-xs'>💾 {plan.limits.storageGB} GB</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className='mt-4'>
                            <label className='flex items-center'>
                                <input
                                    type='checkbox'
                                    {...formState.register('subscription.autoRenew')}
                                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                />
                                <span className='ml-2 text-sm text-gray-700'>
                                    Renovación automática
                                </span>
                            </label>
                        </div>

                        {/* Campo oculto para validación de plan */}
                        <input
                            type="hidden"
                            {...formState.register('subscription.planId')}
                        />
                        {formState.errors.subscription?.planId && (
                            <div className='bg-red-50 border border-red-200 rounded-lg p-3 mt-2'>
                                <p className='text-sm text-red-800'>
                                    ⚠️ {formState.errors.subscription.planId.message}
                                </p>
                            </div>
                        )}

                        <div>
                            <PlanFeaturesDisplay
                                features={formState.watch('features')}
                                size='md'
                                columns={3}
                            />
                        </div>
                    </div>
                )}

                {/* PASO 4: Personalización */}
                {formState.currentStep === 4 && (
                    <div className='space-y-6'>
                        {/* Indicador de validación mejorado */}
                        {renderValidationIndicator()}

                        <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2'>
                            Personalización de Marca
                        </h3>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Color Primario *
                                </label>
                                <div className='flex items-center space-x-3'>
                                    <input
                                        type='color'
                                        value={formState.watch('branding.primaryColor') || '#3B82F6'}
                                        onChange={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            formState.setValue('branding.primaryColor', e.target.value, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                                shouldTouch: false
                                            });
                                        }}
                                        className='w-12 h-10 border border-gray-300 rounded-md cursor-pointer'
                                    />
                                    <input
                                        type='text'
                                        {...formState.register('branding.primaryColor')}
                                        className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='#3B82F6'
                                    />
                                </div>
                                {formState.errors.branding?.primaryColor && (
                                    <p className='text-red-500 text-xs mt-1'>
                                        {formState.errors.branding.primaryColor.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-2'>
                                    Color Secundario *
                                </label>
                                <div className='flex items-center space-x-3'>
                                    <input
                                        type='color'
                                        value={formState.watch('branding.secondaryColor') || '#10B981'}
                                        onChange={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            formState.setValue('branding.secondaryColor', e.target.value, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                                shouldTouch: false
                                            });
                                        }}
                                        className='w-12 h-10 border border-gray-300 rounded-md cursor-pointer'
                                    />
                                    <input
                                        type='text'
                                        {...formState.register('branding.secondaryColor')}
                                        className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='#10B981'
                                    />
                                </div>
                                {formState.errors.branding?.secondaryColor && (
                                    <p className='text-red-500 text-xs mt-1'>
                                        {formState.errors.branding.secondaryColor.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Vista previa de colores */}
                        <div className='mt-6 p-4 border border-gray-200 rounded-lg'>
                            <h4 className='text-xs font-medium text-gray-700 mb-3'>
                                Vista Previa de Colores
                            </h4>
                            <div className='flex gap-4'>
                                <div className='flex-1'>
                                    <div
                                        className='h-16 rounded-md flex items-center justify-center text-white font-medium'
                                        style={{
                                            backgroundColor:
                                                formState.watch('branding.primaryColor') || '#3B82F6'
                                        }}
                                    >
                                        Primario
                                    </div>
                                </div>
                                <div className='flex-1'>
                                    <div
                                        className='h-16 rounded-md flex items-center justify-center text-white font-medium'
                                        style={{
                                            backgroundColor:
                                                formState.watch('branding.secondaryColor') || '#10B981'
                                        }}
                                    >
                                        Secundario
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resumen de Configuración */}
                        <div>
                            <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4'>
                                Resumen de Configuración
                            </h3>

                            <div className='bg-gray-50 rounded-lg p-4 space-y-3'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                                    <div>
                                        <strong>Empresa:</strong> {formState.watch('name')}
                                    </div>
                                    <div>
                                        <strong>Email:</strong> {formState.watch('email')}
                                    </div>
                                    <div>
                                        <strong>Industria:</strong> {formState.watch('settings.industry')}
                                    </div>
                                    <div>
                                        <strong>Plan:</strong>{' '}
                                        {
                                            formState.availablePlans.find(
                                                p => p._id === formState.watch('subscription.planId')
                                            )?.name || 'No seleccionado'
                                        }
                                    </div>
                                    <div>
                                        <strong>Moneda:</strong> {formState.watch('settings.currency')}
                                    </div>
                                    <div>
                                        <strong>RUT/Tax ID:</strong> {formState.watch('settings.taxId')}
                                    </div>
                                </div>

                                <div className='mt-4'>
                                    <strong className='text-sm'>Características habilitadas:</strong>
                                    <div className='flex flex-wrap gap-2 mt-2'>
                                        {Object.entries(formState.watch('features') || {}).map(
                                            ([feature, enabled]) =>
                                                enabled && (
                                                    <span
                                                        key={feature}
                                                        className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                                                    >
                                                        {feature.charAt(0).toUpperCase() + feature.slice(1)}
                                                    </span>
                                                )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Navegación entre pasos */}
                <div className='flex items-center justify-between mt-8 pt-6 border-t border-gray-200'>
                    {/* Botón Anterior/Cancelar */}
                    <button
                        type='button'
                        onClick={formState.currentStep === 1 ? onCancel : formState.prevStep}
                        disabled={formState.isSubmitting}
                        className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                        {formState.currentStep === 1 ? 'Cancelar' : 'Anterior'}
                    </button>

                    {/* Indicador de paso */}
                    <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-600'>
                            Paso {formState.currentStep} de {FORM_STEPS.length}
                        </span>
                        {formState.validationInProgress && (
                            <div className='flex items-center gap-2 text-xs text-blue-600'>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                <span>Validando...</span>
                            </div>
                        )}
                    </div>

                    {/* Botón Siguiente/Crear */}
                    {formState.currentStep === FORM_STEPS.length ? (
                        <button
                            type='submit'
                            disabled={formState.isSubmitting || !formState.isCurrentStepValid}
                            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        >
                            {formState.isSubmitting ? (
                                <>
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                                    Creando Empresa...
                                </>
                            ) : (
                                'Crear Empresa'
                            )}
                        </button>
                    ) : (
                        <button
                            type='button'
                            onClick={formState.nextStep}
                            disabled={formState.isSubmitting || formState.validationInProgress || !formState.isCurrentStepValid}
                            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                            title={!formState.isCurrentStepValid ? 'Complete todos los campos requeridos para continuar' : ''}
                        >
                            Siguiente
                            <svg
                                className='ml-2 w-4 h-4'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 5l7 7-7 7'
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Ayuda contextual */}
                <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
                    <div className='flex items-start gap-2'>
                        <svg
                            className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                        </svg>
                        <div className='text-xs text-blue-800'>
                            <p className='font-medium'>
                                {formState.currentStep === 1 && 'Complete la información básica de la empresa'}
                                {formState.currentStep === 2 && 'Configure los datos específicos del negocio'}
                                {formState.currentStep === 3 && 'Seleccione el plan de suscripción'}
                                {formState.currentStep === 4 && 'Personalice los colores de marca'}
                            </p>
                            <p className='text-xs mt-1 text-blue-600'>
                                Los campos marcados con * son obligatorios
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
