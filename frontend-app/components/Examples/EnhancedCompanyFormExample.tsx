/**
 * Ejemplo de Formulario de Empresa Enhanced
 * @description: Componente que demuestra el uso del formulario de empresas con el sistema tipado avanzado
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

'use client'

import React, {useState} from 'react'
import {
  EnhancedCompanyFormSchema,
  EnhancedCompanyFormSections,
  EnhancedCompanyFormDefaults
} from '../../data/EnhancedCompanies'
import {useAdvancedForm} from '../../hooks/useAdvancedForm'
import {FormValues} from '../../interfaces/FormTypes'

/**
 * Tipo inferido automáticamente para los valores del formulario
 */
type CompanyFormValues = FormValues<typeof EnhancedCompanyFormSchema>

export const EnhancedCompanyForm: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0)

  const form = useAdvancedForm({
    schema: EnhancedCompanyFormSchema,
    onSubmit: async (values: CompanyFormValues) => {
      console.log('Datos de la empresa a crear:', values)

      // Aquí irían las transformaciones necesarias para enviar al backend
      const companyData = transformFormDataToAPI(values)

      // Simulación del envío
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('¡Empresa creada exitosamente!')
    },
    initialValues: EnhancedCompanyFormDefaults,
    validateOnChange: true
  })

  // Función para transformar los datos del formulario al formato esperado por la API
  const transformFormDataToAPI = (formData: CompanyFormValues) => {
    return {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      email: formData.email,
      description: formData.description,
      website: formData.website,
      phone: formData.phone,
      address: {
        street: formData['address.street'],
        city: formData['address.city'],
        state: formData['address.state'],
        country: formData['address.country'],
        postalCode: formData['address.postalCode']
      },
      settings: {
        businessType: formData['settings.businessType'],
        industry: formData['settings.industry'],
        taxId: formData['settings.taxId'],
        currency: formData['settings.currency'],
        fiscalYear: {
          startMonth: parseInt(formData['settings.fiscalYear.startMonth']),
          endMonth: parseInt(formData['settings.fiscalYear.endMonth'])
        }
      },
      subscription: {
        plan: formData['subscription.plan'],
        autoRenew: formData['subscription.autoRenew']
      },
      features: {
        inventory: formData['features.inventory'],
        accounting: formData['features.accounting'],
        hrm: formData['features.hrm'],
        crm: formData['features.crm'],
        projects: formData['features.projects']
      },
      branding: {
        primaryColor: formData['branding.primaryColor'],
        secondaryColor: formData['branding.secondaryColor']
      }
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50)
  }

  const currentSectionConfig = EnhancedCompanyFormSections[currentSection]
  const isLastSection =
    currentSection === EnhancedCompanyFormSections.length - 1
  const isFirstSection = currentSection === 0

  const renderField = (fieldName: keyof CompanyFormValues) => {
    const fieldConfig = EnhancedCompanyFormSchema[fieldName]
    const fieldError = form.errors[fieldName]
    const hasError = fieldError.touched && !fieldError.isValid

    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`

    const renderFieldErrors = () => {
      if (hasError) {
        return fieldError.errors.map((error: string, index: number) => (
          <p key={index} className='text-red-500 text-sm mt-1'>
            {error}
          </p>
        ))
      }
      return null
    }

    const renderLabel = () => (
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        {fieldConfig.label}
        {fieldConfig.required && <span className='text-red-500 ml-1'>*</span>}
        {'helpText' in fieldConfig && fieldConfig.helpText && (
          <span className='text-xs text-gray-500 block font-normal mt-1'>
            {fieldConfig.helpText}
          </span>
        )}
      </label>
    )

    switch (fieldConfig.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <div key={fieldName} className='mb-4'>
            {renderLabel()}
            <input
              type={fieldConfig.type}
              value={form.values[fieldName] as string}
              onChange={e => form.setValue(fieldName, e.target.value)}
              onBlur={() => form.setFieldTouched(fieldName, true)}
              placeholder={
                'placeholder' in fieldConfig
                  ? fieldConfig.placeholder
                  : undefined
              }
              className={baseClasses}
            />
            {renderFieldErrors()}
          </div>
        )

      case 'textarea':
        return (
          <div key={fieldName} className='mb-4'>
            {renderLabel()}
            <textarea
              value={form.values[fieldName] as string}
              onChange={e => form.setValue(fieldName, e.target.value)}
              onBlur={() => form.setFieldTouched(fieldName, true)}
              placeholder={
                'placeholder' in fieldConfig
                  ? fieldConfig.placeholder
                  : undefined
              }
              rows={'rows' in fieldConfig ? fieldConfig.rows : 3}
              className={baseClasses}
            />
            {renderFieldErrors()}
          </div>
        )

      case 'select':
        return (
          <div key={fieldName} className='mb-4'>
            {renderLabel()}
            <select
              value={form.values[fieldName] as string}
              onChange={e => form.setValue(fieldName, e.target.value)}
              onBlur={() => form.setFieldTouched(fieldName, true)}
              className={baseClasses}
            >
              <option value=''>Seleccionar...</option>
              {'options' in fieldConfig &&
                fieldConfig.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
            {renderFieldErrors()}
          </div>
        )

      case 'checkbox':
        return (
          <div key={fieldName} className='mb-4'>
            <label className='flex items-start space-x-3'>
              <input
                type='checkbox'
                checked={form.values[fieldName] as boolean}
                onChange={e => form.setValue(fieldName, e.target.checked)}
                onBlur={() => form.setFieldTouched(fieldName, true)}
                className='mt-1 text-blue-600'
              />
              <div>
                <span className='text-sm font-medium text-gray-700'>
                  {fieldConfig.label}
                  {fieldConfig.required && (
                    <span className='text-red-500 ml-1'>*</span>
                  )}
                </span>
                {'helpText' in fieldConfig && fieldConfig.helpText && (
                  <span className='text-xs text-gray-500 block mt-1'>
                    {fieldConfig.helpText}
                  </span>
                )}
              </div>
            </label>
            {renderFieldErrors()}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-gray-800 mb-2'>
          Crear Nueva Empresa
        </h2>
        <p className='text-gray-600'>
          Complete la información de la empresa paso a paso
        </p>
      </div>

      {/* Indicador de progreso */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          {EnhancedCompanyFormSections.map((section, index) => (
            <div
              key={section.id}
              className={`flex items-center ${
                index !== EnhancedCompanyFormSections.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentSection
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              {index !== EnhancedCompanyFormSections.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index < currentSection ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-gray-800'>
            {currentSectionConfig.title}
          </h3>
          <p className='text-gray-600 text-sm'>
            {currentSectionConfig.description}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit}>
        {/* Campos de la sección actual */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          {currentSectionConfig.fields.map(fieldName =>
            renderField(fieldName as keyof CompanyFormValues)
          )}
        </div>

        {/* Botones de navegación */}
        <div className='flex justify-between items-center'>
          <button
            type='button'
            onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
            disabled={isFirstSection}
            className={`px-6 py-2 rounded-md font-medium ${
              isFirstSection
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Anterior
          </button>

          <div className='text-sm text-gray-600'>
            Sección {currentSection + 1} de {EnhancedCompanyFormSections.length}
          </div>

          {isLastSection ? (
            <button
              type='submit'
              disabled={!form.isValid || form.isSubmitting}
              className={`px-6 py-2 rounded-md font-medium ${
                form.isValid && !form.isSubmitting
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {form.isSubmitting ? 'Creando...' : 'Crear Empresa'}
            </button>
          ) : (
            <button
              type='button'
              onClick={() =>
                setCurrentSection(prev =>
                  Math.min(EnhancedCompanyFormSections.length - 1, prev + 1)
                )
              }
              className='px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700'
            >
              Siguiente
            </button>
          )}
        </div>

        {/* Información de debug */}
        <div className='mt-8 p-4 bg-gray-50 rounded-md'>
          <h4 className='font-medium text-gray-800 mb-2'>
            Estado del Formulario:
          </h4>
          <div className='grid grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='font-medium'>Es válido:</span>
              <span
                className={`ml-2 ${
                  form.isValid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {form.isValid ? 'Sí' : 'No'}
              </span>
            </div>
            <div>
              <span className='font-medium'>Campos modificados:</span>
              <span className='ml-2'>{form.isDirty ? 'Sí' : 'No'}</span>
            </div>
            <div>
              <span className='font-medium'>Enviando:</span>
              <span className='ml-2'>{form.isSubmitting ? 'Sí' : 'No'}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EnhancedCompanyForm
