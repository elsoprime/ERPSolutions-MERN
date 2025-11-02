/**
 * Enhanced Company Utilities
 * @description: Utilidades y helpers para el módulo de Enhanced Companies
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0
 * @updated: 28/10/2025
 */

import {
  CompanyStatus,
  SubscriptionPlan,
  BusinessType,
  Currency,
  ICompanyLimits,
  ICompanyFeatures,
  DEFAULT_PLAN_LIMITS,
  DEFAULT_PLAN_FEATURES
} from '../types/EnhandedCompanyTypes'

// ============ UTILIDADES DE VALIDACIÓN ============

export class CompanyValidationUtils {
  /**
   * Validar formato de RUT chileno
   */
  static validateChileanRUT(rut: string): boolean {
    if (!rut || typeof rut !== 'string') return false

    // Limpiar RUT
    const cleanRUT = rut.replace(/[^0-9kK]/g, '')

    if (cleanRUT.length < 8 || cleanRUT.length > 9) return false

    const rutNumber = cleanRUT.slice(0, -1)
    const verifier = cleanRUT.slice(-1).toUpperCase()

    // Calcular dígito verificador
    let sum = 0
    let multiplier = 2

    for (let i = rutNumber.length - 1; i >= 0; i--) {
      sum += parseInt(rutNumber.charAt(i)) * multiplier
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }

    const remainder = sum % 11
    const calculatedVerifier =
      remainder === 0
        ? '0'
        : remainder === 1
        ? 'K'
        : (11 - remainder).toString()

    return verifier === calculatedVerifier
  }

  /**
   * Validar formato de email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validar formato de teléfono
   */
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/
    return phoneRegex.test(phone) && phone.length >= 8 && phone.length <= 20
  }

  /**
   * Validar formato de slug
   */
  static validateSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9-]+$/
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
  }

  /**
   * Validar URL
   */
  static validateURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validar código de color hexadecimal
   */
  static validateHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexRegex.test(color)
  }
}

// ============ UTILIDADES DE TRANSFORMACIÓN ============

export class CompanyTransformUtils {
  /**
   * Generar slug desde nombre
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Remover guiones duplicados
      .trim()
      .substring(0, 50)
  }

  /**
   * Formatear RUT chileno
   */
  static formatChileanRUT(rut: string): string {
    const cleanRUT = rut.replace(/[^0-9kK]/g, '')
    if (cleanRUT.length < 8) return rut

    const rutNumber = cleanRUT.slice(0, -1)
    const verifier = cleanRUT.slice(-1)

    // Formatear con puntos y guión
    const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    return `${formattedNumber}-${verifier}`
  }

  /**
   * Formatear número de teléfono
   */
  static formatPhone(phone: string, countryCode: string = '+56'): string {
    const cleanPhone = phone.replace(/[^\d]/g, '')

    if (cleanPhone.startsWith('56')) {
      return `+${cleanPhone}`
    }

    if (cleanPhone.startsWith('9') && cleanPhone.length === 9) {
      return `${countryCode} ${cleanPhone}`
    }

    return phone
  }

  /**
   * Limpiar y formatear email
   */
  static formatEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  /**
   * Formatear dirección
   */
  static formatAddress(address: any): any {
    return {
      street: address.street?.trim(),
      city: address.city?.trim(),
      state: address.state?.trim(),
      country: address.country?.trim() || 'Chile',
      postalCode: address.postalCode?.trim()
    }
  }
}

// ============ UTILIDADES DE PLANES Y LÍMITES ============

export class CompanyPlanUtils {
  /**
   * Obtener límites según el plan
   */
  static getLimitsForPlan(plan: SubscriptionPlan): ICompanyLimits {
    return DEFAULT_PLAN_LIMITS[plan]
  }

  /**
   * Obtener funcionalidades según el plan
   */
  static getFeaturesForPlan(plan: SubscriptionPlan): ICompanyFeatures {
    return DEFAULT_PLAN_FEATURES[plan]
  }

  /**
   * Verificar si un plan puede usar una funcionalidad
   */
  static canUseFeature(
    plan: SubscriptionPlan,
    feature: keyof ICompanyFeatures
  ): boolean {
    return DEFAULT_PLAN_FEATURES[plan][feature]
  }

  /**
   * Calcular costo mensual del plan (simulado)
   */
  static getPlanMonthlyCost(
    plan: SubscriptionPlan,
    currency: Currency = Currency.CLP
  ): number {
    const costs = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.BASIC]: 29990,
      [SubscriptionPlan.PROFESSIONAL]: 79990,
      [SubscriptionPlan.ENTERPRISE]: 199990
    }

    const baseCost = costs[plan]

    // Conversión básica de monedas (en producción usar API real)
    const conversionRates = {
      [Currency.CLP]: 1,
      [Currency.USD]: 0.0011,
      [Currency.EUR]: 0.001,
      [Currency.ARS]: 0.94,
      [Currency.PEN]: 0.0041,
      [Currency.COP]: 4.5,
      [Currency.MXN]: 0.019,
      [Currency.BRL]: 0.0062
    }

    return Math.round(baseCost * conversionRates[currency])
  }

  /**
   * Obtener lista de planes disponibles con información
   */
  static getAvailablePlans() {
    return [
      {
        id: SubscriptionPlan.FREE,
        name: 'Gratuito',
        description: 'Ideal para comenzar',
        features: DEFAULT_PLAN_FEATURES[SubscriptionPlan.FREE],
        limits: DEFAULT_PLAN_LIMITS[SubscriptionPlan.FREE],
        monthlyCost: 0,
        recommended: false
      },
      {
        id: SubscriptionPlan.BASIC,
        name: 'Básico',
        description: 'Para pequeñas empresas',
        features: DEFAULT_PLAN_FEATURES[SubscriptionPlan.BASIC],
        limits: DEFAULT_PLAN_LIMITS[SubscriptionPlan.BASIC],
        monthlyCost: 29990,
        recommended: false
      },
      {
        id: SubscriptionPlan.PROFESSIONAL,
        name: 'Profesional',
        description: 'Para empresas en crecimiento',
        features: DEFAULT_PLAN_FEATURES[SubscriptionPlan.PROFESSIONAL],
        limits: DEFAULT_PLAN_LIMITS[SubscriptionPlan.PROFESSIONAL],
        monthlyCost: 79990,
        recommended: true
      },
      {
        id: SubscriptionPlan.ENTERPRISE,
        name: 'Empresarial',
        description: 'Para grandes organizaciones',
        features: DEFAULT_PLAN_FEATURES[SubscriptionPlan.ENTERPRISE],
        limits: DEFAULT_PLAN_LIMITS[SubscriptionPlan.ENTERPRISE],
        monthlyCost: 199990,
        recommended: false
      }
    ]
  }

  /**
   * Sugerir plan basado en uso actual
   */
  static suggestPlan(currentUsage: {
    users: number
    products: number
    transactions: number
    storage: number
  }): SubscriptionPlan {
    const plans = Object.values(SubscriptionPlan)

    for (const plan of plans) {
      const limits = DEFAULT_PLAN_LIMITS[plan]

      if (
        currentUsage.users <= limits.maxUsers &&
        currentUsage.products <= limits.maxProducts &&
        currentUsage.transactions <= limits.maxTransactions &&
        currentUsage.storage <= limits.storageGB * 1024
      ) {
        return plan
      }
    }

    return SubscriptionPlan.ENTERPRISE
  }
}

// ============ UTILIDADES DE ESTADO ============

export class CompanyStatusUtils {
  /**
   * Verificar si una empresa está activa
   */
  static isCompanyActive(status: CompanyStatus, trialEndsAt?: Date): boolean {
    if (status === CompanyStatus.ACTIVE) return true
    if (status === CompanyStatus.TRIAL && trialEndsAt) {
      return new Date() < trialEndsAt
    }
    return false
  }

  /**
   * Obtener próxima fecha de vencimiento
   */
  static getNextExpirationDate(
    status: CompanyStatus,
    trialEndsAt?: Date,
    subscriptionEndsAt?: Date
  ): Date | null {
    if (status === CompanyStatus.TRIAL && trialEndsAt) {
      return trialEndsAt
    }
    if (status === CompanyStatus.ACTIVE && subscriptionEndsAt) {
      return subscriptionEndsAt
    }
    return null
  }

  /**
   * Calcular días restantes hasta vencimiento
   */
  static getDaysUntilExpiration(
    status: CompanyStatus,
    trialEndsAt?: Date,
    subscriptionEndsAt?: Date
  ): number | null {
    const expirationDate = this.getNextExpirationDate(
      status,
      trialEndsAt,
      subscriptionEndsAt
    )

    if (!expirationDate) return null

    const now = new Date()
    const diffTime = expirationDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }

  /**
   * Verificar si está próximo a vencer
   */
  static isNearExpiration(
    status: CompanyStatus,
    trialEndsAt?: Date,
    subscriptionEndsAt?: Date,
    warningDays: number = 7
  ): boolean {
    const daysUntilExpiration = this.getDaysUntilExpiration(
      status,
      trialEndsAt,
      subscriptionEndsAt
    )

    if (daysUntilExpiration === null) return false

    return daysUntilExpiration <= warningDays
  }

  /**
   * Obtener etiqueta de estado en español
   */
  static getStatusLabel(status: CompanyStatus): string {
    const labels = {
      [CompanyStatus.ACTIVE]: 'Activa',
      [CompanyStatus.INACTIVE]: 'Inactiva',
      [CompanyStatus.SUSPENDED]: 'Suspendida',
      [CompanyStatus.TRIAL]: 'Período de Prueba'
    }

    return labels[status] || 'Desconocido'
  }

  /**
   * Obtener color de estado para UI
   */
  static getStatusColor(status: CompanyStatus): string {
    const colors = {
      [CompanyStatus.ACTIVE]: '#10B981', // Verde
      [CompanyStatus.INACTIVE]: '#6B7280', // Gris
      [CompanyStatus.SUSPENDED]: '#EF4444', // Rojo
      [CompanyStatus.TRIAL]: '#F59E0B' // Amarillo
    }

    return colors[status] || '#6B7280'
  }
}

// ============ UTILIDADES DE INDUSTRIAS ============

export class CompanyIndustryUtils {
  /**
   * Obtener lista de industrias disponibles
   */
  static getAvailableIndustries(): string[] {
    return [
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
    ]
  }

  /**
   * Mapear tipo de negocio a industrias sugeridas
   */
  static getSuggestedIndustries(businessType: BusinessType): string[] {
    const mapping: Record<BusinessType, string[]> = {
      [BusinessType.RETAIL]: ['Comercio y Retail', 'Alimentos y Bebidas'],
      [BusinessType.MANUFACTURING]: ['Manufactura', 'Construcción'],
      [BusinessType.SERVICES]: ['Servicios Profesionales', 'Consultoría'],
      [BusinessType.TECHNOLOGY]: ['Tecnología y Software'],
      [BusinessType.HEALTHCARE]: ['Salud y Medicina'],
      [BusinessType.EDUCATION]: ['Educación'],
      [BusinessType.FINANCE]: ['Finanzas y Seguros'],
      [BusinessType.REAL_ESTATE]: ['Inmobiliaria'],
      [BusinessType.TRANSPORTATION]: ['Transporte y Logística'],
      [BusinessType.FOOD_BEVERAGE]: ['Alimentos y Bebidas'],
      [BusinessType.CONSULTING]: ['Consultoría', 'Servicios Profesionales'],
      [BusinessType.CONSTRUCTION]: ['Construcción'],
      [BusinessType.TOURISM]: ['Turismo y Hospitalidad'],
      [BusinessType.AGRICULTURE]: ['Agricultura'],
      [BusinessType.MINING_ENERGY]: ['Minería y Energía'],
      [BusinessType.MEDIA]: ['Medios y Comunicación'],
      [BusinessType.ENTERTAINMENT]: ['Arte y Entretenimiento'],
      [BusinessType.SPORTS]: ['Deportes y Recreación'],
      [BusinessType.GOVERNMENT]: ['Gobierno'],
      [BusinessType.NON_PROFIT]: ['Sin fines de lucro'],
      [BusinessType.OTHER]: ['Otros']
    }

    return mapping[businessType] || ['Otros']
  }
}

// ============ EXPORTACIÓN ============

export default {
  CompanyValidationUtils,
  CompanyTransformUtils,
  CompanyPlanUtils,
  CompanyStatusUtils,
  CompanyIndustryUtils
}
