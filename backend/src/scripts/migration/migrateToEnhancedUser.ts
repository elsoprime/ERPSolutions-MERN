/**
 * Script de Migración de Datos: User.ts → EnhancedUser.ts
 * @description: Migra datos existentes del modelo legacy User al nuevo modelo EnhancedUser
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @date: 28/10/2025
 */

import {config} from 'dotenv'
import mongoose from 'mongoose'
import colors from 'colors'
import bcrypt from 'bcrypt'

// Cargar variables de entorno
config()

// Función simple de conexión sin inicialización automática
async function connectToDatabase() {
  const DATABASE = process.env.DATABASE_URL

  if (!DATABASE) {
    throw new Error('La URL de la base de datos no está definida')
  }

  await mongoose.connect(DATABASE)
  console.log(colors.green('✅ Conexión establecida exitosamente'))
}

// Importar ambos modelos
import User from '@/modules/userManagement/models/User' // Legacy
import EnhancedUser, {
  IUser as IEnhancedUser,
  IUserRole,
  GlobalRole,
  CompanyRole
} from '@/modules/userManagement/models/EnhancedUser'

// Mapeo de roles legacy a nuevos roles
const ROLE_MAPPING = {
  super_admin: {roleType: 'global' as const, role: 'super_admin' as GlobalRole},
  admin: {roleType: 'global' as const, role: 'super_admin' as GlobalRole},
  admin_empresa: {
    roleType: 'company' as const,
    role: 'admin_empresa' as CompanyRole
  },
  company_admin: {
    roleType: 'company' as const,
    role: 'admin_empresa' as CompanyRole
  },
  manager: {roleType: 'company' as const, role: 'manager' as CompanyRole},
  employee: {roleType: 'company' as const, role: 'employee' as CompanyRole},
  user: {roleType: 'company' as const, role: 'employee' as CompanyRole},
  viewer: {roleType: 'company' as const, role: 'viewer' as CompanyRole},
  readonly: {roleType: 'company' as const, role: 'viewer' as CompanyRole}
}

interface MigrationStats {
  totalUsers: number
  migratedUsers: number
  skippedUsers: number
  errors: number
  duplicates: number
}

class UserMigrationService {
  private stats: MigrationStats = {
    totalUsers: 0,
    migratedUsers: 0,
    skippedUsers: 0,
    errors: 0,
    duplicates: 0
  }

  async migrateAllUsers(): Promise<MigrationStats> {
    try {
      console.log(colors.cyan.bold('🚀 Iniciando migración de usuarios...'))
      console.log(
        '============================================================'
      )

      // Obtener todos los usuarios legacy
      const legacyUsers = await User.find({})
      this.stats.totalUsers = legacyUsers.length

      console.log(
        colors.yellow(`📊 Total de usuarios a migrar: ${this.stats.totalUsers}`)
      )

      if (this.stats.totalUsers === 0) {
        console.log(colors.yellow('⚠️  No hay usuarios para migrar'))
        return this.stats
      }

      // Procesar cada usuario
      for (const legacyUser of legacyUsers) {
        try {
          await this.migrateUser(legacyUser)
        } catch (error) {
          this.stats.errors++
          console.log(
            colors.red(`❌ Error migrando usuario ${legacyUser.email}:`),
            error
          )
        }
      }

      // Mostrar estadísticas finales
      this.showMigrationStats()

      return this.stats
    } catch (error) {
      console.error(colors.red('❌ Error en migración general:'), error)
      throw error
    }
  }

  private async migrateUser(legacyUser: any): Promise<void> {
    try {
      // Verificar si el usuario ya existe en EnhancedUser
      const existingEnhancedUser = await EnhancedUser.findOne({
        email: legacyUser.email
      })

      if (existingEnhancedUser) {
        console.log(
          colors.yellow(
            `⚠️  Usuario ${legacyUser.email} ya existe en EnhancedUser - Saltando`
          )
        )
        this.stats.duplicates++
        return
      }

      // Mapear rol legacy a nuevo formato
      const roleMapping = this.mapLegacyRole(legacyUser.role)

      // Crear estructura de rol para EnhancedUser
      const userRole: IUserRole = {
        roleType: roleMapping.roleType,
        role: roleMapping.role,
        companyId:
          roleMapping.roleType === 'company' ? legacyUser.companyId : undefined,
        permissions: [],
        isActive: true,
        assignedAt: new Date(),
        assignedBy: legacyUser._id // Se asigna a sí mismo para usuarios migrados
      }

      // Crear nuevo usuario EnhancedUser
      const enhancedUserData = {
        // Información básica (mantenida)
        name: legacyUser.name,
        email: legacyUser.email.toLowerCase(),
        password: legacyUser.password, // Ya viene hasheada

        // Estado (migrado y mejorado)
        status: this.mapStatus(legacyUser.status),
        confirmed: legacyUser.confirmed || false,
        emailVerified: legacyUser.confirmed || false,

        // Sistema de roles (nuevo)
        roles: [userRole],
        primaryCompanyId: legacyUser.companyId || null,

        // Metadata (nueva)
        lastLogin: null,
        loginCount: 0,
        createdBy: null,

        // Configuraciones por defecto
        preferences: {
          theme: 'light' as const,
          language: 'es',
          timezone: 'America/Santiago',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },

        // Timestamps
        createdAt: legacyUser.createdAt || new Date(),
        updatedAt: new Date()
      }

      // Crear el nuevo usuario
      await EnhancedUser.create(enhancedUserData)

      this.stats.migratedUsers++
      console.log(
        colors.green(`✅ Usuario ${legacyUser.email} migrado exitosamente`)
      )
      console.log(
        colors.gray(
          `   Rol: ${legacyUser.role} → ${roleMapping.roleType}:${roleMapping.role}`
        )
      )
    } catch (error) {
      console.error(
        colors.red(`❌ Error migrando usuario ${legacyUser.email}:`),
        error
      )
      throw error
    }
  }

  private mapLegacyRole(legacyRole: string): {
    roleType: 'global' | 'company'
    role: GlobalRole | CompanyRole
  } {
    const mapping = ROLE_MAPPING[legacyRole as keyof typeof ROLE_MAPPING]

    if (!mapping) {
      console.log(
        colors.yellow(
          `⚠️  Rol desconocido: ${legacyRole}, usando 'employee' por defecto`
        )
      )
      return {roleType: 'company', role: 'employee' as CompanyRole}
    }

    return mapping
  }

  private mapStatus(
    legacyStatus: string
  ): 'active' | 'inactive' | 'suspended' | 'pending' {
    switch (legacyStatus) {
      case 'active':
        return 'active'
      case 'inactive':
        return 'inactive'
      case 'suspended':
        return 'suspended'
      case 'pending':
        return 'pending'
      default:
        return 'pending'
    }
  }

  private showMigrationStats(): void {
    console.log('============================================================')
    console.log(colors.cyan.bold('📊 ESTADÍSTICAS DE MIGRACIÓN:'))
    console.log(
      colors.white(`  • Total usuarios procesados: ${this.stats.totalUsers}`)
    )
    console.log(
      colors.green(
        `  • Usuarios migrados exitosamente: ${this.stats.migratedUsers}`
      )
    )
    console.log(
      colors.yellow(
        `  • Usuarios duplicados (saltados): ${this.stats.duplicates}`
      )
    )
    console.log(colors.red(`  • Errores encontrados: ${this.stats.errors}`))

    const successRate =
      this.stats.totalUsers > 0
        ? ((this.stats.migratedUsers / this.stats.totalUsers) * 100).toFixed(2)
        : '0'

    console.log(colors.magenta(`  • Tasa de éxito: ${successRate}%`))
    console.log('============================================================')
  }

  async verifyMigration(): Promise<void> {
    console.log(colors.cyan.bold('🔍 Verificando migración...'))

    const legacyCount = await User.countDocuments()
    const enhancedCount = await EnhancedUser.countDocuments()

    console.log(colors.white(`📊 Usuarios en modelo legacy: ${legacyCount}`))
    console.log(
      colors.white(`📊 Usuarios en modelo enhanced: ${enhancedCount}`)
    )

    if (enhancedCount >= legacyCount) {
      console.log(colors.green('✅ Migración verificada exitosamente'))
    } else {
      console.log(colors.red('❌ Posible problema en la migración'))
    }
  }

  async rollbackMigration(): Promise<void> {
    console.log(colors.red.bold('🔄 Ejecutando rollback de migración...'))

    const result = await EnhancedUser.deleteMany({})
    console.log(
      colors.yellow(
        `⚠️  ${result.deletedCount} usuarios eliminados de EnhancedUser`
      )
    )
    console.log(colors.green('✅ Rollback completado'))
  }
}

// Función principal de migración
export async function runUserMigration(
  options: {verify?: boolean; rollback?: boolean} = {}
) {
  try {
    console.log(colors.blue.bold('🎯 Script de Migración User → EnhancedUser'))
    console.log('============================================================')

    // Conectar a la base de datos
    console.log(colors.cyan('🔌 Conectando a la base de datos...'))
    await connectToDatabase()

    const migrationService = new UserMigrationService()

    if (options.rollback) {
      await migrationService.rollbackMigration()
      return
    }

    if (options.verify) {
      await migrationService.verifyMigration()
      return
    }

    // Ejecutar migración
    const stats = await migrationService.migrateAllUsers()

    // Verificar resultados
    await migrationService.verifyMigration()

    console.log(colors.green.bold('🎉 Migración completada exitosamente!'))
  } catch (error) {
    console.error(colors.red.bold('❌ Error en la migración:'), error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2)
  const options = {
    verify: args.includes('--verify'),
    rollback: args.includes('--rollback')
  }

  runUserMigration(options)
    .then(() => {
      console.log(colors.blue('👋 Migración finalizada'))
      process.exit(0)
    })
    .catch(error => {
      console.error(colors.red('💥 Error fatal:'), error)
      process.exit(1)
    })
}

export default runUserMigration
