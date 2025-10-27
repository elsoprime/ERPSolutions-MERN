/**
 * Enhanced Database Verification Script
 * @description: Script para verificar el estado de la base de datos con EnhancedCompany
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {config} from 'dotenv'
import {connectDB} from '@/config/database'
import EnhancedCompany from '@/models/EnhancedCompany'
import User from '@/modules/userManagement/models/User'
import colors from 'colors'

// Cargar variables de entorno
config()

/**
 * Verificar el estado actual de la base de datos con EnhancedCompany
 */
export async function verifyEnhancedDatabaseState(): Promise<void> {
  try {
    console.log(
      colors.bold.blue(
        '🔍 Verificando estado de la base de datos (Enhanced)...'
      )
    )
    console.log(colors.bold.blue('='.repeat(60)))

    // Estadísticas generales
    const totalCompanies = await EnhancedCompany.countDocuments()
    const totalUsers = await User.countDocuments()

    console.log(colors.cyan.bold('📊 ESTADÍSTICAS GENERALES:'))
    console.log(colors.cyan(`  • Total empresas: ${totalCompanies}`))
    console.log(colors.cyan(`  • Total usuarios: ${totalUsers}`))

    // Empresas registradas con estadísticas detalladas
    const companies = await EnhancedCompany.aggregate([
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
          slug: 1,
          'settings.taxId': 1,
          'settings.industry': 1,
          email: 1,
          plan: 1,
          status: 1,
          'settings.limits': 1,
          'stats.totalUsers': 1,
          'settings.features': 1,
          userCount: {$size: '$users'},
          users: {
            $map: {
              input: '$users',
              as: 'user',
              in: {
                name: '$$user.name',
                email: '$$user.email',
                role: '$$user.role',
                confirmed: '$$user.confirmed'
              }
            }
          }
        }
      }
    ])

    console.log(colors.cyan.bold('\n🏢 EMPRESAS REGISTRADAS:'))
    companies.forEach((company, index) => {
      console.log(colors.cyan(`  ${index + 1}. ${company.name}`))
      console.log(colors.gray(`     Slug: ${company.slug}`))
      console.log(colors.gray(`     RUT: ${company.settings.taxId}`))
      console.log(colors.gray(`     Industria: ${company.settings.industry}`))
      console.log(colors.gray(`     Email: ${company.email}`))
      console.log(colors.gray(`     Plan: ${company.plan.toUpperCase()}`))
      console.log(colors.gray(`     Estado: ${company.status.toUpperCase()}`))
      console.log(
        colors.gray(
          `     Usuarios: ${company.userCount}/${company.settings.limits.maxUsers}`
        )
      )

      // Mostrar características habilitadas
      const enabledFeatures = Object.entries(company.settings.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature, _]) => feature)

      if (enabledFeatures.length > 0) {
        console.log(
          colors.gray(`     Características: ${enabledFeatures.join(', ')}`)
        )
      }
    })

    // Estadísticas por rol
    const roleStats = await User.aggregate([
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

    // Usuarios por empresa
    const usersByCompany = await User.aggregate([
      {
        $lookup: {
          from: 'enhancedcompanies',
          localField: 'companyId',
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
              confirmed: '$confirmed'
            }
          }
        }
      },
      {$sort: {companyName: 1}}
    ])

    console.log(colors.cyan.bold('\n🏢 USUARIOS POR EMPRESA:'))

    // Usuarios sin empresa (Super Admins)
    const globalUsers = usersByCompany.find(group => !group._id)
    if (globalUsers) {
      console.log(
        colors.cyan(
          `  📋 Global (Super Admin) (${globalUsers.users.length} usuarios):`
        )
      )
      globalUsers.users.forEach(user => {
        const roleIcon =
          {
            super_admin: '🔴',
            admin_empresa: '🔵',
            manager: '🟢',
            employee: '🟡',
            viewer: '⚪'
          }[user.role] || '❓'

        const status = user.confirmed ? '✅' : '❌'
        console.log(
          colors.cyan(`     ${status} ${roleIcon} ${user.name} (${user.email})`)
        )
      })
    }

    // Usuarios por empresa específica
    usersByCompany
      .filter(group => group._id)
      .forEach(group => {
        console.log(
          colors.cyan(
            `  📋 ${group.companyName} (${group.users.length} usuarios):`
          )
        )
        group.users.forEach(user => {
          const roleIcon =
            {
              super_admin: '🔴',
              admin_empresa: '🔵',
              manager: '🟢',
              employee: '🟡',
              viewer: '⚪'
            }[user.role] || '❓'

          const status = user.confirmed ? '✅' : '❌'
          console.log(
            colors.cyan(
              `     ${status} ${roleIcon} ${user.name} (${user.email})`
            )
          )
        })
      })

    // Credenciales de testing
    const testUsers = await User.find(
      {confirmed: true},
      'name email role'
    ).populate('companyId', 'name')

    console.log(colors.cyan.bold('\n🔐 CREDENCIALES DE TESTING:'))
    testUsers.forEach(user => {
      const roleIcon =
        {
          super_admin: '🔴',
          admin_empresa: '🔵',
          manager: '🟢',
          employee: '🟡',
          viewer: '⚪'
        }[user.role] || '❓'

      const roleName =
        {
          super_admin: 'Super Admin',
          admin_empresa: 'Admin Empresa',
          manager: 'Manager',
          employee: 'Employee',
          viewer: 'Viewer'
        }[user.role] || user.role

      console.log(colors.cyan(`  ✅ ${user.email}`))
      console.log(colors.gray(`     Nombre: ${user.name}`))
      console.log(colors.gray(`     Rol: ${roleIcon} ${roleName}`))
      if (user.companyId && (user.companyId as any).name) {
        console.log(
          colors.gray(`     Empresa: ${(user.companyId as any).name}`)
        )
      }
      console.log(colors.gray(`     Confirmado: Sí`))
    })

    // Verificación de problemas
    console.log(colors.cyan.bold('\n🔍 VERIFICACIÓN DE PROBLEMAS:'))

    // Verificar usuarios sin empresa válida (excepto super admins)
    const usersWithoutCompany = await User.find({
      companyId: {$exists: true, $ne: null},
      role: {$ne: 'super_admin'}
    }).populate('companyId')

    const invalidCompanyUsers = usersWithoutCompany.filter(
      user => !user.companyId
    )

    if (invalidCompanyUsers.length > 0) {
      console.log(
        colors.red(
          `  ❌ ${invalidCompanyUsers.length} usuarios con referencias de empresa inválidas`
        )
      )
      invalidCompanyUsers.forEach(user => {
        console.log(colors.red(`     - ${user.name} (${user.email})`))
      })
    } else {
      console.log(
        colors.green(
          '  ✅ Todos los usuarios tienen empresa asignada correctamente'
        )
      )
    }

    // Verificar roles válidos
    const validRoles = [
      'super_admin',
      'admin_empresa',
      'manager',
      'employee',
      'viewer'
    ]
    const invalidRoleUsers = await User.find({
      role: {$nin: validRoles}
    })

    if (invalidRoleUsers.length > 0) {
      console.log(
        colors.red(
          `  ❌ ${invalidRoleUsers.length} usuarios con roles inválidos`
        )
      )
      invalidRoleUsers.forEach(user => {
        console.log(colors.red(`     - ${user.name}: "${user.role}"`))
      })
    } else {
      console.log(colors.green('  ✅ Todos los usuarios tienen roles válidos'))
    }

    // Verificar límites de empresa
    for (const company of companies) {
      if (company.userCount > company.settings.limits.maxUsers) {
        console.log(
          colors.yellow(
            `  ⚠️  ${company.name} excede el límite de usuarios (${company.userCount}/${company.settings.limits.maxUsers})`
          )
        )
      }
    }

    console.log(colors.bold.blue('\n' + '='.repeat(60)))
    console.log(colors.bold.green('🎉 Verificación completada'))
  } catch (error) {
    console.error(colors.red.bold('❌ Error durante la verificación:'), error)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    await connectDB()
    console.log(colors.green('✅ Conexión establecida exitosamente'))
    await verifyEnhancedDatabaseState()
  } catch (error) {
    console.error(
      colors.red.bold('❌ Error en el script de verificación:'),
      error
    )
    process.exit(1)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main()
}
