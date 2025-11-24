/**
 * Ejemplo de Componente de Formulario Avanzado - Versión Simplificada
 * @description: Ejemplo de cómo usar el sistema de tipos avanzado para formularios
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

'use client'

import React from 'react'
import {
  UserRegistrationSchema,
  UserRegistrationValues,
  createFormSchema,
  CommonValidators
} from '../../interfaces/FormTypes'
import {useAdvancedForm} from '../../hooks/useAdvancedForm'

/**
 * Ejemplo 1: Formulario de Registro de Usuario usando el schema predefinido
 */
export const UserRegistrationForm: React.FC = () => {
  const form = useAdvancedForm({
    schema: UserRegistrationSchema,
    onSubmit: async (values: UserRegistrationValues) => {
      console.log('Valores del formulario:', values)
      // Aquí simularíamos el envío al servidor
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('¡Usuario registrado exitosamente!')
    },
    initialValues: {
      name: '',
      email: '',
      role: 'user'
    },
    validateOnChange: true,
    validateOnBlur: true
  })

  return (
    <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800'>
        Registro de Usuario
      </h2>

      <form onSubmit={form.handleSubmit} className='space-y-6'>
        {/* Campo de Nombre */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {UserRegistrationSchema.name.label}
            {UserRegistrationSchema.name.required && (
              <span className='text-red-500'>*</span>
            )}
          </label>
          <input
            type='text'
            placeholder={UserRegistrationSchema.name.placeholder}
            value={form.values.name}
            onChange={e => form.setValue('name', e.target.value)}
            onBlur={() => form.setFieldTouched('name', true)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.name.touched && !form.errors.name.isValid
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          {form.errors.name.touched &&
            form.errors.name.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* Campo de Email */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {UserRegistrationSchema.email.label}
            {UserRegistrationSchema.email.required && (
              <span className='text-red-500'>*</span>
            )}
          </label>
          <input
            type='email'
            placeholder={UserRegistrationSchema.email.placeholder}
            value={form.values.email}
            onChange={e => form.setValue('email', e.target.value)}
            onBlur={() => form.setFieldTouched('email', true)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.email.touched && !form.errors.email.isValid
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          {form.errors.email.touched &&
            form.errors.email.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* Campo de Edad */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {UserRegistrationSchema.age.label}
          </label>
          <input
            type='number'
            min={UserRegistrationSchema.age.min}
            max={UserRegistrationSchema.age.max}
            value={form.values.age || ''}
            onChange={e => form.setValue('age', parseInt(e.target.value) || 0)}
            onBlur={() => form.setFieldTouched('age', true)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.age.touched && !form.errors.age.isValid
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          {form.errors.age.touched &&
            form.errors.age.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* Campo de Rol */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {UserRegistrationSchema.role.label}
            {UserRegistrationSchema.role.required && (
              <span className='text-red-500'>*</span>
            )}
          </label>
          <select
            value={form.values.role}
            onChange={e => form.setValue('role', e.target.value)}
            onBlur={() => form.setFieldTouched('role', true)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.role.touched && !form.errors.role.isValid
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          >
            <option value=''>Seleccionar rol...</option>
            {UserRegistrationSchema.role.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {form.errors.role.touched &&
            form.errors.role.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* Campo de Sitio Web */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {UserRegistrationSchema.website.label}
          </label>
          <input
            type='url'
            placeholder={UserRegistrationSchema.website.placeholder}
            value={form.values.website}
            onChange={e => form.setValue('website', e.target.value)}
            onBlur={() => form.setFieldTouched('website', true)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.website.touched && !form.errors.website.isValid
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          {form.errors.website.touched &&
            form.errors.website.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* Campo de Biografía */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {UserRegistrationSchema.bio.label}
          </label>
          <textarea
            rows={UserRegistrationSchema.bio.rows}
            placeholder={UserRegistrationSchema.bio.placeholder}
            value={form.values.bio}
            onChange={e => form.setValue('bio', e.target.value)}
            onBlur={() => form.setFieldTouched('bio', true)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.bio.touched && !form.errors.bio.isValid
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          {form.errors.bio.touched &&
            form.errors.bio.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* Campo de Avatar */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {UserRegistrationSchema.avatar.label}
          </label>
          <input
            type='file'
            accept={UserRegistrationSchema.avatar.accept}
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) {
                form.setValue('avatar', file)
              }
            }}
            onBlur={() => form.setFieldTouched('avatar', true)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.avatar.touched && !form.errors.avatar.isValid
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          {form.errors.avatar.touched &&
            form.errors.avatar.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* Campo de Términos */}
        <div>
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={form.values.terms}
              onChange={e => form.setValue('terms', e.target.checked)}
              onBlur={() => form.setFieldTouched('terms', true)}
              className='text-blue-600'
            />
            <span className='text-sm text-gray-700'>
              {UserRegistrationSchema.terms.label}
              {UserRegistrationSchema.terms.required && (
                <span className='text-red-500'>*</span>
              )}
            </span>
          </label>
          {form.errors.terms.touched &&
            form.errors.terms.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* Campo de Preferencias */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {UserRegistrationSchema.preferences.label}
          </label>
          <div className='space-y-2'>
            {UserRegistrationSchema.preferences.options.map(option => (
              <label key={option.value} className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  checked={form.values.preferences.includes(option.value)}
                  onChange={e => {
                    const currentPreferences = form.values.preferences
                    if (e.target.checked) {
                      form.setValue('preferences', [
                        ...currentPreferences,
                        option.value
                      ])
                    } else {
                      form.setValue(
                        'preferences',
                        currentPreferences.filter(p => p !== option.value)
                      )
                    }
                  }}
                  className='text-blue-600'
                />
                <span className='text-sm text-gray-700'>{option.label}</span>
              </label>
            ))}
          </div>
          {form.errors.preferences.touched &&
            form.errors.preferences.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* Botones de acción */}
        <div className='flex space-x-4'>
          <button
            type='submit'
            disabled={!form.isValid || form.isSubmitting}
            className={`px-6 py-2 rounded-md font-medium ${
              form.isValid && !form.isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {form.isSubmitting ? 'Registrando...' : 'Registrar Usuario'}
          </button>

          <button
            type='button'
            onClick={form.resetForm}
            className='px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50'
          >
            Limpiar Formulario
          </button>
        </div>

        {/* Información de debug (solo para desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className='mt-8 p-4 bg-gray-100 rounded-md'>
            <h3 className='font-medium text-gray-800 mb-2'>Debug Info:</h3>
            <p className='text-sm text-gray-600'>
              <strong>Es válido:</strong> {form.isValid ? 'Sí' : 'No'}
            </p>
            <p className='text-sm text-gray-600'>
              <strong>Está enviando:</strong> {form.isSubmitting ? 'Sí' : 'No'}
            </p>
            <p className='text-sm text-gray-600'>
              <strong>Ha cambiado:</strong> {form.isDirty ? 'Sí' : 'No'}
            </p>
            <details className='mt-2'>
              <summary className='text-sm font-medium text-gray-700 cursor-pointer'>
                Ver valores actuales
              </summary>
              <pre className='text-xs text-gray-600 mt-2 overflow-auto'>
                {JSON.stringify(form.values, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </form>
    </div>
  )
}

/**
 * Ejemplo 2: Formulario dinámico para productos usando createFormSchema
 */
const ProductSchema = createFormSchema({
  name: {
    label: 'Nombre del Producto',
    type: 'text',
    required: true,
    validators: [
      CommonValidators.required,
      CommonValidators.minLength(3),
      CommonValidators.maxLength(100)
    ]
  },

  price: {
    label: 'Precio',
    type: 'number',
    required: true,
    min: 0,
    validators: [CommonValidators.required, CommonValidators.min(0)]
  },

  category: {
    label: 'Categoría',
    type: 'select',
    required: true,
    options: [
      {value: 'electronics', label: 'Electrónicos'},
      {value: 'clothing', label: 'Ropa'},
      {value: 'books', label: 'Libros'},
      {value: 'home', label: 'Hogar'}
    ],
    validators: [CommonValidators.required]
  },

  description: {
    label: 'Descripción',
    type: 'textarea',
    required: false,
    rows: 3,
    maxLength: 500,
    validators: [CommonValidators.maxLength(500)]
  },

  inStock: {
    label: 'En stock',
    type: 'checkbox',
    required: false,
    defaultValue: true
  },

  tags: {
    label: 'Etiquetas',
    type: 'multiselect',
    required: false,
    options: [
      {value: 'new', label: 'Nuevo'},
      {value: 'sale', label: 'En oferta'},
      {value: 'featured', label: 'Destacado'},
      {value: 'popular', label: 'Popular'}
    ]
  }
} as const)

export const ProductForm: React.FC = () => {
  const form = useAdvancedForm({
    schema: ProductSchema,
    onSubmit: async values => {
      console.log('Producto a crear:', values)
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('¡Producto creado exitosamente!')
    },
    initialValues: {
      inStock: true,
      tags: []
    }
  })

  return (
    <div className='max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800'>Crear Producto</h2>

      <form onSubmit={form.handleSubmit} className='space-y-4'>
        {/* Aquí irían los campos similares al ejemplo anterior */}
        {/* Por brevedad, solo muestro un ejemplo de cómo se vería */}

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {ProductSchema.name.label}
            {ProductSchema.name.required && (
              <span className='text-red-500'>*</span>
            )}
          </label>
          <input
            type='text'
            value={form.values.name}
            onChange={e => form.setValue('name', e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          {form.errors.name.touched &&
            form.errors.name.errors.map((error, index) => (
              <p key={index} className='text-red-500 text-sm mt-1'>
                {error}
              </p>
            ))}
        </div>

        {/* ... más campos ... */}

        <button
          type='submit'
          disabled={!form.isValid || form.isSubmitting}
          className='w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300'
        >
          {form.isSubmitting ? 'Creando...' : 'Crear Producto'}
        </button>
      </form>
    </div>
  )
}

export default UserRegistrationForm
