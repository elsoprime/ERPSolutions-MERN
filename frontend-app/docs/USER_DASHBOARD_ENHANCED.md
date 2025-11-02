# Dashboard de Usuarios Mejorado - Guía Completa

## 📋 Descripción General

Dashboard avanzado de usuarios con estadísticas en tiempo real, filtros de fecha, exportación a CSV y visualizaciones mejoradas para Super Administradores.

## ✨ Nuevas Funcionalidades Implementadas

### 🎛️ 1. Barra de Controles Superior

**Ubicación**: Parte superior del dashboard

**Componentes**:

- **Título Dinámico**: Muestra el período seleccionado
- **Selector de Período**: Dropdown con opciones de fecha
- **Botón de Exportación**: Descarga CSV con estadísticas completas
- **Botón de Actualización**: Refresca datos con animación

**Filtros de Fecha Disponibles**:

```typescript
- Hoy: Estadísticas del día actual
- Esta Semana: Últimos 7 días
- Este Mes: Mes en curso (por defecto)
- Este Trimestre: Últimos 3 meses
- Este Año: Año en curso
- Todo el Tiempo: Histórico completo
```

**Diseño Responsive**:

- Mobile: Controles apilados verticalmente
- Tablet: 2 columnas
- Desktop: Fila horizontal con espaciado óptimo

### 📊 2. Estadísticas Principales (Mejoradas)

**4 Tarjetas con Métricas Clave**:

#### Tarjeta 1: Total de Usuarios

- Icono: UsersIcon (azul)
- Valor principal: Número total
- Indicador de crecimiento: Flecha y porcentaje (verde si positivo)
- Footer: Usuarios activos + nuevos del mes

#### Tarjeta 2: Usuarios Activos

- Icono: CheckCircleIcon (verde)
- Valor principal: Cantidad de activos
- Badge de estado: CheckIcon verde
- Footer: Porcentaje del total

#### Tarjeta 3: Usuarios Inactivos

- Icono: ClockIcon (amarillo)
- Valor principal: Cantidad de inactivos
- Badge de alerta: WarningIcon amarillo
- Footer: "Requiere atención" o "Todo bien"

#### Tarjeta 4: Usuarios Suspendidos

- Icono: ExclamationTriangleIcon (rojo)
- Valor principal: Cantidad de suspendidos
- Badge de error: ErrorIcon rojo
- Footer: "Requiere atención" o "Todo bien"

### 🎨 3. Distribución por Roles (Mejorada)

**Mejoras Implementadas**:

- ✅ Ordenamiento automático por cantidad (mayor a menor)
- ✅ Colores únicos por rol en badges y barras
- ✅ Barras de progreso con animación de 500ms
- ✅ Hover effect con fondo gris claro
- ✅ Altura de barra aumentada (h-2.5)
- ✅ Texto mejorado: "X usuario(s)" con singular/plural
- ✅ Porcentajes en negrita

**Esquema de Colores**:

```typescript
super_admin: {
  badge: 'bg-purple-100 text-purple-800'
  bar: 'bg-purple-600'
}
admin_empresa: {
  badge: 'bg-blue-100 text-blue-800'
  bar: 'bg-blue-600'
}
manager: {
  badge: 'bg-green-100 text-green-800'
  bar: 'bg-green-600'
}
employee: {
  badge: 'bg-gray-100 text-gray-800'
  bar: 'bg-gray-600'
}
viewer: {
  badge: 'bg-yellow-100 text-yellow-800'
  bar: 'bg-yellow-600'
}
```

### 📈 4. Actividad Reciente (Mejorada)

**Mejoras Visuales**:

- ✅ Aumentado a 8 registros (antes 5)
- ✅ Iconos dinámicos por tipo de acción:
  - Verde + CheckCircleIcon: Inicio de sesión
  - Azul + UserGroupIcon: Cuenta creada
- ✅ Tiempo relativo: "Hace X horas/días"
- ✅ Hover effect en cada item
- ✅ Formato mejorado de fecha y hora
- ✅ Texto de acción en minúsculas para mejor legibilidad

**Cálculo de Tiempo Relativo**:

```javascript
- < 1 hora: "Hace menos de 1 hora"
- 1 hora: "Hace 1 hora"
- < 24 horas: "Hace X horas"
- 1 día: "Hace 1 día"
- > 1 día: "Hace X días"
```

### 🏢 5. Distribución por Empresa (Mejorada)

**Mejoras Implementadas**:

- ✅ Grid responsive: 1 → 2 → 3 → 4 columnas
- ✅ Ordenamiento por cantidad (descendente)
- ✅ Muestra todas las empresas (antes solo 6)
- ✅ Diseño con gradiente: from-white to-gray-50
- ✅ Icono BuildingOfficeIcon por tarjeta
- ✅ Badge morado con cantidad
- ✅ Barra con gradiente: from-purple-500 to-purple-600
- ✅ Animación de 500ms en barras
- ✅ Hover con sombra elevada
- ✅ Tooltip en nombre de empresa (truncated)

**Breakpoints**:

```css
- xs-sm: grid-cols-1 (móvil)
- md: grid-cols-2 (tablet)
- lg: grid-cols-3 (desktop)
- xl: grid-cols-4 (pantallas grandes)
```

### 📊 6. Resumen de Crecimiento (NUEVO)

**Sección Destacada** con diseño especial:

**Diseño**:

- Fondo: Gradiente azul (from-blue-50 to-indigo-50)
- Borde: border-blue-200
- Padding: 6 (24px)

**Componentes**:

1. **Encabezado**:

   - Icono ChartBarIcon (azul)
   - Título: "Resumen de Crecimiento"
   - Subtítulo: "Actividad del mes en curso"
   - Porcentaje grande: 3xl, negrita, azul
   - Label: "vs mes anterior"

2. **3 Tarjetas de Métricas**:

   **Nuevos Usuarios** (Verde):

   - Valor con "+" prefijo
   - Ícono circular con ArrowTrendingUpIcon
   - Fondo verde claro (bg-green-100)

   **Activaciones** (Azul):

   - Valor numérico
   - Ícono circular con CheckCircleIcon
   - Fondo azul claro (bg-blue-100)

   **Desactivaciones** (Naranja):

   - Valor numérico
   - Ícono circular con ExclamationTriangleIcon
   - Fondo naranja claro (bg-orange-100)

**Responsive**:

- Mobile: Tarjetas apiladas (1 columna)
- Tablet+: Grid de 3 columnas

### 💾 7. Exportación a CSV (NUEVO)

**Funcionalidad Completa**:

**Botón de Exportación**:

- Color: Verde (bg-green-600)
- Icono: ArrowDownTrayIcon
- Estados: Normal, Exportando, Deshabilitado
- Feedback: Toast notifications

**Contenido del CSV**:

1. **Encabezado**:

   ```
   Estadísticas de Usuarios - ERPSolutions
   ```

2. **Sección: Resumen General**:

   - Total de Usuarios
   - Usuarios Activos
   - Usuarios Inactivos
   - Usuarios Suspendidos
   - Porcentaje Activos

3. **Sección: Crecimiento Mensual**:

   - Nuevos Usuarios
   - Activaciones
   - Desactivaciones
   - Porcentaje de Crecimiento

4. **Sección: Distribución por Roles**:

   - Tabla: Rol | Cantidad | Porcentaje

5. **Sección: Distribución por Empresa**:

   - Tabla: Empresa | Cantidad | Porcentaje

6. **Sección: Actividad Reciente**:
   - Tabla: Usuario | Acción | Fecha
   - Últimas 10 actividades

**Nombre de Archivo**:

```
estadisticas-usuarios-YYYY-MM-DD.csv
```

**Proceso**:

1. Click en botón "Exportar CSV"
2. Toast: "Generando archivo CSV..."
3. Generación del contenido
4. Descarga automática
5. Toast: "Estadísticas exportadas correctamente"

## 🎯 Estados y Comportamientos

### Estados del Componente

```typescript
const [stats, setStats] = useState<UserDashboardStats | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [dateFilter, setDateFilter] = useState<DateFilter>('month')
const [showFilters, setShowFilters] = useState(false)
const [exporting, setExporting] = useState(false)
```

### Ciclo de Vida

1. **Montaje del Componente**:

   - useEffect se ejecuta
   - loadDashboardData() se llama
   - Estado loading = true

2. **Carga de Datos**:

   - Llamada a UserAPI.getUsersStats()
   - Transformación de datos
   - Actualización de estado stats
   - loading = false

3. **Cambio de Filtro**:

   - Usuario selecciona nuevo período
   - setDateFilter actualiza estado
   - useEffect detecta cambio
   - Recarga datos automáticamente

4. **Actualización Manual**:

   - Click en botón "Actualizar"
   - loadDashboardData() se ejecuta
   - Spinner en botón mientras carga

5. **Exportación**:
   - Click en "Exportar CSV"
   - exporting = true
   - Generación del archivo
   - Descarga automática
   - exporting = false
   - Toast de confirmación

## 🎨 Mejoras de UX/UI

### Animaciones

1. **Barras de Progreso**:

   ```css
   transition-all duration-500 ease-out
   ```

2. **Hover Effects**:

   ```css
   hover:bg-gray-50 transition-colors
   hover:shadow-md transition-shadow
   ```

3. **Spinner de Carga**:
   ```css
   animate-spin
   ```

### Colores y Temas

**Paleta Principal**:

- Azul: Usuarios totales, crecimiento positivo
- Verde: Activos, inicios de sesión, nuevos usuarios
- Amarillo: Inactivos, advertencias
- Rojo: Suspendidos, errores
- Morado: Empresas, super admin
- Naranja: Desactivaciones

**Gradientes**:

- Resumen de crecimiento: blue-50 → indigo-50
- Tarjetas de empresa: white → gray-50
- Barras de empresa: purple-500 → purple-600

### Tipografía

**Jerarquía**:

- 3xl: Porcentajes principales
- 2xl: Valores numéricos importantes
- lg: Títulos de secciones
- sm: Texto descriptivo
- xs: Labels y metadata

**Pesos**:

- font-bold: Métricas principales
- font-semibold: Valores destacados
- font-medium: Títulos y labels
- font-normal: Texto descriptivo

## 📱 Diseño Responsive

### Breakpoints y Layouts

**Mobile (< 640px)**:

- Controles: Verticales apilados
- Stats: 1 columna
- Gráficos: 1 columna
- Empresas: 1 columna
- Crecimiento: 1 columna

**Tablet (640px - 1023px)**:

- Controles: Flex wrap con gap
- Stats: 2 columnas
- Gráficos: 1 columna
- Empresas: 2 columnas
- Crecimiento: 3 columnas

**Desktop (1024px - 1279px)**:

- Controles: Fila horizontal
- Stats: 4 columnas
- Gráficos: 2 columnas (lado a lado)
- Empresas: 3 columnas
- Crecimiento: 3 columnas

**Large Desktop (≥ 1280px)**:

- Controles: Fila horizontal espaciada
- Stats: 4 columnas
- Gráficos: 2 columnas
- Empresas: 4 columnas
- Crecimiento: 3 columnas

## 🔒 Seguridad y Permisos

**Autenticación**:

- JWT Token requerido
- Middleware: authMiddleware.authenticate

**Autorización**:

- Solo Super Admin (`companies.list_all`)
- Middleware: requireGlobalPermission

**Validación de Datos**:

- TypeScript tipado estricto
- Validación de respuestas de API
- Manejo de errores robusto

## 📊 Métricas y Cálculos

### Porcentaje de Crecimiento

```typescript
const calculateGrowthPercentage = (): string => {
  if (!stats?.monthlyGrowth || stats.totalUsers === 0) {
    return '0.0'
  }

  const {newUsers} = stats.monthlyGrowth
  const previousTotal = stats.totalUsers - newUsers

  if (previousTotal === 0) {
    return newUsers > 0 ? '100.0' : '0.0'
  }

  const growthPercentage = (newUsers / previousTotal) * 100
  return growthPercentage.toFixed(1)
}
```

### Porcentaje por Rol/Empresa

```typescript
const percentage = (count / stats.totalUsers) * 100
// Formateado: percentage.toFixed(1) + '%'
```

### Tiempo Relativo

```typescript
const diffInHours = Math.floor(
  (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
)

if (diffInHours < 1) return 'Hace menos de 1 hora'
if (diffInHours === 1) return 'Hace 1 hora'
if (diffInHours < 24) return `Hace ${diffInHours} horas`

const diffInDays = Math.floor(diffInHours / 24)
if (diffInDays === 1) return 'Hace 1 día'
return `Hace ${diffInDays} días`
```

## 🛠️ Uso y Mantenimiento

### Para Desarrolladores

**Agregar Nuevo Filtro de Fecha**:

1. Actualizar tipo `DateFilter`
2. Agregar label en `getDateFilterLabel()`
3. Agregar opción en dropdown
4. (Opcional) Implementar lógica en backend

**Modificar Exportación CSV**:

- Editar función `handleExportCSV()`
- Actualizar contenido de `csvContent`
- Modificar formato de secciones

**Personalizar Colores**:

- Editar objetos `roleColors`, `roleBarColors`
- Actualizar clases de Tailwind
- Mantener coherencia visual

### Para Usuarios (Super Admin)

**Ver Estadísticas**:

1. Navegar a "Usuarios"
2. Seleccionar pestaña "Dashboard"
3. Estadísticas se cargan automáticamente

**Filtrar por Período**:

1. Click en selector de fecha
2. Elegir período deseado
3. Datos se actualizan automáticamente

**Exportar Datos**:

1. Click en "Exportar CSV"
2. Esperar notificación
3. Archivo se descarga automáticamente

**Actualizar Manualmente**:

1. Click en botón "Actualizar"
2. Spinner indica carga
3. Datos se refrescan

## 🐛 Solución de Problemas

### Error: "Error al cargar los datos del dashboard"

**Posibles Causas**:

- Backend no está corriendo
- Usuario sin permisos de Super Admin
- Error de red

**Soluciones**:

1. Verificar que backend esté activo
2. Confirmar rol de usuario
3. Revisar consola del navegador
4. Click en "Reintentar"

### Exportación no funciona

**Verificar**:

- Navegador permite descargas
- No hay bloqueador de pop-ups activo
- Datos están cargados correctamente

### Estadísticas en cero

**Revisar**:

- Base de datos tiene usuarios
- Filtro de fecha no está muy restrictivo
- Usuarios tienen estados correctos

## 📈 Mejoras Futuras Sugeridas

1. **Gráficos con Chart.js**:

   - Gráficos de barras interactivos
   - Gráficos de líneas para tendencias
   - Gráficos de dona para distribuciones

2. **Filtros Avanzados**:

   - Rango de fechas personalizado
   - Filtro por empresa específica
   - Filtro por rol

3. **Comparativas**:

   - Mes actual vs mes anterior
   - Año actual vs año anterior
   - Tendencias trimestrales

4. **Exportación Avanzada**:

   - Exportar a PDF con gráficos
   - Exportar a Excel con formato
   - Programar reportes automáticos

5. **Tiempo Real**:

   - WebSocket para actualizaciones en vivo
   - Notificaciones de nuevos usuarios
   - Alertas de cambios importantes

6. **Dashboard Personalizable**:
   - Drag and drop de secciones
   - Ocultar/mostrar widgets
   - Guardar preferencias

## 📚 Referencias Técnicas

- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)
- [React Toastify](https://fkhadra.github.io/react-toastify)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

**Autor**: Esteban Soto Ojeda @elsoprimeDev  
**Fecha**: Noviembre 2025  
**Versión**: 2.1 (Enhanced)  
**Estado**: ✅ Completado y Funcional
