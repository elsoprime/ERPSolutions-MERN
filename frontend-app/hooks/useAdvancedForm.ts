/**
 * useAdvancedForm Hook
 * @description: Hook personalizado para manejar formularios con el sistema de tipos avanzado
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

import {useState, useCallback, useEffect} from 'react'
import {
  FormSchema,
  FormValues,
  FormValidationState,
  FormHookResult,
  FormConfig,
  getDefaultValues,
  validateFormValues,
  isFormValid
} from '../interfaces/FormTypes'

/**
 * Hook avanzado para manejar formularios con tipado fuerte
 */
export function useAdvancedForm<T extends FormSchema>(
  config: FormConfig<T>
): FormHookResult<T> {
  const {
    schema,
    onSubmit,
    initialValues,
    validateOnChange = true,
    validateOnBlur = true
  } = config

  // Estado de los valores del formulario
  const [values, setValues] = useState<FormValues<T>>(() => {
    const defaults = getDefaultValues(schema)
    return {...defaults, ...initialValues} as FormValues<T>
  })

  // Estado de validación
  const [validation, setValidation] = useState<FormValidationState<T>>(() =>
    validateFormValues(schema, values)
  )

  // Estado del formulario
  const [isSubmitting, setIsSubmitting] = useState(false) // Estado de envío
  const [isDirty, setIsDirty] = useState(false) // Estado de si el formulario ha sido modificado

  // Calcular si el formulario es válido
  const formIsValid = isFormValid(validation)

  // Función para establecer valor de un campo específico
  const setValue = useCallback(
    <K extends keyof T>(field: K, value: FormValues<T>[K]) => {
      setValues(prev => ({
        ...prev,
        [field]: value
      }))
      setIsDirty(true)

      // Validar en tiempo real si está habilitado
      if (validateOnChange) {
        setValidation(prev => {
          const fieldConfig = schema[field]
          const errors: string[] = []

          if (fieldConfig.validators) {
            for (const validator of fieldConfig.validators) {
              const error = (validator as any)(value)
              if (error) {
                errors.push(error)
              }
            }
          }

          return {
            ...prev,
            [field]: {
              isValid: errors.length === 0,
              errors,
              touched: true
            }
          }
        })
      }
    },
    [schema, validateOnChange]
  )

  // Función para marcar un campo como tocado
  const setFieldTouched = useCallback((field: keyof T, touched: boolean) => {
    setValidation(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched
      }
    }))
  }, [])

  // Validar un campo específico
  const validateField = useCallback(
    (field: keyof T): boolean => {
      const fieldConfig = schema[field]
      const value = values[field]
      const errors: string[] = []

      if (fieldConfig.validators) {
        for (const validator of fieldConfig.validators) {
          const error = (validator as any)(value)
          if (error) {
            errors.push(error)
          }
        }
      }

      const isValid = errors.length === 0

      setValidation(prev => ({
        ...prev,
        [field]: {
          isValid,
          errors,
          touched: true
        }
      }))

      return isValid
    },
    [schema, values]
  )

  // Validar todo el formulario
  const validateForm = useCallback((): boolean => {
    const newValidation = validateFormValues(schema, values)

    // Marcar todos los campos como tocados
    const touchedValidation = Object.keys(newValidation).reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          ...newValidation[key as keyof T],
          touched: true
        }
      }),
      {} as FormValidationState<T>
    )

    setValidation(touchedValidation)
    return isFormValid(touchedValidation)
  }, [schema, values])

  // Resetear el formulario
  const resetForm = useCallback(() => {
    const defaults = getDefaultValues(schema)
    const resetValues = {...defaults, ...initialValues} as FormValues<T>

    setValues(resetValues)
    setValidation(validateFormValues(schema, resetValues))
    setIsDirty(false)
    setIsSubmitting(false)
  }, [schema, initialValues])

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      // Validar antes de enviar
      const isValid = validateForm()

      if (!isValid) {
        return
      }

      setIsSubmitting(true)

      try {
        await onSubmit(values)
        // Opcional: resetear el formulario después del envío exitoso
        // resetForm()
      } catch (error) {
        console.error('Error al enviar formulario:', error)
        // Aquí podrías manejar errores específicos del servidor
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validateForm, onSubmit]
  )

  // Efecto para validación en blur si está habilitado
  useEffect(() => {
    if (validateOnBlur && isDirty) {
      // Este efecto se puede usar para validación adicional cuando sea necesario
    }
  }, [validateOnBlur, isDirty])

  return {
    values,
    errors: validation,
    setValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    handleSubmit,
    isSubmitting,
    isDirty,
    isValid: formIsValid
  }
}

/**
 * Hook simplificado para formularios básicos
 */
export function useSimpleForm<T extends FormSchema>(
  schema: T,
  onSubmit: (values: FormValues<T>) => Promise<void> | void,
  initialValues?: Partial<FormValues<T>>
) {
  return useAdvancedForm({
    schema,
    onSubmit,
    initialValues,
    validateOnChange: true,
    validateOnBlur: true
  })
}

export default useAdvancedForm
