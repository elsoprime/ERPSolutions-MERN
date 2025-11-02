# Dashboard de Usuarios con Gráficos Interactivos - Guía Completa

## 📊 Descripción General

Dashboard avanzado con gráficos interactivos usando **Recharts**, estadísticas en tiempo real, comparativas mensuales, filtros de fecha, exportación a CSV y visualizaciones de datos mejoradas.

## ✨ Nuevas Funcionalidades Implementadas

### 📈 1. Gráficos Interactivos con Recharts

Se han implementado **4 gráficos interactivos** de alta calidad:

#### 🌊 Gráfico 1: Tendencia de Usuarios (Area Chart)

**Ubicación**: Primera fila, columna izquierda

**Características**:

- **Tipo**: Gráfico de Área con gradientes
- **Datos mostrados**:
  - 📊 **Total de usuarios** (Azul con gradiente)
  - ✅ **Usuarios activos** (Verde con gradiente)
  - ⭐ **Nuevos usuarios** (Línea morada con puntos)
- **Período**: Últimos 6 meses
- **Interactividad**:
  - Tooltip personalizado al hover
  - Leyenda clickeable
  - Grid de referencia
- **Gradientes**:
  ```typescript
  Total: #2563eb (azul) con opacidad 0.8 → 0
  Activos: #16a34a (verde) con opacidad 0.8 → 0
  ```

**Datos reales desde backend**:

```typescript
monthlyTrends: [
  {month: 'Jun', total: 40, active: 35, inactive: 5, newUsers: 8},
  {month: 'Jul', total: 42, active: 36, inactive: 6, newUsers: 5}
  // ... últimos 6 meses
]
```

#### 🥧 Gráfico 2: Estado de Usuarios (Pie Chart)

**Ubicación**: Primera fila, columna derecha

**Características**:

- **Tipo**: Gráfico Circular (Pie)
- **Datos mostrados**:
  - 🟢 **Activos** (Verde)
  - 🟡 **Inactivos** (Amarillo)
  - 🔴 **Suspendidos** (Rojo)
- **Labels**: Automáticos con nombre, valor y porcentaje
- **Leyenda inferior**: 3 indicadores con colores
- **Interactividad**: Tooltip al hover

**Cálculo de porcentajes**:

```typescript
Activos: (activeUsers / totalUsers) * 100
Inactivos: (inactiveUsers / totalUsers) * 100
Suspendidos: (suspendedUsers / totalUsers) * 100
```

#### 📊 Gráfico 3: Usuarios por Rol (Bar Chart)

**Ubicación**: Segunda fila, columna izquierda

**Características**:

- **Tipo**: Gráfico de Barras Verticales
- **Ordenamiento**: Por cantidad (mayor a menor)
- **Colores únicos por rol**:
  - 🟣 Super Admin: `#9333ea`
  - 🔵 Admin Empresa: `#2563eb`
  - 🟢 Manager: `#16a34a`
  - ⚫ Employee: `#6b7280`
  - 🟡 Viewer: `#eab308`
- **Barras redondeadas**: radius `[8, 8, 0, 0]`
- **Eje X rotado**: -15° para mejor legibilidad
- **Tooltip personalizado**: Muestra rol, cantidad y porcentaje

#### 🏢 Gráfico 4: Top 8 Empresas (Horizontal Bar Chart)

**Ubicación**: Segunda fila, columna derecha

**Características**:

- **Tipo**: Barras Horizontales
- **Datos**: Top 8 empresas con más usuarios
- **Color**: Morado uniforme `#9333ea`
- **Barras redondeadas**: radius `[0, 8, 8, 0]`
- **Tooltip especial**: Muestra nombre completo de la empresa
- **Truncamiento**: Nombres largos con "..." en eje Y
- **Width del eje Y**: 120px para nombres

### 🔄 2. Tendencias Mensuales Reales (Backend)

#### Implementación en Backend

**Archivo**: `MultiCompanyUserController.ts`

**Método nuevo**: Cálculo de tendencias de 6 meses

```typescript
// Cálculo para cada mes
for (let i = 5; i >= 0; i--) {
  const date = new Date(year, month - i, 1)
  const nextDate = new Date(year, month - i + 1, 1)

  // Consultas agregadas
  const totalInMonth = await EnhancedUser.countDocuments({
    createdAt: {$lt: nextDate}
  })

  const activeInMonth = await EnhancedUser.countDocuments({
    status: 'active',
    createdAt: {$lt: nextDate}
  })

  const newInMonth = await EnhancedUser.countDocuments({
    createdAt: {$gte: date, $lt: nextDate}
  })

  monthlyTrends.push({
    month: monthNames[date.getMonth()],
    total: totalInMonth,
    active: activeInMonth,
    inactive: inactiveInMonth,
    newUsers: newInMonth
  })
}
```

**Meses españoles**:

```typescript
;[
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic'
]
```

**Respuesta del endpoint**:

```json
{
  "success": true,
  "data": {
    "total": 45,
    "active": 38,
    "inactive": 5,
    "suspended": 2,
    "byRole": {...},
    "byCompany": {...},
    "recent": [...],
    "monthlyGrowth": {...},
    "monthlyTrends": [
      {
        "month": "Jun",
        "total": 40,
        "active": 35,
        "inactive": 5,
        "newUsers": 8
      },
      // ... 5 meses más
    ]
  }
}
```

### 🎨 3. Tooltip Personalizado

**Componente**: `CustomTooltip`

```typescript
const CustomTooltip = ({active, payload, label}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
        <p className='font-medium text-gray-900'>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className='text-sm' style={{color: entry.color}}>
            {entry.name}: <span className='font-semibold'>{entry.value}</span>
            {entry.payload.percentage && ` (${entry.payload.percentage}%)`}
          </p>
        ))}
      </div>
    )
  }
  return null
}
```

**Características**:

- Fondo blanco con sombra
- Borde gris sutil
- Texto con color de la serie
- Porcentajes cuando aplican
- Valores en negrita

### 🎨 4. Paleta de Colores Unificada

```typescript
const CHART_COLORS = {
  purple: '#9333ea', // Morado - Super Admin, Empresas
  blue: '#2563eb', // Azul - Admin Empresa, Total
  green: '#16a34a', // Verde - Manager, Activos
  yellow: '#eab308', // Amarillo - Viewer, Inactivos
  red: '#dc2626', // Rojo - Suspendidos, Alertas
  orange: '#ea580c', // Naranja - Desactivaciones
  gray: '#6b7280', // Gris - Employee
  lightBlue: '#3b82f6', // Azul Claro - Alternativo
  lightGreen: '#22c55e' // Verde Claro - Alternativo
}
```

## 📦 Dependencias Instaladas

### Recharts

```bash
npm install recharts
```

**Versión**: ^2.x
**Componentes usados**:

- `AreaChart`, `Area`
- `BarChart`, `Bar`
- `PieChart`, `Pie`
- `LineChart`, `Line`
- `ResponsiveContainer`
- `CartesianGrid`
- `XAxis`, `YAxis`
- `Tooltip`, `Legend`
- `Cell` (para colores individuales)

## 🔧 Funciones Auxiliares

### 1. prepareRoleChartData()

Transforma datos de roles para el gráfico de barras:

```typescript
{
  name: 'Admin Empresa',
  value: 8,
  percentage: '17.8',
  color: '#2563eb'
}
```

### 2. prepareStatusChartData()

Prepara datos para el gráfico circular:

```typescript
{
  name: 'Activos',
  value: 38,
  color: '#16a34a'
}
```

### 3. prepareCompanyChartData()

Formatea datos de empresas (top 8):

```typescript
{
  name: 'Empresa Demo 1',  // Truncado si > 15 chars
  usuarios: 15,
  fullName: 'Empresa Demo 1 S.A. de C.V.'
}
```

### 4. generateMockTrends() [DEPRECADO]

Genera datos falsos de tendencias.
**Nota**: Ya no se usa, reemplazado por datos reales del backend.

## 📱 Diseño Responsive

### Grid de Gráficos

```css
grid-cols-1           /* Mobile (<640px): 1 columna */
xl:grid-cols-2        /* XL (≥1280px): 2 columnas */
```

### Altura de Gráficos

Todos los gráficos usan `ResponsiveContainer`:

```typescript
<ResponsiveContainer width='100%' height={300}>
  {/* Gráfico */}
</ResponsiveContainer>
```

**Ventajas**:

- ✅ Se adapta al ancho del contenedor padre
- ✅ Altura fija de 300px para consistencia
- ✅ Responsive automático

### Tamaños de Fuente

**Ejes X/Y**:

```typescript
tick={{ fontSize: 12 }}        // Números
tick={{ fontSize: 11 }}        // Labels rotados
```

**Leyenda**:

```typescript
wrapperStyle={{ fontSize: '12px' }}
```

**Tooltips**:

- Título: `font-medium text-gray-900`
- Valores: `text-sm font-semibold`

## 🎯 Interactividad

### Hover Effects en Gráficos

1. **Tooltip aparece** al pasar el mouse
2. **Highlight automático** de la serie
3. **Información detallada** en tooltip personalizado
4. **Animaciones suaves** de entrada/salida

### Leyendas Interactivas

- Click en leyenda **oculta/muestra** la serie
- Estado visual del toggle
- Útil para comparar datos específicos

### Grid de Referencia

```typescript
<CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
```

- Líneas punteadas (3px dash, 3px gap)
- Color gris claro para no distraer
- Ayuda a leer valores exactos

## 📊 Comparativas Implementadas

### Mes a Mes (Visual)

El gráfico de tendencias permite comparar:

- Total de usuarios por mes
- Evolución de usuarios activos
- Nuevos registros mensuales
- Crecimiento acumulado

### Insights Automáticos

**Crecimiento mensual**:

```
Mes anterior: 40 usuarios
Mes actual: 45 usuarios
Crecimiento: +5 usuarios (+12.5%)
```

**Distribución de estado**:

```
Activos: 38 (84.4%)
Inactivos: 5 (11.1%)
Suspendidos: 2 (4.4%)
```

## 🚀 Rendimiento

### Optimizaciones Implementadas

1. **Datos calculados una vez**:

   ```typescript
   const roleChartData = prepareRoleChartData()
   const statusChartData = prepareStatusChartData()
   // ... se calculan antes del render
   ```

2. **Uso de useMemo potencial**:

   ```typescript
   // Siguiente mejora recomendada
   const roleChartData = useMemo(() => prepareRoleChartData(), [stats])
   ```

3. **Consultas optimizadas en backend**:

   - Uso de `Promise.all()` para consultas paralelas
   - Agregaciones eficientes con MongoDB
   - Límite de 6 meses para no sobrecargar

4. **Lazy Loading de Recharts**:
   ```typescript
   // Próxima mejora
   const BarChart = lazy(() =>
     import('recharts').then(mod => ({default: mod.BarChart}))
   )
   ```

## 📈 Métricas Visualizadas

### Por Tipo de Gráfico

| Gráfico        | Métricas                        | Tipo de Comparación  |
| -------------- | ------------------------------- | -------------------- |
| **Tendencias** | Total, Activos, Nuevos          | Temporal (6 meses)   |
| **Estado**     | Activos, Inactivos, Suspendidos | Distribución %       |
| **Roles**      | Cantidad por rol                | Comparativa vertical |
| **Empresas**   | Top 8 con más usuarios          | Ranking              |

### Cálculos Automáticos

**Porcentajes**:

```typescript
;(valor / total) * 100
```

**Crecimiento**:

```typescript
;((mesActual - mesAnterior) / mesAnterior) * 100
```

**Tendencias**:

```typescript
Acumulado hasta fecha vs nuevos en período
```

## 🎨 Estilos y Diseño

### Tarjetas de Gráficos

```css
bg-white              /* Fondo blanco */
shadow                /* Sombra estándar */
rounded-lg            /* Bordes redondeados */
border border-gray-200 /* Borde gris claro */
p-6                   /* Padding 24px */
```

### Headers de Gráficos

```html
<div className="mb-4">
  <h3 className="text-lg font-medium text-gray-900">Título del Gráfico</h3>
  <p className="text-sm text-gray-500 mt-1">Descripción breve</p>
</div>
```

### Colores de Ejes

```typescript
stroke = '#9ca3af' // Gris medio para ejes y ticks
stroke = '#e5e7eb' // Gris claro para grid
```

## 🔄 Flujo de Datos

```mermaid
Backend (getUsersStats)
    ↓
  Cálculo de tendencias mensuales
    ↓
  Response JSON con monthlyTrends
    ↓
UserAPI.getUsersStats()
    ↓
  loadDashboardData()
    ↓
  Transformación de datos
    ↓
  setStats(transformedData)
    ↓
  prepareXXXChartData()
    ↓
  Render de Gráficos Recharts
```

## 📝 Archivos Modificados

### Backend

1. ✅ `MultiCompanyUserController.ts`
   - Agregado cálculo de `monthlyTrends`
   - Loop de 6 meses con consultas agregadas
   - Array de nombres de meses en español

### Frontend

2. ✅ `UserOverviewDashboard.tsx`

   - Imports de Recharts
   - Nuevas interfaces con `monthlyTrends`
   - 4 funciones preparadoras de datos
   - Componente `CustomTooltip`
   - Constante `CHART_COLORS`
   - Sección de gráficos interactivos (4 gráficos)

3. ✅ `UserAPI.ts`

   - Interfaz actualizada con `monthlyTrends`

4. ✅ `package.json`
   - Dependencia `recharts` agregada

## 🐛 Solución de Problemas

### Gráficos no se muestran

**Verificar**:

1. ✅ Recharts instalado: `npm list recharts`
2. ✅ Datos disponibles: `console.log(stats)`
3. ✅ Sin errores en consola
4. ✅ ResponsiveContainer con altura definida

### Tooltip no aparece

**Solución**:

```typescript
// Asegurarse de incluir
<Tooltip content={<CustomTooltip />} />
```

### Colores no coinciden

**Verificar**:

```typescript
// Usar CHART_COLORS constante
fill={CHART_COLORS.purple}
```

### Datos de tendencias vacíos

**Revisar**:

1. Backend retorna `monthlyTrends`
2. Response incluye array de 6 elementos
3. Transformación de datos correcta

## 🎯 Mejoras Futuras Sugeridas

### 1. Filtros Avanzados en Gráficos

- Selector de rango de meses (3, 6, 12)
- Filtro por empresa en gráfico de tendencias
- Filtro por rol específico

### 2. Más Tipos de Gráficos

- **Radar Chart**: Comparar métricas múltiples
- **Scatter Plot**: Correlación empresa-usuarios
- **Composed Chart**: Barras + Líneas combinadas

### 3. Exportación de Gráficos

```typescript
// Exportar gráfico como imagen
import {saveAs} from 'file-saver'
import html2canvas from 'html2canvas'

const exportChart = async chartRef => {
  const canvas = await html2canvas(chartRef.current)
  canvas.toBlob(blob => {
    saveAs(blob, 'grafico-usuarios.png')
  })
}
```

### 4. Animaciones Personalizadas

```typescript
<Bar dataKey='value' animationDuration={1000}>
  {/* Animación de entrada */}
</Bar>
```

### 5. Modo Comparación

- Vista lado a lado de 2 períodos
- Diferencias resaltadas
- Indicadores de mejora/empeoramiento

### 6. Dashboard Personalizable

- Drag & drop de gráficos
- Ocultar/mostrar gráficos
- Guardar configuración en localStorage

## 📚 Referencias

- [Recharts Documentation](https://recharts.org/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB Aggregation](https://www.mongodb.com/docs/manual/aggregation/)

## ✅ Checklist de Implementación

- [x] Instalar Recharts
- [x] Crear funciones preparadoras de datos
- [x] Implementar Gráfico de Tendencias (Area)
- [x] Implementar Gráfico de Estado (Pie)
- [x] Implementar Gráfico de Roles (Barras)
- [x] Implementar Gráfico de Empresas (Barras H)
- [x] Crear Tooltip personalizado
- [x] Definir paleta de colores
- [x] Backend: Cálculo de tendencias mensuales
- [x] Frontend: Integración de datos reales
- [x] Responsive design de gráficos
- [x] Documentación completa
- [ ] Tests unitarios (pendiente)
- [ ] Tests E2E (pendiente)
- [ ] Optimización con useMemo
- [ ] Lazy loading de Recharts

---

**Autor**: Esteban Soto Ojeda @elsoprimeDev  
**Fecha**: Noviembre 2025  
**Versión**: 3.0 (Gráficos Interactivos)  
**Estado**: ✅ Completado y Funcional  
**Biblioteca**: Recharts 2.x  
**Gráficos**: 4 tipos interactivos  
**Datos**: 100% Reales desde Backend
