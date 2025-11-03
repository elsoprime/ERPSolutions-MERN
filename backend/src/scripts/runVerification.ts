/**
 * Script Ejecutable - Verificación de Vínculos Usuario-Empresa
 * @description: Script para ejecutar verificación y reparación de vínculos
 * @usage: npm run script:verify o npm run script:verify -- --repair
 */

import colors from 'colors'
import {connectDB} from '@/config/database'
import {runVerification} from './verification/verifyUserCompanyLinks'

async function main() {
  try {
    console.log(
      colors.blue.bold(
        '🚀 Iniciando Verificación de Vínculos Usuario-Empresa...\n'
      )
    )

    // Conectar a la base de datos
    await connectDB()

    // Verificar argumentos de línea de comandos
    const args = process.argv.slice(2)
    const shouldRepair = args.includes('--repair')

    if (shouldRepair) {
      console.log(colors.yellow('⚙️  Modo REPARACIÓN activado\n'))
    }

    // Ejecutar verificación
    await runVerification({repair: shouldRepair})

    console.log(colors.green.bold('\n✅ Verificación completada exitosamente!'))

    process.exit(0)
  } catch (error) {
    console.error(colors.red.bold('\n❌ Error en la verificación:'), error)
    process.exit(1)
  }
}

main()
