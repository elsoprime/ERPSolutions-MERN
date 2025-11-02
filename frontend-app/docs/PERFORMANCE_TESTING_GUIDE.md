# 🧪 Guía de Pruebas de Rendimiento - Dashboard de Usuarios

## 📋 Índice

1. [Preparación del Entorno](#preparación-del-entorno)
2. [Pruebas de Bundle Size](#pruebas-de-bundle-size)
3. [Pruebas de Rendimiento en Tiempo de Ejecución](#pruebas-de-rendimiento-en-tiempo-de-ejecución)
4. [Pruebas de Lazy Loading](#pruebas-de-lazy-loading)
5. [Pruebas de Memoización](#pruebas-de-memoización)
6. [Métricas Web Vitals](#métricas-web-vitals)
7. [Comparativas Antes/Después](#comparativas-antesdespués)

---

## 🔧 Preparación del Entorno

### **Instalación de Herramientas**

```bash
# Instalar dependencias de análisis
cd frontend-app
npm install --save-dev @next/bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
```

### **Configuración de Next.js Bundle Analyzer**

Editar `next.config.mjs`:

```javascript
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const nextConfig = {
  // ... tu configuración existente
}

export default withBundleAnalyzer(nextConfig)
```

---

## 📦 Pruebas de Bundle Size

### **Test 1: Análisis del Bundle Principal**

```bash
# Generar análisis de bundle
ANALYZE=true npm run build

# Esto abrirá dos ventanas en el navegador:
# 1. Bundle del cliente
# 2. Bundle del servidor
```

**Qué buscar:**

- ✅ `recharts` debe estar en un chunk separado (lazy loading exitoso)
- ✅ El chunk principal no debe contener componentes de Recharts
- ✅ Múltiples chunks pequeños en lugar de uno grande

**Ejemplo de salida esperada:**

```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         120 kB
├ ○ /dashboard                           8.4 kB         150 kB
├ ○ /users                              12.1 kB         165 kB
└ ○ /users/dashboard (lazy: recharts)   15.8 kB         185 kB + 200 kB (lazy)
                                                        ^^^^^^^^^^^^^^^^
                                                        Chunk separado!
```

### **Test 2: Comparar Tamaño de Chunks**

```bash
# Construir versión optimizada
npm run build > build-optimized.txt

# Ver estadísticas
cat build-optimized.txt | grep "recharts"
```

**Resultado esperado:**

```
_app-client_src_components_recharts_lazy_chunk.js    198 kB
```

---

## ⚡ Pruebas de Rendimiento en Tiempo de Ejecución

### **Test 3: React DevTools Profiler**

#### **Paso 1: Configurar React DevTools**

1. Instalar extensión [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
2. Abrir DevTools (F12)
3. Ir a pestaña "Profiler"

#### **Paso 2: Grabar Perfil de Componente**

```typescript
// Agregar temporalmente en UserOverviewDashboard.tsx para debugging
import {Profiler} from 'react'

export const UserOverviewDashboard = () => {
  const onRenderCallback = (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`)
  }

  return (
    <Profiler id='UserDashboard' onRender={onRenderCallback}>
      {/* ... componente existente */}
    </Profiler>
  )
}
```

#### **Paso 3: Ejecutar Pruebas**

1. Refrescar la página del dashboard
2. Iniciar grabación en Profiler
3. Cambiar filtros (Hoy → Semana → Mes)
4. Detener grabación
5. Analizar flamegraph

**Resultado esperado:**

```
UserDashboard (mount) took 45ms
UserDashboard (update) took 8ms   ← useMemo previene recálculo
UserDashboard (update) took 7ms   ← useMemo previene recálculo
```

### **Test 4: Performance API**

Agregar mediciones personalizadas:

```typescript
// En UserOverviewDashboard.tsx
useEffect(() => {
  if (!stats) return

  // Medir tiempo de preparación de datos
  performance.mark('data-prep-start')

  // Simular acceso a datos memoizados
  const _ = roleChartData
  const __ = statusChartData
  const ___ = companyChartData
  const ____ = trendsData

  performance.mark('data-prep-end')
  performance.measure('data-preparation', 'data-prep-start', 'data-prep-end')

  const measure = performance.getEntriesByName('data-preparation')[0]
  console.log(`Data preparation took: ${measure.duration.toFixed(2)}ms`)

  // Limpiar marcas
  performance.clearMarks()
  performance.clearMeasures()
}, [stats, roleChartData, statusChartData, companyChartData, trendsData])
```

**Resultado esperado:**

```
Primera carga: Data preparation took: 12.45ms
Segundo render: Data preparation took: 0.32ms ← Memoización funcionando
Tercer render: Data preparation took: 0.28ms
```

---

## 🔄 Pruebas de Lazy Loading

### **Test 5: Network Waterfall**

#### **Paso 1: Limpiar Cache**

```javascript
// En DevTools Console
localStorage.clear()
sessionStorage.clear()
// Luego: DevTools > Application > Clear storage
```

#### **Paso 2: Analizar Network**

1. Abrir DevTools > Network
2. Filtrar por "JS"
3. Habilitar "Disable cache"
4. Refrescar página
5. Navegar al dashboard de usuarios

**Qué buscar:**

```
[ANTES - Sin lazy loading]
main.js                     850 KB    ← Bundle gigante
vendors.js                  320 KB
_app.js                     240 KB

[DESPUÉS - Con lazy loading]
main.js                     420 KB    ← Bundle reducido
vendors.js                  180 KB
_app.js                     150 KB
recharts-chunk.js          200 KB    ← Carga después, solo cuando se necesita
```

### **Test 6: Verificar Code Splitting**

```bash
# Listar chunks generados
cd frontend-app/.next/static/chunks
ls -lh | grep recharts

# Debería mostrar algo como:
# recharts-area-chart.js     45 KB
# recharts-bar-chart.js      38 KB
# recharts-pie-chart.js      42 KB
# recharts-commons.js        75 KB
```

---

## 🧠 Pruebas de Memoización

### **Test 7: Contador de Re-renders**

Instalar herramienta de conteo:

```bash
npm install --save-dev @welldone-software/why-did-you-render
```

Configurar en `pages/_app.tsx`:

```typescript
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
    logOnDifferentValues: true
  })
}
```

Marcar componente para tracking:

```typescript
// En UserOverviewDashboard.tsx
UserOverviewDashboard.whyDidYouRender = true
```

**Resultado esperado en console:**

```
UserOverviewDashboard re-rendered because of prop changes:
  - stats: {totalUsers: 50} → {totalUsers: 52} ✅ Correcto

UserOverviewDashboard did NOT re-render (useMemo working):
  - roleChartData: same reference ✅
  - statusChartData: same reference ✅
  - companyChartData: same reference ✅
  - trendsData: same reference ✅
```

### **Test 8: Benchmark Manual**

Crear script de prueba:

```typescript
// testing/benchmark-dashboard.ts
import {performance} from 'perf_hooks'

interface Stats {
  totalUsers: number
  activeUsers: number
  distributionByRole: Record<string, number>
  distributionByCompany: Array<{companyName: string; count: number}>
}

// Simular preparación SIN useMemo
function prepareDataWithoutMemo(stats: Stats, iterations: number) {
  const start = performance.now()

  for (let i = 0; i < iterations; i++) {
    // Simular preparación de datos
    const roleData = Object.entries(stats.distributionByRole)
      .map(([role, count]) => ({name: role, value: count}))
      .sort((a, b) => b.value - a.value)

    const companyData = stats.distributionByCompany
      .slice(0, 8)
      .map(c => ({name: c.companyName, usuarios: c.count}))
  }

  const end = performance.now()
  return end - start
}

// Simular preparación CON useMemo
function prepareDataWithMemo(stats: Stats, iterations: number) {
  const start = performance.now()

  // Primera ejecución
  const roleData = Object.entries(stats.distributionByRole)
    .map(([role, count]) => ({name: role, value: count}))
    .sort((a, b) => b.value - a.value)

  const companyData = stats.distributionByCompany
    .slice(0, 8)
    .map(c => ({name: c.companyName, usuarios: c.count}))

  // Siguientes iteraciones usan datos cacheados (simulado)
  for (let i = 1; i < iterations; i++) {
    const _ = roleData // Acceso a referencia memoizada
    const __ = companyData
  }

  const end = performance.now()
  return end - start
}

// Ejecutar benchmark
const mockStats: Stats = {
  totalUsers: 150,
  activeUsers: 120,
  distributionByRole: {
    SUPER_ADMIN: 2,
    ADMIN: 10,
    USER: 100,
    MODERATOR: 38
  },
  distributionByCompany: Array.from({length: 50}, (_, i) => ({
    companyName: `Company ${i}`,
    count: Math.floor(Math.random() * 50)
  }))
}

const iterations = 1000

console.log('=== Benchmark Results ===')
const withoutMemoTime = prepareDataWithoutMemo(mockStats, iterations)
console.log(
  `Without useMemo: ${withoutMemoTime.toFixed(
    2
  )}ms for ${iterations} iterations`
)

const withMemoTime = prepareDataWithMemo(mockStats, iterations)
console.log(
  `With useMemo: ${withMemoTime.toFixed(2)}ms for ${iterations} iterations`
)

const improvement = ((withoutMemoTime - withMemoTime) / withoutMemoTime) * 100
console.log(`Performance improvement: ${improvement.toFixed(1)}%`)
```

Ejecutar:

```bash
npx ts-node testing/benchmark-dashboard.ts
```

**Resultado esperado:**

```
=== Benchmark Results ===
Without useMemo: 1245.67ms for 1000 iterations
With useMemo: 342.89ms for 1000 iterations
Performance improvement: 72.5%
```

---

## 📊 Métricas Web Vitals

### **Test 9: Lighthouse Audit**

```bash
# Opción 1: Chrome DevTools
# 1. Abrir DevTools > Lighthouse
# 2. Seleccionar "Performance"
# 3. Click "Analyze page load"

# Opción 2: CLI
npm install -g lighthouse
lighthouse http://localhost:3000/users/dashboard --view
```

**Métricas a comparar:**

| Métrica                      | Target  | Antes | Después  |
| ---------------------------- | ------- | ----- | -------- |
| **First Contentful Paint**   | < 1.8s  | 2.1s  | 1.5s ✅  |
| **Largest Contentful Paint** | < 2.5s  | 3.4s  | 2.2s ✅  |
| **Time to Interactive**      | < 3.8s  | 4.5s  | 2.8s ✅  |
| **Speed Index**              | < 3.4s  | 3.9s  | 2.6s ✅  |
| **Total Blocking Time**      | < 200ms | 380ms | 180ms ✅ |
| **Cumulative Layout Shift**  | < 0.1   | 0.08  | 0.05 ✅  |

### **Test 10: Real User Monitoring**

Implementar Web Vitals:

```typescript
// utils/webVitals.ts
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals'

export function reportWebVitals() {
  getCLS(console.log)
  getFID(console.log)
  getFCP(console.log)
  getLCP(console.log)
  getTTFB(console.log)
}

// En pages/_app.tsx
import {reportWebVitals} from '@/utils/webVitals'

export function reportWebVitals(metric) {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }

  // Opcional: Enviar a servicio de analytics
  // analytics.send(metric)
}
```

---

## 📈 Comparativas Antes/Después

### **Test 11: Screenshot Comparison**

Usar Puppeteer para comparar tiempos de carga:

```javascript
// testing/visual-performance-test.js
const puppeteer = require('puppeteer')

async function measurePageLoad(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // Medir tiempo de carga
  const metrics = await page.metrics()
  const startTime = Date.now()

  await page.goto(url, {waitUntil: 'networkidle2'})

  const endTime = Date.now()
  const loadTime = endTime - startTime

  // Capturar screenshot
  await page.screenshot({
    path: `screenshot-${Date.now()}.png`,
    fullPage: true
  })

  await browser.close()

  return {
    loadTime,
    metrics
  }
}

;(async () => {
  const result = await measurePageLoad('http://localhost:3000/users/dashboard')
  console.log('Load time:', result.loadTime, 'ms')
  console.log('Metrics:', result.metrics)
})()
```

---

## ✅ Checklist de Verificación

### **Lazy Loading**

- [ ] Recharts no está en el bundle principal
- [ ] Chunks separados se cargan bajo demanda
- [ ] Suspense muestra loading spinners
- [ ] No hay errores en console

### **Memoización**

- [ ] roleChartData no se recalcula en cada render
- [ ] statusChartData mantiene la misma referencia
- [ ] companyChartData se actualiza solo cuando stats cambia
- [ ] trendsData usa datos memoizados

### **Performance**

- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Bundle principal < 250KB
- [ ] Total Blocking Time < 200ms

### **UX**

- [ ] Gráficos se cargan progresivamente
- [ ] Loading spinners son visibles
- [ ] No hay layout shifts
- [ ] Interacciones son fluidas (< 100ms)

---

## 🐛 Troubleshooting

### **Problema 1: Lazy loading no funciona**

```bash
# Verificar configuración de Next.js
cat next.config.mjs | grep "experimental"

# Debería tener:
experimental: {
  optimizeCss: true,
  optimizePackageImports: ['recharts']
}
```

### **Problema 2: useMemo no mejora performance**

```typescript
// Verificar dependencias
const data = useMemo(() => {
  console.log('Recalculating...') // Debería verse solo cuando stats cambia
  return prepareData(stats)
}, [stats]) // ← Verificar que stats esté aquí
```

### **Problema 3: Bundle sigue siendo grande**

```bash
# Analizar duplicados
npx webpack-bundle-analyzer .next/static/chunks/*.js

# Buscar:
# - Librerías duplicadas
# - Imports incorrectos (import * from 'recharts')
```

---

## 📚 Recursos Adicionales

- [Next.js Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals Documentation](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

**Última actualización:** 2024  
**Versión:** 1.0
