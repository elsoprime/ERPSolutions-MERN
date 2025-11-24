/**
 * Edit Company Form Component (Enhanced) - FIXED VERSION
 * @description: Formulario para editar empresa existente por Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.1 - Bug Fixes for Plan Synchronization
 */

'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import {
  IEnhancedCompany,
  INDUSTRIES,
  CURRENCIES
} from '@/interfaces/EnhanchedCompany/EnhancedCompany'
import {
  FORM_STEPS,
  FormStep
} from '@/interfaces/EnhanchedCompany/CreateCompanyFormTypes'
import { PlanFeaturesDisplay } from '@/components/Plans/PlanFeaturesDisplay'
import EnhancedCompanyAPI from '@/api/EnhancedCompanyAPI'
import PlanAPI, { IPlan } from '@/api/PlanAPI'
import ConfirmationDialog, {
  ConfirmationDialogAction
} from '@/components/Shared/ConfirmationDialog'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/20/solid'
import FormStepper from '@/components/Shared/FormStepper'
import FormModal from '@/components/Shared/FormModal'
import { getTranslatedBusinessTypes } from '@/utils/formOptions'
import {
  updateCompanySchema,
  UpdateCompanyFormData,
  convertCompanyToUpdateFormData,
  sanitizeCompanyUpdateData
} from '@/schemas/EnhancedCompanySchemas'
interface EditCompanyFormProps {
  isOpen: boolean
  company: IEnhancedCompany
  onClose: () => void
  onSuccess: (company: IEnhancedCompany) => void
}

export default function EditCompanyForm({
  isOpen,
  company,
  onClose,
  onSuccess
}: EditCompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [slugPreview, setSlugPreview] = useState('')
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false)
  const [validationInProgress, setValidationInProgress] = useState(false)

  // Estados para gestión de planes desde API
  const [availablePlans, setAvailablePlans] = useState<IPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')

  // 🔥 FIX: Flag para controlar la inicialización
  const [isInitialized, setIsInitialized] = useState(false)

  // 🔍 DEBUG: Monitorear cambios en selectedPlanId
  useEffect(() => {
    console.log('🎯 selectedPlanId cambió a:', selectedPlanId, '| Timestamp:', new Date().toISOString())
  }, [selectedPlanId])

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
    formState: { errors },
    setValue,
    getValues,
    reset,
    trigger
  } = useForm<UpdateCompanyFormData>({
    resolver: zodResolver(updateCompanySchema),
    mode: 'onChange'
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

  // 🔥 FIX #1: Reset del formulario PRIMERO (sin el plan)
  useEffect(() => {
    if (isOpen && company) {
      console.log('📄 Resetting form with company data:', company)

      // Convertir datos de empresa a formato de formulario
      const formData = convertCompanyToUpdateFormData(company as never)

      // 🔥 IMPORTANTE: Reset SIN el plan (se establecerá después)
      const { subscription, ...restFormData } = formData
      reset({
        ...restFormData,
        subscription: {
          ...subscription,
          planId: '' // Se establecerá después
        }
      })

      // Marcar como NO inicializado aún
      setIsInitialized(false)
    }
  }, [isOpen, company, reset])

  // FIX #2: Cargar planes y establecer el plan DESPUÉS del reset
  // ⚠️ IMPORTANTE: Usar useCallback para evitar recursividad infinita
  const loadPlansAndSetCurrent = useCallback(async () => {
    if (!isOpen || isInitialized) return

    try {
      setPlansLoading(true)
      console.log('Cargando planes desde API...')
      const response = await PlanAPI.getActivePlans()

      if (response.success && response.data) {
        console.log('Planes cargados:', response.data)
        setAvailablePlans(response.data)

        // 🔥 CRÍTICO: Extraer el planId correctamente (puede ser string u objeto populated)
        let currentPlanId: string
        let currentPlanType: string | undefined

        if (company.plan) {
          if (typeof company.plan === 'object' && company.plan !== null) {
            // Plan viene populated del backend
            currentPlanId = company.plan._id
            currentPlanType = company.plan.type
            console.log('Plan populated detectado:', {
              id: currentPlanId,
              name: company.plan.name,
              type: currentPlanType
            })
          } else {
            // Plan es un string (ObjectId)
            currentPlanId = company.plan
            console.log('Plan como ObjectId:', currentPlanId)
          }

          console.log('Estableciendo plan actual - ID:', currentPlanId)

          const currentPlan = response.data.find((p: IPlan) => p._id === currentPlanId)

          if (currentPlan) {
            console.log('Plan encontrado:', currentPlan.name, currentPlan.type)

            // 🔥 FIX CRÍTICO: Establecer selectedPlanId INMEDIATAMENTE
            // Esto asegura que si el usuario NO cambia el plan, se mantenga el original
            setSelectedPlanId(currentPlanId)

            setValue('subscription.planId', currentPlan.type, {
              shouldValidate: true,
              shouldDirty: false // 🔥 Cambiar a false para que no se marque como "modificado"
            })

            // Actualizar features inmediatamente
            setValue('features', {
              inventoryManagement: currentPlan.features.inventoryManagement,
              accounting: currentPlan.features.accounting,
              hrm: currentPlan.features.hrm,
              crm: currentPlan.features.crm,
              projectManagement: currentPlan.features.projectManagement,
              reports: currentPlan.features.reports,
              multiCurrency: currentPlan.features.multiCurrency,
              apiAccess: currentPlan.features.apiAccess,
              customBranding: currentPlan.features.customBranding,
              prioritySupport: currentPlan.features.prioritySupport,
              advancedAnalytics: currentPlan.features.advancedAnalytics,
              auditLog: currentPlan.features.auditLog,
              customIntegrations: currentPlan.features.customIntegrations,
              dedicatedAccount: currentPlan.features.dedicatedAccount
            }, { shouldValidate: true })

            console.log('✅ Plan establecido correctamente - selectedPlanId:', currentPlanId)

            // Marcar como inicializado
            setIsInitialized(true)
          } else {
            console.error('❌ Plan no encontrado en la lista de planes disponibles')
            // 🔥 Aún así, establecer el selectedPlanId para mantener el plan original
            setSelectedPlanId(currentPlanId)
            setIsInitialized(true)
          }
        } else {
          console.warn('⚠️ La empresa no tiene un plan asignado')
          setIsInitialized(true)
        }
      } else {
        console.error('Error al cargar planes:', response.message)
        toast.error('No se pudieron cargar los planes disponibles')
        setAvailablePlans([])
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Error al cargar planes:', error)
      toast.error('Error al cargar planes disponibles')
      setAvailablePlans([])
      setIsInitialized(true)
    } finally {
      setPlansLoading(false)
    }
  }, [isOpen, company.plan, isInitialized, setValue])

  useEffect(() => {
    loadPlansAndSetCurrent()
  }, [loadPlansAndSetCurrent])

  // FIX #3: Actualizar características SOLO cuando el usuario cambia el plan
  const lastSelectedPlanIdRef = useRef<string>('')

  useEffect(() => {
    console.log('🔍 useEffect plan change - EJECUTADO', {
      isInitialized,
      selectedPlanId,
      lastSelectedPlanId: lastSelectedPlanIdRef.current,
      companyPlan: company.plan,
      availablePlansCount: availablePlans.length,
      timestamp: new Date().toISOString()
    })

    // Solo ejecutar si ya está inicializado y el plan cambió MANUALMENTE
    if (!isInitialized || !selectedPlanId || availablePlans.length === 0) {
      console.log('⏭️ SKIP: no inicializado o sin datos')
      return
    }

    // Extraer el planId correctamente del company.plan
    let companyPlanId: string
    if (typeof company.plan === 'object' && company.plan !== null) {
      companyPlanId = company.plan._id
    } else {
      companyPlanId = company.plan
    }

    // FIX: Ignorar el primer cambio (inicialización)
    if (lastSelectedPlanIdRef.current === '' && selectedPlanId === companyPlanId) {
      console.log('🎬 INICIALIZACIÓN: estableciendo lastSelectedPlanIdRef a:', selectedPlanId)
      lastSelectedPlanIdRef.current = selectedPlanId
      return
    }

    // Solo actualizar si realmente cambió
    if (selectedPlanId === lastSelectedPlanIdRef.current) {
      console.log('⏭️ SKIP: plan no cambió (mismo que anterior)')
      return
    }

    console.log('🔄 CAMBIO DETECTADO:', {
      de: lastSelectedPlanIdRef.current,
      a: selectedPlanId
    })

    const selectedPlan = availablePlans.find(p => p._id === selectedPlanId)
    if (selectedPlan) {
      console.log('✅ Usuario cambió plan manualmente:', {
        planAnterior: lastSelectedPlanIdRef.current,
        planNuevo: selectedPlanId,
        nombrePlan: selectedPlan.name,
        limites: selectedPlan.limits
      })

      setValue('subscription.planId', selectedPlan._id, { shouldValidate: true })

      // Actualizar features inmediatamente
      setValue('features', {
        inventoryManagement: selectedPlan.features.inventoryManagement,
        accounting: selectedPlan.features.accounting,
        hrm: selectedPlan.features.hrm,
        crm: selectedPlan.features.crm,
        projectManagement: selectedPlan.features.projectManagement,
        reports: selectedPlan.features.reports,
        multiCurrency: selectedPlan.features.multiCurrency,
        apiAccess: selectedPlan.features.apiAccess,
        customBranding: selectedPlan.features.customBranding,
        prioritySupport: selectedPlan.features.prioritySupport,
        advancedAnalytics: selectedPlan.features.advancedAnalytics,
        auditLog: selectedPlan.features.auditLog,
        customIntegrations: selectedPlan.features.customIntegrations,
        dedicatedAccount: selectedPlan.features.dedicatedAccount
      }, { shouldValidate: true })

      lastSelectedPlanIdRef.current = selectedPlanId
    }
    // setValue se omite de dependencias porque React Hook Form garantiza estabilidad
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId, availablePlans, isInitialized, company.plan])

  // Función para validar campos por etapa
  const validateStep = useCallback(
    async (
      step: number
    ): Promise<{ isValid: boolean; missingFields: string[] }> => {
      let fieldsToValidate: string[] = []
      let missingFields: string[] = []

      switch (step) {
        case 1:
          fieldsToValidate = [
            'name',
            'email',
            'address.street',
            'address.city',
            'address.state',
            'address.country',
            'address.postalCode'
          ]
          break
        case 2:
          fieldsToValidate = [
            'settings.businessType',
            'settings.industry',
            'settings.taxId',
            'settings.currency'
          ]
          break
        case 3:
          fieldsToValidate = ['subscription.plan']
          console.log('🔍 Validando Step 3 - Plan actual:', getValues('subscription.planId'))
          break
        case 4:
          fieldsToValidate = [
            'branding.primaryColor',
            'branding.secondaryColor'
          ]
          break
      }

      const results = await Promise.all(
        fieldsToValidate.map(field => trigger(field as any))
      )

      fieldsToValidate.forEach((field, index) => {
        if (!results[index]) {
          const fieldLabels: { [key: string]: string } = {
            name: 'Nombre de la Empresa',
            email: 'Email de Contacto',
            'address.street': 'Dirección',
            'address.city': 'Ciudad',
            'address.state': 'Estado/Región',
            'address.country': 'País',
            'address.postalCode': 'Código Postal',
            'settings.businessType': 'Tipo de Negocio',
            'settings.industry': 'Industria',
            'settings.taxId': 'RUT/Tax ID',
            'settings.currency': 'Moneda',
            'subscription.plan': 'Plan de Suscripción',
            'branding.primaryColor': 'Color Primario',
            'branding.secondaryColor': 'Color Secundario'
          }
          missingFields.push(fieldLabels[field] || field)
        }
      })

      const isValid = results.every(result => result)
      return { isValid, missingFields }
    },
    [trigger, getValues]
  )

  // 🔥 FIX #4: Solo validar si está inicializado
  useEffect(() => {
    if (!isInitialized) return

    let isMounted = true

    const checkValidation = async () => {
      if (!isMounted) return

      try {
        const validation = await validateStep(currentStep)
        if (isMounted) {
          setIsCurrentStepValid(validation.isValid)
        }
      } catch (error) {
        console.error('Error en validación de paso:', error)
        if (isMounted) {
          setIsCurrentStepValid(false)
        }
      }
    }

    checkValidation()

    return () => {
      isMounted = false
    }
  }, [currentStep, validateStep, isInitialized])

  // Validación en tiempo real con debounce
  const formValues = watch()
  const lastValidationTimeRef = useRef(0)

  useEffect(() => {
    if (!isInitialized) return

    const now = Date.now()
    const shouldValidate = now - lastValidationTimeRef.current > 500

    if (!shouldValidate) {
      return
    }

    let isMounted = true
    setValidationInProgress(true)

    const timeoutId = setTimeout(async () => {
      if (!isMounted) return

      try {
        const validation = await validateStep(currentStep)
        if (isMounted) {
          setIsCurrentStepValid(validation.isValid)
          lastValidationTimeRef.current = Date.now()
        }
      } catch (error) {
        console.error('Error en validación en tiempo real:', error)
        if (isMounted) {
          setIsCurrentStepValid(false)
        }
      } finally {
        if (isMounted) {
          setValidationInProgress(false)
        }
      }
    }, 300)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [formValues, currentStep, validateStep, isInitialized])

  // Reset inicial del estado de validación cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Modal abierto - Reseteando estados')
      setCurrentStep(1)
      setIsCurrentStepValid(false)
      setValidationInProgress(false)
      setIsInitialized(false)
      lastSelectedPlanIdRef.current = ''
      // NO resetear selectedPlanId aquí - se establecerá cuando se carguen los planes
    }
  }, [isOpen])

  // Manejo del envío del formulario
  const onSubmit = async (data: UpdateCompanyFormData) => {
    console.log('🚀 SUBMIT ejecutado - Paso actual:', currentStep)

    if (currentStep !== 4) {
      console.error('❌ SUBMIT ejecutado en paso incorrecto!')
      return
    }

    console.log('📋 Datos del formulario:', data)
    console.log('📌 selectedPlanId (estado):', selectedPlanId)
    console.log('📌 company.plan (original):', company.plan)
    console.log('📌 typeof company.plan:', typeof company.plan)
    console.log('📌 lastSelectedPlanIdRef.current:', lastSelectedPlanIdRef.current)

    // 🔥 CRÍTICO: Determinar el plan a enviar
    // Extraer el planId correctamente (puede ser string u objeto populated)
    let originalPlanId: string = ''
    if (company.plan) {
      if (typeof company.plan === 'object' && company.plan !== null) {
        originalPlanId = company.plan._id
        console.log('✅ Plan es objeto - ID extraído:', originalPlanId)
      } else {
        originalPlanId = company.plan as string
        console.log('✅ Plan es string - ID:', originalPlanId)
      }
    } else {
      console.warn('⚠️ company.plan es null/undefined')
    }

    console.log('📌 originalPlanId extraído:', originalPlanId)
    console.log('📌 selectedPlanId actual:', selectedPlanId)

    // Prioridad: 1) selectedPlanId (si el usuario cambió el plan)
    //           2) originalPlanId (si no se modificó, mantener el original)
    const planToSend = selectedPlanId || originalPlanId

    console.log('✅ Plan final que se enviará:', planToSend)
    console.log('📊 Comparación:', {
      selectedPlanId,
      originalPlanId,
      planToSend,
      esIgualAlOriginal: planToSend === originalPlanId,
      cambioElPlan: planToSend !== originalPlanId
    })

    if (!planToSend) {
      console.error('❌ ERROR: No hay plan válido para enviar')
      toast.error('Error: No se pudo determinar el plan de la empresa')
      return
    }

    // Sanitizar datos PRIMERO
    const correctedData = sanitizeCompanyUpdateData(data, company as never)

    console.log('📦 Datos sanitizados:', correctedData)
    console.log('📦 subscription completo:', correctedData.subscription)

    // 🔥 CRÍTICO: Agregar planId a subscription para que la API lo reciba correctamente
    const dataWithPlan = {
      ...correctedData,
      subscription: {
        ...correctedData.subscription,
        planId: planToSend // 🔥 La API espera subscription.planId
      }
    }

    console.log('📦 Datos finales a enviar:', dataWithPlan)
    console.log('📦 subscription.planId:', dataWithPlan.subscription.planId)

    setIsSubmitting(true)
    try {
      const result = await EnhancedCompanyAPI.updateCompany(
        company._id,
        dataWithPlan as never
      )

      if (result.success) {
        handleSuccess(result)
      } else {
        handleError(result.message)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccess = (result: any) => {
    toast.success('🎉 Empresa actualizada exitosamente', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    })

    onSuccess(result.company!)

    // Reset completo del estado
    setCurrentStep(1)
    setIsCurrentStepValid(false)
    setValidationInProgress(false)
    setIsInitialized(false)
    setSelectedPlanId('')
    lastSelectedPlanIdRef.current = ''

    onClose()
  }

  const handleError = (error: any) => {
    console.error('Error al actualizar empresa:', error)
    setDialogState({
      isOpen: true,
      action: 'error',
      title: 'Error al actualizar empresa',
      message: typeof error === 'string' ? error : error?.message || 'Error inesperado al actualizar la empresa. Por favor, intente nuevamente.',
      confirmText: 'Cerrar',
      onConfirm: closeDialog
    })
    setIsSubmitting(false)
  }

  // Navegación entre pasos
  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    console.log('🔄 NextStep ejecutado, paso actual:', currentStep)

    try {
      setValidationInProgress(true)
      const validation = await validateStep(currentStep)
      console.log('✅ Validación resultado:', validation)

      if (validation.isValid) {
        const newStep = Math.min(currentStep + 1, 4)
        console.log('✅ Avanzando al paso:', newStep)
        setCurrentStep(newStep)
      } else {
        console.log('❌ Validación falló, campos faltantes:', validation.missingFields)

        const missingFieldsList = validation.missingFields.join(', ')
        const message =
          validation.missingFields.length === 1
            ? `Por favor complete el campo requerido: ${missingFieldsList}`
            : `Por favor complete los siguientes campos requeridos: ${missingFieldsList}`

        setDialogState({
          isOpen: true,
          action: 'warning',
          title: 'Campos requeridos incompletos',
          message,
          confirmText: 'Entendido',
          onConfirm: closeDialog
        })
      }
    } catch (error) {
      console.error('Error en nextStep:', error)
      setDialogState({
        isOpen: true,
        action: 'error',
        title: 'Error de validación',
        message: 'Ocurrió un error al validar el formulario. Por favor, inténtelo nuevamente.',
        confirmText: 'Entendido',
        onConfirm: closeDialog
      })
    } finally {
      setValidationInProgress(false)
    }
  }

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleClose = () => {
    reset()
    setCurrentStep(1)
    setIsCurrentStepValid(false)
    setValidationInProgress(false)
    setIsInitialized(false)
    setSelectedPlanId('')
    lastSelectedPlanIdRef.current = ''
    onClose()
  }

  if (!isOpen) return null

  console.log('🔍 EditForm Render - Paso:', currentStep, 'Válido:', isCurrentStepValid, 'Inicializado:', isInitialized)

  const handleStepClick = (step: FormStep) => {
    setCurrentStep(step)
  }

  const renderValidationIndicator = () => {
    if (isCurrentStepValid) {
      return (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
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
      <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
        <div className='flex items-center'>
          <ExclamationTriangleIcon className='w-5 h-5 text-amber-600 mr-2' />
          <p className='text-sm text-amber-800'>
            Complete todos los campos obligatorios para continuar al siguiente
            paso
          </p>
        </div>
      </div>
    )
  }

  // Obtener opciones traducidas para tipos de negocio y otras listas
  const businessTypeOptions = getTranslatedBusinessTypes()

  return (
    <>
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        title='Editar Empresa'
        size='5xl'
        className='max-h-[90vh] overflow-y-auto'
      >
        <div className='p-6'>
          {/* Header personalizado con avatar */}
          <div className='flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200'>
            <div
              className='w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg'
              style={{ backgroundColor: company.settings.branding.primaryColor }}
            >
              {company.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                {company.name}
              </h3>
              <p className='text-sm text-gray-600'>Editando configuración</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
            {/* Etapas de navegación */}
            <FormStepper
              steps={FORM_STEPS}
              currentStep={currentStep as FormStep}
              onStepClick={handleStepClick}
              allowClickableSteps={false}
              showProgress={true}
              className='mb-8'
            />
            {/* Step 1: Información Básica */}
            {currentStep === 1 && (
              <div className='space-y-6'>
                {/* Indicador de validación mejorado */}
                {renderValidationIndicator()}

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
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
                {/* Indicador de validación mejorado */}
                {renderValidationIndicator()}

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Tipo de Negocio *
                    </label>
                    <select
                      {...register('settings.businessType')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value=''>Seleccionar tipo</option>
                      {businessTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          month => (
                            <option key={month} value={month}>
                              {new Date(2024, month - 1, 1).toLocaleDateString(
                                'es-ES',
                                { month: 'long' }
                              )}
                            </option>
                          )
                        )}
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
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          month => (
                            <option key={month} value={month}>
                              {new Date(2024, month - 1, 1).toLocaleDateString(
                                'es-ES',
                                { month: 'long' }
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Plan y Características */}
            {currentStep === 3 && (
              <div className='space-y-6'>
                {/* Indicador de validación mejorado */}
                {renderValidationIndicator()}

                <div>
                  <h3 className='text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4'>
                    Plan de Suscripción
                  </h3>

                  {plansLoading ? (
                    <div className='flex justify-center items-center py-8'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                      <span className='ml-3 text-gray-600'>Cargando planes disponibles...</span>
                    </div>
                  ) : availablePlans.length === 0 ? (
                    <div className='text-center py-8'>
                      <p className='text-gray-500'>No hay planes disponibles en este momento.</p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                      {availablePlans.map(plan => (
                        <div
                          key={plan._id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative ${selectedPlanId === plan._id
                            ? plan.type === 'trial'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                          onClick={() => {
                            console.log('🎯 Clic en plan:', {
                              planId: plan._id,
                              planName: plan.name,
                              planType: plan.type,
                              selectedPlanIdAntes: selectedPlanId,
                              companyPlan: company.plan
                            })
                            setSelectedPlanId(plan._id)
                            setValue('subscription.planId', plan._id)
                            console.log('✅ selectedPlanId actualizado a:', plan._id)
                          }}
                        >
                          {plan.type === 'trial' && (
                            <div className='absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full'>
                              PRUEBA
                            </div>
                          )}
                          {plan.isRecommended && (
                            <div className='absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
                              ⭐ RECOMENDADO
                            </div>
                          )}
                          <div className='text-center'>
                            <h4
                              className={`font-semibold text-lg ${plan.type === 'trial' ? 'text-orange-700' : ''
                                }`}
                            >
                              {plan.name}
                            </h4>
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
                            {plan.price && (
                              <div className='mt-3 pt-3 border-t border-gray-200'>
                                <p className='text-lg font-bold text-gray-900'>
                                  ${plan.price.monthly?.toLocaleString() || '0'} {plan.price.currency || 'USD'}
                                </p>
                                <p className='text-xs text-gray-500'>por mes</p>
                              </div>
                            )}
                          </div>
                          <input
                            type='radio'
                            name='planSelection'
                            value={plan._id}
                            checked={selectedPlanId === plan._id}
                            onChange={() => {
                              setSelectedPlanId(plan._id)
                              setValue('subscription.planId', plan._id)
                            }}
                            className='sr-only'
                            aria-checked='true'
                            placeholder='Seleccionar este plan'
                          />
                        </div>
                      ))}
                    </div>
                  )}

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
                  <PlanFeaturesDisplay
                    features={watch('features')}
                    size="md"
                    columns={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Personalización */}
            {currentStep === 4 && (
              <div className='space-y-6'>
                {/* Indicador de validación mejorado */}
                {renderValidationIndicator()}

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
                          value={watch('branding.primaryColor') || '#3B82F6'}
                          onChange={e =>
                            setValue('branding.primaryColor', e.target.value)
                          }
                          className='w-12 h-10 border border-gray-300 rounded-md cursor-pointer'
                          placeholder='Selecciona un Color Primario'
                        />
                        <input
                          type='text'
                          {...register('branding.primaryColor')}
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='#3B82F6'
                          onChange={e => {
                            const value = e.target.value
                            if (
                              value.match(/^#[0-9A-F]{6}$/i) ||
                              value === ''
                            ) {
                              setValue('branding.primaryColor', value)
                            }
                          }}
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
                          value={watch('branding.secondaryColor') || '#64748B'}
                          onChange={e =>
                            setValue('branding.secondaryColor', e.target.value)
                          }
                          className='w-12 h-10 border border-gray-300 rounded-md cursor-pointer'
                          placeholder='Selecciona un Color Secundario'
                        />
                        <input
                          type='text'
                          {...register('branding.secondaryColor')}
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='#64748B'
                          onChange={e => {
                            const value = e.target.value
                            if (
                              value.match(/^#[0-9A-F]{6}$/i) ||
                              value === ''
                            ) {
                              setValue('branding.secondaryColor', value)
                            }
                          }}
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
                        {availablePlans.find(p => p._id === selectedPlanId)?.name || 'No seleccionado'}
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

            {/* Los pasos 2, 3 y 4 son similares al formulario de creación */}
            {/* Por brevedad, incluyo solo las referencias pero la implementación sería idéntica */}

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
                    onClick={e => nextStep(e)}
                    disabled={!isCurrentStepValid || validationInProgress}
                    className={`px-6 py-2 rounded-md transition-colors ${isCurrentStepValid && !validationInProgress
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    title={
                      !isCurrentStepValid
                        ? 'Complete todos los campos requeridos para continuar'
                        : ''
                    }
                  >
                    {validationInProgress ? 'Validando...' : 'Siguiente'}
                  </button>
                ) : (
                  <button
                    type='submit'
                    disabled={isSubmitting || !isCurrentStepValid}
                    className={`px-6 py-2 rounded-md transition-colors ${!isSubmitting && isCurrentStepValid
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {isSubmitting ? 'Actualizando...' : 'Actualizar Empresa'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </FormModal>

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
    </>
  )
}
