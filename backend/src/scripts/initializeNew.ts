/**
 * Database Initialization Script
 * @description: Script completo para inicializar la base de datos con empresas, usuarios y roles
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import bcrypt from 'bcrypt'
import colors from 'colors'
import Company from '@/models/Company'
import User from '@/modules/userManagement/models/User'

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

// ====== DATOS DE INICIALIZACIÓN ======
const COMPANIES_DATA = [
  {
    companyName: 'ERP Solutions SPA',
    rutOrDni: '77.123.456-7',
    description: 'Software ERP desarrollado por ELSOMEDIA - Empresa Principal',
    email: 'admin@erpsolutions.cl',
    incorporationDate: new Date('2024-01-01'),
    industry: 'Tecnología y Software',
    address: 'Av. Providencia 1234, Santiago, Chile',
    phoneNumber: '+56 9 1234 5678',
    facilities: []
  },
  {
    companyName: 'Demo Company SPA',
    rutOrDni: '76.987.654-3',
    description: 'Empresa de demostración para testing del sistema ERP',
    email: 'demo@democompany.cl',
    incorporationDate: new Date('2024-06-01'),
    industry: 'Comercio y Retail',
    address: 'Av. Las Condes 5678, Santiago, Chile',
    phoneNumber: '+56 9 8765 4321',
    facilities: []
  },
  {
    companyName: 'Test Industries LTDA',
    rutOrDni: '75.555.444-9',
    description: 'Empresa industrial para pruebas del módulo de manufactura',
    email: 'admin@testindustries.cl',
    incorporationDate: new Date('2024-03-15'),
    industry: 'Manufactura',
    address: 'Parque Industrial 999, Quilicura, Chile',
    phoneNumber: '+56 2 3456 7890',
    facilities: []
  }
]

const USERS_DATA = [
  {
    name: 'Super Administrador',
    email: 'superadmin@erpsolutions.cl',
    password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.SUPER_ADMIN,
    companyId: null // Super Admin no pertenece a una empresa específica
  },
  {
    name: 'Admin ERP Solutions',
    email: 'admin@erpsolutions.cl',
    password: process.env.ADMIN_PASSWORD || 'AdminERP2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.ADMIN_EMPRESA,
    companyId: 'ERP_SOLUTIONS' // Se asignará el ID real después
  },
  {
    name: 'Manager Demo',
    email: 'manager@democompany.cl',
    password: process.env.MANAGER_PASSWORD || 'Manager2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.MANAGER,
    companyId: 'DEMO_COMPANY'
  },
  {
    name: 'Empleado Test',
    email: 'empleado@testindustries.cl',
    password: process.env.EMPLOYEE_PASSWORD || 'Employee2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.EMPLOYEE,
    companyId: 'TEST_INDUSTRIES'
  },
  {
    name: 'Viewer Demo',
    email: 'viewer@democompany.cl',
    password: process.env.VIEWER_PASSWORD || 'Viewer2024!',
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.VIEWER,
    companyId: 'DEMO_COMPANY'
  }
]

// ====== FUNCIONES DE UTILIDAD ======
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

function logSuccess(message: string): void {
  console.log(colors.green.bold(`✅ ${message}`))
}

function logInfo(message: string): void {
  console.log(colors.cyan.bold(`ℹ️  ${message}`))
}

function logWarning(message: string): void {
  console.log(colors.yellow.bold(`⚠️  ${message}`))
}

function logError(message: string, error?: any): void {
  console.log(colors.red.bold(`❌ ${message}`))
  if (error) {
    console.error(colors.red(error))
  }
}

// ====== FUNCIONES DE CREACIÓN ======

/**
 * Crear o verificar empresas en la base de datos
 */
export async function initializeCompanies(): Promise<Map<string, string>> {
  const companyIdMap = new Map<string, string>()

  logInfo('Inicializando empresas...')

  try {
    for (const companyData of COMPANIES_DATA) {
      const existingCompany = await Company.findOne({
        rutOrDni: companyData.rutOrDni
      })

      if (existingCompany) {
        logWarning(
          `Empresa ${existingCompany.companyName} (${existingCompany.rutOrDni}) ya existe`
        )

        // Mapear según el RUT para facilitar la asignación
        if (companyData.rutOrDni === '77.123.456-7') {
          companyIdMap.set('ERP_SOLUTIONS', existingCompany._id.toString())
        } else if (companyData.rutOrDni === '76.987.654-3') {
          companyIdMap.set('DEMO_COMPANY', existingCompany._id.toString())
        } else if (companyData.rutOrDni === '75.555.444-9') {
          companyIdMap.set('TEST_INDUSTRIES', existingCompany._id.toString())
        }
      } else {
        const newCompany = await Company.create(companyData)
        logSuccess(`Empresa ${newCompany.companyName} creada exitosamente`)

        // Mapear según el RUT
        if (companyData.rutOrDni === '77.123.456-7') {
          companyIdMap.set('ERP_SOLUTIONS', newCompany._id.toString())
        } else if (companyData.rutOrDni === '76.987.654-3') {
          companyIdMap.set('DEMO_COMPANY', newCompany._id.toString())
        } else if (companyData.rutOrDni === '75.555.444-9') {
          companyIdMap.set('TEST_INDUSTRIES', newCompany._id.toString())
        }
      }
    }

    logSuccess(`✨ Inicialización de empresas completada`)
    return companyIdMap
  } catch (error) {
    logError('Error al inicializar empresas', error)
    throw error
  }
}

/**
 * Crear o verificar usuarios en la base de datos
 */
export async function initializeUsers(
  companyIdMap: Map<string, string>
): Promise<void> {
  logInfo('Inicializando usuarios...')

  try {
    for (const userData of USERS_DATA) {
      const existingUser = await User.findOne({email: userData.email})

      if (existingUser) {
        logWarning(
          `Usuario ${existingUser.name} (${existingUser.email}) ya existe`
        )

        // Verificar y actualizar contraseña si es necesario
        const passwordMatch = await bcrypt.compare(
          userData.password,
          existingUser.password
        )
        if (!passwordMatch) {
          const hashedPassword = await hashPassword(userData.password)
          await User.updateOne(
            {email: userData.email},
            {password: hashedPassword}
          )
          logInfo(`Contraseña actualizada para ${existingUser.name}`)
        }
      } else {
        // Preparar datos del usuario
        const hashedPassword = await hashPassword(userData.password)

        const userToCreate = {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          status: userData.status,
          confirmed: userData.confirmed,
          role: userData.role,
          companyId: null as any
        }

        // Asignar companyId si corresponde
        if (userData.companyId && userData.companyId !== null) {
          const companyId = companyIdMap.get(userData.companyId)
          if (companyId) {
            userToCreate.companyId = companyId
          } else {
            logWarning(`No se encontró empresa para ${userData.companyId}`)
          }
        }

        const newUser = await User.create(userToCreate)
        logSuccess(
          `Usuario ${newUser.name} (${newUser.role}) creado exitosamente`
        )
      }
    }

    logSuccess(`✨ Inicialización de usuarios completada`)
  } catch (error) {
    logError('Error al inicializar usuarios', error)
    throw error
  }
}

/**
 * Verificar y mostrar estadísticas de la base de datos
 */
export async function showDatabaseStats(): Promise<void> {
  try {
    logInfo('📊 Estadísticas de la base de datos:')

    const totalCompanies = await Company.countDocuments()
    const totalUsers = await User.countDocuments()

    console.log(colors.cyan(`  • Total empresas: ${totalCompanies}`))
    console.log(colors.cyan(`  • Total usuarios: ${totalUsers}`))

    // Estadísticas por rol
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: {$sum: 1}
        }
      },
      {
        $sort: {count: -1}
      }
    ])

    console.log(colors.cyan('  • Usuarios por rol:'))
    roleStats.forEach(stat => {
      console.log(colors.cyan(`    - ${stat._id}: ${stat.count}`))
    })

    // Estadísticas por empresa
    const companyStats = await User.aggregate([
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $group: {
          _id: '$companyId',
          companyName: {$first: {$arrayElemAt: ['$company.companyName', 0]}},
          count: {$sum: 1}
        }
      },
      {
        $sort: {count: -1}
      }
    ])

    console.log(colors.cyan('  • Usuarios por empresa:'))
    companyStats.forEach(stat => {
      const companyName = stat.companyName || 'Global (Super Admin)'
      console.log(colors.cyan(`    - ${companyName}: ${stat.count}`))
    })
  } catch (error) {
    logError('Error al obtener estadísticas', error)
  }
}

/**
 * Crear usuarios de prueba adicionales para testing
 */
export async function createTestUsers(
  companyIdMap: Map<string, string>
): Promise<void> {
  logInfo('Creando usuarios de prueba adicionales...')

  const testUsers = [
    {
      name: 'Test Manager',
      email: 'testmanager@erpsolutions.cl',
      password: 'TestManager2024!',
      role: UserRole.MANAGER,
      companyId: 'ERP_SOLUTIONS'
    },
    {
      name: 'Test Employee',
      email: 'testemployee@erpsolutions.cl',
      password: 'TestEmployee2024!',
      role: UserRole.EMPLOYEE,
      companyId: 'ERP_SOLUTIONS'
    },
    {
      name: 'Demo Admin',
      email: 'demoadmin@democompany.cl',
      password: 'DemoAdmin2024!',
      role: UserRole.ADMIN_EMPRESA,
      companyId: 'DEMO_COMPANY'
    }
  ]

  try {
    for (const userData of testUsers) {
      const existingUser = await User.findOne({email: userData.email})

      if (!existingUser) {
        const hashedPassword = await hashPassword(userData.password)
        const companyId = companyIdMap.get(userData.companyId)

        await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          status: UserStatus.ACTIVE,
          confirmed: true,
          role: userData.role,
          companyId: companyId
        })

        logSuccess(`Usuario de prueba ${userData.name} creado`)
      }
    }
  } catch (error) {
    logError('Error al crear usuarios de prueba', error)
  }
}

/**
 * Función principal de inicialización
 */
export async function initializeDatabase(
  includeTestUsers = false
): Promise<void> {
  console.log(
    colors.bold.blue('🚀 Iniciando configuración de base de datos...')
  )
  console.log(colors.bold.blue('='.repeat(60)))

  try {
    // 1. Inicializar empresas
    const companyIdMap = await initializeCompanies()

    // 2. Inicializar usuarios principales
    await initializeUsers(companyIdMap)

    // 3. Crear usuarios de prueba si se solicita
    if (includeTestUsers) {
      await createTestUsers(companyIdMap)
    }

    // 4. Mostrar estadísticas
    await showDatabaseStats()

    console.log(colors.bold.blue('='.repeat(60)))
    console.log(
      colors.bold.green(
        '🎉 Inicialización de base de datos completada exitosamente!'
      )
    )

    // Mostrar credenciales importantes
    console.log(colors.bold.yellow('\n📝 CREDENCIALES IMPORTANTES:'))
    console.log(
      colors.yellow('Super Admin: superadmin@erpsolutions.cl / SuperAdmin2024!')
    )
    console.log(
      colors.yellow('Admin ERP: admin@erpsolutions.cl / AdminERP2024!')
    )
    console.log(
      colors.yellow('Manager Demo: manager@democompany.cl / Manager2024!')
    )
    console.log(
      colors.yellow('Employee Test: empleado@testindustries.cl / Employee2024!')
    )
    console.log(
      colors.yellow('Viewer Demo: viewer@democompany.cl / Viewer2024!')
    )
  } catch (error) {
    logError('❌ Error en la inicialización de la base de datos', error)
    throw error
  }
}

// ====== FUNCIONES DE COMPATIBILIDAD (LEGACY) ======

/**
 * Función legacy para compatibilidad - obtener o crear empresa principal
 */
export async function getOrCreateCompany(): Promise<string> {
  const companyIdMap = await initializeCompanies()
  return companyIdMap.get('ERP_SOLUTIONS') || ''
}

/**
 * Función legacy para compatibilidad - inicializar usuario admin
 */
export async function initializeAdminUser(): Promise<string> {
  const companyIdMap = await initializeCompanies()
  await initializeUsers(companyIdMap)
  return 'admin@erpsolutions.cl'
}

// ====== EXPORTACIÓN POR DEFECTO ======
export default {
  initializeDatabase,
  initializeCompanies,
  initializeUsers,
  createTestUsers,
  showDatabaseStats,
  getOrCreateCompany,
  initializeAdminUser
}
