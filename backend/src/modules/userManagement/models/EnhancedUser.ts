/**
 * Enhanced User Model for Multi-Company Architecture
 * @description: Modelo de usuario mejorado para arquitectura multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import mongoose, {Schema, Document, Types} from 'mongoose'
import bcrypt from 'bcrypt'
// Importar EnhancedCompany para asegurar que el modelo esté registrado antes de usarlo en refs
import '../../companiesManagement/models/EnhancedCompany'

// Definir tipos de roles globales vs empresariales
export type GlobalRole = 'super_admin' | 'system_admin'
export type CompanyRole = 'admin_empresa' | 'manager' | 'employee' | 'viewer'

export interface IUserRole {
  roleType: 'global' | 'company'
  role: GlobalRole | CompanyRole
  companyId?: Types.ObjectId // Solo requerido para roles de empresa
  permissions?: string[] // Permisos adicionales específicos
  isActive: boolean
  assignedAt: Date
  assignedBy: Types.ObjectId
}

export interface IUser extends Document {
  // Información básica
  name: string
  email: string
  password: string
  avatar?: string
  phone?: string

  // Estado del usuario
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  confirmed: boolean
  emailVerified: boolean

  // Sistema multiempresa
  roles: IUserRole[] // Array de roles (puede tener roles en múltiples empresas)
  primaryCompanyId?: Types.ObjectId // Empresa principal del usuario

  // Metadata
  lastLogin?: Date
  loginCount: number
  createdBy?: Types.ObjectId
  deactivatedReason?:
    | 'manual'
    | 'company_suspended'
    | 'policy_violation'
    | 'other'
  deactivatedAt?: Date

  // Configuraciones personales
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }

  // Métodos del modelo
  hasGlobalRole(): boolean
  hasRoleInCompany(companyId: Types.ObjectId): boolean
  getHighestRoleInCompany(companyId: Types.ObjectId): CompanyRole | null
  canAccessCompany(companyId: Types.ObjectId): boolean
  getAllCompanies(): Types.ObjectId[]
  checkPassword(candidatePassword: string): Promise<boolean>
}

const UserRoleSchema = new Schema<IUserRole>(
  {
    roleType: {
      type: String,
      enum: ['global', 'company'],
      required: true
    },
    role: {
      type: String,
      required: true,
      validate: {
        validator: function (this: IUserRole, value: string) {
          if (this.roleType === 'global') {
            return ['super_admin', 'system_admin'].includes(value)
          } else {
            return ['admin_empresa', 'manager', 'employee', 'viewer'].includes(
              value
            )
          }
        },
        message: 'Rol inválido para el tipo especificado'
      }
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'EnhancedCompany',
      required: function (this: IUserRole) {
        return this.roleType === 'company'
      }
    },
    permissions: [
      {
        type: String
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    _id: false // No generar ID para subdocumentos
  }
)

const UserSchema = new Schema<IUser>(
  {
    // Información básica
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    avatar: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      trim: true
    },

    // Estado del usuario
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'pending'
    },
    confirmed: {
      type: Boolean,
      default: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },

    // Sistema multiempresa
    roles: [UserRoleSchema],
    primaryCompanyId: {
      type: Schema.Types.ObjectId,
      ref: 'EnhancedCompany',
      default: null
    },

    // Metadata
    lastLogin: {
      type: Date,
      default: null
    },
    loginCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deactivatedReason: {
      type: String,
      enum: ['manual', 'company_suspended', 'policy_violation', 'other'],
      default: null
    },
    deactivatedAt: {
      type: Date,
      default: null
    },

    // Configuraciones personales
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      },
      language: {
        type: String,
        default: 'es'
      },
      timezone: {
        type: String,
        default: 'America/Santiago'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        push: {
          type: Boolean,
          default: true
        },
        sms: {
          type: Boolean,
          default: false
        }
      }
    }
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
)

// Métodos de instancia
UserSchema.methods.hasGlobalRole = function (): boolean {
  return this.roles.some(
    (role: IUserRole) => role.roleType === 'global' && role.isActive
  )
}

UserSchema.methods.hasRoleInCompany = function (
  companyId: Types.ObjectId
): boolean {
  return this.roles.some(
    (role: IUserRole) =>
      role.roleType === 'company' &&
      role.companyId?.toString() === companyId.toString() &&
      role.isActive
  )
}

UserSchema.methods.getHighestRoleInCompany = function (
  companyId: Types.ObjectId
): CompanyRole | null {
  const companyRoles = this.roles.filter(
    (role: IUserRole) =>
      role.roleType === 'company' &&
      role.companyId?.toString() === companyId.toString() &&
      role.isActive
  )

  if (companyRoles.length === 0) return null

  // Jerarquía de roles (mayor a menor)
  const hierarchy: CompanyRole[] = [
    'admin_empresa',
    'manager',
    'employee',
    'viewer'
  ]

  for (const hierarchyRole of hierarchy) {
    if (companyRoles.some(role => role.role === hierarchyRole)) {
      return hierarchyRole
    }
  }

  return null
}

UserSchema.methods.canAccessCompany = function (
  companyId: Types.ObjectId
): boolean {
  // Super admins pueden acceder a todas las empresas
  if (this.hasGlobalRole()) return true

  // Verificar si tiene rol específico en la empresa
  return this.hasRoleInCompany(companyId)
}

UserSchema.methods.getAllCompanies = function (): Types.ObjectId[] {
  return this.roles
    .filter((role: IUserRole) => role.roleType === 'company' && role.isActive)
    .map((role: IUserRole) => role.companyId!)
    .filter(
      (id: Types.ObjectId, index: number, self: Types.ObjectId[]) =>
        index ===
        self.findIndex(otherId => otherId.toString() === id.toString())
    ) // Eliminar duplicados
}

UserSchema.methods.checkPassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    console.error('Error al verificar contraseña:', error)
    return false
  }
}

// Índices para optimización
UserSchema.index(
  {email: 1},
  {unique: true, collation: {locale: 'en', strength: 2}}
)
UserSchema.index({'roles.companyId': 1})
UserSchema.index({'roles.role': 1})
UserSchema.index({status: 1})
UserSchema.index({confirmed: 1})

const EnhancedUser = mongoose.model<IUser>('EnhancedUser', UserSchema)

export default EnhancedUser
