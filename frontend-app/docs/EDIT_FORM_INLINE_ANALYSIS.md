# Análisis: EditCompanyFormInline con Transiciones

> **Fecha**: 10 de noviembre de 2025  
> **Autor**: Esteban Soto Ojeda @elsoprimeDev  
> **Objetivo**: Implementar formulario inline de edición siguiendo el patrón exitoso de CreateCompanyFormInline

---

## 📋 Resumen Ejecutivo

### Estado Actual
- **EditCompanyForm.tsx**: 1,451 líneas (modal)
- **Patrón**: Modal con FormModal wrapper
- **Complejidad**: Alta (gestión de sincronización de planes, validación por pasos)
- **Reutilización**: Baja (lógica acoplada al componente)

### Propuesta
Aplicar el **mismo patrón exitoso** usado en `CreateCompanyFormInline`:

1. **Custom Hook**: `useEditCompanyForm.ts` (~500 líneas)
2. **Componente Inline**: `EditCompanyFormInline.tsx` (~450 líneas)
3. **Transición CSS**: Animación suave al renderizar
4. **Integración**: Renderizado condicional en `CompanyTable.tsx`

---

## 🎯 Objetivos

### Funcionales
✅ Mantener toda la lógica de edición existente  
✅ Preservar validación por pasos (4 steps)  
✅ Sincronización correcta de planes (fix actual)  
✅ Conversión de datos bidireccional (empresa ↔ form)  
✅ Manejo de errores y confirmaciones  

### No Funcionales
✅ TypeScript strict typing  
✅ Reutilización del custom hook  
✅ Transición suave (300ms)  
✅ Performance optimizada  
✅ Accesibilidad (ARIA labels)  

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                     CompanyTable.tsx                        │
│                                                             │
│  State:                                                     │
│    - isCreatingCompany: boolean                            │
│    - editingCompanyId: string | null  ← NUEVO              │
│    - editingCompany: IEnhancedCompany | null  ← NUEVO      │
│                                                             │
│  Conditional Rendering:                                     │
│    if (isCreatingCompany) → CreateCompanyFormInline        │
│    if (editingCompanyId) → EditCompanyFormInline  ← NUEVO  │
│    else → Table                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────────┐
                              │                     │
                              ▼                     ▼
┌───────────────────────────────────┐  ┌───────────────────────────────────┐
│   useCreateCompanyForm.ts (✅)   │  │   useEditCompanyForm.ts (NUEVO)   │
│                                   │  │                                   │
│  - Form state management          │  │  - Form state management          │
│  - Step validation                │  │  - Step validation                │
│  - Plans loading                  │  │  - Plans loading & sync           │
│  - Create submission              │  │  - Update submission              │
│  - Auto slug generation           │  │  - Plan change detection          │
│                                   │  │  - Dirty fields tracking          │
└───────────────────────────────────┘  └───────────────────────────────────┘
                              │                     │
                              ▼                     ▼
┌───────────────────────────────────┐  ┌───────────────────────────────────┐
│ CreateCompanyFormInline.tsx (✅) │  │ EditCompanyFormInline.tsx (NUEVO) │
│                                   │  │                                   │
│  - Header + Cancel button         │  │  - Header + Cancel button         │
│  - FormStepper                    │  │  - FormStepper                    │
│  - 4 Steps (Basic, Business,      │  │  - 4 Steps (same structure)       │
│    Plans, Branding)               │  │  - Transition animation           │
│  - Navigation (Prev/Next)         │  │  - Navigation (Prev/Next)         │
│  - Submit → Create                │  │  - Submit → Update                │
└───────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 🔍 Diferencias Clave: Create vs Edit

| Aspecto | CreateCompanyFormInline ✅ | EditCompanyFormInline (Propuesto) |
|---------|---------------------------|-----------------------------------|
| **Props** | `onCancel, onSuccess, initialValues?` | `company, onCancel, onSuccess` |
| **Inicialización** | Valores por defecto vacíos | Pre-poblado desde `company` |
| **Sincronización Plan** | No aplica | ⚠️ **Crítico** - Mantener plan actual |
| **Validación** | Campos vacíos → requeridos | Campos existentes → validar cambios |
| **Submit** | `createCompany()` | `updateCompany(companyId, changes)` |
| **Slug** | Auto-generado nuevo | Mantener existente (no editable) |
| **Dirty Tracking** | No necesario | ✅ Solo enviar campos modificados |
| **Confirmación** | No necesaria | ⚠️ Si plan cambia → Confirmar impacto |

---

## 📦 Custom Hook: `useEditCompanyForm.ts`

### Signature

```typescript
export interface UseEditCompanyFormProps {
  company: IEnhancedCompany
  onSuccess: (company: IEnhancedCompany) => void
  onError?: (error: Error) => void
}

export interface UseEditCompanyFormReturn {
  // React Hook Form
  register: UseFormRegister<UpdateCompanyFormData>
  handleSubmit: UseFormHandleSubmit<UpdateCompanyFormData>
  watch: UseFormWatch<UpdateCompanyFormData>
  setValue: UseFormSetValue<UpdateCompanyFormData>
  getValues: UseFormGetValues<UpdateCompanyFormData>
  trigger: UseFormTrigger<UpdateCompanyFormData>
  errors: FieldErrors<UpdateCompanyFormData>
  
  // Steps
  currentStep: FormStep
  nextStep: () => Promise<void>
  prevStep: () => void
  goToStep: (step: FormStep) => Promise<void>
  
  // Validation
  isCurrentStepValid: boolean
  validationInProgress: boolean
  validateStep: (step: FormStep) => Promise<StepValidationResult>
  
  // Plans
  availablePlans: IPlan[]
  plansLoading: boolean
  selectedPlanId: string
  setSelectedPlanId: (id: string) => void
  planChanged: boolean  // ← NUEVO: Detecta si cambió el plan
  
  // Submission
  isSubmitting: boolean
  
  // Utilities
  slugPreview: string
  isDirty: boolean  // ← NUEVO: Detecta si hay cambios
  dirtyFields: Partial<Record<keyof UpdateCompanyFormData, boolean>>
  resetForm: () => void
}

export function useEditCompanyForm({
  company,
  onSuccess,
  onError
}: UseEditCompanyFormProps): UseEditCompanyFormReturn
```

### Características Especiales (vs Create Hook)

#### 1. Inicialización Pre-poblada
```typescript
// Convertir empresa existente a formato de formulario
const formData = useMemo(() => {
  return convertCompanyToUpdateFormData(company)
}, [company._id]) // Solo recalcular si cambia la empresa

const {
  register,
  handleSubmit,
  watch,
  setValue,
  reset,
  formState: { errors, dirtyFields, isDirty }
} = useForm<UpdateCompanyFormData>({
  resolver: zodResolver(updateCompanySchema),
  defaultValues: formData,
  mode: 'onChange'
})
```

#### 2. Sincronización de Plan (FIX del modal actual)
```typescript
const [isInitialized, setIsInitialized] = useState(false)
const [selectedPlanId, setSelectedPlanId] = useState<string>('')
const lastSelectedPlanIdRef = useRef<string>('')

// Cargar planes y establecer el plan actual
const loadPlansAndSetCurrent = useCallback(async () => {
  if (isInitialized) return
  
  try {
    setPlansLoading(true)
    const response = await PlanAPI.getActivePlans()
    
    if (response.success && response.data) {
      setAvailablePlans(response.data)
      
      // Extraer planId correctamente (puede ser string u objeto populated)
      const currentPlanId = typeof company.plan === 'object' 
        ? company.plan._id 
        : company.plan
      
      const currentPlan = response.data.find(p => p._id === currentPlanId)
      
      if (currentPlan) {
        // Establecer selectedPlanId INMEDIATAMENTE
        setSelectedPlanId(currentPlanId)
        lastSelectedPlanIdRef.current = currentPlanId
        
        setValue('subscription.planId', currentPlan._id, {
          shouldValidate: true,
          shouldDirty: false // NO marcar como modificado
        })
        
        // Actualizar features
        setValue('features', currentPlan.features, { shouldValidate: true })
      }
      
      setIsInitialized(true)
    }
  } catch (error) {
    console.error('Error loading plans:', error)
    onError?.(error as Error)
  } finally {
    setPlansLoading(false)
  }
}, [company._id, isInitialized, setValue])
```

#### 3. Detección de Cambio de Plan
```typescript
const planChanged = useMemo(() => {
  if (!selectedPlanId || !company.plan) return false
  
  const originalPlanId = typeof company.plan === 'object' 
    ? company.plan._id 
    : company.plan
  
  return selectedPlanId !== originalPlanId
}, [selectedPlanId, company.plan])
```

#### 4. Submit con Dirty Fields (Optimización)
```typescript
const onSubmit = async (data: UpdateCompanyFormData) => {
  setIsSubmitting(true)
  
  try {
    // Solo enviar campos modificados
    const sanitizedData = sanitizeCompanyUpdateData(data)
    
    // Advertencia si cambió el plan
    if (planChanged) {
      const confirmed = await confirmPlanChange(
        company,
        availablePlans.find(p => p._id === selectedPlanId)!
      )
      
      if (!confirmed) {
        setIsSubmitting(false)
        return
      }
    }
    
    const result = await EnhancedCompanyAPI.updateCompany(
      company._id,
      sanitizedData
    )
    
    if (result.success) {
      toast.success(`Empresa "${result.data.name}" actualizada correctamente`)
      onSuccess(result.data)
      resetForm()
    } else {
      toast.error(result.message || 'Error al actualizar empresa')
      onError?.(new Error(result.message))
    }
  } catch (error) {
    console.error('Error updating company:', error)
    toast.error('Error al actualizar empresa')
    onError?.(error as Error)
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## 🎨 Componente: `EditCompanyFormInline.tsx`

### Structure

```tsx
export interface EditCompanyFormInlineProps {
  company: IEnhancedCompany
  onCancel: () => void
  onSuccess: (company: IEnhancedCompany) => void
}

export default function EditCompanyFormInline({
  company,
  onCancel,
  onSuccess
}: EditCompanyFormInlineProps) {
  const formState = useEditCompanyForm({
    company,
    onSuccess
  })
  
  return (
    <div className='bg-white shadow-sm rounded-lg animate-slide-in-right'>
      {/* Header */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Editar Empresa: {company.name}
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              Modificar información de la empresa registrada
            </p>
          </div>
          <button onClick={onCancel} className='...'>
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>
        
        {/* Stepper */}
        <FormStepper
          steps={FORM_STEPS}
          currentStep={formState.currentStep}
          onStepClick={formState.goToStep}
        />
      </div>
      
      {/* Form Content (idéntico a Create) */}
      <form onSubmit={formState.handleSubmit} className='p-6'>
        {/* Step 1: Basic Info */}
        {/* Step 2: Business Config */}
        {/* Step 3: Plan Selection */}
        {/* Step 4: Branding */}
        
        {/* Advertencia de cambio de plan */}
        {formState.planChanged && (
          <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
            <div className='flex items-start gap-2'>
              <ExclamationTriangleIcon className='w-5 h-5 text-yellow-600' />
              <div className='text-sm text-yellow-800'>
                <p className='font-medium'>Cambio de Plan Detectado</p>
                <p className='text-xs mt-1'>
                  Está cambiando el plan de suscripción. Esto puede afectar
                  las características y límites disponibles.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className='flex justify-between mt-8 pt-6 border-t'>
          <button type='button' onClick={onCancel}>
            Cancelar
          </button>
          <button type='submit' disabled={!formState.isDirty}>
            {formState.isSubmitting ? 'Actualizando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

## 🎬 Transiciones CSS

### Opción 1: Tailwind Animation Classes

```css
/* global.css */
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-in',
      },
    },
  },
}
```

**Uso en componente**:
```tsx
<div className='bg-white shadow-sm rounded-lg animate-slide-in-right'>
  {/* Formulario */}
</div>
```

### Opción 2: Framer Motion (Recomendado)

```bash
npm install framer-motion
```

```tsx
import { motion } from 'framer-motion'

export default function EditCompanyFormInline({ ... }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className='bg-white shadow-sm rounded-lg'
    >
      {/* Formulario */}
    </motion.div>
  )
}
```

### Opción 3: React Transition Group (Lightweight)

```bash
npm install react-transition-group
npm install --save-dev @types/react-transition-group
```

```tsx
import { CSSTransition } from 'react-transition-group'

// CompanyTable.tsx
<CSSTransition
  in={editingCompanyId !== null}
  timeout={300}
  classNames='slide'
  unmountOnExit
>
  <EditCompanyFormInline ... />
</CSSTransition>
```

```css
/* global.css */
.slide-enter {
  opacity: 0;
  transform: translateX(100%);
}
.slide-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms, transform 300ms;
}
.slide-exit {
  opacity: 1;
  transform: translateX(0);
}
.slide-exit-active {
  opacity: 0;
  transform: translateX(-100%);
  transition: opacity 300ms, transform 300ms;
}
```

---

## 🔄 Integración en CompanyTable.tsx

### State Management

```typescript
export default function CompaniesTable({ ... }) {
  // Estado existente
  const [isCreatingCompany, setIsCreatingCompany] = useState(false)
  
  // 🆕 Estado para edición inline
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null)
  const [editingCompany, setEditingCompany] = useState<IEnhancedCompany | null>(null)
  
  // Handlers
  const handleEditCompanyInline = (company: IEnhancedCompany) => {
    setEditingCompanyId(company._id)
    setEditingCompany(company)
  }
  
  const handleEditCancel = () => {
    setEditingCompanyId(null)
    setEditingCompany(null)
  }
  
  const handleEditSuccess = (company: IEnhancedCompany) => {
    setEditingCompanyId(null)
    setEditingCompany(null)
    loadCompanies()
    toast.success(`Empresa "${company.name}" actualizada correctamente`)
  }
  
  // Conditional rendering
  if (isCreatingCompany) {
    return <CreateCompanyFormInline onCancel={...} onSuccess={...} />
  }
  
  if (editingCompanyId && editingCompany) {
    return (
      <EditCompanyFormInline
        company={editingCompany}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />
    )
  }
  
  return (
    <div className='bg-white shadow-sm rounded-lg'>
      {/* Tabla normal */}
    </div>
  )
}
```

### Con Transiciones (Framer Motion)

```tsx
import { AnimatePresence, motion } from 'framer-motion'

export default function CompaniesTable({ ... }) {
  const [viewMode, setViewMode] = useState<'table' | 'create' | 'edit'>('table')
  
  return (
    <AnimatePresence mode='wait'>
      {viewMode === 'table' && (
        <motion.div
          key='table'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Tabla */}
        </motion.div>
      )}
      
      {viewMode === 'create' && (
        <motion.div
          key='create'
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <CreateCompanyFormInline ... />
        </motion.div>
      )}
      
      {viewMode === 'edit' && (
        <motion.div
          key='edit'
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          <EditCompanyFormInline ... />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## 🧪 Testing Strategy

### Unit Tests (useEditCompanyForm.ts)

```typescript
describe('useEditCompanyForm', () => {
  it('should initialize with company data', () => {
    const { result } = renderHook(() => useEditCompanyForm({
      company: mockCompany,
      onSuccess: jest.fn()
    }))
    
    expect(result.current.watch('name')).toBe(mockCompany.name)
    expect(result.current.watch('email')).toBe(mockCompany.email)
  })
  
  it('should detect plan changes', async () => {
    const { result } = renderHook(() => useEditCompanyForm({ ... }))
    
    act(() => {
      result.current.setSelectedPlanId('different-plan-id')
    })
    
    await waitFor(() => {
      expect(result.current.planChanged).toBe(true)
    })
  })
  
  it('should only submit dirty fields', async () => {
    const { result } = renderHook(() => useEditCompanyForm({ ... }))
    
    act(() => {
      result.current.setValue('name', 'New Name')
    })
    
    await act(async () => {
      await result.current.handleSubmit()
    })
    
    expect(EnhancedCompanyAPI.updateCompany).toHaveBeenCalledWith(
      mockCompany._id,
      expect.objectContaining({ name: 'New Name' })
    )
  })
})
```

### Integration Tests (EditCompanyFormInline.tsx)

```typescript
describe('EditCompanyFormInline', () => {
  it('should render with company data', () => {
    render(
      <EditCompanyFormInline
        company={mockCompany}
        onCancel={jest.fn()}
        onSuccess={jest.fn()}
      />
    )
    
    expect(screen.getByDisplayValue(mockCompany.name)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockCompany.email)).toBeInTheDocument()
  })
  
  it('should show warning when plan changes', async () => {
    render(<EditCompanyFormInline ... />)
    
    const planCard = screen.getByText('Professional Plan')
    fireEvent.click(planCard)
    
    await waitFor(() => {
      expect(screen.getByText(/Cambio de Plan Detectado/i)).toBeInTheDocument()
    })
  })
  
  it('should disable submit when no changes', () => {
    render(<EditCompanyFormInline ... />)
    
    const submitButton = screen.getByText('Guardar Cambios')
    expect(submitButton).toBeDisabled()
  })
})
```

---

## 📊 Estimación de Esfuerzo

| Tarea | Tiempo | Complejidad |
|-------|--------|-------------|
| **1. Custom Hook** | 6-8 horas | Alta |
| - Estructura base | 2 horas | Media |
| - Sincronización de planes | 3 horas | Alta |
| - Dirty fields tracking | 1 hora | Baja |
| - Submit handler | 2 horas | Media |
| **2. Componente Inline** | 4-6 horas | Media |
| - Estructura y layout | 2 horas | Baja |
| - Form steps rendering | 2 horas | Baja |
| - Advertencias y validación | 2 horas | Media |
| **3. Transiciones** | 2-3 horas | Baja |
| - Configurar Framer Motion | 1 hora | Baja |
| - Animaciones entrada/salida | 1 hora | Baja |
| - Testing en diferentes devices | 1 hora | Baja |
| **4. Integración** | 3-4 horas | Media |
| - CompanyTable updates | 2 horas | Media |
| - CompanyManagementPage updates | 1 hora | Baja |
| - Testing integración | 1 hora | Media |
| **5. Testing** | 4-5 horas | Media |
| - Unit tests hook | 2 horas | Media |
| - Integration tests | 2 horas | Media |
| - E2E tests | 1 hora | Baja |
| **6. Documentación** | 2 horas | Baja |
| **TOTAL** | **21-28 horas** | **3-4 días** |

---

## 🚀 Plan de Implementación

### Fase 1: Preparación (2 horas)
- [ ] Instalar Framer Motion
- [ ] Configurar animaciones en Tailwind
- [ ] Crear tipos TypeScript
- [ ] Setup testing environment

### Fase 2: Custom Hook (8 horas)
- [ ] Crear `useEditCompanyForm.ts`
- [ ] Implementar inicialización con datos de empresa
- [ ] Implementar sincronización de planes (fix actual)
- [ ] Implementar dirty fields tracking
- [ ] Implementar submit handler optimizado
- [ ] Unit tests del hook

### Fase 3: Componente Inline (6 horas)
- [ ] Crear `EditCompanyFormInline.tsx`
- [ ] Implementar header con título dinámico
- [ ] Implementar 4 pasos (reutilizar estructura de Create)
- [ ] Agregar advertencia de cambio de plan
- [ ] Agregar transiciones con Framer Motion
- [ ] Integration tests del componente

### Fase 4: Integración (4 horas)
- [ ] Actualizar `CompanyTable.tsx`
- [ ] Agregar estados `editingCompanyId` y `editingCompany`
- [ ] Implementar renderizado condicional con transiciones
- [ ] Actualizar handlers de edición
- [ ] Testing de integración

### Fase 5: Testing & QA (6 horas)
- [ ] Tests unitarios completos
- [ ] Tests de integración
- [ ] E2E tests
- [ ] Validación en diferentes navegadores
- [ ] Validación responsive
- [ ] Performance testing

### Fase 6: Documentación (2 horas)
- [ ] Actualizar README
- [ ] Documentar API del hook
- [ ] Ejemplos de uso
- [ ] Migration guide (modal → inline)

---

## ✅ Ventajas de la Implementación

### UX
✅ **Contexto preservado**: Usuario no pierde de vista la tabla  
✅ **Flujo natural**: Editar → Ver cambios inmediatos  
✅ **Transiciones suaves**: Experiencia moderna y pulida  
✅ **Feedback claro**: Advertencias de cambio de plan  

### DX (Developer Experience)
✅ **Reutilización**: Hook reutilizable en otros contextos  
✅ **Mantenibilidad**: Lógica separada de presentación  
✅ **Testabilidad**: Fácil de testear (hook + componente)  
✅ **TypeScript**: Type-safe en toda la implementación  

### Performance
✅ **Optimización**: Solo se envían campos modificados (dirty fields)  
✅ **Lazy loading**: Componente solo se carga cuando se necesita  
✅ **Memoización**: UseMemo/UseCallback en hook  

### Consistencia
✅ **Patrón unificado**: Mismo approach que CreateCompanyFormInline  
✅ **Código DRY**: Reutilización de componentes (FormStepper, etc)  
✅ **Estilos consistentes**: Mismo diseño visual  

---

## ⚠️ Consideraciones y Riesgos

### Riesgos Técnicos

#### 1. Sincronización de Plan (CRÍTICO)
**Problema**: El modal actual tiene bugs de sincronización de plan  
**Solución**: Implementar el fix en el hook desde el inicio  
**Testing**: Tests específicos para este escenario  

#### 2. Dirty Fields Tracking
**Problema**: Detectar correctamente qué cambió  
**Solución**: Usar `formState.dirtyFields` de React Hook Form  
**Testing**: Validar con diferentes combinaciones de campos  

#### 3. Transiciones y Performance
**Problema**: Animaciones pueden causar lag en devices lentos  
**Solución**: Usar `prefers-reduced-motion` CSS  
**Testing**: Validar en devices de gama baja  

### Riesgos de UX

#### 1. Pérdida de Cambios
**Problema**: Usuario cierra formulario sin guardar  
**Solución**: Advertencia si hay cambios sin guardar (isDirty)  
**Testing**: Validar diálogo de confirmación  

#### 2. Cambio de Plan Sin Confirmar
**Problema**: Usuario cambia plan sin entender impacto  
**Solución**: Modal de confirmación con detalles del cambio  
**Testing**: Validar flujo completo de confirmación  

---

## 🎯 Criterios de Aceptación

### Funcionales
- [ ] El formulario se renderiza inline correctamente
- [ ] Todos los campos se pre-poblan con datos de empresa
- [ ] La navegación entre pasos funciona
- [ ] La validación por paso funciona
- [ ] La sincronización de plan funciona (sin bugs)
- [ ] Solo se envían campos modificados
- [ ] El cambio de plan muestra advertencia
- [ ] El submit actualiza la empresa correctamente
- [ ] El cancel vuelve a la tabla
- [ ] El success refresca la tabla

### No Funcionales
- [ ] Transición de entrada smooth (300ms)
- [ ] Transición de salida smooth (300ms)
- [ ] No hay errores de TypeScript
- [ ] Todos los tests pasan (>90% coverage)
- [ ] Performance: <100ms render time
- [ ] Accesibilidad: ARIA labels correctos
- [ ] Responsive: Funciona en mobile/tablet/desktop

---

## 📝 Decisiones de Diseño

### ¿Por qué Framer Motion?
- ✅ Más simple que React Transition Group
- ✅ Mejor performance que CSS transitions
- ✅ API declarativa y fácil de usar
- ✅ Soporte para gestures (futuro)
- ❌ Bundle size: +50kb (pero vale la pena)

### ¿Por qué Custom Hook?
- ✅ Reutilización en otros contextos (mobile app, etc)
- ✅ Testing más fácil
- ✅ Separación de concerns
- ✅ Consistencia con CreateCompanyFormInline

### ¿Por qué Inline vs Modal?
- ✅ Mejor UX (contexto preservado)
- ✅ Más moderno
- ✅ Consistente con Create flow
- ❌ Menos espacio en pantalla (pero responsive)

---

## 📚 Referencias

- [React Hook Form - Dirty Fields](https://react-hook-form.com/api/useform/formstate#dirtyFields)
- [Framer Motion - AnimatePresence](https://www.framer.com/motion/animate-presence/)
- [Zod - Schema Validation](https://zod.dev/)
- [Tailwind CSS - Animations](https://tailwindcss.com/docs/animation)

---

## 🎬 Conclusión

La implementación de `EditCompanyFormInline` con transiciones es:

✅ **Viable**: Patrón probado con CreateCompanyFormInline  
✅ **Beneficioso**: Mejora UX, DX y mantenibilidad  
✅ **Consistente**: Mismo approach en todo el sistema  
✅ **Estimado**: 3-4 días de trabajo (21-28 horas)  

**Recomendación**: ✅ **PROCEDER CON IMPLEMENTACIÓN**

---

**Siguiente Paso**: Crear `useEditCompanyForm.ts` hook
