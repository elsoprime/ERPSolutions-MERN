/**
 * Enhanced Database Runner Script
 * @description: Script ejecutor para la base de datos con EnhancedCompany
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {config} from 'dotenv'
import {connectDB} from '@/config/database'
import {
  initializeEnhancedCompanies,
  initializeUsers,
  getEnhancedDatabaseStatistics
} from './initializeEnhanced'
import {cleanDatabase} from './cleanDatabase'
import colors from 'colors'
import mongoose from 'mongoose'

// Cargar variables de entorno
config()

/**
 * Función principal del runner
 */
async function runEnhancedInitialization() {
  try {
    console.log(colors.bold.cyan('🚀 ENHANCED DATABASE INITIALIZATION'))
    console.log(colors.cyan('='.repeat(60)))

    // Conectar a la base de datos
    await connectDB()
    console.log(colors.green('✅ Conectado a la base de datos'))

    // Procesar argumentos de línea de comandos
    const args = process.argv.slice(2)
    const isCleanMode = args.includes('--clean')
    const includeTestUsers = args.includes('--test-users')

    if (isCleanMode) {
      console.log(colors.yellow.bold('\n🧹 MODO LIMPIEZA ACTIVADO'))
      console.log(colors.yellow('Limpiando base de datos...'))
      await cleanDatabase()
      console.log(colors.green('✅ Base de datos limpiada'))
    }

    console.log(colors.blue.bold('\n📋 INICIALIZANDO DATOS...'))

    // Inicializar empresas
    const companyIdMap = await initializeEnhancedCompanies()

    // Inicializar usuarios
    await initializeUsers(companyIdMap, includeTestUsers)

    console.log(colors.green.bold('\n✨ INICIALIZACIÓN COMPLETADA'))

    // Mostrar estadísticas
    console.log(colors.blue.bold('\n📊 ESTADÍSTICAS FINALES:'))
    await getEnhancedDatabaseStatistics()

    console.log(colors.cyan('\n' + '='.repeat(60)))
    console.log(
      colors.green.bold('🎉 Sistema Enhanced ERP inicializado correctamente')
    )
    console.log(colors.gray('\nPara verificar el estado completo, ejecuta:'))
    console.log(colors.white('npm run verify-enhanced-db'))
  } catch (error) {
    console.error(
      colors.red.bold('\n❌ Error durante la inicialización:'),
      error
    )
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log(colors.gray('🔌 Conexión cerrada'))
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  runEnhancedInitialization()
}
