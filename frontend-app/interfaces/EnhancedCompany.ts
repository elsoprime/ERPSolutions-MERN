/**
 * Enhanced Company Interfaces
 * @description: Interfaces TypeScript para el sistema de gestión de empresas Enhanced
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

export interface ICompanySettings {
  // Configuraciones de negocio
  businessType: string
  industry: string
  taxId: string
  currency: string
  fiscalYear: {
    startMonth: number // 1-12
    endMonth: number // 1-12
  }

  // Configuraciones de la aplicación
  features: {
    inventory: boolean
    accounting: boolean
    hrm: boolean
    crm: boolean
    projects: boolean
  }

  // Límites y cuotas
  limits: {
    maxUsers: number
    maxProducts: number
    maxTransactions: number
    storageGB: number
  }

  // Personalización
  branding: {
    logo?: string
    primaryColor: string
    secondaryColor: string
    favicon?: string
  }

  // Configuraciones de notificaciones
  notifications: {
    emailDomain?: string
    smsProvider?: string
    webhookUrl?: string
  }
}

export interface ICompanyStatistics {
  userCount: number
  productCount: number
  transactionCount: number
  storageUsed: number
  lastActivity: Date

  // Estadísticas de uso
  usage: {
    users: {
      current: number
      limit: number
      percentage: number
    }
    products: {
      current: number
      limit: number
      percentage: number
    }
    transactions: {
      current: number
      limit: number
      percentage: number
    }
    storage: {
      current: number
      limit: number
      percentage: number
    }
  }
}

export interface IEnhancedCompany {
  _id: string
  name: string
  slug: string
  description?: string
  website?: string
  phone?: string
  email: string

  // Ubicación
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }

  // Plan y estado de la empresa
  plan: 'free' | 'basic' | 'professional' | 'enterprise'
  status: 'active' | 'inactive' | 'suspended' | 'trial'

  // Información de suscripción (fechas)
  subscription: {
    status: 'trial' | 'active' | 'suspended' | 'cancelled'
    startDate: Date
    endDate?: Date
    autoRenew: boolean
  }

  // Configuraciones de la empresa
  settings: ICompanySettings

  // Estadísticas
  statistics: ICompanyStatistics
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

// Formularios y DTOs
export interface ICreateCompanyFormData {
  // Información básica
  name: string
  email: string
  description?: string
  website?: string
  phone?: string

  // Ubicación
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }

  // Configuraciones de negocio
  settings: {
    businessType: string
    industry: string
    taxId: string
    currency: string
    fiscalYear: {
      startMonth: number
      endMonth: number
    }
  }

  // Plan de suscripción
  subscription: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise'
    autoRenew: boolean
  }

  // Características habilitadas
  features: {
    inventory: boolean
    accounting: boolean
    hrm: boolean
    crm: boolean
    projects: boolean
  }

  // Personalización
  branding: {
    primaryColor: string
    secondaryColor: string
  }
}

export interface IUpdateCompanyFormData
  extends Partial<ICreateCompanyFormData> {
  _id: string
}

export interface ICompanyFilters {
  search?: string
  plan?: string
  status?: string
  industry?: string
  businessType?: string
}

export interface ICompanyListResponse {
  data: IEnhancedCompany[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Tipos para acciones
export type CompanyAction =
  | 'view'
  | 'edit'
  | 'suspend'
  | 'reactivate'
  | 'delete'

export interface ICompanyActionResult {
  success: boolean
  message: string
  company?: IEnhancedCompany
}

// Opciones para formularios
export const BUSINESS_TYPES = [
  'retail',
  'manufacturing',
  'services',
  'technology',
  'healthcare',
  'education',
  'finance',
  'real_estate',
  'transportation',
  'food_beverage',
  'consulting',
  'other'
] as const

export const INDUSTRIES = [
  'Tecnología y Software',
  'Comercio y Retail',
  'Manufactura',
  'Servicios Profesionales',
  'Salud y Medicina',
  'Educación',
  'Finanzas y Seguros',
  'Inmobiliaria',
  'Transporte y Logística',
  'Alimentos y Bebidas',
  'Consultoría',
  'Construcción',
  'Turismo y Hospitalidad',
  'Agricultura',
  'Minería y Energía',
  'Medios y Comunicación',
  'Arte y Entretenimiento',
  'Deportes y Recreación',
  'Gobierno',
  'Sin fines de lucro',
  'Otros'
] as const

export const CURRENCIES = [
  {code: 'CLP', symbol: '$', name: 'Peso Chileno'},
  {code: 'USD', symbol: '$', name: 'Dólar Estadounidense'},
  {code: 'EUR', symbol: '€', name: 'Euro'},
  {code: 'ARS', symbol: '$', name: 'Peso Argentino'},
  {code: 'PEN', symbol: 'S/', name: 'Sol Peruano'},
  {code: 'COP', symbol: '$', name: 'Peso Colombiano'},
  {code: 'MXN', symbol: '$', name: 'Peso Mexicano'},
  {code: 'BRL', symbol: 'R$', name: 'Real Brasileño'}
] as const

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Plan básico para comenzar',
    features: ['Hasta 2 usuarios', 'Funcionalidades básicas'],
    limits: {
      maxUsers: 2,
      maxProducts: 50,
      maxTransactions: 100,
      storageGB: 0.5
    }
  },
  {
    id: 'basic',
    name: 'Básico',
    description: 'Para pequeñas empresas',
    features: ['Hasta 10 usuarios', 'Inventario', 'HRM'],
    limits: {
      maxUsers: 10,
      maxProducts: 1000,
      maxTransactions: 5000,
      storageGB: 5
    }
  },
  {
    id: 'professional',
    name: 'Profesional',
    description: 'Para empresas en crecimiento',
    features: ['Hasta 25 usuarios', 'Todas las funcionalidades', 'Soporte'],
    limits: {
      maxUsers: 25,
      maxProducts: 5000,
      maxTransactions: 25000,
      storageGB: 10
    }
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    description: 'Para grandes organizaciones',
    features: [
      'Hasta 100 usuarios',
      'Funcionalidades completas',
      'Soporte premium'
    ],
    limits: {
      maxUsers: 100,
      maxProducts: 50000,
      maxTransactions: 100000,
      storageGB: 50
    }
  }
] as const

export type BusinessType = (typeof BUSINESS_TYPES)[number]
export type Industry = (typeof INDUSTRIES)[number]
export type Currency = (typeof CURRENCIES)[number]
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number]
