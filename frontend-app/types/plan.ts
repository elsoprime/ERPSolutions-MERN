/**
 * @fileoverview Plan Management TypeScript Types
 * @description Tipos para gestión de planes de suscripción
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

/**
 * Tipos de planes disponibles en el sistema
 */
export enum PlanType {
  FREE = "free",
  BASIC = "basic",
  PROFESSIONAL = "Professional",
  ENTERPRISE = "enterprise",
}

/**
 * Estado del plan
 */
export enum PlanStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DEPRECATED = "deprecated",
}

/**
 * Características del plan
 */
export interface PlanFeatures {
  /** Gestión de usuarios */
  userManagement: boolean;
  /** Gestión de roles personalizados */
  customRoles: boolean;
  /** Módulo de inventario */
  inventory: boolean;
  /** Módulo de ventas */
  sales: boolean;
  /** Módulo de compras */
  purchases: boolean;
  /** Módulo de contabilidad */
  accounting: boolean;
  /** Reportes avanzados */
  advancedReports: boolean;
  /** API Access */
  apiAccess: boolean;
  /** Soporte prioritario */
  prioritySupport: boolean;
  /** Almacenamiento en la nube */
  cloudStorage: boolean;
  /** Backup automático */
  autoBackup: boolean;
  /** Multi-moneda */
  multiCurrency: boolean;
  /** Integraciones de terceros */
  thirdPartyIntegrations: boolean;
  /** Auditoría avanzada */
  advancedAudit: boolean;
}

/**
 * Límites del plan
 */
export interface PlanLimits {
  /** Número máximo de usuarios */
  maxUsers: number;
  /** Número máximo de empresas */
  maxCompanies: number;
  /** Almacenamiento en MB */
  storageLimit: number;
  /** Transacciones mensuales */
  monthlyTransactions: number;
  /** Documentos por mes */
  monthlyDocuments: number;
  /** Productos en inventario */
  maxProducts: number;
}

/**
 * Precio del plan
 */
export interface PlanPrice {
  /** Precio mensual */
  monthly: number;
  /** Precio anual */
  annual: number;
  /** Moneda */
  currency: string;
  /** Descuento anual en porcentaje */
  annualDiscount: number;
}

/**
 * Interfaz principal de Plan
 */
export interface IPlan {
  /** ID único del plan */
  _id?: string;
  /** Nombre del plan */
  name: string;
  /** Descripción del plan */
  description: string;
  /** Tipo de plan */
  type: PlanType;
  /** Estado del plan */
  status: PlanStatus;
  /** Precio del plan */
  price: PlanPrice;
  /** Límites del plan */
  limits: PlanLimits;
  /** Características del plan */
  features: PlanFeatures;
  /** Es el plan recomendado */
  isRecommended: boolean;
  /** Orden de visualización */
  displayOrder: number;
  /** Fecha de creación */
  createdAt?: Date;
  /** Fecha de actualización */
  updatedAt?: Date;
}

/**
 * DTO para crear un plan
 */
export type CreatePlanDTO = Omit<IPlan, "_id" | "createdAt" | "updatedAt">;

/**
 * DTO para actualizar un plan
 */
export type UpdatePlanDTO = Partial<CreatePlanDTO>;

/**
 * Response del API para planes
 */
export interface PlanApiResponse<T = IPlan> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Response del API para lista de planes
 */
export interface PlansListApiResponse {
  success: boolean;
  data: IPlan[];
  message?: string;
}
