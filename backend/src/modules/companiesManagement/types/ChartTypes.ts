/**
 * Chart Types - Sistema ERP Multiempresa
 * @description: Tipos e interfaces para datos de gráficas y estadísticas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 * @created: 10/11/2025
 */

/**
 * =============================================================================
 * TIPOS BASE PARA GRÁFICAS
 * =============================================================================
 */

/**
 * Estructura base para datos de gráfica de pastel/dona
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

/**
 * Estructura para datos de tendencias mensuales
 */
export interface MonthlyTrendPoint {
  month: string;
  total: number;
  active: number;
  inactive?: number;
  suspended?: number;
  trial?: number;
  newCompanies?: number;
}

/**
 * Estructura para datos de actividad temporal
 */
export interface ActivityTrendPoint {
  month: string;
  date?: string;
  transactions?: number;
  users?: number;
  products?: number;
  revenue?: number;
}

/**
 * =============================================================================
 * ESTADÍSTICAS DE COMPAÑÍA INDIVIDUAL
 * =============================================================================
 */

/**
 * Estadísticas completas de una compañía para gráficas
 */
export interface CompanyChartStats {
  companyId: string;
  companyName: string;

  // Distribución de usuarios por rol
  usersByRole: ChartDataPoint[];

  // Uso de recursos vs límites del plan
  resourceUsage: {
    users: {
      current: number;
      limit: number;
      percentage: number;
    };
    products: {
      current: number;
      limit: number;
      percentage: number;
    };
    transactions: {
      current: number;
      limit: number;
      percentage: number;
    };
    storage: {
      current: number; // MB
      limit: number; // MB
      percentage: number;
    };
  };

  // Tendencias de actividad (últimos 6 meses)
  activityTrends: ActivityTrendPoint[];

  // Totales generales
  totals: {
    users: number;
    products: number;
    transactions: number;
    storage: number; // MB
    lastActivity: Date;
  };

  // Plan actual
  currentPlan: {
    type: string;
    name: string;
    features: string[];
  };

  // Metadata
  generatedAt: Date;
}

/**
 * =============================================================================
 * ESTADÍSTICAS GLOBALES DEL SISTEMA
 * =============================================================================
 */

/**
 * Tendencias mensuales globales de todas las empresas
 */
export interface GlobalMonthlyTrends {
  trends: MonthlyTrendPoint[];
  summary: {
    totalGrowth: number; // Porcentaje de crecimiento
    averageActiveRate: number; // Porcentaje promedio de empresas activas
    churnRate: number; // Tasa de abandono
  };
}

/**
 * Distribución por planes con detalles
 */
export interface PlanDistributionDetail {
  plan: string;
  count: number;
  percentage: number;
  revenue?: number;
  avgUsage?: number;
}

/**
 * Distribución por industrias
 */
export interface IndustryDistributionDetail {
  industry: string;
  count: number;
  percentage: number;
  topCompanies?: string[];
}

/**
 * =============================================================================
 * RESPUESTAS DE API
 * =============================================================================
 */

/**
 * Respuesta del endpoint GET /companies/:id/stats
 */
export interface CompanyStatsResponse {
  success: boolean;
  message: string;
  data: CompanyChartStats;
  timestamp: Date;
}

/**
 * Respuesta del endpoint GET /companies/summary (extendida)
 */
export interface CompaniesSummaryResponse {
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  trialCompanies: number;
  inactiveCompanies: number;

  // Distribuciones básicas
  planDistribution: Record<string, number>;
  industryDistribution: Record<string, number>;
  businessTypeDistribution: Record<string, number>;

  // Actividad reciente
  recentActivity: Array<{
    companyId: string;
    companyName: string;
    action: string;
    timestamp: Date;
  }>;

  // Crecimiento mensual
  monthlyGrowth: {
    newCompanies: number;
    upgrades: number;
    cancellations: number;
    reactivations?: number;
  };

  // NUEVO: Tendencias mensuales (últimos 6 meses)
  monthlyTrends?: MonthlyTrendPoint[];

  // Metadata
  generatedAt: Date;
}

/**
 * =============================================================================
 * UTILIDADES Y HELPERS
 * =============================================================================
 */

/**
 * Opciones para generar estadísticas
 */
export interface StatsGenerationOptions {
  includeInactive?: boolean;
  includeSuspended?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
}

/**
 * Filtros para queries de tendencias
 */
export interface TrendFilters {
  startDate?: Date;
  endDate?: Date;
  granularity?: "day" | "week" | "month" | "quarter" | "year";
  companies?: string[];
  plans?: string[];
  industries?: string[];
}

/**
 * =============================================================================
 * EXPORTS
 * =============================================================================
 */

// No es necesario re-exportar, las interfaces ya están exportadas arriba
