# 📊 Chart Components - Sistema Completo

Componentes de gráficas reutilizables enterprise-grade con TypeScript estricto (sin `any`) y estados de carga, error y vacío.

## 📁 Estructura

```
components/UI/Charts/
├── types.ts              # ✅ Sistema de tipos completo
├── chartColors.ts        # ✅ Paleta de colores y gradientes
├── CustomTooltip.tsx     # ✅ 3 variantes de tooltips
├── AreaChartCard.tsx     # ✅ Gráfica de área con gradientes
├── BarChartCard.tsx      # ✅ Gráfica de barras H/V
├── PieChartCard.tsx      # ✅ Gráfica circular/dona
├── LineChartCard.tsx     # ✅ Gráfica de líneas
├── index.ts              # ✅ Exports centralizados
├── README.md             # 📖 Esta documentación
└── EXAMPLES.tsx          # 📚 10 ejemplos de uso
```

## 🎨 Componentes Disponibles

### 1. **PieChartCard** - Gráfica Circular/Dona
- ✅ Modo Pie (innerRadius=0) o Donut (innerRadius>0)
- ✅ Barras de progreso con porcentajes
- ✅ Total calculado automáticamente
- ✅ Leyenda configurable (top/bottom/left/right)
- ✅ Estados: loading, error, empty

**Uso típico**: Distribución de categorías, porcentajes

```tsx
<PieChartCard
  title="Distribución de Presupuesto"
  data={[
    { name: 'Ventas', value: 45000, color: '#9333ea' },
    { name: 'Marketing', value: 23000, color: '#2563eb' }
  ]}
  innerRadius={60}
  showStats={true}
  showLegend={true}
/>
```

### 2. **BarChartCard** - Gráfica de Barras
- ✅ Layout horizontal o vertical
- ✅ Colores personalizados por barra o color único
- ✅ Bordes redondeados configurables
- ✅ Ejes configurables (fontSize, stroke, tickFormatter)
- ✅ Estados: loading, error, empty

**Uso típico**: Comparaciones, rankings, evolución mensual

```tsx
<BarChartCard
  title="Ventas Mensuales"
  data={[
    { name: 'Enero', value: 24500, fullName: 'Ventas Enero 2024' },
    { name: 'Febrero', value: 32800 }
  ]}
  dataKey="value"
  nameKey="name"
  layout="vertical"
  barColor="blue"
  barRadius={8}
/>
```

### 3. **AreaChartCard** - Gráfica de Área
- ✅ Gradientes automáticos por color
- ✅ Multi-serie (múltiples áreas)
- ✅ Soporte para líneas superpuestas (type: 'line')
- ✅ Grilla y leyenda configurables
- ✅ Estados: loading, error, empty

**Uso típico**: Tendencias temporales, análisis financiero

```tsx
<AreaChartCard
  title="Análisis Financiero"
  data={[
    { name: 'Ene', ingresos: 4000, gastos: 2400 },
    { name: 'Feb', ingresos: 3000, gastos: 1398 }
  ]}
  xAxisKey="name"
  dataKeys={[
    { key: 'ingresos', name: 'Ingresos', color: 'green' },
    { key: 'gastos', name: 'Gastos', color: 'red', type: 'line' }
  ]}
  gradientFill={true}
/>
```

### 4. **LineChartCard** - Gráfica de Líneas
- ✅ Multi-línea para comparaciones
- ✅ Puntos configurables (showDots)
- ✅ Tipos de curva: monotone, linear, step, basis
- ✅ Grosor de línea por serie (strokeWidth)
- ✅ Estados: loading, error, empty

**Uso típico**: Tendencias, comparación plan vs real

```tsx
<LineChartCard
  title="Rendimiento vs Plan"
  data={[
    { name: 'Lun', plan: 80, actual: 75 },
    { name: 'Mar', plan: 85, actual: 88 }
  ]}
  xAxisKey="name"
  dataKeys={[
    { key: 'plan', name: 'Meta', color: 'gray' },
    { key: 'actual', name: 'Real', color: 'purple', strokeWidth: 3 }
  ]}
  showDots={true}
  curveType="monotone"
/>
```

## 🎨 Paleta de Colores (12 colores)

| Color | Hex | Uso recomendado |
|-------|-----|-----------------|
| `purple` | `#9333ea` | Primario, destacados |
| `blue` | `#2563eb` | Secundario, información |
| `green` | `#16a34a` | Éxito, ingresos, positivo |
| `yellow` | `#eab308` | Advertencias, pendientes |
| `red` | `#dc2626` | Errores, gastos, negativo |
| `orange` | `#ea580c` | Alertas, llamados a la acción |
| `gray` | `#6b7280` | Neutral, referencias |
| `teal` | `#14b8a6` | Información alternativa |
| `pink` | `#ec4899` | Especial, categorías |
| `indigo` | `#6366f1` | Profundo, analytics |
| `lightBlue` | `#3b82f6` | Claro, amigable |
| `lightGreen` | `#22c55e` | Crecimiento, progreso |

## 📊 Estados de los Componentes

Todos los componentes manejan 4 estados:

### 1. **Loading** (Cargando)
```tsx
<PieChartCard
  title="Datos"
  data={[]}
  loading={true}
/>
```

### 2. **Error** (Con error)
```tsx
<BarChartCard
  title="Datos"
  data={[]}
  error="No se pudo conectar con el servidor"
  showRefresh={true}
  onRefresh={() => fetchData()}
/>
```

### 3. **Empty** (Sin datos)
```tsx
<LineChartCard
  title="Datos"
  data={[]}
  emptyMessage="Aún no hay registros"
/>
```

### 4. **Normal** (Con datos)
```tsx
<AreaChartCard
  title="Datos"
  data={myData}
/>
```

## 🔧 Configuración Avanzada

### Ejes personalizados
```tsx
<AreaChartCard
  xAxisConfig={{
    fontSize: 11,
    stroke: '#6b7280',
    angle: -45,
    textAnchor: 'end',
    tickFormatter: (value) => `${value}%`
  }}
  yAxisConfig={{
    tickFormatter: (value) => `$${value.toLocaleString('es-CL')}`
  }}
/>
```

### Tooltips personalizados
```tsx
<LineChartCard
  tooltipConfig={{
    show: true,
    custom: true,
    cursor: true,
    formatter: (value) => `${value} unidades`
  }}
/>
```

## 📦 Exports

```typescript
// Componentes
import { PieChartCard, BarChartCard, AreaChartCard, LineChartCard } from '@/components/UI/Charts';

// Tooltips
import { CustomTooltip, SimplePieTooltip, BarTooltip } from '@/components/UI/Charts';

// Colores
import { CHART_COLORS, getChartColor } from '@/components/UI/Charts';

// Tipos
import type { 
  PieData, 
  BarData, 
  TrendData,
  ChartColor,
  AreaChartCardProps 
} from '@/components/UI/Charts';
```

## 📚 Ejemplos Completos

Ver `EXAMPLES.tsx` para 10 ejemplos detallados:
1. ✅ Pie Chart básico
2. ✅ Bar Chart vertical
3. ✅ Bar Chart horizontal con colores
4. ✅ Area Chart multi-serie
5. ✅ Line Chart comparativo
6. ✅ Con estado de carga
7. ✅ Con manejo de errores
8. ✅ Con estado vacío
9. ✅ Integración con backend
10. ✅ Dashboard completo (grid)

## ✅ Validación TypeScript

- ✅ Zero `any` - Tipado estricto en todo el sistema
- ✅ Props completamente tipadas
- ✅ Exports centralizados en index.ts
- ✅ Compatibilidad con Recharts
- ✅ Sin errores de compilación

## 🚀 Próximos Pasos

1. Integrar en `CompanyOverviewDashboard`
2. Conectar con endpoint `/api/companies/:id/stats`
3. Agregar tests unitarios (opcional)
4. Crear Storybook stories (opcional)

---

**Autor**: Esteban Soto Ojeda (@elsoprimeDev)  
**Versión**: 2.0.0 - Sistema Completo  
**Estado**: ✅ Listo para producción  
**Actualización**: Noviembre 2025
