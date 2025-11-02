/**
 * Script para sincronizar el contador de usuarios de las empresas
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import {connectDB} from '../config/database'
import EnhancedCompany from '../modules/companiesManagement/models/EnhancedCompany'
import EnhancedUser from '../modules/userManagement/models/EnhancedUser'

async function syncUserStats() {
  try {
    await connectDB()
    console.log('🔌 Conectado a MongoDB\n')

    const companies = await EnhancedCompany.find()

    for (const company of companies) {
      // Contar usuarios REALES de esta empresa
      const realUserCount = await EnhancedUser.countDocuments({
        'roles.companyId': company._id,
        'roles.isActive': true
      })

      const currentCount = company.stats.totalUsers

      console.log(`\n📦 Empresa: ${company.name}`)
      console.log(`   Contador actual: ${currentCount}`)
      console.log(`   Usuarios reales: ${realUserCount}`)

      if (currentCount !== realUserCount) {
        console.log(`   ⚠️  DESINCRONIZADO! Actualizando...`)

        await EnhancedCompany.findByIdAndUpdate(company._id, {
          $set: {'stats.totalUsers': realUserCount}
        })

        console.log(`   ✅ Actualizado: ${currentCount} → ${realUserCount}`)
      } else {
        console.log(`   ✅ Sincronizado correctamente`)
      }
    }

    console.log('\n\n✅ Proceso completado')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

syncUserStats()
