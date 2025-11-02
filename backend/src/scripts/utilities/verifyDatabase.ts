/**
 * Database Verification Script
 * @description: Script para verificar el estado de la base de datos
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0 Enhanced
 */

import {config} from 'dotenv'
import {connectDB} from '@/config/database'
import EnhancedCompany from '@/modules/companiesManagement/models/EnhancedCompany'
import EnhancedUser from '@/modules/userManagement/models/EnhancedUser'
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
    const totalCompanies = await EnhancedCompany.countDocuments()
    const totalUsers = await EnhancedUser.countDocuments()

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
    const companies = await EnhancedCompany.find({}).select(
      'name slug email settings.taxId settings.industry plan status'
    )

    if (companies.length > 0) {
      companies.forEach((company, index) => {
        console.log(colors.cyan(`  ${index + 1}. ${company.name}`))
        console.log(
          colors.gray(
            `     RUT: ${company.settings?.taxId || 'No especificado'}`
          )
        )
        console.log(
          colors.gray(
            `     Industria: ${company.settings?.industry || 'No especificada'}`
          )
        )
        console.log(colors.gray(`     Email: ${company.email}`))
        console.log(colors.gray(`     Plan: ${company.plan}`))
        console.log(colors.gray(`     Estado: ${company.status}`))
      })
    } else {
      console.log(colors.yellow('   No hay empresas registradas'))
    }

    // Verificar usuarios por rol
    console.log(colors.cyan.bold('\n👥 USUARIOS POR ROL:'))
    const roleStats = await EnhancedUser.aggregate([
      {
        $group: {
          _id: '$roles.role',
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
    const companyStats = await EnhancedUser.aggregate([
      {
        $lookup: {
          from: 'enhancedcompanies',
          localField: 'primaryCompanyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $group: {
          _id: '$companyId',
          companyName: {$first: {$arrayElemAt: ['$company.name', 0]}},
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
      const user = await EnhancedUser.findOne({email}).select(
        'name roles status confirmed'
      )
      if (user) {
        const statusIcon = user.status === 'active' ? '✅' : '❌'
        const confirmedIcon = user.confirmed ? '✅' : '❌'
        const userRole =
          user.roles && user.roles.length > 0 ? user.roles[0].role : 'sin_rol'
        const roleDisplay =
          {
            super_admin: '🔴 Super Admin',
            admin_empresa: '🔵 Admin Empresa',
            manager: '🟢 Manager',
            employee: '🟡 Employee',
            viewer: '⚪ Viewer'
          }[userRole] || userRole

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
    const usersWithoutCompany = await EnhancedUser.find({
      primaryCompanyId: {$in: [null, undefined]},
      'roles.role': {$ne: 'super_admin'}
    }).select('name email roles')

    if (usersWithoutCompany.length > 0) {
      console.log(
        colors.yellow(
          '  ⚠️  Usuarios sin empresa asignada (excepto Super Admin):'
        )
      )
      usersWithoutCompany.forEach(user => {
        const userRole =
          user.roles && user.roles.length > 0 ? user.roles[0].role : 'sin_rol'
        console.log(
          colors.yellow(
            `     - ${user.name} (${user.email}) - Rol: ${userRole}`
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
    const usersWithInvalidRoles = await EnhancedUser.find({
      'roles.role': {$nin: validRoles}
    }).select('name email roles')

    if (usersWithInvalidRoles.length > 0) {
      console.log(colors.red('  ❌ Usuarios con roles inválidos:'))
      usersWithInvalidRoles.forEach(user => {
        const userRole =
          user.roles && user.roles.length > 0 ? user.roles[0].role : 'sin_rol'
        console.log(
          colors.red(`     - ${user.name} (${user.email}) - Rol: ${userRole}`)
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
