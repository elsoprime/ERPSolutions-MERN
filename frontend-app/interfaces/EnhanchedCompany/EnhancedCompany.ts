/**
 * Enhanced Company Interfaces
 * @description: Interfaces TypeScript para el sistema de gestión de empresas Enhanced
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { IPlanFeatures, IPlanLimits } from "../Plan/IPlan";

export interface ICompanySettings {
  // Configuraciones de negocio
  businessType: string;
  industry: string;
  taxId: string;
  currency: string;
  fiscalYear: {
    startMonth: number; // 1-12
    endMonth: number; // 1-12
  };

  // Configuraciones de la aplicación
  features: IPlanFeatures;

  // Límites y cuotas
  limits: IPlanLimits;

  // Personalización
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    favicon?: string;
  };

  // Configuraciones de notificaciones
  notifications: {
    emailDomain?: string;
    smsProvider?: string;
    webhookUrl?: string;
  };
}

export interface ICompanyStatistics {
  userCount: number;
  productCount: number;
  transactionCount: number;
  storageUsed: number;
  lastActivity: Date;

  // Estadísticas de uso
  usage: {
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
      current: number;
      limit: number;
      percentage: number;
    };
  };
}

// Interfaz para estadísticas reales del backend (stats)
export interface ICompanyStats {
  totalUsers: number;
  totalProducts: number;
  storageUsed: number;
  lastActivity: Date;
}

// Interfaz para porcentajes de uso del backend
export interface IUsagePercentage {
  users: number;
  products: number;
  storage: number;
}

export interface IEnhancedCompany {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  phone?: string;
  email: string;

  // Ubicación
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  // Plan y estado de la empresa
  plan:
    | string
    | {
        _id: string;
        name: string;
        type: "trial" | "free" | "basic" | "professional" | "enterprise";
        description?: string;
      };
  status: "active" | "inactive" | "suspended";

  // Información de suscripción (fechas)
  subscription: {
    status: "trial" | "active" | "suspended" | "cancelled";
    startDate: Date;
    endDate?: Date;
    autoRenew: boolean;
  };

  // Configuraciones de la empresa
  settings: ICompanySettings;

  // Estadísticas (legacy - mantener por compatibilidad)
  statistics?: ICompanyStatistics;

  // Stats reales del backend
  stats?: ICompanyStats;

  // Porcentajes de uso del backend
  usage?: IUsagePercentage;

  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Formularios y DTOs
export interface ICreateCompanyFormData {
  // Información básica
  name: string;
  email: string;
  description?: string;
  website?: string;
  phone?: string;

  // Ubicación
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  // Configuraciones de negocio
  settings: {
    businessType: string;
    industry: string;
    taxId: string;
    currency: string;
    fiscalYear: {
      startMonth: number;
      endMonth: number;
    };
  };

  // Plan de suscripción
  subscription: {
    planId: string; // ObjectId del plan seleccionado
    autoRenew: boolean;
  };

  // Características habilitadas
  features: {
    inventoryManagement: boolean;
    accounting: boolean;
    hrm: boolean;
    crm: boolean;
    projectManagement: boolean;
    reports: boolean;
    multiCurrency: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    auditLog: boolean;
    customIntegrations: boolean;
    dedicatedAccount: boolean;
  };

  // Personalización
  branding: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface IUpdateCompanyFormData
  extends Partial<ICreateCompanyFormData> {
  _id: string;
}

export interface ICompanyFilters {
  search?: string;
  plan?: string;
  status?: string;
  industry?: string;
  businessType?: string;
}

export interface ICompanyListResponse {
  data: IEnhancedCompany[];
  pagination: {
    currentPage: number;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Tipos para acciones
export type CompanyAction =
  | "view"
  | "edit"
  | "suspend"
  | "reactivate"
  | "delete";

export interface ICompanyActionResult {
  success: boolean;
  message: string;
  company?: IEnhancedCompany;
}

// Opciones para formularios
export const BUSINESS_TYPES = [
  "retail",
  "manufacturing",
  "services",
  "technology",
  "healthcare",
  "education",
  "finance",
  "real_estate",
  "transportation",
  "food_beverage",
  "consulting",
  "other",
] as const;

export const INDUSTRIES = [
  "Tecnología y Software",
  "Comercio y Retail",
  "Manufactura",
  "Servicios Profesionales",
  "Salud y Medicina",
  "Educación",
  "Finanzas y Seguros",
  "Inmobiliaria",
  "Transporte y Logística",
  "Alimentos y Bebidas",
  "Consultoría",
  "Construcción",
  "Turismo y Hospitalidad",
  "Agricultura",
  "Minería y Energía",
  "Medios y Comunicación",
  "Arte y Entretenimiento",
  "Deportes y Recreación",
  "Gobierno",
  "Sin fines de lucro",
  "Otros",
] as const;

export const CURRENCIES = [
  { code: "CLP", symbol: "$", name: "Peso Chileno" },
  { code: "USD", symbol: "$", name: "Dólar Estadounidense" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "ARS", symbol: "$", name: "Peso Argentino" },
  { code: "PEN", symbol: "S/", name: "Sol Peruano" },
  { code: "COP", symbol: "$", name: "Peso Colombiano" },
  { code: "MXN", symbol: "$", name: "Peso Mexicano" },
  { code: "BRL", symbol: "R$", name: "Real Brasileño" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
export type Industry = (typeof INDUSTRIES)[number];
export type Currency = (typeof CURRENCIES)[number];
export type PlanType =
  | "trial"
  | "free"
  | "basic"
  | "professional"
  | "enterprise";

// ============ SUBSCRIPTION PLANS CONSTANT ============
export const SUBSCRIPTION_PLANS = [
  {
    id: "trial",
    name: "Prueba",
    type: "trial" as const,
    limits: {
      maxUsers: 5,
      maxProducts: 100,
      maxMonthlyTransactions: 500,
      storageGB: 1,
    },
    description: "Plan de prueba por 30 días con acceso completo",
  },
  {
    id: "free",
    name: "Gratuito",
    type: "free" as const,
    limits: {
      maxUsers: 2,
      maxProducts: 50,
      maxMonthlyTransactions: 100,
      storageGB: 0.5,
    },
    description: "Plan gratuito permanente con funcionalidades básicas",
  },
  {
    id: "basic",
    name: "Básico",
    type: "basic" as const,
    limits: {
      maxUsers: 10,
      maxProducts: 1000,
      maxMonthlyTransactions: 5000,
      storageGB: 5,
    },
    description: "Ideal para pequeñas empresas en crecimiento",
  },
  {
    id: "professional",
    name: "Profesional",
    type: "professional" as const,
    limits: {
      maxUsers: 25,
      maxProducts: 5000,
      maxMonthlyTransactions: 25000,
      storageGB: 20,
    },
    description: "Para empresas medianas con necesidades avanzadas",
  },
  {
    id: "enterprise",
    name: "Empresarial",
    type: "enterprise" as const,
    limits: {
      maxUsers: 100,
      maxProducts: 50000,
      maxMonthlyTransactions: 250000,
      storageGB: 100,
    },
    description: "Solución completa para grandes empresas",
  },
] as const;

/**
 * =============================================================================
 * INTERFACES PARA GRÁFICAS Y ESTADÍSTICAS AVANZADAS
 * =============================================================================
 */

/**
 * Datos de gráficas para una compañía individual
 * Corresponde a la respuesta del endpoint GET /api/companies/:id/stats
 */
export interface ICompanyChartData {
  companyId: string;
  companyName: string;

  // Distribución de usuarios por rol
  usersByRole: Array<{
    name: string;
    value: number;
  }>;

  // Uso de recursos vs límites
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
      current: number;
      limit: number;
      percentage: number;
    };
  };

  // Tendencias de actividad (últimos 6 meses)
  activityTrends: Array<{
    month: string;
    transactions?: number;
    users?: number;
    products?: number;
  }>;

  // Totales
  totals: {
    users: number;
    products: number;
    transactions: number;
    storage: number;
    lastActivity: Date;
  };

  // Plan actual
  currentPlan: {
    type: string;
    name: string;
    features: string[];
  };

  generatedAt: Date;
}

/**
 * Tendencias mensuales globales
 * Parte de la respuesta de GET /api/companies/summary
 */
export interface IMonthlyTrend {
  month: string;
  total: number;
  active: number;
  inactive?: number;
  suspended?: number;
  trial?: number;
  newCompanies?: number;
}

/**
 * Resumen global extendido con tendencias
 */
export interface ICompaniesSummaryExtended {
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  trialCompanies: number;

  planDistribution: Record<string, number>;
  industryDistribution: Record<string, number>;
  businessTypeDistribution?: Record<string, number>;

  recentActivity: Array<{
    companyId: string;
    companyName: string;
    action: string;
    timestamp: Date;
  }>;

  monthlyGrowth: {
    newCompanies: number;
    upgrades: number;
    cancellations: number;
  };

  // NUEVO: Tendencias mensuales para gráficas
  monthlyTrends?: IMonthlyTrend[];
}
