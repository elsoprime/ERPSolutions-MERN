/**
 * Multi-Company User Management Interfaces
 * @description: Interfaces TypeScript para el sistema de gestión multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

// ====== ENUMS ======
export enum RoleType {
  GLOBAL = 'global',
  COMPANY = 'company'
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN_EMPRESA = 'admin_empresa',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial'
}

export enum CompanyPlan {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

// ====== ROLE INTERFACES ======
export interface IUserRole {
  roleType: RoleType
  role: UserRole
  companyId?: string
  permissions: string[]
  isActive: boolean
  assignedAt: Date
  assignedBy: string
}

// ====== USER INTERFACES ======
export interface IEnhancedUser {
  _id: string
  name: string
  email: string
  phone?: string
  status: UserStatus
  confirmed: boolean
  emailVerified: boolean
  roles: IUserRole[]
  primaryCompanyId?: string
  preferences: {
    language: 'es' | 'en'
    timezone: string
    theme: 'light' | 'dark' | 'auto'
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  createdBy?: string
}

export interface ICreateUserRequest {
  name: string
  email: string
  password: string
  phone?: string
  roleType: RoleType
  role: UserRole
  companyId?: string
  permissions?: string[]
}

export interface IUpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  status?: UserStatus
  password?: string
  preferences?: Partial<IEnhancedUser['preferences']>
  // Campos de rol (opcionales, para actualizar rol y permisos)
  role?: UserRole
  roleType?: RoleType
  companyId?: string
  permissions?: string[]
}

export interface IAssignRoleRequest {
  roleType: RoleType
  role: UserRole
  companyId?: string
  permissions?: string[]
}

// ====== COMPANY INTERFACES ======
export interface ICompanySettings {
  businessType: 'retail' | 'wholesale' | 'manufacturing' | 'service' | 'other'
  industry: string
  taxId: string
  currency: 'CLP' | 'USD' | 'EUR' | 'ARS' | 'PEN' | 'COL'
  fiscalYear: {
    startMonth: number
    endMonth: number
  }
  features: {
    inventory: boolean
    accounting: boolean
    hrm: boolean
    crm: boolean
    projects: boolean
  }
  limits: {
    maxUsers: number
    maxProducts: number
    maxTransactions: number
    storageGB: number
  }
  branding: {
    logo?: string
    primaryColor: string
    secondaryColor: string
    favicon?: string
  }
  notifications: {
    emailDomain?: string
    smsProvider?: string
    webhookUrl?: string
  }
}

export interface IEnhancedCompany {
  _id: string
  name: string
  slug: string
  description?: string
  website?: string
  email: string
  phone?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  status: CompanyStatus
  plan: CompanyPlan
  settings: ICompanySettings
  createdBy: string
  ownerId: string
  stats: {
    totalUsers: number
    totalProducts: number
    lastActivity: Date
    storageUsed: number
  }
  trialEndsAt?: Date
  subscriptionEndsAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ICreateCompanyRequest {
  name: string
  slug: string
  description?: string
  website?: string
  email: string
  phone?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  plan?: CompanyPlan
  settings?: Partial<ICompanySettings>
}

export interface IUpdateCompanyRequest {
  name?: string
  description?: string
  website?: string
  email?: string
  phone?: string
  address?: Partial<IEnhancedCompany['address']>
  settings?: Partial<ICompanySettings>
}

export interface IUpdateCompanyPlanRequest {
  plan: CompanyPlan
  features?: Partial<ICompanySettings['features']>
  limits?: Partial<ICompanySettings['limits']>
}

// ====== RESPONSE INTERFACES ======
export interface IPaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface IApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
  error?: string
  details?: any[]
}

export interface IPaginatedResponse<T> {
  data: T[]
  pagination: IPaginationMeta
}

export interface IUserListResponse extends IPaginatedResponse<IEnhancedUser> {}
export interface ICompanyListResponse
  extends IPaginatedResponse<IEnhancedCompany> {}

export interface ICompanyStats {
  totalUsers: number
  activeUsers: number
  userLimit: number
  usagePercentage: number
  totalProducts: number
  lastActivity: Date
  storageUsed: number
}

// ====== PERMISSION INTERFACES ======
export interface IPermissionContext {
  global: string[]
  company: string[]
}

export interface ICompanyContext {
  id: string
  slug: string
  name: string
  canAccess: boolean
}

// ====== FORM INTERFACES ======
export interface IUserFormData {
  name: string
  email: string
  password?: string
  phone?: string
  role: UserRole
  companyId?: string
  permissions?: string[]
}

export interface ICompanyFormData {
  name: string
  slug: string
  description?: string
  website?: string
  email: string
  phone?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  plan: CompanyPlan
  businessType: ICompanySettings['businessType']
  industry: string
  taxId: string
  currency: ICompanySettings['currency']
}

// ====== FILTER INTERFACES ======
export interface IUserFilters {
  search?: string
  role?: UserRole
  status?: UserStatus
  companyId?: string
  page?: number
  limit?: number
}

export interface ICompanyFilters {
  search?: string
  status?: CompanyStatus
  plan?: CompanyPlan
  page?: number
  limit?: number
}

// ====== AUTH CONTEXT INTERFACES ======
export interface IAuthUser extends IEnhancedUser {
  permissions: IPermissionContext
  currentCompany?: ICompanyContext
}

export interface IAuthContext {
  user: IAuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchCompany: (companyId: string) => Promise<void>
  refreshUser: () => Promise<void>
  hasGlobalPermission: (permission: string) => boolean
  hasCompanyPermission: (permission: string) => boolean
  isSuperAdmin: () => boolean
  isCompanyAdmin: () => boolean
}
