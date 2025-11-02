/**
 * Reusable Form Field Components
 * @description: Componentes de campo reutilizables con tipado avanzado para formularios
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.1
 */

import {forwardRef} from 'react'
import {UseFormRegister, FieldErrors, Path} from 'react-hook-form'
import {CompanyFormData} from '@/interfaces/EnhanchedCompany/CreateCompanyFormTypes'

// Tipos base para los props de campos
interface BaseFieldProps {
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  description?: string
}

interface FormFieldProps<T extends CompanyFormData = CompanyFormData>
  extends BaseFieldProps {
  name: Path<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
}

// Utility para obtener el mensaje de error de forma segura
const getErrorMessage = <T extends CompanyFormData>(
  errors: FieldErrors<T>,
  name: Path<T>
): string | undefined => {
  try {
    if (!name.includes('.')) {
      return (errors as any)[name]?.message
    }

    const parts = name.split('.')
    let current: any = errors

    for (const part of parts) {
      current = current?.[part]
      if (!current) return undefined
    }

    return current?.message
  } catch {
    return undefined
  }
}

/**
 * Campo de texto estándar
 */
export const FormTextField = forwardRef<
  HTMLInputElement,
  FormFieldProps & {type?: 'text' | 'email' | 'tel'}
>(
  (
    {
      name,
      label,
      placeholder,
      required,
      disabled,
      className = '',
      description,
      type = 'text',
      register,
      errors
    },
    ref
  ) => {
    const errorMessage = getErrorMessage(errors, name)
    const hasError = !!errorMessage

    return (
      <div className='space-y-2'>
        <label
          htmlFor={name}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>

        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors
            ${
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            ${className}
          `}
          {...register(name)}
          ref={ref}
        />

        {description && <p className='text-xs text-gray-500'>{description}</p>}

        {hasError && <p className='text-sm text-red-600'>{errorMessage}</p>}
      </div>
    )
  }
)
FormTextField.displayName = 'FormTextField'

/**
 * Campo de área de texto
 */
export const FormTextAreaField = forwardRef<
  HTMLTextAreaElement,
  FormFieldProps & {rows?: number}
>(
  (
    {
      name,
      label,
      placeholder,
      required,
      disabled,
      className = '',
      description,
      rows = 4,
      register,
      errors
    },
    ref
  ) => {
    const errorMessage = getErrorMessage(errors, name)
    const hasError = !!errorMessage

    return (
      <div className='space-y-2'>
        <label
          htmlFor={name}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>

        <textarea
          id={name}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-vertical transition-colors
            ${
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            ${className}
          `}
          {...register(name)}
          ref={ref}
        />

        {description && <p className='text-xs text-gray-500'>{description}</p>}

        {hasError && <p className='text-sm text-red-600'>{errorMessage}</p>}
      </div>
    )
  }
)
FormTextAreaField.displayName = 'FormTextAreaField'

/**
 * Campo de selección (select)
 */
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export const FormSelectField = forwardRef<
  HTMLSelectElement,
  FormFieldProps & {
    options: SelectOption[]
    defaultValue?: string
  }
>(
  (
    {
      name,
      label,
      required,
      disabled,
      className = '',
      description,
      options,
      defaultValue,
      register,
      errors
    },
    ref
  ) => {
    const errorMessage = getErrorMessage(errors, name)
    const hasError = !!errorMessage

    return (
      <div className='space-y-2'>
        <label
          htmlFor={name}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>

        <select
          id={name}
          disabled={disabled}
          defaultValue={defaultValue}
          className={`
            block w-full px-3 py-2 rounded-lg border shadow-sm transition-colors focus:outline-none focus:ring-2
            ${
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${
              disabled
                ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                : 'bg-white'
            }
            ${className}
          `}
          {...register(name)}
          ref={ref}
        >
          <option value=''>Seleccionar...</option>
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {description && <p className='text-xs text-gray-500'>{description}</p>}

        {hasError && <p className='text-sm text-red-600'>{errorMessage}</p>}
      </div>
    )
  }
)
FormSelectField.displayName = 'FormSelectField'

/**
 * Campo de checkbox
 */
export const FormCheckboxField = forwardRef<
  HTMLInputElement,
  FormFieldProps & {
    checkboxLabel?: string
  }
>(
  (
    {
      name,
      label,
      required,
      disabled,
      className = '',
      description,
      checkboxLabel,
      register,
      errors
    },
    ref
  ) => {
    const errorMessage = getErrorMessage(errors, name)
    const hasError = !!errorMessage

    return (
      <div className='space-y-2'>
        <div className='block text-sm font-medium text-gray-700'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </div>

        <div className='flex items-start'>
          <input
            id={name}
            type='checkbox'
            disabled={disabled}
            className={`
              h-4 w-4 text-blue-600 border rounded transition-colors focus:ring-2
              ${
                hasError
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }
              ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
              ${className}
            `}
            {...register(name)}
            ref={ref}
          />
          {checkboxLabel && (
            <label htmlFor={name} className='ml-3 text-sm text-gray-600'>
              {checkboxLabel}
            </label>
          )}
        </div>

        {description && <p className='text-xs text-gray-500'>{description}</p>}

        {hasError && <p className='text-sm text-red-600'>{errorMessage}</p>}
      </div>
    )
  }
)
FormCheckboxField.displayName = 'FormCheckboxField'

/**
 * Campo de color
 */
export const FormColorField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      name,
      label,
      required,
      disabled,
      className = '',
      description,
      register,
      errors
    },
    ref
  ) => {
    const errorMessage = getErrorMessage(errors, name)
    const hasError = !!errorMessage

    return (
      <div className='space-y-2'>
        <label
          htmlFor={name}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>

        <div className='flex items-center space-x-3'>
          <input
            id={name}
            type='color'
            disabled={disabled}
            className={`
              h-10 w-16 rounded-lg border-2 cursor-pointer transition-colors
              ${hasError ? 'border-red-300' : 'border-gray-300'}
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              ${className}
            `}
            {...register(name)}
            ref={ref}
          />
          <div className='flex-1'>
            <input
              type='text'
              disabled={disabled}
              className={`
                block w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:outline-none focus:ring-2
                ${
                  hasError
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
                ${
                  disabled
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'bg-white'
                }
              `}
              placeholder='#3B82F6'
              {...register(name)}
            />
          </div>
        </div>

        {description && <p className='text-xs text-gray-500'>{description}</p>}

        {hasError && <p className='text-sm text-red-600'>{errorMessage}</p>}
      </div>
    )
  }
)
FormColorField.displayName = 'FormColorField'

/**
 * Grupo de campos relacionados
 */
interface FormFieldGroupProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const FormFieldGroup: React.FC<FormFieldGroupProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className='border-b border-gray-200 pb-4'>
        <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
        {description && (
          <p className='mt-1 text-sm text-gray-600'>{description}</p>
        )}
      </div>
      <div className='space-y-4'>{children}</div>
    </div>
  )
}

export default {
  FormTextField,
  FormTextAreaField,
  FormSelectField,
  FormCheckboxField,
  FormColorField,
  FormFieldGroup
}
