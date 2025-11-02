/**
 * @description: Datos para Generar los Formularios de Empresas y/o Compañías, Modulo EnhancedCompanies de la App Frontend
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @date: 2023-10-05
 * @updated: 2025-10-30 - Migrado al sistema de tipos avanzado
 */

import {createFormSchema, CommonValidators} from '@/interfaces/FormTypes'
import {
  BUSINESS_TYPES,
  INDUSTRIES,
  CURRENCIES,
  SUBSCRIPTION_PLANS
} from '@/interfaces/EnhanchedCompany/EnhancedCompany'

/**
 * Schema del Formulario de Creación de Empresas Enhanced
 * Utilizando el sistema de tipos avanzado para máxima seguridad y reutilización
 */
export const EnhancedCompanyFormSchema = createFormSchema({
  // ===== SECCIÓN 1: INFORMACIÓN BÁSICA =====
  name: {
    label: 'Nombre de la Empresa',
    type: 'text',
    required: true,
    placeholder: 'Ingrese el nombre de la empresa',
    validators: [
      CommonValidators.required,
      CommonValidators.minLength(2),
      CommonValidators.maxLength(100)
    ]
  },

  slug: {
    label: 'Slug de la Empresa',
    type: 'text',
    required: false, // Se puede generar automáticamente desde el nombre
    placeholder: 'se-genera-automaticamente-desde-el-nombre',
    helpText: 'Se genera automáticamente basado en el nombre de la empresa',
    validators: [
      CommonValidators.minLength(2),
      CommonValidators.maxLength(50),
      // Validador personalizado para slug
      (value: string) => {
        if (!value) return null // Es opcional
        const slugRegex = /^[a-z0-9-]+$/
        return slugRegex.test(value)
          ? null
          : 'Solo se permiten letras minúsculas, números y guiones'
      }
    ]
  },

  email: {
    label: 'Correo Electrónico de Contacto',
    type: 'email',
    required: true,
    placeholder: 'contacto@empresa.com',
    validators: [CommonValidators.required, CommonValidators.email]
  },

  description: {
    label: 'Descripción de la Empresa',
    type: 'textarea',
    required: false,
    rows: 3,
    placeholder: 'Ingrese una descripción breve de la empresa',
    maxLength: 500,
    validators: [CommonValidators.maxLength(500)]
  },

  website: {
    label: 'Sitio Web de la Empresa',
    type: 'url',
    required: false,
    placeholder: 'https://www.empresa.com',
    validators: [CommonValidators.url]
  },

  phone: {
    label: 'Teléfono de Contacto',
    type: 'text',
    required: false,
    placeholder: '+56 9 1234 5678',
    validators: [
      // Validador personalizado para teléfono
      (value: string) => {
        if (!value) return null // Es opcional
        const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/
        return phoneRegex.test(value) ? null : 'Formato de teléfono inválido'
      }
    ]
  },

  // ===== SECCIÓN 2: DIRECCIÓN =====
  'address.street': {
    label: 'Calle y Número',
    type: 'text',
    required: true,
    placeholder: 'Av. Principal 1234',
    validators: [
      CommonValidators.required,
      CommonValidators.minLength(5),
      CommonValidators.maxLength(100)
    ]
  },

  'address.city': {
    label: 'Ciudad',
    type: 'text',
    required: true,
    placeholder: 'Santiago',
    validators: [
      CommonValidators.required,
      CommonValidators.minLength(2),
      CommonValidators.maxLength(50)
    ]
  },

  'address.state': {
    label: 'Estado/Región',
    type: 'text',
    required: true,
    placeholder: 'Región Metropolitana',
    validators: [
      CommonValidators.required,
      CommonValidators.minLength(2),
      CommonValidators.maxLength(50)
    ]
  },

  'address.country': {
    label: 'País',
    type: 'text',
    required: true,
    placeholder: 'Chile',
    defaultValue: 'Chile',
    validators: [
      CommonValidators.required,
      CommonValidators.minLength(2),
      CommonValidators.maxLength(50)
    ]
  },

  'address.postalCode': {
    label: 'Código Postal',
    type: 'text',
    required: true,
    placeholder: '7500000',
    validators: [
      CommonValidators.required,
      CommonValidators.minLength(4),
      CommonValidators.maxLength(10)
    ]
  },

  // ===== SECCIÓN 3: CONFIGURACIONES DE NEGOCIO =====
  'settings.businessType': {
    label: 'Tipo de Negocio',
    type: 'select',
    required: true,
    options: BUSINESS_TYPES.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
    })),
    validators: [CommonValidators.required]
  },

  'settings.industry': {
    label: 'Industria',
    type: 'select',
    required: true,
    options: INDUSTRIES.map(industry => ({
      value: industry,
      label: industry
    })),
    validators: [CommonValidators.required]
  },

  'settings.taxId': {
    label: 'RUT/ID Fiscal',
    type: 'text',
    required: true,
    placeholder: '12.345.678-9',
    validators: [
      CommonValidators.required,
      CommonValidators.minLength(8),
      CommonValidators.maxLength(20),
      // Validador personalizado para RUT chileno (ejemplo)
      (value: string) => {
        if (!value) return null
        // Validación básica de formato RUT
        const rutRegex = /^[\d\.\-kK]+$/
        return rutRegex.test(value) ? null : 'Formato de RUT inválido'
      }
    ]
  },

  'settings.currency': {
    label: 'Moneda',
    type: 'select',
    required: true,
    defaultValue: 'CLP',
    options: CURRENCIES.map(currency => ({
      value: currency.code,
      label: `${currency.name} (${currency.symbol})`
    })),
    validators: [CommonValidators.required]
  },

  'settings.fiscalYear.startMonth': {
    label: 'Mes de Inicio del Año Fiscal',
    type: 'select',
    required: true,
    defaultValue: '1',
    options: [
      {value: '1', label: 'Enero'},
      {value: '2', label: 'Febrero'},
      {value: '3', label: 'Marzo'},
      {value: '4', label: 'Abril'},
      {value: '5', label: 'Mayo'},
      {value: '6', label: 'Junio'},
      {value: '7', label: 'Julio'},
      {value: '8', label: 'Agosto'},
      {value: '9', label: 'Septiembre'},
      {value: '10', label: 'Octubre'},
      {value: '11', label: 'Noviembre'},
      {value: '12', label: 'Diciembre'}
    ],
    validators: [CommonValidators.required]
  },

  'settings.fiscalYear.endMonth': {
    label: 'Mes de Fin del Año Fiscal',
    type: 'select',
    required: true,
    defaultValue: '12',
    options: [
      {value: '1', label: 'Enero'},
      {value: '2', label: 'Febrero'},
      {value: '3', label: 'Marzo'},
      {value: '4', label: 'Abril'},
      {value: '5', label: 'Mayo'},
      {value: '6', label: 'Junio'},
      {value: '7', label: 'Julio'},
      {value: '8', label: 'Agosto'},
      {value: '9', label: 'Septiembre'},
      {value: '10', label: 'Octubre'},
      {value: '11', label: 'Noviembre'},
      {value: '12', label: 'Diciembre'}
    ],
    validators: [CommonValidators.required]
  },

  // ===== SECCIÓN 4: PLAN DE SUSCRIPCIÓN =====
  'subscription.plan': {
    label: 'Plan de Suscripción',
    type: 'select',
    required: true,
    defaultValue: 'free',
    options: SUBSCRIPTION_PLANS.map(plan => ({
      value: plan.id,
      label: `${plan.name} - ${plan.description}`
    })),
    validators: [CommonValidators.required]
  },

  'subscription.autoRenew': {
    label: 'Renovación Automática',
    type: 'checkbox',
    required: false,
    defaultValue: true,
    helpText:
      'La suscripción se renovará automáticamente al finalizar el período'
  },

  // ===== SECCIÓN 5: CARACTERÍSTICAS HABILITADAS =====
  'features.inventory': {
    label: 'Gestión de Inventario',
    type: 'checkbox',
    required: false,
    defaultValue: true,
    helpText: 'Habilitar módulo de gestión de inventario y productos'
  },

  'features.accounting': {
    label: 'Contabilidad',
    type: 'checkbox',
    required: false,
    defaultValue: false,
    helpText: 'Habilitar módulo de contabilidad y finanzas'
  },

  'features.hrm': {
    label: 'Recursos Humanos',
    type: 'checkbox',
    required: false,
    defaultValue: false,
    helpText: 'Habilitar módulo de recursos humanos y nómina'
  },

  'features.crm': {
    label: 'CRM (Gestión de Clientes)',
    type: 'checkbox',
    required: false,
    defaultValue: false,
    helpText: 'Habilitar módulo de gestión de clientes y ventas'
  },

  'features.projects': {
    label: 'Gestión de Proyectos',
    type: 'checkbox',
    required: false,
    defaultValue: false,
    helpText: 'Habilitar módulo de gestión de proyectos y tareas'
  },

  // ===== SECCIÓN 6: PERSONALIZACIÓN =====
  'branding.primaryColor': {
    label: 'Color Primario',
    type: 'text', // Podrías usar un color picker personalizado
    required: true,
    defaultValue: '#3B82F6',
    placeholder: '#3B82F6',
    validators: [
      CommonValidators.required,
      // Validador para color hexadecimal
      (value: string) => {
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        return colorRegex.test(value)
          ? null
          : 'Debe ser un color hexadecimal válido (ej: #3B82F6)'
      }
    ]
  },

  'branding.secondaryColor': {
    label: 'Color Secundario',
    type: 'text',
    required: true,
    defaultValue: '#6B7280',
    placeholder: '#6B7280',
    validators: [
      CommonValidators.required,
      // Validador para color hexadecimal
      (value: string) => {
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        return colorRegex.test(value)
          ? null
          : 'Debe ser un color hexadecimal válido (ej: #6B7280)'
      }
    ]
  }
} as const)

/**
 * Tipo inferido automáticamente para los valores del formulario
 */
export type EnhancedCompanyFormValues = typeof EnhancedCompanyFormSchema

/**
 * Configuración de secciones del formulario para UI
 */
export const EnhancedCompanyFormSections = [
  {
    id: 'basic-info',
    title: 'Información Básica',
    description: 'Datos principales de la empresa',
    fields: ['name', 'slug', 'email', 'description', 'website', 'phone']
  },
  {
    id: 'address',
    title: 'Dirección',
    description: 'Ubicación física de la empresa',
    fields: [
      'address.street',
      'address.city',
      'address.state',
      'address.country',
      'address.postalCode'
    ]
  },
  {
    id: 'business-config',
    title: 'Configuración de Negocio',
    description: 'Configuraciones específicas del negocio',
    fields: [
      'settings.businessType',
      'settings.industry',
      'settings.taxId',
      'settings.currency',
      'settings.fiscalYear.startMonth',
      'settings.fiscalYear.endMonth'
    ]
  },
  {
    id: 'subscription',
    title: 'Plan de Suscripción',
    description: 'Configuración del plan y facturación',
    fields: ['subscription.plan', 'subscription.autoRenew']
  },
  {
    id: 'features',
    title: 'Módulos Habilitados',
    description: 'Características y módulos disponibles',
    fields: [
      'features.inventory',
      'features.accounting',
      'features.hrm',
      'features.crm',
      'features.projects'
    ]
  },
  {
    id: 'branding',
    title: 'Personalización',
    description: 'Colores y marca de la empresa',
    fields: ['branding.primaryColor', 'branding.secondaryColor']
  }
] as const

/**
 * Valores por defecto para el formulario
 */
export const EnhancedCompanyFormDefaults = {
  name: '',
  slug: '',
  email: '',
  description: '',
  website: '',
  phone: '',
  'address.street': '',
  'address.city': '',
  'address.state': '',
  'address.country': 'Chile',
  'address.postalCode': '',
  'settings.businessType': 'other',
  'settings.industry': 'Otros',
  'settings.taxId': '',
  'settings.currency': 'CLP',
  'settings.fiscalYear.startMonth': '1',
  'settings.fiscalYear.endMonth': '12',
  'subscription.plan': 'free',
  'subscription.autoRenew': true,
  'features.inventory': true,
  'features.accounting': false,
  'features.hrm': false,
  'features.crm': false,
  'features.projects': false,
  'branding.primaryColor': '#3B82F6',
  'branding.secondaryColor': '#6B7280'
} as const

/**
 * @deprecated Mantenido para compatibilidad hacia atrás
 * Usar EnhancedCompanyFormSchema en su lugar
 */
export const EnhancedCompanyFormFields = Object.entries(
  EnhancedCompanyFormSchema
).map(([id, config]) => ({
  id,
  label: config.label,
  type: config.type,
  placeholder: 'placeholder' in config ? config.placeholder : undefined,
  required: config.required || false
}))

export default EnhancedCompanyFormSchema
