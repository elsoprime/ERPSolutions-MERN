/**
 * Database Verification Script
 * @description: Script para verificar el estado de la base de datos
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {config} from 'dotenv'
import {connectDB} from '@/config/database'
import Company from '@/models/Company'
import User from '@/modules/userManagement/models/User'
import colors from 'colors'

// Cargar variables de entorno
config()

/**
 * Verificar el estado actual de la base de datos
 */
export async function verifyDatabaseState(): Promise<void> {
  try {
    console.log(
      colors.bold.blue('🔍 Verificando estado de la base de datos...')
    )
    console.log(colors.bold.blue('='.repeat(60)))

    // Estadísticas generales
    const totalCompanies = await Company.countDocuments()
    const totalUsers = await User.countDocuments()

    console.log(colors.cyan.bold('📊 ESTADÍSTICAS GENERALES:'))
    console.log(colors.cyan(`  • Total empresas: ${totalCompanies}`))
    console.log(colors.cyan(`  • Total usuarios: ${totalUsers}`))

    if (totalCompanies === 0 && totalUsers === 0) {
      console.log(colors.yellow.bold('\n⚠️  La base de datos está vacía'))
      console.log(colors.yellow('   Ejecuta: npm run init-db para inicializar'))
      return
    }

    // Verificar empresas
    console.log(colors.cyan.bold('\n🏢 EMPRESAS REGISTRADAS:'))
    const companies = await Company.find({}).select(
      'companyName rutOrDni industry email'
    )

    if (companies.length > 0) {
      companies.forEach((company, index) => {
        console.log(colors.cyan(`  ${index + 1}. ${company.companyName}`))
        console.log(colors.gray(`     RUT: ${company.rutOrDni}`))
        console.log(colors.gray(`     Industria: ${company.industry}`))
        console.log(colors.gray(`     Email: ${company.email}`))
      })
    } else {
      console.log(colors.yellow('   No hay empresas registradas'))
    }

    // Verificar usuarios por rol
    console.log(colors.cyan.bold('\n👥 USUARIOS POR ROL:'))
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

    if (roleStats.length > 0) {
      roleStats.forEach(stat => {
        const roleDisplay =
          {
            super_admin: '🔴 Super Admin',
            admin_empresa: '🔵 Admin Empresa',
            manager: '🟢 Manager',
            employee: '🟡 Employee',
            viewer: '⚪ Viewer'
          }[stat._id] || `⚫ ${stat._id}`

        console.log(colors.cyan(`  ${roleDisplay}: ${stat.count}`))
      })
    } else {
      console.log(colors.yellow('   No hay usuarios registrados'))
    }

    // Verificar usuarios por empresa
    console.log(colors.cyan.bold('\n🏢 USUARIOS POR EMPRESA:'))
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
          users: {
            $push: {
              name: '$name',
              email: '$email',
              role: '$role',
              status: '$status'
            }
          },
          count: {$sum: 1}
        }
      },
      {
        $sort: {count: -1}
      }
    ])

    if (companyStats.length > 0) {
      companyStats.forEach(stat => {
        const companyName = stat.companyName || 'Global (Super Admin)'
        console.log(
          colors.cyan(`  📋 ${companyName} (${stat.count} usuarios):`)
        )

        stat.users.forEach((user: any) => {
          const statusIcon = user.status === 'active' ? '✅' : '❌'
          const roleDisplay =
            {
              super_admin: '🔴',
              admin_empresa: '🔵',
              manager: '🟢',
              employee: '🟡',
              viewer: '⚪'
            }[user.role] || '⚫'

          console.log(
            colors.gray(
              `     ${statusIcon} ${roleDisplay} ${user.name} (${user.email})`
            )
          )
        })
      })
    }

    // Verificar credenciales de testing
    console.log(colors.cyan.bold('\n🔐 CREDENCIALES DE TESTING:'))
    const testUsers = [
      'superadmin@erpsolutions.cl',
      'admin@erpsolutions.cl',
      'manager@democompany.cl',
      'empleado@testindustries.cl',
      'viewer@democompany.cl'
    ]

    for (const email of testUsers) {
      const user = await User.findOne({email}).select(
        'name role status confirmed'
      )
      if (user) {
        const statusIcon = user.status === 'active' ? '✅' : '❌'
        const confirmedIcon = user.confirmed ? '✅' : '❌'
        const roleDisplay =
          {
            super_admin: '🔴 Super Admin',
            admin_empresa: '🔵 Admin Empresa',
            manager: '🟢 Manager',
            employee: '🟡 Employee',
            viewer: '⚪ Viewer'
          }[user.role] || user.role

        console.log(colors.cyan(`  ${statusIcon} ${email}`))
        console.log(colors.gray(`     Nombre: ${user.name}`))
        console.log(colors.gray(`     Rol: ${roleDisplay}`))
        console.log(
          colors.gray(`     Confirmado: ${confirmedIcon ? 'Sí' : 'No'}`)
        )
      } else {
        console.log(colors.red(`  ❌ ${email} - No encontrado`))
      }
    }

    // Verificar problemas potenciales
    console.log(colors.cyan.bold('\n🔍 VERIFICACIÓN DE PROBLEMAS:'))

    // Usuarios sin empresa (excepto super admin)
    const usersWithoutCompany = await User.find({
      companyId: {$in: [null, undefined]},
      role: {$ne: 'super_admin'}
    }).select('name email role')

    if (usersWithoutCompany.length > 0) {
      console.log(
        colors.yellow(
          '  ⚠️  Usuarios sin empresa asignada (excepto Super Admin):'
        )
      )
      usersWithoutCompany.forEach(user => {
        console.log(
          colors.yellow(
            `     - ${user.name} (${user.email}) - Rol: ${user.role}`
          )
        )
      })
    } else {
      console.log(
        colors.green(
          '  ✅ Todos los usuarios tienen empresa asignada correctamente'
        )
      )
    }

    // Usuarios con roles inválidos
    const validRoles = [
      'super_admin',
      'admin_empresa',
      'manager',
      'employee',
      'viewer'
    ]
    const usersWithInvalidRoles = await User.find({
      role: {$nin: validRoles}
    }).select('name email role')

    if (usersWithInvalidRoles.length > 0) {
      console.log(colors.red('  ❌ Usuarios con roles inválidos:'))
      usersWithInvalidRoles.forEach(user => {
        console.log(
          colors.red(`     - ${user.name} (${user.email}) - Rol: ${user.role}`)
        )
      })
      console.log(
        colors.yellow('   Ejecuta: npm run migrate-users para corregir')
      )
    } else {
      console.log(colors.green('  ✅ Todos los usuarios tienen roles válidos'))
    }

    console.log(colors.bold.blue('\n' + '='.repeat(60)))
    console.log(colors.bold.green('🎉 Verificación completada'))
  } catch (error) {
    console.error(colors.red.bold('❌ Error durante la verificación:'))
    console.error(colors.red(error))
    throw error
  }
}

/**
 * Script principal de verificación
 */
async function runVerification() {
  try {
    // Conectar a la base de datos
    console.log(colors.cyan('🔌 Conectando a la base de datos...'))
    await connectDB()
    console.log(colors.green('✅ Conexión establecida exitosamente\n'))

    // Ejecutar verificación
    await verifyDatabaseState()
  } catch (error) {
    console.error(colors.red.bold('❌ Error durante la verificación:'))
    console.error(colors.red(error))
    process.exit(1)
  } finally {
    // Cerrar conexión y terminar proceso
    process.exit(0)
  }
}

// Verificar si se ejecuta directamente
if (require.main === module) {
  runVerification()
}

export default {
  verifyDatabaseState,
  runVerification
}
