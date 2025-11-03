/**
 * Enhanced Company Model for Multi-Company Architecture v2.0
 * @description: Modelo de empresa mejorado para arquitectura multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0
 * @updated: 28/10/2025
 */

import mongoose, {Schema, Document, Types} from 'mongoose'
import {
  IEnhancedCompany,
  ICompanySettings,
  ICompanyAddress,
  IFiscalYear,
  ICompanyFeatures,
  ICompanyLimits,
  ICompanyBranding,
  ICompanyNotifications,
  ICompanyStats,
  IUsagePercentage,
  CompanyStatus,
  SubscriptionPlan,
  BusinessType,
  Currency,
  DEFAULT_COMPANY_SETTINGS,
  DEFAULT_PLAN_LIMITS,
  DEFAULT_PLAN_FEATURES
} from '../types/EnhandedCompanyTypes'

// ============ INTERFACES EXTENDIDAS PARA MONGOOSE ============

export interface IEnhancedCompanyDocument
  extends Omit<IEnhancedCompany, '_id'>,
    Document {
  // Métodos de instancia
  isActive(): boolean
  canAddUser(): boolean
  getUsagePercentage(): IUsagePercentage
  isTrialExpired(): boolean
  updateStats(): Promise<void>
  upgradeToTrialExtended(days: number): Promise<void>
  changeSubscriptionPlan(newPlan: SubscriptionPlan): Promise<void>
  suspendCompany(reason: string, suspendedBy: Types.ObjectId): Promise<void>
  reactivateCompany(): Promise<void>
}

// ============ ESQUEMAS ANIDADOS ============

/**
 * Esquema para dirección de empresa
 */
const CompanyAddressSchema = new Schema<ICompanyAddress>(
  {
    street: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true,
      maxlength: [200, 'La dirección no puede exceder 200 caracteres']
    },
    city: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      trim: true,
      maxlength: [100, 'La ciudad no puede exceder 100 caracteres']
    },
    state: {
      type: String,
      required: [true, 'El estado/región es requerido'],
      trim: true,
      maxlength: [100, 'El estado no puede exceder 100 caracteres']
    },
    country: {
      type: String,
      required: [true, 'El país es requerido'],
      trim: true,
      default: 'Chile',
      maxlength: [100, 'El país no puede exceder 100 caracteres']
    },
    postalCode: {
      type: String,
      required: [true, 'El código postal es requerido'],
      trim: true,
      maxlength: [20, 'El código postal no puede exceder 20 caracteres']
    }
  },
  {_id: false}
)

/**
 * Esquema para año fiscal
 */
const FiscalYearSchema = new Schema<IFiscalYear>(
  {
    startMonth: {
      type: Number,
      required: true,
      min: [1, 'El mes de inicio debe ser entre 1 y 12'],
      max: [12, 'El mes de inicio debe ser entre 1 y 12'],
      default: 1
    },
    endMonth: {
      type: Number,
      required: true,
      min: [1, 'El mes de fin debe ser entre 1 y 12'],
      max: [12, 'El mes de fin debe ser entre 1 y 12'],
      default: 12
    }
  },
  {_id: false}
)

/**
 * Esquema para funcionalidades de empresa
 */
const CompanyFeaturesSchema = new Schema<ICompanyFeatures>(
  {
    inventory: {type: Boolean, default: true},
    accounting: {type: Boolean, default: false},
    hrm: {type: Boolean, default: false},
    crm: {type: Boolean, default: false},
    projects: {type: Boolean, default: false}
  },
  {_id: false}
)

/**
 * Esquema para límites de empresa
 */
const CompanyLimitsSchema = new Schema<ICompanyLimits>(
  {
    maxUsers: {
      type: Number,
      required: true,
      min: [1, 'El máximo de usuarios debe ser al menos 1'],
      default: 5
    },
    maxProducts: {
      type: Number,
      required: true,
      min: [1, 'El máximo de productos debe ser al menos 1'],
      default: 100
    },
    maxTransactions: {
      type: Number,
      required: true,
      min: [1, 'El máximo de transacciones debe ser al menos 1'],
      default: 1000
    },
    storageGB: {
      type: Number,
      required: true,
      min: [0.1, 'El almacenamiento debe ser al menos 0.1 GB'],
      default: 1
    }
  },
  {_id: false}
)

/**
 * Esquema para branding de empresa
 */
const CompanyBrandingSchema = new Schema<ICompanyBranding>(
  {
    logo: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string) {
          if (!v) return true
          return /^https?:\/\/.+/.test(v) || /^\//.test(v)
        },
        message: 'El logo debe ser una URL válida'
      }
    },
    primaryColor: {
      type: String,
      required: true,
      default: '#3B82F6',
      validate: {
        validator: function (v: string) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v)
        },
        message: 'El color primario debe ser un código hexadecimal válido'
      }
    },
    secondaryColor: {
      type: String,
      required: true,
      default: '#64748B',
      validate: {
        validator: function (v: string) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v)
        },
        message: 'El color secundario debe ser un código hexadecimal válido'
      }
    },
    favicon: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string) {
          if (!v) return true
          return /^https?:\/\/.+/.test(v) || /^\//.test(v)
        },
        message: 'El favicon debe ser una URL válida'
      }
    }
  },
  {_id: false}
)

/**
 * Esquema para notificaciones de empresa
 */
const CompanyNotificationsSchema = new Schema<ICompanyNotifications>(
  {
    emailDomain: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string) {
          if (!v) return true
          return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(
            v
          )
        },
        message: 'El dominio de email debe ser válido'
      }
    },
    smsProvider: {
      type: String,
      default: null,
      enum: {
        values: [null, 'twilio', 'aws_sns', 'nexmo', 'custom'],
        message: 'Proveedor SMS no válido'
      }
    },
    webhookUrl: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string) {
          if (!v) return true
          return /^https:\/\/.+/.test(v)
        },
        message: 'La URL del webhook debe ser HTTPS'
      }
    }
  },
  {_id: false}
)

/**
 * Esquema para configuraciones de empresa
 */
const CompanySettingsSchema = new Schema<ICompanySettings>(
  {
    businessType: {
      type: String,
      required: [true, 'El tipo de negocio es requerido'],
      enum: {
        values: Object.values(BusinessType),
        message: 'Tipo de negocio no válido'
      },
      default: BusinessType.OTHER
    },
    industry: {
      type: String,
      required: [true, 'La industria es requerida'],
      trim: true,
      maxlength: [100, 'La industria no puede exceder 100 caracteres'],
      default: 'Otros'
    },
    taxId: {
      type: String,
      required: [true, 'El ID fiscal/RUT es requerido'],
      trim: true,
      validate: {
        validator: function (v: string) {
          // Validación básica para RUT chileno o tax ID genérico
          return /^[\w\.-]+$/.test(v) && v.length >= 5 && v.length <= 20
        },
        message: 'ID fiscal/RUT no válido'
      }
    },
    currency: {
      type: String,
      required: [true, 'La moneda es requerida'],
      enum: {
        values: Object.values(Currency),
        message: 'Moneda no válida'
      },
      default: Currency.CLP
    },
    fiscalYear: {
      type: FiscalYearSchema,
      required: true,
      default: () => ({startMonth: 1, endMonth: 12})
    },
    features: {
      type: CompanyFeaturesSchema,
      required: true,
      default: () => DEFAULT_PLAN_FEATURES[SubscriptionPlan.FREE]
    },
    limits: {
      type: CompanyLimitsSchema,
      required: true,
      default: () => DEFAULT_PLAN_LIMITS[SubscriptionPlan.FREE]
    },
    branding: {
      type: CompanyBrandingSchema,
      required: true,
      default: () => ({
        primaryColor: '#3B82F6',
        secondaryColor: '#64748B'
      })
    },
    notifications: {
      type: CompanyNotificationsSchema,
      required: true,
      default: () => ({})
    }
  },
  {_id: false}
)

/**
 * Esquema para estadísticas de empresa
 */
const CompanyStatsSchema = new Schema<ICompanyStats>(
  {
    totalUsers: {
      type: Number,
      default: 0,
      min: [0, 'El total de usuarios no puede ser negativo']
    },
    totalProducts: {
      type: Number,
      default: 0,
      min: [0, 'El total de productos no puede ser negativo']
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    storageUsed: {
      type: Number,
      default: 0,
      min: [0, 'El almacenamiento usado no puede ser negativo']
    }
  },
  {_id: false}
)

// ============ ESQUEMA PRINCIPAL ============

/**
 * Esquema principal de Enhanced Company
 */
const EnhancedCompanySchema = new Schema<IEnhancedCompanyDocument>(
  {
    // Información básica
    name: {
      type: String,
      required: [true, 'El nombre de la empresa es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    slug: {
      type: String,
      required: [true, 'El slug es requerido'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[a-z0-9-]+$/.test(v) && v.length >= 3 && v.length <= 50
        },
        message:
          'El slug debe contener solo letras minúsculas, números y guiones'
      }
    },
    description: {
      type: String,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
      default: null
    },
    website: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string) {
          if (!v) return true
          return /^https?:\/\/.+/.test(v)
        },
        message: 'La URL del sitio web debe ser válida'
      }
    },

    // Información de contacto
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: 'Email no válido'
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true
          return (
            /^[\+]?[\d\s\-\(\)]+$/.test(v) && v.length >= 8 && v.length <= 20
          )
        },
        message: 'Número de teléfono no válido'
      }
    },
    address: {
      type: CompanyAddressSchema,
      required: [true, 'La dirección es requerida']
    },

    // Estado y plan
    status: {
      type: String,
      enum: {
        values: Object.values(CompanyStatus),
        message: 'Estado de empresa no válido'
      },
      default: CompanyStatus.TRIAL
    },
    plan: {
      type: String,
      enum: {
        values: Object.values(SubscriptionPlan),
        message: 'Plan de suscripción no válido'
      },
      default: SubscriptionPlan.FREE
    },

    // Configuraciones
    settings: {
      type: CompanySettingsSchema,
      required: true
    },

    // Metadata de usuarios
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'EnhancedUser',
      required: [true, 'El usuario creador es requerido']
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'EnhancedUser',
      required: [true, 'El propietario es requerido']
    },

    // Estadísticas
    stats: {
      type: CompanyStatsSchema,
      required: true,
      default: () => ({
        totalUsers: 0,
        totalProducts: 0,
        lastActivity: new Date(),
        storageUsed: 0
      })
    },

    // Fechas importantes
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    },
    subscriptionEndsAt: {
      type: Date,
      default: null
    },

    // Tracking de suspensión
    suspendedAt: {
      type: Date,
      default: null
    },
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'EnhancedUser',
      default: null
    },
    suspensionReason: {
      type: String,
      enum: {
        values: [
          null,
          'payment_failed',
          'manual_admin',
          'policy_violation',
          'user_request',
          'subscription_ended'
        ],
        message: 'Razón de suspensión no válida'
      },
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remover campos sensibles del JSON
        delete ret.__v
        return ret
      }
    },
    toObject: {virtuals: true}
  }
)

// ============ MÉTODOS DE INSTANCIA ============

/**
 * Verificar si la empresa está activa
 */
EnhancedCompanySchema.methods.isActive = function (): boolean {
  return (
    this.status === CompanyStatus.ACTIVE ||
    (this.status === CompanyStatus.TRIAL && !this.isTrialExpired())
  )
}

/**
 * Verificar si se pueden agregar más usuarios
 */
EnhancedCompanySchema.methods.canAddUser = function (): boolean {
  return this.stats.totalUsers < this.settings.limits.maxUsers
}

/**
 * Obtener porcentajes de uso de recursos
 */
EnhancedCompanySchema.methods.getUsagePercentage =
  function (): IUsagePercentage {
    const limits = this.settings.limits

    return {
      users: Math.round((this.stats.totalUsers / limits.maxUsers) * 100),
      products: Math.round(
        (this.stats.totalProducts / limits.maxProducts) * 100
      ),
      storage: Math.round(
        (this.stats.storageUsed / (limits.storageGB * 1024)) * 100
      )
    }
  }

/**
 * Verificar si el trial ha expirado
 */
EnhancedCompanySchema.methods.isTrialExpired = function (): boolean {
  return (
    this.status === CompanyStatus.TRIAL &&
    this.trialEndsAt &&
    new Date() > this.trialEndsAt
  )
}

/**
 * Actualizar estadísticas de la empresa
 */
EnhancedCompanySchema.methods.updateStats = async function (): Promise<void> {
  const EnhancedUser = mongoose.model('EnhancedUser')
  const Product = mongoose.model('Product') // Asumiendo que existe

  try {
    const [userCount, productCount] = await Promise.all([
      // Solo contar usuarios activos vinculados a esta empresa
      EnhancedUser.countDocuments({
        primaryCompanyId: this._id,
        status: 'active' // ✅ Filtrar solo usuarios activos
      }),
      Product?.countDocuments?.({companyId: this._id}) || 0
    ])

    this.stats.totalUsers = userCount
    this.stats.totalProducts = productCount
    this.stats.lastActivity = new Date()

    console.log(`📊 Stats actualizadas para empresa ${this._id}:`, {
      totalUsers: this.stats.totalUsers,
      totalProducts: this.stats.totalProducts
    })

    await this.save()
  } catch (error) {
    console.error('Error actualizando estadísticas de empresa:', error)
  }
}

/**
 * Extender período de trial
 */
EnhancedCompanySchema.methods.upgradeToTrialExtended = async function (
  days: number
): Promise<void> {
  const currentDate = new Date()
  const extendedDate = new Date(
    currentDate.getTime() + days * 24 * 60 * 60 * 1000
  )

  this.trialEndsAt = extendedDate
  this.status = CompanyStatus.TRIAL

  await this.save()
}

/**
 * Cambiar plan de suscripción
 */
EnhancedCompanySchema.methods.changeSubscriptionPlan = async function (
  newPlan: SubscriptionPlan
): Promise<void> {
  console.log('🔄 changeSubscriptionPlan llamado:', {
    planActual: this.plan,
    planNuevo: newPlan
  })

  // Actualizar plan (el middleware pre-save se encargará de actualizar límites y features)
  this.plan = newPlan

  // Si no es plan gratuito, activar la empresa
  if (newPlan !== SubscriptionPlan.FREE) {
    this.status = CompanyStatus.ACTIVE
    this.subscriptionEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
  }

  await this.save()

  console.log('✅ changeSubscriptionPlan completado:', {
    plan: this.plan,
    limits: this.settings.limits,
    features: this.settings.features
  })
}

/**
 * Suspender empresa y desactivar usuarios
 */
EnhancedCompanySchema.methods.suspendCompany = async function (
  reason: string,
  suspendedBy: Types.ObjectId
): Promise<void> {
  const EnhancedUser = mongoose.model('EnhancedUser')

  console.log('⏸️ Suspendiendo empresa:', {
    companyId: this._id,
    companyName: this.name,
    reason
  })

  // Actualizar estado de la empresa
  this.status = CompanyStatus.SUSPENDED
  this.suspendedAt = new Date()
  this.suspendedBy = suspendedBy
  this.suspensionReason = reason

  await this.save()

  // Desactivar TODOS los usuarios de la empresa (activos e inactivos)
  const result = await EnhancedUser.updateMany(
    {primaryCompanyId: this._id},
    {
      $set: {
        status: 'inactive',
        'roles.$[].isActive': false,
        deactivatedReason: 'company_suspended',
        deactivatedAt: new Date()
      }
    }
  )

  console.log('✅ Empresa suspendida:', {
    companyId: this._id,
    usuariosDesactivados: result.modifiedCount,
    matchedCount: result.matchedCount
  })

  // Verificar que los usuarios realmente se actualizaron
  const verifyUsers = await EnhancedUser.find({
    primaryCompanyId: this._id
  }).select('email status deactivatedReason')

  console.log('📊 Estado de usuarios después de suspensión:')
  verifyUsers.forEach(u => {
    console.log(
      `   - ${u.email}: status=${u.status}, reason=${u.deactivatedReason}`
    )
  })

  // Actualizar estadísticas
  await this.updateStats()
}

/**
 * Reactivar empresa y usuarios que estaban activos
 */
EnhancedCompanySchema.methods.reactivateCompany =
  async function (): Promise<void> {
    const EnhancedUser = mongoose.model('EnhancedUser')

    console.log('▶️ Reactivando empresa:', {
      companyId: this._id,
      companyName: this.name
    })

    // Cambiar estado de empresa
    this.status = CompanyStatus.ACTIVE
    this.suspendedAt = null
    this.suspendedBy = null
    this.suspensionReason = null

    await this.save()

    // Reactivar usuarios que pertenecen a esta empresa
    // Solo reactivamos los que fueron desactivados por la suspensión
    const result = await EnhancedUser.updateMany(
      {
        primaryCompanyId: this._id,
        status: 'inactive'
      },
      {
        $set: {
          status: 'active',
          'roles.$[elem].isActive': true
        }
      },
      {
        arrayFilters: [{'elem.companyId': this._id}]
      }
    )

    console.log('✅ Empresa reactivada:', {
      companyId: this._id,
      usuariosReactivados: result.modifiedCount
    })

    // Actualizar estadísticas
    await this.updateStats()
  }

// ============ MIDDLEWARES ============

/**
 * Middleware para generar slug automáticamente si no se proporciona
 */
EnhancedCompanySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Remover guiones duplicados
      .trim()
      .substring(0, 50) // Limitar longitud
  }
  next()
})

/**
 * Middleware para actualizar límites automáticamente cuando cambia el plan
 */
EnhancedCompanySchema.pre('save', function (next) {
  if (this.isModified('plan')) {
    const newLimits = DEFAULT_PLAN_LIMITS[this.plan as SubscriptionPlan]
    const newFeatures = DEFAULT_PLAN_FEATURES[this.plan as SubscriptionPlan]

    console.log('🔧 Middleware pre-save: Plan modificado', {
      plan: this.plan,
      newLimits,
      currentLimits: this.settings.limits
    })

    // Actualizar límites según el nuevo plan (permitir tanto upgrades como downgrades)
    this.settings.limits = {...newLimits}

    // Actualizar funcionalidades según el nuevo plan
    this.settings.features = {...newFeatures}

    console.log('✅ Middleware pre-save: Límites actualizados', {
      newLimits: this.settings.limits,
      newFeatures: this.settings.features
    })
  }
  next()
})

/**
 * Middleware para validar fechas de suscripción
 */
EnhancedCompanySchema.pre('save', function (next) {
  // Si es plan gratuito, limpiar fecha de suscripción
  if (this.plan === SubscriptionPlan.FREE) {
    this.subscriptionEndsAt = null
  }

  // Si no es trial, limpiar fecha de trial
  if (this.status !== CompanyStatus.TRIAL) {
    this.trialEndsAt = null
  }

  next()
})

// ============ ÍNDICES ============

// Índices únicos
EnhancedCompanySchema.index({slug: 1}, {unique: true})
EnhancedCompanySchema.index({'settings.taxId': 1}, {unique: true})

// Índices de consulta
EnhancedCompanySchema.index({status: 1, plan: 1})
EnhancedCompanySchema.index({createdBy: 1})
EnhancedCompanySchema.index({ownerId: 1})
EnhancedCompanySchema.index({email: 1})
EnhancedCompanySchema.index({'settings.industry': 1})
EnhancedCompanySchema.index({'settings.businessType': 1})

// Índices de fechas
EnhancedCompanySchema.index({trialEndsAt: 1})
EnhancedCompanySchema.index({subscriptionEndsAt: 1})
EnhancedCompanySchema.index({createdAt: -1})

// Índice de texto para búsqueda
EnhancedCompanySchema.index(
  {
    name: 'text',
    description: 'text',
    email: 'text',
    'settings.industry': 'text'
  },
  {
    weights: {
      name: 10,
      email: 5,
      description: 2,
      'settings.industry': 1
    }
  }
)

// ============ MÉTODOS ESTÁTICOS ============

/**
 * Buscar empresa por slug o ID
 */
EnhancedCompanySchema.statics.findBySlugOrId = function (identifier: string) {
  if (Types.ObjectId.isValid(identifier)) {
    return this.findById(identifier)
  }
  return this.findOne({slug: identifier})
}

/**
 * Obtener empresas activas
 */
EnhancedCompanySchema.statics.findActive = function () {
  return this.find({
    $or: [
      {status: CompanyStatus.ACTIVE},
      {
        status: CompanyStatus.TRIAL,
        trialEndsAt: {$gt: new Date()}
      }
    ]
  })
}

/**
 * Obtener empresas con trial expirado
 */
EnhancedCompanySchema.statics.findTrialExpired = function () {
  return this.find({
    status: CompanyStatus.TRIAL,
    trialEndsAt: {$lte: new Date()}
  })
}

// ============ EXPORTACIÓN ============

const EnhancedCompany = mongoose.model<IEnhancedCompanyDocument>(
  'EnhancedCompany',
  EnhancedCompanySchema
)

export default EnhancedCompany
