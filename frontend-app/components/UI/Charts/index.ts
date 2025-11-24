/**
 * Chart Components - Central Exports
 * @description Punto de entrada centralizado para todos los componentes de gráficas
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

// Componentes de gráficas
export { AreaChartCard } from "./AreaChartCard";
export { BarChartCard } from "./BarChartCard";
export { PieChartCard } from "./PieChartCard";
export { LineChartCard } from "./LineChartCard";

// Tooltips
export { CustomTooltip, SimplePieTooltip, BarTooltip } from "./CustomTooltip";

// Colores y utilidades
export {
  CHART_COLORS,
  CHART_BG_COLORS,
  PIE_CHART_PALETTE,
  GRADIENT_CONFIGS,
  getChartColor,
  getChartBgColor,
  getGradientConfig,
} from "./chartColors";

// Tipos
export type {
  // Tipos base
  ChartColor,
  ChartType,
  ChartLayout,
  LegendPosition,

  // Configuraciones
  AxisConfig,
  GridConfig,
  LegendConfig,
  TooltipConfig,
  TooltipPayload,
  DataSeriesConfig,

  // Datos
  TrendData,
  TrendDataPoint,
  BarData,
  BarDataPoint,
  PieData,
  PieDataPoint,

  // Props de componentes
  BaseChartProps,
  AreaChartCardProps,
  BarChartCardProps,
  PieChartCardProps,
  LineChartCardProps,

  // Backend
  ChartStats,

  // Utilidades
  NumberFormatOptions,
  CustomFormatter,
} from "./types";
