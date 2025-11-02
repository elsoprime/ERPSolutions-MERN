/**
 * Enhanced Company Types - Sistema ERP Multiempresa
 * @description: Tipos y interfaces para el sistema de gestión de empresas mejorado
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0
 * @updated: 28/10/2025
 */

import {Types} from 'mongoose'

// ============ ENUMS Y CONSTANTES ============

export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial'
}

export enum SubscriptionPlan {
  TRIAL = 'trial',
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export enum BusinessType {
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  SERVICES = 'services',
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  FINANCE = 'finance',
  REAL_ESTATE = 'real_estate',
  TRANSPORTATION = 'transportation',
  FOOD_BEVERAGE = 'food_beverage',
  CONSULTING = 'consulting',
  CONSTRUCTION = 'construction',
  TOURISM = 'tourism',
  AGRICULTURE = 'agriculture',
  MINING_ENERGY = 'mining_energy',
  MEDIA = 'media',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  GOVERNMENT = 'government',
  NON_PROFIT = 'non_profit',
  OTHER = 'other'
}

export enum Currency {
  CLP = 'CLP',
  USD = 'USD',
  EUR = 'EUR',
  ARS = 'ARS',
  PEN = 'PEN',
  COP = 'COP',
  MXN = 'MXN',
  BRL = 'BRL'
}

// ============ INTERFACES PRINCIPALES ============

/**
 * Dirección de la empresa
 */
export interface ICompanyAddress {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

/**
 * Año fiscal de la empresa
 */
export interface IFiscalYear {
  startMonth: number // 1-12
  endMonth: number // 1-12
}

/**
 * Funcionalidades habilitadas en la empresa
 */
export interface ICompanyFeatures {
  inventory: boolean
  accounting: boolean
  hrm: boolean
  crm: boolean
  projects: boolean
}

/**
 * Límites y cuotas de la empresa
 */
export interface ICompanyLimits {
  maxUsers: number
  maxProducts: number
  maxTransactions: number
  storageGB: number
}

/**
 * Configuración de marca de la empresa
 */
export interface ICompanyBranding {
  logo?: string
  primaryColor: string
  secondaryColor: string
  favicon?: string
}

/**
 * Configuraciones de notificaciones
 */
export interface ICompanyNotifications {
  emailDomain?: string
  smsProvider?: string
  webhookUrl?: string
}

/**
 * Configuraciones completas de la empresa
 */
export interface ICompanySettings {
  // Configuraciones de negocio
  businessType: BusinessType
  industry: string
  taxId: string
  currency: Currency
  fiscalYear: IFiscalYear

  // Funcionalidades
  features: ICompanyFeatures

  // Límites y cuotas
  limits: ICompanyLimits

  // Personalización
  branding: ICompanyBranding

  // Notificaciones
  notifications: ICompanyNotifications
}

/**
 * Estadísticas de uso de la empresa
 */
export interface ICompanyStats {
  totalUsers: number
  totalProducts: number
  lastActivity: Date
  storageUsed: number // en MB
}

/**
 * Porcentajes de uso de recursos
 */
export interface IUsagePercentage {
  users: number
  products: number
  storage: number
}

/**
 * Información de suscripción
 */
export interface ISubscriptionInfo {
  plan: SubscriptionPlan
  status: CompanyStatus
  startDate: Date
  endDate?: Date
  trialEndsAt?: Date
  subscriptionEndsAt?: Date
  autoRenew: boolean
}

// ============ INTERFACE PRINCIPAL ============

/**
 * Empresa Enhanced - Estructura principal
 */
export interface IEnhancedCompany {
  _id?: Types.ObjectId

  // Información básica
  name: string
  slug: string
  description?: string
  website?: string

  // Información de contacto
  email: string
  phone?: string
  address: ICompanyAddress

  // Estado y plan
  status: CompanyStatus
  plan: SubscriptionPlan

  // Configuraciones
  settings: ICompanySettings

  // Metadata de usuarios
  createdBy: Types.ObjectId
  ownerId: Types.ObjectId

  // Estadísticas
  stats: ICompanyStats

  // Fechas importantes
  trialEndsAt?: Date
  subscriptionEndsAt?: Date

  // Fechas del sistema
  createdAt: Date
  updatedAt: Date

  // Métodos (para el documento de Mongoose)
  isActive?(): boolean
  canAddUser?(): boolean
  getUsagePercentage?(): IUsagePercentage
  isTrialExpired?(): boolean
}

// ============ TIPOS PARA FORMULARIOS Y DTOs ============

/**
 * Datos para crear una nueva empresa
 */
export interface ICreateCompanyRequest {
  // Información básica
  name: string
  slug?: string
  description?: string
  website?: string

  // Información de contacto
  email: string
  phone?: string
  address: ICompanyAddress

  // Plan inicial
  plan?: SubscriptionPlan

  // Configuraciones iniciales
  settings?: Partial<ICompanySettings>
}

/**
 * Datos para actualizar una empresa
 */
export interface IUpdateCompanyRequest {
  // Información básica
  name?: string
  slug?: string
  description?: string
  website?: string

  // Información de contacto
  email?: string
  phone?: string
  address?: Partial<ICompanyAddress>

  // Estado y plan
  status?: CompanyStatus
  plan?: SubscriptionPlan

  // Configuraciones
  settings?: Partial<ICompanySettings>

  // Fechas importantes (solo para super admin)
  trialEndsAt?: Date
  subscriptionEndsAt?: Date
}

/**
 * Respuesta de empresa con información adicional
 */
export interface ICompanyResponse extends Omit<IEnhancedCompany, '_id'> {
  // ID como string para respuestas API
  _id: string

  // Información adicional computada
  usage: IUsagePercentage
  isActiveComputed: boolean
  canAddUserComputed: boolean
  isTrialExpiredComputed: boolean

  // Información de usuarios relacionados (opcional)
  totalUsers?: number
  ownerInfo?: {
    _id: string
    name: string
    email: string
  }
  creatorInfo?: {
    _id: string
    name: string
    email: string
  }
}

/**
 * Filtros para listado de empresas
 */
export interface ICompanyFilters {
  search?: string
  status?: CompanyStatus[]
  plan?: SubscriptionPlan[]
  businessType?: BusinessType[]
  industry?: string[]
  createdAfter?: Date
  createdBefore?: Date
  hasUsers?: boolean
  trialExpired?: boolean
}

/**
 * Opciones de paginación
 */
export interface IPaginationOptions {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Respuesta paginada de empresas
 */
export interface ICompanyListResponse {
  data: ICompanyResponse[]
  pagination: {
    currentPage: number
    totalPages: number
    total: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters?: ICompanyFilters
}

/**
 * Estadísticas globales de empresas (para Super Admin)
 */
export interface ICompaniesGlobalStats {
  totalCompanies: number
  activeCompanies: number
  suspendedCompanies: number
  trialCompanies: number

  planDistribution: Record<SubscriptionPlan, number>
  industryDistribution: Record<string, number>
  businessTypeDistribution: Record<BusinessType, number>

  recentActivity: Array<{
    companyId: string
    companyName: string
    action: string
    timestamp: Date
  }>

  monthlyGrowth: {
    newCompanies: number
    upgrades: number
    cancellations: number
  }
}

// ============ TIPOS DE ACCIONES ============

export type CompanyAction =
  | 'view'
  | 'edit'
  | 'delete'
  | 'suspend'
  | 'reactivate'
  | 'change_plan'
  | 'extend_trial'
  | 'view_users'
  | 'view_stats'

/**
 * Resultado de acciones sobre empresas
 */
export interface ICompanyActionResult {
  success: boolean
  message: string
  company?: ICompanyResponse
  error?: string
  code?: string
}

// ============ TIPOS PARA VALIDACIONES ============

/**
 * Errores de validación
 */
export interface ICompanyValidationError {
  field: string
  message: string
  code: string
  value?: any
}

/**
 * Resultado de validación
 */
export interface ICompanyValidationResult {
  isValid: boolean
  errors: ICompanyValidationError[]
}

// ============ CONSTANTES Y CONFIGURACIONES ============

/**
 * Límites por defecto según el plan
 */
export const DEFAULT_PLAN_LIMITS: Record<SubscriptionPlan, ICompanyLimits> = {
  [SubscriptionPlan.TRIAL]: {
    maxUsers: 5,
    maxProducts: 100,
    maxTransactions: 1000,
    storageGB: 1
  },

  [SubscriptionPlan.FREE]: {
    maxUsers: 2,
    maxProducts: 50,
    maxTransactions: 100,
    storageGB: 0.5
  },
  [SubscriptionPlan.BASIC]: {
    maxUsers: 10,
    maxProducts: 1000,
    maxTransactions: 5000,
    storageGB: 5
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    maxUsers: 25,
    maxProducts: 5000,
    maxTransactions: 25000,
    storageGB: 10
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxUsers: 100,
    maxProducts: 50000,
    maxTransactions: 100000,
    storageGB: 50
  }
}

/**
 * Funcionalidades por defecto según el plan
 */
export const DEFAULT_PLAN_FEATURES: Record<SubscriptionPlan, ICompanyFeatures> =
  {
    [SubscriptionPlan.TRIAL]: {
      inventory: true,
      accounting: true,
      hrm: true,
      crm: true,
      projects: true
    },
    [SubscriptionPlan.FREE]: {
      inventory: true,
      accounting: false,
      hrm: false,
      crm: false,
      projects: false
    },
    [SubscriptionPlan.BASIC]: {
      inventory: true,
      accounting: true,
      hrm: false,
      crm: false,
      projects: false
    },
    [SubscriptionPlan.PROFESSIONAL]: {
      inventory: true,
      accounting: true,
      hrm: true,
      crm: true,
      projects: false
    },
    [SubscriptionPlan.ENTERPRISE]: {
      inventory: true,
      accounting: true,
      hrm: true,
      crm: true,
      projects: true
    }
  }

/**
 * Configuraciones por defecto para nuevas empresas
 */
export const DEFAULT_COMPANY_SETTINGS: Omit<ICompanySettings, 'taxId'> = {
  businessType: BusinessType.OTHER,
  industry: 'Otros',
  currency: Currency.CLP,
  fiscalYear: {
    startMonth: 1,
    endMonth: 12
  },
  features: DEFAULT_PLAN_FEATURES[SubscriptionPlan.FREE],
  limits: DEFAULT_PLAN_LIMITS[SubscriptionPlan.FREE],
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B'
  },
  notifications: {}
}

// ============ HELPER TYPES ============

/**
 * Tipo para actualizaciones parciales de configuraciones
 */
export type PartialCompanySettings = {
  [K in keyof ICompanySettings]?: K extends
    | 'features'
    | 'limits'
    | 'branding'
    | 'notifications'
    | 'fiscalYear'
    ? Partial<ICompanySettings[K]>
    : ICompanySettings[K]
}

/**
 * Tipo para query de búsqueda
 */
export interface ICompanySearchQuery {
  text?: string
  filters?: ICompanyFilters
  pagination?: IPaginationOptions
}

// ============ EXPORTACIONES DE TIPOS LEGACY (para compatibilidad) ============

/**
 * @deprecated Usar IEnhancedCompany en su lugar
 */
export type EnhancedCompany = IEnhancedCompany

/**
 * @deprecated Usar ICreateCompanyRequest en su lugar
 */
export type CreateCompanyData = ICreateCompanyRequest

/**
 * @deprecated Usar IUpdateCompanyRequest en su lugar
 */
export type UpdateCompanyData = IUpdateCompanyRequest
