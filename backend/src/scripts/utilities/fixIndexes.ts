/**
 * Fix Duplicate Indexes Script
 * @description: Script para eliminar y recrear índices duplicados
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {config} from 'dotenv'
import {connectDB} from '@/config/database'
import EnhancedCompany from '@/modules/companiesManagement/models/EnhancedCompany'
import colors from 'colors'

// Cargar variables de entorno
config()

async function fixDuplicateIndexes(): Promise<void> {
  try {
    console.log(colors.blue('🔧 Conectando a la base de datos...'))
    await connectDB()

    console.log(
      colors.yellow('📋 Obteniendo información de índices actuales...')
    )

    // Obtener colección de enhanced companies
    const collection = EnhancedCompany.collection

    // Listar índices existentes
    const indexes = await collection.indexes()
    console.log(colors.cyan('Índices existentes:'))
    indexes.forEach(index => {
      console.log(
        colors.white(`  - ${index.name}: ${JSON.stringify(index.key)}`)
      )
    })

    console.log(colors.yellow('\n🗑️ Eliminando índices duplicados...'))

    // Lista de índices que pueden estar duplicados
    const indexesToRecreate = [
      'slug_1',
      'settings.taxId_1',
      'email_1',
      'createdBy_1',
      'ownerId_1',
      'trialEndsAt_1',
      'subscriptionEndsAt_1'
    ]

    for (const indexName of indexesToRecreate) {
      try {
        await collection.dropIndex(indexName)
        console.log(colors.green(`  ✅ Índice ${indexName} eliminado`))
      } catch (error: any) {
        if (error.codeName === 'IndexNotFound') {
          console.log(colors.gray(`  ⚪ Índice ${indexName} no encontrado`))
        } else {
          console.log(
            colors.red(`  ❌ Error eliminando ${indexName}: ${error.message}`)
          )
        }
      }
    }

    console.log(colors.yellow('\n🔄 Recreando índices desde el modelo...'))

    // Recrear índices desde el modelo
    await EnhancedCompany.syncIndexes()
    console.log(colors.green('  ✅ Índices recreados desde el modelo'))

    console.log(colors.yellow('\n📋 Verificando índices finales...'))
    const finalIndexes = await collection.indexes()
    console.log(colors.cyan('Índices finales:'))
    finalIndexes.forEach(index => {
      console.log(
        colors.white(`  - ${index.name}: ${JSON.stringify(index.key)}`)
      )
    })

    console.log(
      colors.green.bold('\n🎉 Índices duplicados corregidos exitosamente!')
    )
  } catch (error) {
    console.error(colors.red.bold('❌ Error al corregir índices:'))
    console.error(colors.red(error))
  } finally {
    process.exit(0)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  fixDuplicateIndexes()
}

export default fixDuplicateIndexes
