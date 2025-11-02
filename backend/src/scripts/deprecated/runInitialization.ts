/**
 * Database Initialization Runner
 * @description: Script ejecutor para inicializar la base de datos
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {config} from 'dotenv'
import {connectDB} from '@/config/database'
import {initializeDatabase} from './initializeNew'
import {cleanDatabase} from './cleanDatabase'
import colors from 'colors'

// Cargar variables de entorno
config()

async function runInitialization() {
  try {
    console.log(
      colors.bold.magenta('🎯 Script de Inicialización de Base de Datos')
    )
    console.log(colors.bold.magenta('='.repeat(60)))

    // Conectar a la base de datos
    console.log(colors.cyan('🔌 Conectando a la base de datos...'))
    await connectDB()
    console.log(colors.green('✅ Conexión establecida exitosamente'))

    // Verificar argumentos de línea de comandos
    const includeTestUsers =
      process.argv.includes('--test-users') || process.argv.includes('-t')
    const shouldClean =
      process.argv.includes('--clean') || process.argv.includes('-c')

    if (shouldClean) {
      console.log(
        colors.red(
          '🧹 Modo de limpieza activado - Se eliminarán todos los datos existentes'
        )
      )
      await cleanDatabase()
    }

    if (includeTestUsers) {
      console.log(
        colors.yellow(
          '🧪 Modo de prueba activado - Se crearán usuarios adicionales de testing'
        )
      )
    }

    // Ejecutar inicialización
    await initializeDatabase(includeTestUsers)

    console.log(
      colors.bold.green('\n🎉 ¡Inicialización completada exitosamente!')
    )
    console.log(colors.bold.cyan('\n📖 Próximos pasos:'))
    console.log(colors.cyan('1. Inicia tu servidor backend'))
    console.log(
      colors.cyan('2. Accede al frontend con las credenciales mostradas')
    )
    console.log(
      colors.cyan('3. Explora los diferentes dashboards según los roles')
    )
  } catch (error) {
    console.error(colors.red.bold('❌ Error durante la inicialización:'))
    console.error(colors.red(error))
    process.exit(1)
  } finally {
    // Cerrar conexión y terminar proceso
    process.exit(0)
  }
}

// Ejecutar script
runInitialization()
