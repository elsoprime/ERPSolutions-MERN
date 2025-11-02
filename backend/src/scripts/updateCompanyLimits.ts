/**
 * Script para actualizar los límites de una empresa
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import {connectDB} from '../config/database'
import EnhancedCompany from '../modules/companiesManagement/models/EnhancedCompany'

async function updateCompanyLimits() {
  try {
    await connectDB()
    console.log('🔌 Conectado a MongoDB\n')

    // Listar todas las empresas con sus límites
    const companies = await EnhancedCompany.find().select(
      'name slug stats.totalUsers settings.limits'
    )

    console.log(`📊 Total de empresas: ${companies.length}\n`)

    for (const company of companies) {
      const usage = company.getUsagePercentage()
      console.log(`\n📦 Empresa: ${company.name}`)
      console.log(`   Slug: ${company.slug}`)
      console.log(
        `   Usuarios: ${company.stats.totalUsers}/${company.settings.limits.maxUsers} (${usage.users}%)`
      )
      console.log(`   Límites actuales:`)
      console.log(`     - Max Usuarios: ${company.settings.limits.maxUsers}`)
      console.log(
        `     - Max Productos: ${company.settings.limits.maxProducts}`
      )
      console.log(`     - Storage: ${company.settings.limits.storageGB} GB`)

      if (usage.users >= 80) {
        console.log(`   ⚠️  Advertencia: Uso de usuarios al ${usage.users}%`)
      }
    }

    console.log('\n\n📝 Para actualizar los límites de una empresa específica:')
    console.log('Ejecuta en MongoDB Compass o Shell:\n')
    console.log(`db.enhancedcompanies.updateOne(`)
    console.log(`  { slug: "slug-de-la-empresa" },`)
    console.log(`  { $set: {`)
    console.log(`    "settings.limits.maxUsers": 50,`)
    console.log(`    "settings.limits.maxProducts": 1000,`)
    console.log(`    "settings.limits.storageGB": 10`)
    console.log(`  }}`)
    console.log(`)`)

    console.log('\n\n✅ Proceso completado')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Ejecutar script
updateCompanyLimits()
