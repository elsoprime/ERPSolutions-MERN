/**
 * Advanced Form Types System
 * @description: Sistema de tipos avanzado para formularios escalables y declarativos
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 *
 * Este sistema permite crear formularios tipados de manera declarativa,
 * con inferencia automática de tipos y validaciones robustas.
 */

// ===== TIPOS BASE PARA VALORES DE CAMPOS =====

/**
 * Tipos de datos primitivos soportados por los campos
 */
export type FieldValueType =
  | string
  | number
  | boolean
  | Date
  | File
  | File[]
  | string[]

/**
 * Mapeo de tipos de campo a sus valores correspondientes
 */
export type FieldTypeValueMap = {
  text: string
  email: string
  password: string
  url: string
  textarea: string
  number: number
  select: string
  multiselect: string[]
  checkbox: boolean
  radio: string
  date: Date
  datetime: Date
  file: File
  multifile: File[]
  hidden: string
}

/**
 * Tipos de campo soportados
 */
export type FieldType = keyof FieldTypeValueMap

// ===== VALIDADORES =====

/**
 * Función de validación genérica que devuelve un mensaje de error o null
 */
export type Validator<T> = (value: T) => string | null

/**
 * Validadores predefinidos comunes
 */
export const CommonValidators = {
  // Validador de email
  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : 'Formato de email inválido'
  },

  // Validador de longitud mínima
  minLength:
    (min: number) =>
    (value: string): string | null => {
      return value.length >= min
        ? null
        : `Debe tener al menos ${min} caracteres`
    },

  // Validador de longitud máxima
  maxLength:
    (max: number) =>
    (value: string): string | null => {
      return value.length <= max ? null : `No puede exceder ${max} caracteres`
    },

  // Validador de número mínimo
  min:
    (min: number) =>
    (value: number): string | null => {
      return value >= min ? null : `El valor debe ser mayor o igual a ${min}`
    },

  // Validador de número máximo
  max:
    (max: number) =>
    (value: number): string | null => {
      return value <= max ? null : `El valor debe ser menor o igual a ${max}`
    },

  // Validador de campos requeridos
  required: <T>(value: T): string | null => {
    if (value === null || value === undefined || value === '') {
      return 'Este campo es requerido'
    }
    return null
  },

  // Validador de URL
  url: (value: string): string | null => {
    try {
      new URL(value)
      return null
    } catch {
      return 'Formato de URL inválido'
    }
  },

  // Validador de número entero
  integer: (value: number): string | null => {
    return Number.isInteger(value) ? null : 'Debe ser un número entero'
  },

  // Validador de archivo por tipo MIME
  fileType:
    (allowedTypes: string[]) =>
    (file: File): string | null => {
      return allowedTypes.includes(file.type)
        ? null
        : `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`
    },

  // Validador de tamaño de archivo
  fileSize:
    (maxSizeInMB: number) =>
    (file: File): string | null => {
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024
      return file.size <= maxSizeInBytes
        ? null
        : `El archivo debe ser menor a ${maxSizeInMB}MB`
    }
} as const

// ===== DEFINICIÓN DE CAMPOS =====

/**
 * Opciones para campos de tipo select
 */
export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
  group?: string
}

/**
 * Configuración base para cualquier campo del formulario
 */
export interface BaseFieldConfig<T extends FieldType> {
  label: string
  type: T
  required?: boolean
  disabled?: boolean
  placeholder?: string
  helpText?: string
  className?: string
  defaultValue?: FieldTypeValueMap[T]
  validators?: readonly Validator<FieldTypeValueMap[T]>[]
}

/**
 * Configuración específica para campos de tipo select
 */
export interface SelectFieldConfig extends BaseFieldConfig<'select'> {
  options: readonly SelectOption<string>[]
  placeholder?: string
}

/**
 * Configuración específica para campos de tipo multiselect
 */
export interface MultiSelectFieldConfig extends BaseFieldConfig<'multiselect'> {
  options: readonly SelectOption<string>[]
  placeholder?: string
  maxSelections?: number
}

/**
 * Configuración específica para campos de tipo radio
 */
export interface RadioFieldConfig extends BaseFieldConfig<'radio'> {
  options: readonly SelectOption<string>[]
}

/**
 * Configuración específica para campos de archivo
 */
export interface FileFieldConfig extends BaseFieldConfig<'file'> {
  accept?: string
  maxSize?: number // en bytes
}

/**
 * Configuración específica para campos de múltiples archivos
 */
export interface MultiFileFieldConfig extends BaseFieldConfig<'multifile'> {
  accept?: string
  maxSize?: number // en bytes
  maxFiles?: number
}

/**
 * Configuración específica para campos numéricos
 */
export interface NumberFieldConfig extends BaseFieldConfig<'number'> {
  min?: number
  max?: number
  step?: number
}

/**
 * Configuración específica para campos de fecha
 */
export interface DateFieldConfig extends BaseFieldConfig<'date' | 'datetime'> {
  min?: Date
  max?: Date
}

/**
 * Configuración específica para campos de texto
 */
export interface TextFieldConfig
  extends BaseFieldConfig<'text' | 'email' | 'password' | 'url'> {
  minLength?: number
  maxLength?: number
  pattern?: string
}

/**
 * Configuración específica para campos de textarea
 */
export interface TextAreaFieldConfig extends BaseFieldConfig<'textarea'> {
  rows?: number
  cols?: number
  minLength?: number
  maxLength?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

/**
 * Union type de todas las configuraciones posibles de campos
 */
export type FormField<T extends FieldType = FieldType> = T extends 'select'
  ? SelectFieldConfig
  : T extends 'multiselect'
  ? MultiSelectFieldConfig
  : T extends 'radio'
  ? RadioFieldConfig
  : T extends 'file'
  ? FileFieldConfig
  : T extends 'multifile'
  ? MultiFileFieldConfig
  : T extends 'number'
  ? NumberFieldConfig
  : T extends 'date' | 'datetime'
  ? DateFieldConfig
  : T extends 'text' | 'email' | 'password' | 'url'
  ? TextFieldConfig
  : T extends 'textarea'
  ? TextAreaFieldConfig
  : BaseFieldConfig<T>

// ===== SCHEMA Y VALORES DEL FORMULARIO =====

/**
 * Schema del formulario: un objeto con claves dinámicas y valores FormField
 */
export type FormSchema = Record<string, FormField>

/**
 * Infiere los tipos de valores del formulario basándose en el schema
 */
export type FormValues<T extends FormSchema> = {
  [K in keyof T]: T[K] extends FormField<infer U> ? FieldTypeValueMap[U] : never
}

/**
 * Estado de validación para cada campo
 */
export type FormValidationState<T extends FormSchema> = {
  [K in keyof T]: {
    isValid: boolean
    errors: string[]
    touched: boolean
  }
}

/**
 * Estado completo del formulario
 */
export interface FormState<T extends FormSchema> {
  values: FormValues<T>
  validation: FormValidationState<T>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
}

// ===== HOOKS Y UTILIDADES =====

/**
 * Configuración para el hook de formulario
 */
export interface FormConfig<T extends FormSchema> {
  schema: T
  onSubmit: (values: FormValues<T>) => Promise<void> | void
  initialValues?: Partial<FormValues<T>>
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

/**
 * Resultado del hook de formulario
 */
export interface FormHookResult<T extends FormSchema> {
  values: FormValues<T>
  errors: FormValidationState<T>
  setValue: <K extends keyof T>(field: K, value: FormValues<T>[K]) => void
  setFieldTouched: (field: keyof T, touched: boolean) => void
  validateField: (field: keyof T) => boolean
  validateForm: () => boolean
  resetForm: () => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
}

// ===== EJEMPLO DE USO =====

/**
 * Ejemplo: Schema para formulario de registro de usuario
 *
 * Este ejemplo demuestra cómo usar el sistema de tipos para crear
 * un formulario completamente tipado con validaciones
 */
export const UserRegistrationSchema = {
  name: {
    label: 'Nombre completo',
    type: 'text',
    required: true,
    placeholder: 'Ingresa tu nombre completo',
    validators: [
      CommonValidators.required,
      CommonValidators.minLength(2),
      CommonValidators.maxLength(50)
    ]
  },

  email: {
    label: 'Correo electrónico',
    type: 'email',
    required: true,
    placeholder: 'ejemplo@correo.com',
    validators: [CommonValidators.required, CommonValidators.email]
  },

  age: {
    label: 'Edad',
    type: 'number',
    required: false,
    min: 18,
    max: 120,
    validators: [
      CommonValidators.min(18),
      CommonValidators.max(120),
      CommonValidators.integer
    ]
  },

  role: {
    label: 'Rol',
    type: 'select',
    required: true,
    options: [
      {value: 'admin', label: 'Administrador'},
      {value: 'user', label: 'Usuario'},
      {value: 'guest', label: 'Invitado'}
    ],
    validators: [CommonValidators.required]
  },

  website: {
    label: 'Sitio web',
    type: 'url',
    required: false,
    placeholder: 'https://example.com',
    validators: [CommonValidators.url]
  },

  bio: {
    label: 'Biografía',
    type: 'textarea',
    required: false,
    rows: 4,
    maxLength: 500,
    placeholder: 'Cuéntanos sobre ti...',
    validators: [CommonValidators.maxLength(500)]
  },

  avatar: {
    label: 'Foto de perfil',
    type: 'file',
    required: false,
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024, // 5MB
    validators: [
      CommonValidators.fileType(['image/jpeg', 'image/png', 'image/webp']),
      CommonValidators.fileSize(5)
    ]
  },

  terms: {
    label: 'Acepto los términos y condiciones',
    type: 'checkbox',
    required: true,
    validators: [
      (value: boolean) =>
        value ? null : 'Debes aceptar los términos y condiciones'
    ]
  },

  preferences: {
    label: 'Preferencias',
    type: 'multiselect',
    required: false,
    options: [
      {value: 'newsletter', label: 'Recibir newsletter'},
      {value: 'notifications', label: 'Notificaciones push'},
      {value: 'updates', label: 'Actualizaciones de producto'}
    ],
    maxSelections: 3
  }
} as const

/**
 * Tipo inferido automáticamente para los valores del formulario de usuario
 * TypeScript inferirá:
 * {
 *   name: string
 *   email: string
 *   age: number
 *   role: string
 *   website: string
 *   bio: string
 *   avatar: File
 *   terms: boolean
 *   preferences: string[]
 * }
 */
export type UserRegistrationValues = FormValues<typeof UserRegistrationSchema>

// ===== UTILIDADES ADICIONALES =====

/**
 * Helper para crear un schema de formulario con autocompletado
 */
export const createFormSchema = <T extends FormSchema>(schema: T): T => schema

/**
 * Helper para obtener valores por defecto del schema
 */
export const getDefaultValues = <T extends FormSchema>(
  schema: T
): Partial<FormValues<T>> => {
  const defaults: any = {}

  for (const [key, field] of Object.entries(schema)) {
    if (field.defaultValue !== undefined) {
      defaults[key] = field.defaultValue
    } else {
      // Valores por defecto basados en el tipo
      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'url':
        case 'textarea':
        case 'select':
        case 'radio':
        case 'hidden':
          defaults[key] = ''
          break
        case 'number':
          defaults[key] = 0
          break
        case 'checkbox':
          defaults[key] = false
          break
        case 'multiselect':
          defaults[key] = []
          break
        case 'date':
        case 'datetime':
          defaults[key] = new Date()
          break
        case 'file':
          defaults[key] = null
          break
        case 'multifile':
          defaults[key] = []
          break
      }
    }
  }

  return defaults
}

/**
 * Helper para validar un formulario completo
 */
export const validateFormValues = <T extends FormSchema>(
  schema: T,
  values: FormValues<T>
): FormValidationState<T> => {
  const validation: any = {}

  for (const [key, field] of Object.entries(schema)) {
    const value = values[key as keyof T]
    const errors: string[] = []

    // Ejecutar validadores si existen
    if (field.validators) {
      for (const validator of field.validators) {
        const error = (validator as any)(value)
        if (error) {
          errors.push(error)
        }
      }
    }

    validation[key] = {
      isValid: errors.length === 0,
      errors,
      touched: false
    }
  }

  return validation
}

/**
 * Helper para verificar si el formulario es válido
 */
export const isFormValid = <T extends FormSchema>(
  validation: FormValidationState<T>
): boolean => {
  return Object.values(validation).every(field => field.isValid)
}

export default {
  createFormSchema,
  getDefaultValues,
  validateFormValues,
  isFormValid,
  CommonValidators
}
