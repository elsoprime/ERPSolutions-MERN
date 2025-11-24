/**
 * User Chart Data Transformers
 * @description Transformadores para convertir datos del backend de usuarios a formatos de gráficas
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
 * Transforma distribución de estados a formato PieData
 * @param active - Cantidad de usuarios activos
 * @param inactive - Cantidad de usuarios inactivos
 * @param suspended - Cantidad de usuarios suspendidos
 * @returns PieData[] listo para PieChartCard
 */
export function transformStatusDistribution(
  active: number,
  inactive: number,
  suspended: number
): PieData {
  return [
    {
      name: "Activos",
      value: active,
      color: CHART_COLORS.green,
    },
    {
      name: "Inactivos",
      value: inactive,
      color: CHART_COLORS.yellow,
    },
    {
      name: "Suspendidos",
      value: suspended,
      color: CHART_COLORS.red,
    },
  ];
}

/**
 * =============================================================================
 * TRANSFORMADORES PARA BAR CHARTS
 * =============================================================================
 */

/**
 * Transforma distribución de roles a formato BarData
 * @param distribution - Record<string, number> del backend
 * @returns BarData[] listo para BarChartCard
 */
export function transformRoleDistribution(
  distribution: Record<string, number>
): BarData {
  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin_empresa: "Admin Empresa",
    manager: "Manager",
    employee: "Empleado",
    viewer: "Visualizador",
  };

  const roleColors: Record<string, string> = {
    super_admin: CHART_COLORS.purple,
    admin_empresa: CHART_COLORS.blue,
    manager: CHART_COLORS.green,
    employee: CHART_COLORS.gray,
    viewer: CHART_COLORS.yellow,
  };

  return Object.entries(distribution)
    .map(([role, count]) => ({
      name: roleLabels[role] || role,
      value: count,
      color: roleColors[role] || CHART_COLORS.gray,
    }))
    .sort((a, b) => b.value - a.value); // Ordenar por cantidad (mayor a menor)
}

/**
 * Transforma distribución de empresas a formato BarData
 * @param distribution - Record<string, number> del backend
 * @param limit - Número máximo de empresas a mostrar (default: 8)
 * @returns BarData[] listo para BarChartCard
 */
export function transformCompanyDistribution(
  distribution: Record<string, number>,
  limit: number = 8
): BarData {
  return Object.entries(distribution)
    .sort(([, a], [, b]) => b - a) // Ordenar por cantidad (mayor a menor)
    .slice(0, limit) // Limitar cantidad
    .map(([company, count]) => ({
      name: company.length > 20 ? company.substring(0, 20) + "..." : company,
      value: count,
      color: CHART_COLORS.purple,
      fullName: company, // Guardar nombre completo para tooltip
    }));
}

/**
 * =============================================================================
 * TRANSFORMADORES PARA AREA/LINE CHARTS
 * =============================================================================
 */

/**
 * Transforma tendencias mensuales a formato TrendData
 * @param trends - Array de tendencias mensuales del backend
 * @returns TrendData[] listo para AreaChartCard/LineChartCard
 */
export function transformMonthlyTrends(
  trends: Array<{
    month: string;
    total: number;
    active: number;
    inactive: number;
    newUsers: number;
  }>
): TrendData {
  return trends.map((trend) => ({
    name: trend.month,
    total: trend.total,
    active: trend.active,
    inactive: trend.inactive,
    newUsers: trend.newUsers,
  }));
}

/**
 * =============================================================================
 * TRANSFORMADORES COMPUESTOS
 * =============================================================================
 */

/**
 * Transforma todas las estadísticas de usuarios del backend
 * @param stats - Estadísticas completas del backend
 * @returns Objeto con todos los datos transformados para gráficas
 */
export function transformUserDashboardStats(stats: {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  byRole: Record<string, number>;
  byCompany: Record<string, number>;
  monthlyTrends?: Array<{
    month: string;
    total: number;
    active: number;
    inactive: number;
    newUsers: number;
  }>;
}) {
  return {
    statusDistribution: transformStatusDistribution(
      stats.active,
      stats.inactive,
      stats.suspended
    ),
    roleDistribution: transformRoleDistribution(stats.byRole),
    companyDistribution: transformCompanyDistribution(stats.byCompany),
    monthlyTrends: stats.monthlyTrends
      ? transformMonthlyTrends(stats.monthlyTrends)
      : [],
  };
}
