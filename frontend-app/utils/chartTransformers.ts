/**
 * Chart Data Transformers
 * @description Transformadores para convertir datos del backend a formatos de gráficas
 * @author Esteban Soto Ojeda @elsoprimeDev
 * @version 1.0.0
 * @created 10/11/2025
 */

import type { PieData, TrendData, BarData } from "@/components/UI/Charts";
import { CHART_COLORS, PIE_CHART_PALETTE } from "@/components/UI/Charts";

/**
 * =============================================================================
 * TRANSFORMADORES PARA PIE/DONUT CHARTS
 * =============================================================================
 */

/**
 * Transforma distribución de planes a formato PieData
 * @param distribution - Record<string, number> del backend
 * @returns PieData[] listo para PieChartCard
 */
export function transformPlanDistribution(
  distribution: Record<string, number>
): PieData {
  const planColors: Record<string, string> = {
    free: CHART_COLORS.gray,
    basic: CHART_COLORS.blue,
    professional: CHART_COLORS.purple,
    enterprise: CHART_COLORS.green,
    trial: CHART_COLORS.yellow,
  };

  return Object.entries(distribution).map(([plan, count]) => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    value: count,
    color: planColors[plan.toLowerCase()] || CHART_COLORS.gray,
  }));
}

/**
 * Transforma distribución de industrias a formato PieData
 * @param distribution - Record<string, number> del backend
 * @returns PieData[] listo para PieChartCard
 */
export function transformIndustryDistribution(
  distribution: Record<string, number>
): PieData {
  return Object.entries(distribution)
    .sort(([, a], [, b]) => b - a) // Ordenar por cantidad (mayor a menor)
    .map(([industry, count], index) => ({
      name: industry === "Sin especificar" ? "Otros" : industry,
      value: count,
      color: PIE_CHART_PALETTE[index % PIE_CHART_PALETTE.length],
    }));
}

/**
 * Transforma distribución de usuarios por rol a formato PieData
 * @param usersByRole - Array de {name: string, value: number} del backend
 * @returns PieData[] listo para PieChartCard
 */
export function transformUsersByRole(
  usersByRole: Array<{ name: string; value: number }>
): PieData {
  const roleColors: Record<string, string> = {
    "Super Admin": CHART_COLORS.red,
    Superadmin: CHART_COLORS.red,
    Admin_empresa: CHART_COLORS.purple,
    Admin: CHART_COLORS.purple,
    Manager: CHART_COLORS.blue,
    Employee: CHART_COLORS.green,
    Viewer: CHART_COLORS.gray,
    User: CHART_COLORS.lightBlue,
  };

  return usersByRole.map((item) => ({
    name: item.name,
    value: item.value,
    color: roleColors[item.name] || CHART_COLORS.teal,
  }));
}

/**
 * Transforma uso de recursos a formato PieData
 * @param resourceUsage - Objeto con current/limit/percentage del backend
 * @returns PieData[] mostrando porcentajes de uso
 */
export function transformResourceUsage(resourceUsage: {
  users: { current: number; limit: number; percentage: number };
  products: { current: number; limit: number; percentage: number };
  transactions: { current: number; limit: number; percentage: number };
  storage: { current: number; limit: number; percentage: number };
}): PieData {
  return [
    {
      name: `Usuarios (${resourceUsage.users.current}/${resourceUsage.users.limit})`,
      value: resourceUsage.users.percentage,
      color: CHART_COLORS.blue,
    },
    {
      name: `Productos (${resourceUsage.products.current}/${resourceUsage.products.limit})`,
      value: resourceUsage.products.percentage,
      color: CHART_COLORS.green,
    },
    {
      name: `Transacciones (${resourceUsage.transactions.current}/${resourceUsage.transactions.limit})`,
      value: resourceUsage.transactions.percentage,
      color: CHART_COLORS.purple,
    },
    {
      name: `Storage (${resourceUsage.storage.current}MB/${resourceUsage.storage.limit}MB)`,
      value: resourceUsage.storage.percentage,
      color: CHART_COLORS.yellow,
    },
  ];
}

/**
 * =============================================================================
 * TRANSFORMADORES PARA AREA/LINE CHARTS
 * =============================================================================
 */

/**
 * Transforma tendencias mensuales globales a formato TrendData
 * @param monthlyTrends - Array de tendencias del backend
 * @returns TrendData[] listo para AreaChartCard/LineChartCard
 */
export function transformMonthlyTrends(
  monthlyTrends: Array<{
    month: string;
    total: number;
    active: number;
    inactive?: number;
    suspended?: number;
    trial?: number;
    newCompanies?: number;
  }>
): TrendData {
  return monthlyTrends.map((trend) => ({
    name: trend.month,
    total: trend.total,
    active: trend.active,
    inactive: trend.inactive || 0,
    trial: trend.trial || 0,
    suspended: trend.suspended || 0,
    newCompanies: trend.newCompanies || 0,
  }));
}

/**
 * Transforma tendencias de actividad de una compañía a formato TrendData
 * @param activityTrends - Array de actividad del backend
 * @returns TrendData[] listo para AreaChartCard
 */
export function transformActivityTrends(
  activityTrends: Array<{
    month: string;
    transactions?: number;
    users?: number;
    products?: number;
  }>
): TrendData {
  return activityTrends.map((trend) => ({
    name: trend.month,
    transactions: trend.transactions || 0,
    users: trend.users || 0,
    products: trend.products || 0,
  }));
}

/**
 * =============================================================================
 * TRANSFORMADORES PARA BAR CHARTS
 * =============================================================================
 */

/**
 * Transforma distribución para BarChart horizontal/vertical
 * @param distribution - Record<string, number> del backend
 * @param useColors - Si usar colores personalizados por barra
 * @returns BarData[] listo para BarChartCard
 */
export function transformToBarData(
  distribution: Record<string, number>,
  useColors: boolean = false
): BarData {
  const entries = Object.entries(distribution).sort(([, a], [, b]) => b - a);

  return entries.map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: useColors
      ? PIE_CHART_PALETTE[index % PIE_CHART_PALETTE.length]
      : undefined,
    fullName: `${name} - ${value} empresas`,
  }));
}

/**
 * =============================================================================
 * HELPERS GENÉRICOS
 * =============================================================================
 */

/**
 * Calcula porcentaje de un valor respecto al total
 * @param value - Valor actual
 * @param total - Total
 * @returns Porcentaje redondeado a 1 decimal
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

/**
 * Formatea números grandes a formato corto (1.2K, 3.4M, etc.)
 * @param value - Número a formatear
 * @returns String formateado
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Formatea bytes a MB/GB legible
 * @param mb - Megabytes
 * @returns String formateado
 */
export function formatStorage(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb} MB`;
}

/**
 * =============================================================================
 * TRANSFORMADOR PRINCIPAL PARA COMPANY CHART STATS
 * =============================================================================
 */

/**
 * Transforma respuesta completa de getCompanyStats a objetos listos para gráficas
 * @param chartStats - CompanyChartStats del backend
 * @returns Objeto con todos los datos transformados
 */
export function transformCompanyChartStats(chartStats: any) {
  return {
    usersByRole: transformUsersByRole(chartStats.usersByRole || []),
    resourceUsage: transformResourceUsage(chartStats.resourceUsage),
    activityTrends: transformActivityTrends(chartStats.activityTrends || []),
    totals: chartStats.totals,
    currentPlan: chartStats.currentPlan,
  };
}

/**
 * Transforma respuesta de getCompaniesSummary para gráficas
 * @param summary - Resumen global del backend
 * @returns Objeto con datos transformados para dashboard
 */
export function transformCompaniesSummary(summary: any) {
  return {
    planDistribution: transformPlanDistribution(summary.planDistribution || {}),
    industryDistribution: transformIndustryDistribution(
      summary.industryDistribution || {}
    ),
    monthlyTrends: summary.monthlyTrends
      ? transformMonthlyTrends(summary.monthlyTrends)
      : [],
    stats: {
      totalCompanies: summary.totalCompanies || 0,
      activeCompanies: summary.activeCompanies || 0,
      suspendedCompanies: summary.suspendedCompanies || 0,
      trialCompanies: summary.trialCompanies || 0,
    },
  };
}
