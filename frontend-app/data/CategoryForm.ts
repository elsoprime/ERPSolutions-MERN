/**
 * Category Form Configuration
 * @description: Configuración de campos para el formulario de categorías
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { IFormField } from '@/interfaces/IComponents'

export const categoryFormFields: IFormField[] = [
  {
    id: 'name',
    label: 'Nombre de la Categoría',
    type: 'text',
    placeholder: 'Ej: Electrónicos, Ropa, Hogar...',
    required: true,
    maxLength: 50
  },
  {
    id: 'description',
    label: 'Descripción',
    type: 'textarea',
    placeholder: 'Describe brevemente esta categoría...',
    required: false,
    maxLength: 200
  }
]

// Configuración de estilos del formulario
export const categoryFormStyles = {
  container: 'space-y-6',
  fieldWrapper: 'space-y-2',
  label: 'font-roboto-bold text-sm font-medium text-gray-700 block',
  input: {
    base: 'font-roboto w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
    normal: 'border-gray-300 bg-white hover:border-gray-400',
    error: 'border-red-500 bg-red-50 focus:ring-red-500',
    disabled: 'bg-gray-100 cursor-not-allowed'
  },
  textarea: {
    base: 'font-roboto w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical min-h-[100px]',
    normal: 'border-gray-300 bg-white hover:border-gray-400',
    error: 'border-red-500 bg-red-50 focus:ring-red-500'
  },
  error: 'font-roboto-light text-sm text-red-600 mt-1 flex items-center gap-1',
  placeholder: 'text-gray-400'
}

// Mensajes de validación personalizados
export const categoryValidationMessages = {
  name: {
    required: 'El nombre de la categoría es obligatorio',
    minLength: 'El nombre debe tener al menos 2 caracteres',
    maxLength: 'El nombre no puede exceder 50 caracteres'
  },
  description: {
    maxLength: 'La descripción no puede exceder 200 caracteres'
  }
}