/**
 * Form Stepper Component
 * @description: Componente de navegación de pasos para formularios multi-paso
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.1.0 - Enhanced with icons and CreateCompanyForm logic
 */

import React from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'
import {
  FormStep,
  StepConfig
} from '@/interfaces/EnhanchedCompany/CreateCompanyFormTypes'

interface FormStepperProps {
  steps: StepConfig[]
  currentStep: FormStep
  onStepClick?: (step: FormStep) => void
  allowClickableSteps?: boolean
  className?: string
  showProgress?: boolean
}

/**
 * Componente de navegación visual para pasos del formulario
 */
export const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowClickableSteps = false,
  className = '',
  showProgress = true
}) => {
  const getStepStatus = (stepNumber: FormStep) => {
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'current'
    return 'pending'
  }

  const getStepClasses = (stepNumber: FormStep) => {
    const status = getStepStatus(stepNumber)
    const baseClasses =
      'flex h-12 w-12 lg:h-8 lg:w-8 items-center justify-center rounded-full border-2 transition-all duration-300 transform'

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-lg`
      case 'current':
        return `${baseClasses} bg-gradient-to-br from-blue-500 to-blue-700 border-blue-500 text-white shadow-xl ring-4 ring-gray-500/20 scale-110`
      case 'pending':
        return `${baseClasses} bg-white border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500`
      default:
        return baseClasses
    }
  }

  const getConnectorClasses = (stepNumber: FormStep) => {
    const status = getStepStatus(stepNumber)

    return status === 'completed'
      ? 'bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300'
      : 'bg-gray-300 transition-all duration-300'
  }

  const handleStepClick = (stepNumber: FormStep) => {
    if (allowClickableSteps && onStepClick) {
      onStepClick(stepNumber)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className='relative'>
        {/* Steps Container - Mobile: Single step view, Desktop: Horizontal layout */}

        {/* Mobile View - Solo paso actual */}
        <div className='md:hidden flex flex-col items-center justify-center relative'>
          {steps
            .filter((step) => step.number === currentStep)
            .map((step) => {
              const stepNumber = step.number
              const status = getStepStatus(stepNumber)
              const isClickable = allowClickableSteps && stepNumber <= currentStep

              return (
                <div key={stepNumber} className='relative flex flex-col items-center z-10 animate-fadeIn'>
                  {/* Step Circle with Icon */}
                  <button
                    onClick={() => handleStepClick(stepNumber)}
                    disabled={!isClickable}
                    className={`
                      ${getStepClasses(stepNumber)}
                      ${isClickable
                        ? 'cursor-pointer hover:scale-105 hover:shadow-lg'
                        : 'cursor-default'
                      }
                      relative z-10 transition-all duration-300
                    `}
                    aria-label={`Paso ${stepNumber}: ${step.title}`}
                    title={step.description || step.title}
                  >
                    {status === 'completed' ? (
                      <CheckIcon className='h-5 w-5' />
                    ) : status === 'current' ? (
                      <step.icon className='h-4 w-4' />
                    ) : (
                      <step.icon className='h-4 w-4 opacity-60' />
                    )}
                  </button>

                  {/* Step Info */}
                  <div className='mt-3 text-center max-w-full px-4'>
                    <div
                      className={`
                        text-sm font-bold transition-colors duration-200
                        ${status === 'current'
                          ? 'text-blue-700'
                          : status === 'completed'
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }
                      `}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div
                        className={`
                          text-xs mt-1 transition-colors duration-200 leading-tight
                          ${status === 'current'
                            ? 'text-blue-500'
                            : status === 'completed'
                              ? 'text-green-500'
                              : 'text-gray-400'
                          }
                        `}
                      >
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>

        {/* Desktop View - Todos los pasos horizontales */}
        <div className='hidden md:flex flex-row items-center justify-between relative'>
          {steps.map((step, index) => {
            const stepNumber = step.number
            const status = getStepStatus(stepNumber)
            const isClickable = allowClickableSteps && stepNumber <= currentStep

            return (
              <React.Fragment key={stepNumber}>
                {/* Step Container */}
                <div className='relative flex flex-col items-center z-10'>
                  {/* Step Circle with Icon */}
                  <button
                    onClick={() => handleStepClick(stepNumber)}
                    disabled={!isClickable}
                    className={`
                      ${getStepClasses(stepNumber)}
                      ${isClickable
                        ? 'cursor-pointer hover:scale-105 hover:shadow-lg'
                        : 'cursor-default'
                      }
                      relative z-10 transition-all duration-300
                    `}
                    aria-label={`Paso ${stepNumber}: ${step.title}`}
                    title={step.description || step.title}
                  >
                    {status === 'completed' ? (
                      <CheckIcon className='h-5 w-5' />
                    ) : status === 'current' ? (
                      <step.icon className='h-4 w-4' />
                    ) : (
                      <step.icon className='h-4 w-4 opacity-60' />
                    )}
                  </button>

                  {/* Step Info */}
                  <div className='mt-3 text-center max-w-24'>
                    <div
                      className={`
                        text-sm font-bold transition-colors duration-200
                        ${status === 'current'
                          ? 'text-blue-700'
                          : status === 'completed'
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }
                      `}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div
                        className={`
                          text-xs mt-1 transition-colors duration-200 leading-tight
                          ${status === 'current'
                            ? 'text-blue-500'
                            : status === 'completed'
                              ? 'text-green-500'
                              : 'text-gray-400'
                          }
                        `}
                      >
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector Line between steps */}
                {index < steps.length - 1 && (
                  <div className='flex-1 flex items-center px-6 lg:px-2'>
                    <div
                      className={`h-0.5 w-full ${getConnectorClasses(
                        stepNumber
                      )}`}
                    />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      {showProgress && (
        <div className='mt-2 w-full bg-gray-200 rounded-full h-3 shadow-inner'>
          <div
            className='bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 h-3 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden'
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
            }}
          >
            {/* Progress shine effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse' />
          </div>
        </div>
      )}

      {/* Enhanced Step Description */}
      <div className='mt-2 px-4 text-center flex flex-col md:flex-row items-center '>
        <div className='text-gray-600 text-xs font-medium'>
          Paso <span className='font-bold'>{currentStep}</span> de {steps.length}
        </div>
        {steps[currentStep - 1]?.description && (
          <div className='mt-2 text-xs text-gray-500 max-w-lg mx-auto leading-relaxed'>
            {steps[currentStep - 1].description}
          </div>
        )}

        {/* Progress percentage */}
        {showProgress && (
          <div className='mt-2 text-xs text-gray-400'>
            {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}%
            completado
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Características principales del FormStepper mejorado:
 *
 * 1. **Iconos dinámicos**: Cada paso muestra su icono específico según el estado
 *    - Completado: CheckIcon verde
 *    - Actual: Icono del paso con color azul y animación
 *    - Pendiente: Icono del paso con opacidad reducida
 *
 * 2. **Estados visuales mejorados**:
 *    - Gradientes para pasos completados y actuales
 *    - Animaciones suaves de escala y sombra
 *    - Ring de enfoque para el paso actual
 *
 * 3. **Diseño responsivo**:
 *    - Layout vertical en móviles
 *    - Layout horizontal en desktop
 *    - Conectores adaptativos
 *
 * 4. **Barra de progreso mejorada**:
 *    - Altura aumentada (h-3)
 *    - Efectos de brillo animados
 *    - Porcentaje de completado
 *
 * 5. **Accesibilidad**:
 *    - ARIA labels descriptivos
 *    - Tooltips informativos
 *    - Estados de hover y focus mejorados
 *
 * 6. **Integración con CreateCompanyForm**:
 *    - Compatible con FORM_STEPS de CreateCompanyFormTypes
 *    - Manejo de iconos desde HeroIcons
 *    - Validación de pasos integrada
 */

export default FormStepper
