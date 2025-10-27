/**
 * Create Company Form Component
 * @description: Formulario completo para crear nueva empresa por Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import React, {useState, useEffect} from 'react'
import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {toast} from 'react-toastify'

import {
  ICreateCompanyFormData,
  BUSINESS_TYPES,
  INDUSTRIES,
  CURRENCIES,
  SUBSCRIPTION_PLANS
} from '@/interfaces/EnhancedCompany'
import EnhancedCompanyAPI from '@/api/EnhancedCompanyAPI'
import ConfirmationDialog, {
  ConfirmationDialogAction
} from '@/components/Shared/ConfirmationDialog'
import {
  XMarkIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CogIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'
import {
  CreateCompanyFormData,
  createCompanySchema
} from '@/schemas/EnhancedCompanySchemas'

interface CreateCompanyFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (company: any) => void
}

export default function CreateCompanyForm({
  isOpen,
  onClose,
  onSuccess
}: CreateCompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [slugPreview, setSlugPreview] = useState('')

  // Estado para el diálogo de confirmación/error
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    action: ConfirmationDialogAction
    title: string
    message: string
    confirmText?: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    action: 'error',
    title: '',
    message: ''
  })

  // Función para cerrar el diálogo
  const closeDialog = () => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false
    }))
  }

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: {errors},
    setValue,
    getValues,
    reset,
    trigger
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      subscription: {
        plan: 'basic',
        autoRenew: true
      },
      features: {
        inventory: true,
        accounting: false,
        hrm: false,
        crm: false,
        projects: false
      },
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#64748B'
      },
      settings: {
        currency: 'CLP',
        fiscalYear: {
          startMonth: 1,
          endMonth: 12
        }
      }
    }
  })

  // Observar cambios en el nombre para generar slug
  const watchedName = watch('name')
  useEffect(() => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setSlugPreview(slug)
    }
  }, [watchedName])

  // Observar cambios en el plan para actualizar características
  const watchedPlan = watch('subscription.plan')
  useEffect(() => {
    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === watchedPlan)
    if (selectedPlan) {
      // Actualizar características según el plan
      switch (watchedPlan) {
        case 'free':
          setValue('features', {
            inventory: true,
            accounting: false,
            hrm: false,
            crm: false,
            projects: false
          })
          break
        case 'basic':
          setValue('features', {
            inventory: true,
            accounting: false,
            hrm: true,
            crm: false,
            projects: false
          })
          break
        case 'professional':
          setValue('features', {
            inventory: true,
            accounting: true,
            hrm: false,
            crm: true,
            projects: false
          })
          break
        case 'enterprise':
          setValue('features', {
            inventory: true,
            accounting: true,
            hrm: true,
            crm: true,
            projects: true
          })
          break
      }
    }
  }, [watchedPlan, setValue])

  const onSubmit = async (data: CreateCompanyFormData) => {
    setIsSubmitting(true)
    try {
      console.log('📤 Datos enviados al backend:', data)
      const result = await EnhancedCompanyAPI.createCompany(data)

      if (result.success) {
        // Mostrar toast de éxito
        toast.success('🎉 Empresa creada exitosamente', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })

        onSuccess(result.company)
        reset()
        setCurrentStep(1)
        onClose()
      } else {
        setDialogState({
          isOpen: true,
          action: 'error',
          title: 'Error al crear empresa',
          message: result.message || 'No se pudo crear la empresa',
          confirmText: 'Cerrar',
          onConfirm: closeDialog
        })
      }
    } catch (error) {
      console.error('Error al crear empresa:', error)
      setDialogState({
        isOpen: true,
        action: 'error',
        title: 'Error inesperado',
        message:
          'Error inesperado al crear la empresa. Por favor, intente nuevamente.',
        confirmText: 'Cerrar',
        onConfirm: closeDialog
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para validar campos por etapa
  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: Array<keyof CreateCompanyFormData> = []

    switch (step) {
      case 1: // Información básica (solo campos requeridos)
        fieldsToValidate = ['name', 'email']
        break
      case 2: // Dirección e información de contacto (solo dirección requerida)
        fieldsToValidate = ['address']
        break
      case 3: // Plan y características
        fieldsToValidate = ['subscription']
        break
      case 4: // Configuraciones de negocio
        fieldsToValidate = ['settings']
        break
    }

    // Trigger validation para los campos específicos
    const result = await trigger(fieldsToValidate)
    return result
  }

  const nextStep = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    } else {
      // Mostrar modal de error de validación
      setDialogState({
        isOpen: true,
        action: 'warning',
        title: 'Campos requeridos',
        message:
          'Por favor complete todos los campos requeridos antes de continuar.',
        confirmText: 'Entendido',
        onConfirm: closeDialog
      })
    }
  }

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleClose = () => {
    reset()
    setCurrentStep(1)
    onClose()
  }

  if (!isOpen) return null

  const steps = [
    {number: 1, title: 'Información Básica', icon: BuildingOfficeIcon},
    {number: 2, title: 'Configuración', icon: CogIcon},
    {number: 3, title: 'Plan y Características', icon: UserGroupIcon},
    {number: 4, title: 'Personalización', icon: PaintBrushIcon}
  ]

  const renderStepIndicator = () => (
    <div className='flex items-center justify-center mb-8'>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div
            className={`flex flex-col items-center ${
              currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step.number
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}
            >
              <step.icon className='w-5 h-5' />
            </div>
            <span className='text-xs mt-2 font-medium'>{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Crear Nueva Empresa
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              Complete la información para registrar una nueva empresa en el
              sistema
            </p>
          </div>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <XMarkIcon className='w-6 h-6 text-gray-400' />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
          {renderStepIndicator()}

          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nombre de la Empresa *
                  </label>
                  <input
                    type='text'
                    {...register('name')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ej: Mi Empresa SPA'
                  />
                  {errors.name && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.name.message}
                    </p>
                  )}
                  {slugPreview && (
                    <p className='text-gray-500 text-sm mt-1'>
                      Slug:{' '}
                      <code className='bg-gray-100 px-1 rounded'>
                        {slugPreview}
                      </code>
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email de Contacto *
                  </label>
                  <input
                    type='email'
                    {...register('email')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='contacto@miempresa.com'
                  />
                  {errors.email && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Teléfono
                  </label>
                  <input
                    type='tel'
                    {...register('phone')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='+56 9 1234 5678'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Sitio Web
                  </label>
                  <input
                    type='url'
                    {...register('website')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='https://www.miempresa.com'
                  />
                  {errors.website && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.website.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Breve descripción de la empresa...'
                />
              </div>

              {/* Dirección */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2'>
                  Dirección
                </h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Dirección *
                  </label>
                  <input
                    type='text'
                    {...register('address.street')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Calle y número'
                  />
                  {errors.address?.street && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.address.street.message}
                    </p>
                  )}
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Ciudad *
                    </label>
                    <input
                      type='text'
                      {...register('address.city')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Ciudad'
                    />
                    {errors.address?.city && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.address.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Estado/Región *
                    </label>
                    <input
                      type='text'
                      {...register('address.state')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Región'
                    />
                    {errors.address?.state && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.address.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      País *
                    </label>
                    <input
                      type='text'
                      {...register('address.country')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='País'
                    />
                    {errors.address?.country && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.address.country.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Código Postal *
                    </label>
                    <input
                      type='text'
                      {...register('address.postalCode')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Código postal'
                    />
                    {errors.address?.postalCode && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.address.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuración de Negocio */}
          {currentStep === 2 && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Tipo de Negocio *
                  </label>
                  <select
                    {...register('settings.businessType')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value=''>Seleccionar tipo</option>
                    {BUSINESS_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() +
                          type.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.settings?.businessType && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.settings.businessType.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Industria *
                  </label>
                  <select
                    {...register('settings.industry')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value=''>Seleccionar industria</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  {errors.settings?.industry && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.settings.industry.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    RUT/Tax ID *
                  </label>
                  <input
                    type='text'
                    {...register('settings.taxId')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='12.345.678-9'
                  />
                  {errors.settings?.taxId && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.settings.taxId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Moneda *
                  </label>
                  <select
                    {...register('settings.currency')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} - {currency.name}
                      </option>
                    ))}
                  </select>
                  {errors.settings?.currency && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.settings.currency.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2'>
                  Año Fiscal
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Mes de Inicio *
                    </label>
                    <select
                      {...register('settings.fiscalYear.startMonth', {
                        valueAsNumber: true
                      })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(2024, month - 1, 1).toLocaleDateString(
                            'es-ES',
                            {month: 'long'}
                          )}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Mes de Fin *
                    </label>
                    <select
                      {...register('settings.fiscalYear.endMonth', {
                        valueAsNumber: true
                      })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(2024, month - 1, 1).toLocaleDateString(
                            'es-ES',
                            {month: 'long'}
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Plan y Características */}
          {currentStep === 3 && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4'>
                  Plan de Suscripción
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <div
                      key={plan.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        watch('subscription.plan') === plan.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() =>
                        setValue('subscription.plan', plan.id as any)
                      }
                    >
                      <div className='text-center'>
                        <h4 className='font-semibold text-lg'>{plan.name}</h4>
                        <p className='text-sm text-gray-600 mt-1'>
                          {plan.description}
                        </p>
                        <div className='mt-3 space-y-1'>
                          <p className='text-xs text-gray-500'>Límites:</p>
                          <p className='text-xs'>
                            👥 {plan.limits.maxUsers} usuarios
                          </p>
                          <p className='text-xs'>
                            📦 {plan.limits.maxProducts} productos
                          </p>
                          <p className='text-xs'>
                            💾 {plan.limits.storageGB} GB
                          </p>
                        </div>
                      </div>
                      <input
                        type='radio'
                        {...register('subscription.plan')}
                        value={plan.id}
                        className='sr-only'
                      />
                    </div>
                  ))}
                </div>

                <div className='mt-4'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      {...register('subscription.autoRenew')}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-sm text-gray-700'>
                      Renovación automática
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4'>
                  Características Habilitadas
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <label className='flex items-center p-3 border border-gray-200 rounded-lg'>
                    <input
                      type='checkbox'
                      {...register('features.inventory')}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>
                        Inventario
                      </p>
                      <p className='text-xs text-gray-500'>
                        Gestión de productos y stock
                      </p>
                    </div>
                  </label>

                  <label className='flex items-center p-3 border border-gray-200 rounded-lg'>
                    <input
                      type='checkbox'
                      {...register('features.accounting')}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>
                        Contabilidad
                      </p>
                      <p className='text-xs text-gray-500'>
                        Gestión financiera y contable
                      </p>
                    </div>
                  </label>

                  <label className='flex items-center p-3 border border-gray-200 rounded-lg'>
                    <input
                      type='checkbox'
                      {...register('features.hrm')}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>
                        Recursos Humanos
                      </p>
                      <p className='text-xs text-gray-500'>
                        Gestión de personal
                      </p>
                    </div>
                  </label>

                  <label className='flex items-center p-3 border border-gray-200 rounded-lg'>
                    <input
                      type='checkbox'
                      {...register('features.crm')}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>CRM</p>
                      <p className='text-xs text-gray-500'>
                        Gestión de clientes
                      </p>
                    </div>
                  </label>

                  <label className='flex items-center p-3 border border-gray-200 rounded-lg'>
                    <input
                      type='checkbox'
                      {...register('features.projects')}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>
                        Proyectos
                      </p>
                      <p className='text-xs text-gray-500'>
                        Gestión de proyectos
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Personalización */}
          {currentStep === 4 && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4'>
                  Personalización de Marca
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Color Primario *
                    </label>
                    <div className='flex items-center space-x-3'>
                      <input
                        type='color'
                        {...register('branding.primaryColor')}
                        className='w-12 h-10 border border-gray-300 rounded-md cursor-pointer'
                      />
                      <input
                        type='text'
                        {...register('branding.primaryColor')}
                        className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='#3B82F6'
                      />
                    </div>
                    {errors.branding?.primaryColor && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.branding.primaryColor.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Color Secundario *
                    </label>
                    <div className='flex items-center space-x-3'>
                      <input
                        type='color'
                        {...register('branding.secondaryColor')}
                        className='w-12 h-10 border border-gray-300 rounded-md cursor-pointer'
                      />
                      <input
                        type='text'
                        {...register('branding.secondaryColor')}
                        className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='#64748B'
                      />
                    </div>
                    {errors.branding?.secondaryColor && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.branding.secondaryColor.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className='mt-6'>
                  <h4 className='text-sm font-medium text-gray-900 mb-3'>
                    Vista Previa
                  </h4>
                  <div
                    className='p-4 rounded-lg border-2 border-dashed border-gray-300'
                    style={{
                      background: `linear-gradient(135deg, ${watch(
                        'branding.primaryColor'
                      )} 0%, ${watch('branding.secondaryColor')} 100%)`
                    }}
                  >
                    <div className='bg-white rounded-lg p-4 shadow-sm'>
                      <h5 className='font-semibold text-gray-900'>
                        {watch('name') || 'Nombre de la Empresa'}
                      </h5>
                      <p className='text-sm text-gray-600 mt-1'>
                        Vista previa del branding
                      </p>
                      <div className='flex items-center space-x-2 mt-3'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{
                            backgroundColor: watch('branding.primaryColor')
                          }}
                        />
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{
                            backgroundColor: watch('branding.secondaryColor')
                          }}
                        />
                        <span className='text-xs text-gray-500'>
                          Colores seleccionados
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4'>
                  Resumen de Configuración
                </h3>

                <div className='bg-gray-50 rounded-lg p-4 space-y-3'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <strong>Empresa:</strong> {watch('name')}
                    </div>
                    <div>
                      <strong>Email:</strong> {watch('email')}
                    </div>
                    <div>
                      <strong>Industria:</strong> {watch('settings.industry')}
                    </div>
                    <div>
                      <strong>Plan:</strong>{' '}
                      {
                        SUBSCRIPTION_PLANS.find(
                          p => p.id === watch('subscription.plan')
                        )?.name
                      }
                    </div>
                    <div>
                      <strong>Moneda:</strong> {watch('settings.currency')}
                    </div>
                    <div>
                      <strong>RUT/Tax ID:</strong> {watch('settings.taxId')}
                    </div>
                  </div>

                  <div className='mt-4'>
                    <strong className='text-sm'>
                      Características habilitadas:
                    </strong>
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {Object.entries(watch('features') || {}).map(
                        ([feature, enabled]) =>
                          enabled && (
                            <span
                              key={feature}
                              className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                            >
                              {feature.charAt(0).toUpperCase() +
                                feature.slice(1)}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className='flex justify-between mt-8 pt-6 border-t border-gray-200'>
            <div>
              {currentStep > 1 && (
                <button
                  type='button'
                  onClick={prevStep}
                  className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                >
                  Anterior
                </button>
              )}
            </div>

            <div>
              {currentStep < 4 ? (
                <button
                  type='button'
                  onClick={nextStep}
                  className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? 'Creando...' : 'Crear Empresa'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Diálogo de Confirmación/Error */}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        action={dialogState.action}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        onConfirm={dialogState.onConfirm || closeDialog}
        onClose={closeDialog}
      />
    </div>
  )
}
