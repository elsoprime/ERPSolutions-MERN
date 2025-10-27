/**
 * Enhanced Company Model for Multi-Company Architecture
 * @description: Modelo de empresa mejorado para arquitectura multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import mongoose, {Schema, Document, Types} from 'mongoose'

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

export interface IEnhancedCompany extends Document {
  // Información básica
  name: string
  slug: string // URL-friendly name
  description?: string
  website?: string

  // Información de contacto
  email: string
  phone?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }

  // Estado de la empresa
  status: 'active' | 'inactive' | 'suspended' | 'trial'
  plan: 'free' | 'basic' | 'professional' | 'enterprise'

  // Configuraciones
  settings: ICompanySettings

  // Metadata
  createdBy: Types.ObjectId
  ownerId: Types.ObjectId // Usuario dueño principal

  // Estadísticas
  stats: {
    totalUsers: number
    totalProducts: number
    lastActivity: Date
    storageUsed: number // en MB
  }

  // Fechas importantes
  trialEndsAt?: Date
  subscriptionEndsAt?: Date

  // Métodos
  isActive(): boolean
  canAddUser(): boolean
  getUsagePercentage(): {users: number; products: number; storage: number}
  isTrialExpired(): boolean
}

const CompanySettingsSchema = new Schema<ICompanySettings>(
  {
    businessType: {
      type: String,
      required: true,
      enum: [
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
      ]
    },
    industry: {
      type: String,
      required: true
    },
    taxId: {
      type: String,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: 'CLP',
      enum: ['CLP', 'USD', 'EUR', 'ARS', 'PEN', 'COL']
    },
    fiscalYear: {
      startMonth: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
        default: 1
      },
      endMonth: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
        default: 12
      }
    },
    features: {
      inventory: {type: Boolean, default: true},
      accounting: {type: Boolean, default: false},
      hrm: {type: Boolean, default: false},
      crm: {type: Boolean, default: false},
      projects: {type: Boolean, default: false}
    },
    limits: {
      maxUsers: {type: Number, default: 5},
      maxProducts: {type: Number, default: 100},
      maxTransactions: {type: Number, default: 1000},
      storageGB: {type: Number, default: 1}
    },
    branding: {
      logo: {type: String, default: null},
      primaryColor: {type: String, default: '#3B82F6'},
      secondaryColor: {type: String, default: '#64748B'},
      favicon: {type: String, default: null}
    },
    notifications: {
      emailDomain: {type: String, default: null},
      smsProvider: {type: String, default: null},
      webhookUrl: {type: String, default: null}
    }
  },
  {
    _id: false
  }
)

const EnhancedCompanySchema = new Schema<IEnhancedCompany>(
  {
    // Información básica
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/
    },
    description: {
      type: String,
      maxlength: 500,
      default: null
    },
    website: {
      type: String,
      default: null
    },

    // Información de contacto
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: {type: String, required: true},
      city: {type: String, required: true},
      state: {type: String, required: true},
      country: {type: String, required: true, default: 'Chile'},
      postalCode: {type: String, required: true}
    },

    // Estado de la empresa
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'trial'],
      default: 'trial'
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free'
    },

    // Configuraciones
    settings: {
      type: CompanySettingsSchema,
      required: true
    },

    // Metadata
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Estadísticas
    stats: {
      totalUsers: {type: Number, default: 0},
      totalProducts: {type: Number, default: 0},
      lastActivity: {type: Date, default: Date.now},
      storageUsed: {type: Number, default: 0} // en MB
    },

    // Fechas importantes
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    },
    subscriptionEndsAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
)

// Métodos de instancia
EnhancedCompanySchema.methods.isActive = function (): boolean {
  return (
    this.status === 'active' ||
    (this.status === 'trial' && !this.isTrialExpired())
  )
}

EnhancedCompanySchema.methods.canAddUser = function (): boolean {
  return this.stats.totalUsers < this.settings.limits.maxUsers
}

EnhancedCompanySchema.methods.getUsagePercentage = function () {
  return {
    users: Math.round(
      (this.stats.totalUsers / this.settings.limits.maxUsers) * 100
    ),
    products: Math.round(
      (this.stats.totalProducts / this.settings.limits.maxProducts) * 100
    ),
    storage: Math.round(
      (this.stats.storageUsed / (this.settings.limits.storageGB * 1024)) * 100
    )
  }
}

EnhancedCompanySchema.methods.isTrialExpired = function (): boolean {
  return (
    this.status === 'trial' && this.trialEndsAt && new Date() > this.trialEndsAt
  )
}

// Middleware para generar slug automáticamente
EnhancedCompanySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Remover guiones duplicados
      .trim()
  }
  next()
})

// Índices para optimización
EnhancedCompanySchema.index({slug: 1}, {unique: true})
EnhancedCompanySchema.index({status: 1})
EnhancedCompanySchema.index({createdBy: 1})
EnhancedCompanySchema.index({ownerId: 1})
EnhancedCompanySchema.index({'settings.taxId': 1}, {unique: true})

const EnhancedCompany = mongoose.model<IEnhancedCompany>(
  'EnhancedCompany',
  EnhancedCompanySchema
)

export default EnhancedCompany
