/**
 * Chart Components - TypeScript Types
 * @description Tipos estrictamente tipados para componentes de gráficas reutilizables
 * @author Esteban Soto Ojeda @elsoprimeDev
 * @version 1.0.0
 */

import { CSSProperties, ReactNode } from "react";

/**
 * =============================================================================
 * TIPOS BASE
 * =============================================================================
 */

/**
 * Colores predefinidos del sistema de gráficas
 * Basados en la paleta de Tailwind CSS
 */
export type ChartColor =
  | "purple"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "orange"
  | "gray"
  | "teal"
  | "pink"
  | "indigo"
  | "lightBlue"
  | "lightGreen";

/**
 * Tipos de gráficas disponibles
 */
export type ChartType = "area" | "bar" | "pie" | "line" | "donut" | "combo";

/**
 * Orientación de layout
 */
export type ChartLayout = "horizontal" | "vertical";

/**
 * Posiciones para leyendas
 */
export type LegendPosition = "top" | "bottom" | "left" | "right";

/**
 * =============================================================================
 * CONFIGURACIONES
 * =============================================================================
 */

/**
 * Configuración de eje (X o Y)
 */
export interface AxisConfig {
  show?: boolean;
  fontSize?: number;
  stroke?: string;
  angle?: number;
  textAnchor?: "start" | "middle" | "end";
  height?: number;
  width?: number;
  tickFormatter?: (value: string | number) => string;
}

/**
 * Configuración de grilla cartesiana
 */
export interface GridConfig {
  show?: boolean;
  strokeDasharray?: string;
  stroke?: string;
  opacity?: number;
}

/**
 * Configuración de leyenda
 */
export interface LegendConfig {
  show?: boolean;
  fontSize?: number;
  position?: LegendPosition;
  wrapperStyle?: CSSProperties;
  iconType?: "line" | "square" | "rect" | "circle";
}

/**
 * Payload del tooltip (datos que recibe)
 */
export interface TooltipPayload {
  name: string;
  value: number;
  color?: string;
  payload?: Record<string, unknown>;
  dataKey?: string;
  percentage?: string;
  fullName?: string;
}

/**
 * Configuración de tooltip
 */
export interface TooltipConfig {
  show?: boolean;
  custom?: boolean;
  cursor?: boolean;
  formatter?: (
    value: number,
    name: string,
    props: TooltipPayload
  ) => string | ReactNode;
}

/**
 * Configuración de una serie de datos en gráficas de tendencia
 */
export interface DataSeriesConfig {
  /** Clave del dato en el objeto de datos */
  key: string;
  /** Nombre para mostrar en leyenda */
  name: string;
  /** Color de la serie */
  color: ChartColor;
  /** Tipo de renderizado (solo para AreaChart) */
  type?: "area" | "line";
  /** Grosor de línea (solo para LineChart) */
  strokeWidth?: number;
  /** Mostrar puntos en la línea */
  showDots?: boolean;
}

/**
 * =============================================================================
 * DATA TYPES - ESTRUCTURAS DE DATOS
 * =============================================================================
 */

/**
 * Punto de datos para gráficas de tendencia (Area/Line)
 * Permite múltiples series de datos dinámicamente
 */
export interface TrendDataPoint {
  /** Etiqueta del eje X (mes, día, categoría) */
  [key: string]: string | number;
}

export type TrendData = TrendDataPoint[];

/**
 * Punto de datos para gráficas de barras
 */
export interface BarDataPoint {
  /** Nombre/etiqueta de la barra */
  name: string;
  /** Valor numérico */
  value: number;
  /** Color personalizado (opcional) */
  color?: string;
  /** Nombre completo para tooltips (opcional) */
  fullName?: string;
  /** Datos adicionales */
  [key: string]: string | number | undefined;
}

export type BarData = BarDataPoint[];

/**
 * Punto de datos para gráficas circulares (Pie/Donut)
 */
export interface PieDataPoint {
  /** Nombre del segmento */
  name: string;
  /** Valor numérico del segmento */
  value: number;
  /** Color del segmento */
  color: string;
  /** Porcentaje formateado (ej: "42.5%") */
  percentage?: string;
  /** Datos adicionales */
  [key: string]: string | number | undefined;
}

export type PieData = PieDataPoint[];

/**
 * =============================================================================
 * PROPS DE COMPONENTES
 * =============================================================================
 */

/**
 * Props base compartidas por todos los componentes de gráficas
 */
export interface BaseChartProps {
  /** Título principal de la gráfica */
  title: string;
  /** Subtítulo o descripción */
  subtitle?: string;
  /** Altura de la gráfica en píxeles */
  height?: number;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Estado de carga */
  loading?: boolean;
  /** Mensaje de error */
  error?: string | null;
  /** Mensaje cuando no hay datos */
  emptyMessage?: string;
  /** Mostrar botón de actualización */
  showRefresh?: boolean;
  /** Callback al hacer clic en actualizar */
  onRefresh?: () => void;
}

/**
 * Props para AreaChartCard
 * Gráfica de área con gradientes, ideal para tendencias temporales
 */
export interface AreaChartCardProps extends BaseChartProps {
  /** Datos de la gráfica */
  data: TrendData;
  /** Configuración de las series a mostrar */
  dataKeys: DataSeriesConfig[];
  /** Clave para el eje X */
  xAxisKey: string;
  /** Mostrar grilla de fondo */
  showGrid?: boolean;
  /** Mostrar leyenda */
  showLegend?: boolean;
  /** Usar relleno con gradiente */
  gradientFill?: boolean;
  /** Configuración personalizada del eje X */
  xAxisConfig?: AxisConfig;
  /** Configuración personalizada del eje Y */
  yAxisConfig?: AxisConfig;
  /** Configuración del tooltip */
  tooltipConfig?: TooltipConfig;
}

/**
 * Props para BarChartCard
 * Gráfica de barras horizontal o vertical
 */
export interface BarChartCardProps extends BaseChartProps {
  /** Datos de la gráfica */
  data: BarData;
  /** Clave del valor numérico */
  dataKey: string;
  /** Clave del nombre/etiqueta */
  nameKey?: string;
  /** Orientación del gráfico */
  layout?: ChartLayout;
  /** Color principal de las barras */
  barColor?: ChartColor;
  /** Usar colores personalizados por barra */
  useCustomColors?: boolean;
  /** Mostrar grilla de fondo */
  showGrid?: boolean;
  /** Radio de bordes de las barras */
  barRadius?: number | [number, number, number, number];
  /** Configuración personalizada del eje X */
  xAxisConfig?: AxisConfig;
  /** Configuración personalizada del eje Y */
  yAxisConfig?: AxisConfig;
  /** Configuración del tooltip */
  tooltipConfig?: TooltipConfig;
}

/**
 * Props para PieChartCard
 * Gráfica circular (Pie) o de dona (Donut)
 */
export interface PieChartCardProps extends BaseChartProps {
  /** Datos de la gráfica */
  data: PieData;
  /** Radio interno (0 = Pie normal, >0 = Donut) */
  innerRadius?: number;
  /** Radio externo */
  outerRadius?: number;
  /** Mostrar etiquetas en los segmentos */
  showLabels?: boolean;
  /** Mostrar leyenda */
  showLegend?: boolean;
  /** Posición de la leyenda */
  legendPosition?: LegendPosition;
  /** Separación entre segmentos (grados) */
  paddingAngle?: number;
  /** Configuración del tooltip */
  tooltipConfig?: TooltipConfig;
  /** Mostrar estadísticas debajo del gráfico */
  showStats?: boolean;
}

/**
 * Props para LineChartCard
 * Gráfica de líneas para tendencias
 */
export interface LineChartCardProps extends BaseChartProps {
  /** Datos de la gráfica */
  data: TrendData;
  /** Configuración de las líneas a mostrar */
  dataKeys: DataSeriesConfig[];
  /** Clave para el eje X */
  xAxisKey: string;
  /** Mostrar grilla de fondo */
  showGrid?: boolean;
  /** Mostrar leyenda */
  showLegend?: boolean;
  /** Mostrar puntos en las líneas */
  showDots?: boolean;
  /** Tipo de curva */
  curveType?: "linear" | "monotone" | "step" | "basis";
  /** Configuración personalizada del eje X */
  xAxisConfig?: AxisConfig;
  /** Configuración personalizada del eje Y */
  yAxisConfig?: AxisConfig;
  /** Configuración del tooltip */
  tooltipConfig?: TooltipConfig;
}

/**
 * =============================================================================
 * TIPOS DE RESPUESTA DEL BACKEND
 * =============================================================================
 */

/**
 * Estructura de estadísticas que devuelve el backend
 */
export interface ChartStats {
  /** Tendencias mensuales */
  monthlyTrends?: TrendData;
  /** Distribución de datos (nombre: cantidad) */
  distribution?: Record<string, number>;
  /** Top items ordenados */
  topItems?: Array<{ name: string; value: number; color?: string }>;
  /** Total general */
  total?: number;
}

/**
 * =============================================================================
 * UTILIDADES
 * =============================================================================
 */

/**
 * Opciones de formato de números
 */
export interface NumberFormatOptions {
  /** Usar separadores de miles */
  useGrouping?: boolean;
  /** Dígitos decimales máximos */
  maximumFractionDigits?: number;
  /** Dígitos decimales mínimos */
  minimumFractionDigits?: number;
  /** Estilo de formato */
  style?: "decimal" | "currency" | "percent";
  /** Código de moneda (para style: 'currency') */
  currency?: string;
}

/**
 * Función de formato personalizado
 */
export type CustomFormatter = (value: number) => string;
