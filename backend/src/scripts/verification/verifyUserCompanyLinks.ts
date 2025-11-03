/**
 * Script de Verificación de Vínculos Usuario-Empresa
 * @description: Verifica y repara la vinculación entre usuarios y empresas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

import colors from 'colors'
import mongoose from 'mongoose'
import EnhancedCompany from '@/modules/companiesManagement/models/EnhancedCompany'
import EnhancedUser from '@/modules/userManagement/models/EnhancedUser'

// ====== UTILIDADES DE LOGGING ======
const logInfo = (message: string) => console.log(colors.green(`✅ ${message}`))
const logWarning = (message: string) =>
  console.log(colors.yellow(`⚠️  ${message}`))
const logError = (message: string) => console.log(colors.red(`❌ ${message}`))
const logProcess = (message: string) =>
  console.log(colors.cyan(`ℹ️  ${message}`))

/**
 * Verificar vínculos entre usuarios y empresas
 */
async function verifyUserCompanyLinks(): Promise<void> {
  try {
    console.log(colors.blue.bold('🔍 Verificando vínculos Usuario-Empresa...'))
    console.log('============================================================')

    // 1. Obtener todas las empresas
    const companies = await EnhancedCompany.find()
    logInfo(`Total de empresas encontradas: ${companies.length}`)

    // 2. Verificar cada empresa
    for (const company of companies) {
      console.log(
        colors.white(
          `\n📦 Empresa: ${company.name} (${company.settings.taxId})`
        )
      )

      // Contar usuarios vinculados
      const usersInCompany = await EnhancedUser.find({
        primaryCompanyId: company._id,
        status: 'active'
      })

      console.log(
        colors.gray(
          `   - Usuarios activos vinculados: ${usersInCompany.length}`
        )
      )
      console.log(
        colors.gray(
          `   - Estadística actual: ${company.stats.totalUsers} usuarios`
        )
      )

      // Mostrar usuarios vinculados
      if (usersInCompany.length > 0) {
        console.log(colors.gray('   - Lista de usuarios:'))
        usersInCompany.forEach(user => {
          const hasActiveRole = user.roles.some(
            role =>
              role.companyId?.toString() === company._id.toString() &&
              role.isActive
          )
          const roleStatus = hasActiveRole
            ? '✅ Rol activo'
            : '❌ Sin rol activo'
          console.log(
            colors.gray(`     • ${user.name} (${user.email}) - ${roleStatus}`)
          )
        })
      } else {
        logWarning('   No hay usuarios vinculados a esta empresa')
      }

      // Verificar inconsistencia
      if (company.stats.totalUsers !== usersInCompany.length) {
        logWarning(
          `   ⚠️  INCONSISTENCIA: stats.totalUsers (${company.stats.totalUsers}) != usuarios reales (${usersInCompany.length})`
        )
      }
    }

    // 3. Verificar usuarios sin empresa
    const usersWithoutCompany = await EnhancedUser.find({
      primaryCompanyId: null,
      'roles.roleType': 'company' // Usuarios que deberían tener empresa
    })

    if (usersWithoutCompany.length > 0) {
      console.log(
        colors.yellow(
          `\n⚠️  Usuarios con rol de empresa pero sin primaryCompanyId:`
        )
      )
      usersWithoutCompany.forEach(user => {
        console.log(colors.yellow(`   - ${user.name} (${user.email})`))
      })
    }

    // 4. Verificar usuarios con primaryCompanyId inválido
    const allUsers = await EnhancedUser.find({
      primaryCompanyId: {$ne: null}
    })
    const companyIds = new Set(companies.map(c => c._id.toString()))

    const usersWithInvalidCompany = allUsers.filter(
      user => !companyIds.has(user.primaryCompanyId!.toString())
    )

    if (usersWithInvalidCompany.length > 0) {
      console.log(colors.red(`\n❌ Usuarios con primaryCompanyId inválido:`))
      usersWithInvalidCompany.forEach(user => {
        console.log(
          colors.red(
            `   - ${user.name} (${user.email}) - CompanyId: ${user.primaryCompanyId}`
          )
        )
      })
    }

    console.log('============================================================')
    logInfo('Verificación completada')
  } catch (error) {
    logError(`Error en la verificación: ${error}`)
    throw error
  }
}

/**
 * Reparar estadísticas de empresas
 */
async function repairCompanyStats(): Promise<void> {
  try {
    console.log(colors.blue.bold('🔧 Reparando estadísticas de empresas...'))
    console.log('============================================================')

    const companies = await EnhancedCompany.find()
    let repairedCount = 0

    for (const company of companies) {
      const oldStats = company.stats.totalUsers

      // Actualizar estadísticas usando el método del modelo
      await company.updateStats()

      const newStats = company.stats.totalUsers

      if (oldStats !== newStats) {
        repairedCount++
        logInfo(`Empresa ${company.name}: ${oldStats} → ${newStats} usuarios`)
      } else {
        console.log(
          colors.gray(
            `Empresa ${company.name}: ${newStats} usuarios (sin cambios)`
          )
        )
      }
    }

    console.log('============================================================')
    if (repairedCount > 0) {
      logInfo(`${repairedCount} empresas reparadas`)
    } else {
      logInfo('No se encontraron inconsistencias')
    }
  } catch (error) {
    logError(`Error reparando estadísticas: ${error}`)
    throw error
  }
}

/**
 * Mostrar resumen detallado
 */
async function showDetailedSummary(): Promise<void> {
  console.log(colors.blue.bold('\n📊 RESUMEN DETALLADO'))
  console.log('============================================================')

  const totalCompanies = await EnhancedCompany.countDocuments()
  const totalUsers = await EnhancedUser.countDocuments()
  const activeUsers = await EnhancedUser.countDocuments({status: 'active'})

  console.log(colors.white(`Total de empresas: ${totalCompanies}`))
  console.log(colors.white(`Total de usuarios: ${totalUsers}`))
  console.log(colors.white(`Usuarios activos: ${activeUsers}`))

  // Usuarios por empresa
  const usersByCompany = await EnhancedUser.aggregate([
    {
      $match: {
        primaryCompanyId: {$ne: null},
        status: 'active'
      }
    },
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
        _id: '$primaryCompanyId',
        companyName: {$first: {$arrayElemAt: ['$company.name', 0]}},
        taxId: {$first: {$arrayElemAt: ['$company.settings.taxId', 0]}},
        count: {$sum: 1}
      }
    },
    {$sort: {count: -1}}
  ])

  console.log(colors.white('\nUsuarios activos por empresa:'))
  usersByCompany.forEach(item => {
    console.log(
      colors.gray(
        `   ${item.companyName} (${item.taxId}): ${item.count} usuarios`
      )
    )
  })

  // Usuarios globales (super admins)
  const globalUsers = await EnhancedUser.countDocuments({
    primaryCompanyId: null,
    'roles.roleType': 'global'
  })

  if (globalUsers > 0) {
    console.log(
      colors.white(`\nUsuarios globales (sin empresa): ${globalUsers}`)
    )
  }

  console.log('============================================================')
}

/**
 * Función principal
 */
export async function runVerification(
  options: {repair?: boolean} = {}
): Promise<void> {
  try {
    await verifyUserCompanyLinks()
    await showDetailedSummary()

    if (options.repair) {
      console.log('\n')
      await repairCompanyStats()
    } else {
      console.log('\n')
      logProcess('Para reparar las estadísticas, ejecuta con: {repair: true}')
    }
  } catch (error) {
    logError(`Error en la verificación: ${error}`)
    throw error
  }
}

export {verifyUserCompanyLinks, repairCompanyStats, showDetailedSummary}
