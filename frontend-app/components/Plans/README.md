# Plan Features Display Components

## 📋 Descripción

Componentes para visualización **read-only** de características de planes de suscripción.
Las características están predefinidas por el sistema según el plan contratado y **no pueden ser modificadas manualmente**.

---

## 🔧 Componentes

### 1. `FeatureBadge.tsx`

Componente individual que muestra una característica con ícono check/x.

**Props:**
```typescript
interface FeatureBadgeProps {
  label: string;        // Etiqueta de la característica
  enabled: boolean;     // Si está habilitada o no
  size?: 'sm' | 'md' | 'lg';  // Tamaño del badge
}
```

**Uso:**
```tsx
<FeatureBadge 
  label="Gestión de Inventario" 
  enabled={true} 
  size="md"
/>
```

**Estilos:**
- **Habilitada**: Fondo verde con ícono ✅ (CheckIcon)
- **Deshabilitada**: Fondo gris con ícono ❌ (XMarkIcon)

---

### 2. `PlanFeaturesDisplay.tsx`

Componente principal que muestra el grid completo de características.

**Props:**
```typescript
interface PlanFeaturesDisplayProps {
  features: Partial<PlanFeatures>;  // Objeto de características
  size?: 'sm' | 'md' | 'lg';       // Tamaño de los badges
  columns?: 1 | 2 | 3;             // Número de columnas en el grid
}
```

**Uso:**
```tsx
<PlanFeaturesDisplay 
  features={watch('features')}
  size="md"
  columns={3}
/>
```

**Características incluidas:**
1. `inventoryManagement` - Gestión de Inventario
2. `accounting` - Contabilidad
3. `hrm` - Recursos Humanos
4. `crm` - CRM
5. `projectManagement` - Gestión de Proyectos
6. `reports` - Reportes
7. `multiCurrency` - Multimoneda
8. `apiAccess` - Acceso API
9. `customBranding` - Branding Personalizado
10. `prioritySupport` - Soporte Prioritario
11. `advancedAnalytics` - Analítica Avanzada
12. `auditLog` - Registro de Auditoría
13. `customIntegrations` - Integraciones Personalizadas
14. `dedicatedAccount` - Cuenta Dedicada

---

## 📊 Estructura de Datos

Las características **DEBEN** coincidir exactamente con el schema del backend:

**Backend**: `backend/src/models/Plan.ts`
```typescript
const planFeaturesSchema = new Schema<IPlanFeatures>({
  inventoryManagement: { type: Boolean, default: false },
  accounting: { type: Boolean, default: false },
  hrm: { type: Boolean, default: false },
  crm: { type: Boolean, default: false },
  projectManagement: { type: Boolean, default: false },
  reports: { type: Boolean, default: false },
  multiCurrency: { type: Boolean, default: false },
  apiAccess: { type: Boolean, default: false },
  customBranding: { type: Boolean, default: false },
  prioritySupport: { type: Boolean, default: false },
  advancedAnalytics: { type: Boolean, default: false },
  auditLog: { type: Boolean, default: false },
  customIntegrations: { type: Boolean, default: false },
  dedicatedAccount: { type: Boolean, default: false },
});
```

**Frontend Schema**: `frontend-app/schemas/EnhancedCompanySchemas.ts`
```typescript
features: z.object({
  inventoryManagement: z.boolean().default(false),
  accounting: z.boolean().default(false),
  hrm: z.boolean().default(false),
  crm: z.boolean().default(false),
  projectManagement: z.boolean().default(false),
  reports: z.boolean().default(false),
  multiCurrency: z.boolean().default(false),
  apiAccess: z.boolean().default(false),
  customBranding: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),
  advancedAnalytics: z.boolean().default(false),
  auditLog: z.boolean().default(false),
  customIntegrations: z.boolean().default(false),
  dedicatedAccount: z.boolean().default(false),
})
```

---

## 🎯 Integración en Formularios

### CreateCompanyForm.tsx

```tsx
import { PlanFeaturesDisplay } from '@/components/Plans/PlanFeaturesDisplay'
import { defaultCompanyFormValues } from '@/schemas/EnhancedCompanySchemas'

// useForm con defaultValues predefinidos
const { ... } = useForm<CreateCompanyFormData>({
  resolver: zodResolver(createCompanySchema),
  defaultValues: defaultCompanyFormValues  // ✅ Usa el helper del schema
})

// En el Step 3 del formulario
<PlanFeaturesDisplay 
  features={watch('features')}
  size="md"
  columns={3}
/>
```

### EditCompanyForm.tsx

```tsx
import { PlanFeaturesDisplay } from '@/components/Plans/PlanFeaturesDisplay'

// En el Step 3 del formulario (reemplaza los checkboxes)
<PlanFeaturesDisplay 
  features={watch('features')}
  size="md"
  columns={3}
/>
```

---

## 🔄 Flujo de Auto-Actualización

Cuando el usuario selecciona un plan, las características se actualizan automáticamente:

```tsx
useEffect(() => {
  if (selectedPlanId && availablePlans.length > 0) {
    const selectedPlan = availablePlans.find(p => p._id === selectedPlanId);
    
    if (selectedPlan) {
      // ✅ Copiar TODAS las features directamente del plan
      setValue('features', selectedPlan.features, { shouldValidate: true });
    }
  }
}, [selectedPlanId, availablePlans, setValue]);
```

**Flujo:**
1. Usuario selecciona plan → `selectedPlanId` cambia
2. useEffect detecta el cambio
3. Busca plan en `availablePlans`
4. Actualiza `features` con `setValue()`
5. `PlanFeaturesDisplay` se re-renderiza automáticamente mostrando las nuevas features

---

## ✅ Ventajas del Enfoque Read-Only

1. **Consistencia**: Features siempre coinciden con el plan contratado
2. **Inmutabilidad**: Usuario no puede habilitar features no incluidas en su plan
3. **Transparencia**: Visual clara de qué incluye cada plan
4. **Mantenibilidad**: Un solo punto de verdad en `seedPlans.ts`
5. **UX Mejorada**: No hay confusión sobre qué features están disponibles

---

## 🚫 Qué NO Hacer

❌ **NO** usar checkboxes editables para features
❌ **NO** permitir modificación manual de features
❌ **NO** agregar features que no existan en el schema del backend
❌ **NO** usar nombres diferentes entre frontend y backend

---

## 📝 Notas Importantes

- Las features se definen en `backend/src/scripts/initialization/seedPlans.ts`
- Cada plan tiene su conjunto específico de features predefinidas
- El componente es **solo lectura** - no dispara eventos de cambio
- Los datos se sincronizan automáticamente cuando cambia el plan
- El contador muestra "X de 14 activas" dinámicamente

---

## 🎨 Ejemplo Visual

```
Características del Plan                    10 de 14 activas
┌─────────────────────────────────────────────────────────┐
│ ✅ Gestión de Inventario  ✅ Contabilidad  ✅ RRHH      │
│ ✅ CRM                    ✅ Reportes       ✅ API       │
│ ✅ Multimoneda            ✅ Branding       ✅ Soporte   │
│ ✅ Analítica Avanzada     ❌ Auditoría     ❌ Integrac.  │
│ ❌ Cuenta Dedicada        ❌ Proyectos                   │
└─────────────────────────────────────────────────────────┘
ℹ️ Las características están definidas por el plan seleccionado
   y no pueden modificarse manualmente.
```

---

## 🔗 Archivos Relacionados

- `frontend-app/components/Plans/FeatureBadge.tsx`
- `frontend-app/components/Plans/PlanFeaturesDisplay.tsx`
- `frontend-app/schemas/EnhancedCompanySchemas.ts`
- `backend/src/models/Plan.ts`
- `backend/src/scripts/initialization/seedPlans.ts`
- `backend/src/interfaces/IPlan.ts`

---

**Autor**: Esteban Soto Ojeda (@elsoprimeDev)  
**Versión**: 1.0.0  
**Fecha**: Noviembre 2025
