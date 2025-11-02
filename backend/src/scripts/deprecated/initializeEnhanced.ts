/**
 * Enhanced Database Initialization Script
 * @description: Script completo para inicializar la base de datos con EnhancedCompany, usuarios y roles
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import bcrypt from 'bcrypt'
import colors from 'colors'
import EnhancedCompany from '@/modules/companiesManagement/models/EnhancedCompany'
import {
  IEnhancedCompany,
  CompanyStatus,
  SubscriptionPlan,
  BusinessType,
  Currency
} from '@/modules/companiesManagement/types/EnhandedCompanyTypes'
import EnhancedUser from '@/modules/userManagement/models/EnhancedUser'
import mongoose from 'mongoose'

// ====== ENUMS Y CONSTANTES ======
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

// ====== FUNCIÓN PARA GENERAR SLUG ======
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones duplicados
    .trim()
}

// ====== DATOS DE INICIALIZACIÓN ======
const ENHANCED_COMPANIES_DATA: Partial<IEnhancedCompany>[] = [
  {
    name: 'ERP Solutions SPA',
    slug: 'erp-solutions-spa',
    description: 'Software ERP desarrollado por ELSOMEDIA - Empresa Principal',
    email: 'admin@erpsolutions.cl',
    phone: '+56 9 1234 5678',
    address: {
      street: 'Av. Providencia 1234',
      city: 'Santiago',
      state: 'Región Metropolitana',
      country: 'Chile',
      postalCode: '7500000'
    },
    status: CompanyStatus.ACTIVE,
    plan: SubscriptionPlan.ENTERPRISE,
    settings: {
      businessType: BusinessType.SERVICES,
      industry: 'Tecnología y Software',
      taxId: '77.123.456-7',
      currency: Currency.CLP,
      fiscalYear: {
        startMonth: 1,
        endMonth: 12
      },
      features: {
        inventory: true,
        accounting: true,
        hrm: true,
        crm: true,
        projects: true
      },
      limits: {
        maxUsers: 100,
        maxProducts: 50000,
        maxTransactions: 100000,
        storageGB: 50
      },
      branding: {
        logo: null,
        primaryColor: '#3B82F6',
        secondaryColor: '#64748B',
        favicon: null
      },
      notifications: {
        emailDomain: 'erpsolutions.cl',
        smsProvider: null,
        webhookUrl: null
      }
    },
    stats: {
      totalUsers: 0,
      totalProducts: 0,
      lastActivity: new Date(),
      storageUsed: 0
    },
    trialEndsAt: null,
    subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
  },
  {
    name: 'Demo Company SPA',
    slug: 'demo-company-spa',
    description: 'Empresa de demostración para testing del sistema ERP',
    email: 'demo@democompany.cl',
    phone: '+56 9 8765 4321',
    address: {
      street: 'Av. Las Condes 5678',
      city: 'Santiago',
      state: 'Región Metropolitana',
      country: 'Chile',
      postalCode: '7550000'
    },
    status: CompanyStatus.ACTIVE,
    plan: SubscriptionPlan.PROFESSIONAL,
    settings: {
      businessType: BusinessType.RETAIL,
      industry: 'Comercio y Retail',
      taxId: '76.987.654-3',
      currency: Currency.CLP,
      fiscalYear: {
        startMonth: 1,
        endMonth: 12
      },
      features: {
        inventory: true,
        accounting: true,
        hrm: false,
        crm: true,
        projects: false
      },
      limits: {
        maxUsers: 25,
        maxProducts: 5000,
        maxTransactions: 25000,
        storageGB: 10
      },
      branding: {
        logo: null,
        primaryColor: '#10B981',
        secondaryColor: '#6B7280',
        favicon: null
      },
      notifications: {
        emailDomain: 'democompany.cl',
        smsProvider: null,
        webhookUrl: null
      }
    },
    stats: {
      totalUsers: 0,
      totalProducts: 0,
      lastActivity: new Date(),
      storageUsed: 0
    },
    trialEndsAt: null,
    subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
  },
  {
    name: 'Test Industries LTDA',
    slug: 'test-industries-ltda',
    description:
      'Empresa industrial para testing de funcionalidades de manufactura',
    email: 'admin@testindustries.cl',
    phone: '+56 9 5555 7777',
    address: {
      street: 'Parque Industrial 123',
      city: 'Puente Alto',
      state: 'Región Metropolitana',
      country: 'Chile',
      postalCode: '8150000'
    },
    status: CompanyStatus.ACTIVE,
    plan: SubscriptionPlan.BASIC,
    settings: {
      businessType: BusinessType.MANUFACTURING,
      industry: 'Manufactura',
      taxId: '75.555.444-9',
      currency: Currency.CLP,
      fiscalYear: {
        startMonth: 1,
        endMonth: 12
      },
      features: {
        inventory: true,
        accounting: false,
        hrm: true,
        crm: false,
        projects: true
      },
      limits: {
        maxUsers: 10,
        maxProducts: 1000,
        maxTransactions: 5000,
        storageGB: 5
      },
      branding: {
        logo: null,
        primaryColor: '#F59E0B',
        secondaryColor: '#9CA3AF',
        favicon: null
      },
      notifications: {
        emailDomain: 'testindustries.cl',
        smsProvider: null,
        webhookUrl: null
      }
    },
    stats: {
      totalUsers: 0,
      totalProducts: 0,
      lastActivity: new Date(),
      storageUsed: 0
    },
    trialEndsAt: null,
    subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
  }
]

const USERS_DATA = [
  {
    name: 'Super Administrador',
    email: 'superadmin@erpsolutions.cl',
    password: 'SuperAdmin2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.SUPER_ADMIN,
    companyKey: null // Super admin no pertenece a una empresa específica
  },
  {
    name: 'Admin ERP Solutions',
    email: 'admin@erpsolutions.cl',
    password: 'AdminERP2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.ADMIN_EMPRESA,
    companyKey: 'ERP_SOLUTIONS'
  },
  {
    name: 'Manager Demo',
    email: 'manager@democompany.cl',
    password: 'Manager2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.MANAGER,
    companyKey: 'DEMO_COMPANY'
  },
  {
    name: 'Empleado Test',
    email: 'empleado@testindustries.cl',
    password: 'Employee2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.EMPLOYEE,
    companyKey: 'TEST_INDUSTRIES'
  },
  {
    name: 'Viewer Demo',
    email: 'viewer@democompany.cl',
    password: 'Viewer2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.VIEWER,
    companyKey: 'DEMO_COMPANY'
  }
]

// ====== FUNCIONES DE LOGGING ======
const logInfo = (message: string) => console.log(colors.blue(`ℹ️  ${message}`))
const logSuccess = (message: string) =>
  console.log(colors.green(`✅ ${message}`))
const logWarning = (message: string) =>
  console.log(colors.yellow(`⚠️  ${message}`))
const logError = (message: string) => console.log(colors.red(`❌ ${message}`))

// ====== FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ======
export async function initializeEnhancedCompanies(): Promise<
  Map<string, string>
> {
  logInfo('Inicializando empresas...')
  const companyIdMap = new Map<string, string>()

  try {
    for (const [index, companyData] of ENHANCED_COMPANIES_DATA.entries()) {
      const existingCompany = await EnhancedCompany.findOne({
        'settings.taxId': companyData.settings?.taxId
      })

      if (existingCompany) {
        logWarning(
          `Empresa ${existingCompany.name} (${existingCompany.settings.taxId}) ya existe`
        )

        // Mapear las empresas existentes
        if (index === 0) {
          companyIdMap.set('ERP_SOLUTIONS', existingCompany._id.toString())
        } else if (index === 1) {
          companyIdMap.set('DEMO_COMPANY', existingCompany._id.toString())
        } else if (index === 2) {
          companyIdMap.set('TEST_INDUSTRIES', existingCompany._id.toString())
        }
      } else {
        // Necesitamos un usuario Super Admin para asignar como creador
        const superAdmin = await EnhancedUser.findOne({
          role: UserRole.SUPER_ADMIN
        })
        let creatorId: mongoose.Types.ObjectId

        if (superAdmin) {
          creatorId = superAdmin._id as mongoose.Types.ObjectId
        } else {
          // Si no existe Super Admin, crear uno temporal
          const tempSuperAdmin = await EnhancedUser.create({
            name: 'Temp Super Admin',
            email: 'temp@system.com',
            password: await bcrypt.hash('TempPassword123!', 12),
            status: UserStatus.ACTIVE,
            confirmed: true,
            role: UserRole.SUPER_ADMIN
          })
          creatorId = tempSuperAdmin._id as mongoose.Types.ObjectId
        }

        // Asignar createdBy y ownerId
        const enhancedCompanyData = {
          ...companyData,
          createdBy: creatorId,
          ownerId: creatorId
        }

        const newCompany = await EnhancedCompany.create(enhancedCompanyData)
        logSuccess(`Empresa ${newCompany.name} creada exitosamente`)

        // Mapear las nuevas empresas
        if (index === 0) {
          companyIdMap.set('ERP_SOLUTIONS', newCompany._id.toString())
        } else if (index === 1) {
          companyIdMap.set('DEMO_COMPANY', newCompany._id.toString())
        } else if (index === 2) {
          companyIdMap.set('TEST_INDUSTRIES', newCompany._id.toString())
        }
      }
    }

    logSuccess('✨ Inicialización de empresas completada')
    return companyIdMap
  } catch (error) {
    logError(`Error inicializando empresas: ${error.message}`)
    throw error
  }
}

export async function initializeUsers(
  companyIdMap: Map<string, string>,
  includeTestUsers: boolean = false
): Promise<void> {
  logInfo('Inicializando usuarios...')

  try {
    for (const userData of USERS_DATA) {
      const existingUser = await EnhancedUser.findOne({email: userData.email})

      if (existingUser) {
        logWarning(
          `Usuario ${existingUser.name} (${existingUser.email}) ya existe`
        )
        continue
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 12)

      // Obtener el ID de la empresa si aplica
      let companyId = null
      if (userData.companyKey && companyIdMap.has(userData.companyKey)) {
        companyId = companyIdMap.get(userData.companyKey)
      }

      const newUser = await EnhancedUser.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        status: userData.status,
        confirmed: userData.confirmed,
        role: userData.role,
        companyId: companyId
          ? new mongoose.Types.ObjectId(companyId)
          : undefined
      })

      logSuccess(
        `Usuario ${newUser.name} (${userData.role}) creado exitosamente`
      )

      // Actualizar las estadísticas de la empresa
      if (companyId) {
        await EnhancedCompany.findByIdAndUpdate(companyId, {
          $inc: {'stats.totalUsers': 1}
        })

        // Actualizar ownerId si es admin de empresa
        if (userData.role === UserRole.ADMIN_EMPRESA) {
          await EnhancedCompany.findByIdAndUpdate(companyId, {
            ownerId: newUser._id
          })
        }
      }
    }

    logSuccess('✨ Inicialización de usuarios completada')
  } catch (error) {
    logError(`Error inicializando usuarios: ${error.message}`)
    throw error
  }
}

export async function getEnhancedDatabaseStatistics(): Promise<void> {
  try {
    const totalCompanies = await EnhancedCompany.countDocuments()
    const totalUsers = await EnhancedUser.countDocuments()

    logInfo('Estadísticas de la base de datos:')
    console.log(colors.cyan(`  • Total empresas: ${totalCompanies}`))
    console.log(colors.cyan(`  • Total usuarios: ${totalUsers}`))

    // Estadísticas por empresa
    const companiesWithStats = await EnhancedCompany.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'companyId',
          as: 'users'
        }
      },
      {
        $project: {
          name: 1,
          'settings.taxId': 1,
          'settings.industry': 1,
          email: 1,
          plan: 1,
          status: 1,
          userCount: {$size: '$users'}
        }
      }
    ])

    console.log(colors.cyan.bold('\n🏢 EMPRESAS REGISTRADAS:'))
    companiesWithStats.forEach((company, index) => {
      console.log(colors.cyan(`  ${index + 1}. ${company.name}`))
      console.log(colors.gray(`     RUT: ${company.settings.taxId}`))
      console.log(colors.gray(`     Industria: ${company.settings.industry}`))
      console.log(colors.gray(`     Email: ${company.email}`))
      console.log(colors.gray(`     Plan: ${company.plan}`))
      console.log(colors.gray(`     Usuarios: ${company.userCount}`))
    })

    // Estadísticas por rol
    const roleStats = await EnhancedUser.aggregate([
      {$group: {_id: '$role', count: {$sum: 1}}},
      {$sort: {_id: 1}}
    ])

    console.log(colors.cyan.bold('\n👥 USUARIOS POR ROL:'))
    roleStats.forEach(stat => {
      const roleIcon =
        {
          super_admin: '🔴',
          admin_empresa: '🔵',
          manager: '🟢',
          employee: '🟡',
          viewer: '⚪'
        }[stat._id] || '❓'

      const roleName =
        {
          super_admin: 'Super Admin',
          admin_empresa: 'Admin Empresa',
          manager: 'Manager',
          employee: 'Employee',
          viewer: 'Viewer'
        }[stat._id] || stat._id

      console.log(colors.cyan(`  ${roleIcon} ${roleName}: ${stat.count}`))
    })
  } catch (error) {
    logError(`Error obteniendo estadísticas: ${error.message}`)
    throw error
  }
}
