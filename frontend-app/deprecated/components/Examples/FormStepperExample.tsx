/**
 * FormStepper Example Component
 * @description: Ejemplo de uso del FormStepper mejorado con la lógica del CreateCompanyForm
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

'use client'
import React, {useState} from 'react'
import FormStepper from '@/components/Shared/FormStepper'
import {
  FORM_STEPS,
  FormStep
} from '@/interfaces/EnhanchedCompany/CreateCompanyFormTypes'

/**
 * Ejemplo de uso del FormStepper mejorado
 */
export const FormStepperExample: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>(1)
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([])

  // Simular navegación entre pasos
  const handleStepClick = (step: FormStep) => {
    console.log(`Navegando al paso: ${step}`)
    setCurrentStep(step)
  }

  // Simular completar un paso
  const handleCompleteStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep])
    }

    if (currentStep < 4) {
      setCurrentStep(prev => (prev + 1) as FormStep)
    }
  }

  // Simular retroceder un paso
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as FormStep)
    }
  }

  // Simular reset del formulario
  const handleReset = () => {
    setCurrentStep(1)
    setCompletedSteps([])
  }

  return (
    <div className='max-w-4xl mx-auto p-8 space-y-8'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          FormStepper Mejorado
        </h1>
        <p className='text-gray-600'>
          Componente de navegación para formularios multi-paso con iconos y
          lógica del CreateCompanyForm
        </p>
      </div>

      {/* FormStepper Component */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <FormStepper
          steps={FORM_STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          allowClickableSteps={true}
          showProgress={true}
          className='mb-6'
        />

        {/* Current Step Content Simulation */}
        <div className='bg-gray-50 rounded-lg p-6 min-h-32'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>
            {FORM_STEPS[currentStep - 1].title}
          </h3>
          <p className='text-gray-600 mb-4'>
            {FORM_STEPS[currentStep - 1].description}
          </p>

          {/* Simulación de campos del formulario */}
          <div className='space-y-3'>
            {FORM_STEPS[currentStep - 1].fields.map((field, index) => (
              <div key={index} className='flex items-center space-x-3'>
                <div className='w-3 h-3 bg-blue-200 rounded-full flex-shrink-0'></div>
                <span className='text-sm text-gray-600'>
                  Campo: {String(field)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className='flex justify-between items-center mt-6 pt-6 border-t border-gray-200'>
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            Anterior
          </button>

          <div className='flex space-x-3'>
            <button
              onClick={handleReset}
              className='px-4 py-2 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors'
            >
              Reiniciar
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleCompleteStep}
                className='px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors'
              >
                Completar y Continuar
              </button>
            ) : (
              <button
                onClick={handleCompleteStep}
                className='px-6 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors'
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-blue-50 rounded-lg p-4'>
          <h4 className='font-semibold text-blue-900 mb-2'>Paso Actual</h4>
          <p className='text-blue-700'>
            Paso {currentStep} de {FORM_STEPS.length}
          </p>
        </div>

        <div className='bg-green-50 rounded-lg p-4'>
          <h4 className='font-semibold text-green-900 mb-2'>Completados</h4>
          <p className='text-green-700'>
            {completedSteps.length} pasos completados
          </p>
        </div>

        <div className='bg-purple-50 rounded-lg p-4'>
          <h4 className='font-semibold text-purple-900 mb-2'>Progreso</h4>
          <p className='text-purple-700'>
            {Math.round(((currentStep - 1) / (FORM_STEPS.length - 1)) * 100)}%
            completado
          </p>
        </div>
      </div>

      {/* Features List */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Características del FormStepper Mejorado
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-3'>
            <div className='flex items-start space-x-3'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
              <div>
                <p className='font-medium text-gray-900'>Iconos Dinámicos</p>
                <p className='text-sm text-gray-600'>
                  Cada paso muestra su icono específico según el estado
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
              <div>
                <p className='font-medium text-gray-900'>Estados Visuales</p>
                <p className='text-sm text-gray-600'>
                  Gradientes y animaciones para mejor UX
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <div className='w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0'></div>
              <div>
                <p className='font-medium text-gray-900'>Diseño Responsivo</p>
                <p className='text-sm text-gray-600'>
                  Adaptable a móviles y desktop
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-start space-x-3'>
              <div className='w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0'></div>
              <div>
                <p className='font-medium text-gray-900'>Barra de Progreso</p>
                <p className='text-sm text-gray-600'>
                  Con efectos de brillo y porcentaje
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <div className='w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0'></div>
              <div>
                <p className='font-medium text-gray-900'>Accesibilidad</p>
                <p className='text-sm text-gray-600'>
                  ARIA labels y navegación por teclado
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <div className='w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0'></div>
              <div>
                <p className='font-medium text-gray-900'>Integración</p>
                <p className='text-sm text-gray-600'>
                  Compatible con CreateCompanyForm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormStepperExample
