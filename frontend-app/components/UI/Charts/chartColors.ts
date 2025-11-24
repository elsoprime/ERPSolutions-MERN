/**
 * Chart Colors Configuration
 * @description Paleta de colores centralizada para gráficas
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import { ChartColor } from "./types";

/**
 * Paleta de colores para gráficas
 * Basados en Tailwind CSS v3
 */
export const CHART_COLORS: Record<ChartColor, string> = {
  purple: "#9333ea", // purple-600
  blue: "#2563eb", // blue-600
  green: "#16a34a", // green-600
  yellow: "#eab308", // yellow-500
  red: "#dc2626", // red-600
  orange: "#ea580c", // orange-600
  gray: "#6b7280", // gray-500
  teal: "#14b8a6", // teal-500
  pink: "#ec4899", // pink-500
  indigo: "#6366f1", // indigo-500
  lightBlue: "#3b82f6", // blue-500
  lightGreen: "#22c55e", // green-500
};

/**
 * Colores de fondo con opacidad para áreas
 */
export const CHART_BG_COLORS: Record<ChartColor, string> = {
  purple: "#9333ea20",
  blue: "#2563eb20",
  green: "#16a34a20",
  yellow: "#eab30820",
  red: "#dc262620",
  orange: "#ea580c20",
  gray: "#6b728020",
  teal: "#14b8a620",
  pink: "#ec489920",
  indigo: "#6366f120",
  lightBlue: "#3b82f620",
  lightGreen: "#22c55e20",
};

/**
 * Obtener color por nombre
 */
export const getChartColor = (color: ChartColor): string => {
  return CHART_COLORS[color] || CHART_COLORS.blue;
};

/**
 * Obtener color de fondo por nombre
 */
export const getChartBgColor = (color: ChartColor): string => {
  return CHART_BG_COLORS[color] || CHART_BG_COLORS.blue;
};

/**
 * Paleta de colores para gráficas de Pie/Donut
 * Cuando se necesita asignar colores automáticamente
 */
export const PIE_CHART_PALETTE: string[] = [
  CHART_COLORS.purple,
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.yellow,
  CHART_COLORS.orange,
  CHART_COLORS.teal,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
  CHART_COLORS.red,
  CHART_COLORS.lightBlue,
  CHART_COLORS.lightGreen,
  CHART_COLORS.gray,
];

/**
 * Configuración de gradientes para AreaChart
 */
export const GRADIENT_CONFIGS: Record<
  ChartColor,
  { start: string; end: string }
> = {
  purple: { start: "#9333ea", end: "#9333ea00" },
  blue: { start: "#2563eb", end: "#2563eb00" },
  green: { start: "#16a34a", end: "#16a34a00" },
  yellow: { start: "#eab308", end: "#eab30800" },
  red: { start: "#dc2626", end: "#dc262600" },
  orange: { start: "#ea580c", end: "#ea580c00" },
  gray: { start: "#6b7280", end: "#6b728000" },
  teal: { start: "#14b8a6", end: "#14b8a600" },
  pink: { start: "#ec4899", end: "#ec489900" },
  indigo: { start: "#6366f1", end: "#6366f100" },
  lightBlue: { start: "#3b82f6", end: "#3b82f600" },
  lightGreen: { start: "#22c55e", end: "#22c55e00" },
};

/**
 * Obtener configuración de gradiente
 */
export const getGradientConfig = (color: ChartColor) => {
  return GRADIENT_CONFIGS[color] || GRADIENT_CONFIGS.blue;
};
