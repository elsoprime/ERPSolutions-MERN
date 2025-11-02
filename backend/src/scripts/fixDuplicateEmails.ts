/**
 * Script para eliminar usuarios duplicados y recrear índice único en email
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import mongoose from 'mongoose'
import EnhancedUser from '../modules/userManagement/models/EnhancedUser'
import {connectDB} from '../config/database'

async function fixDuplicateEmails() {
  try {
    await connectDB()
    console.log('🔌 Conectado a MongoDB')

    // Buscar emails duplicados
    const duplicates = await EnhancedUser.aggregate([
      {
        $group: {
          _id: {$toLower: '$email'},
          count: {$sum: 1},
          ids: {$push: '$_id'},
          emails: {$push: '$email'}
        }
      },
      {
        $match: {
          count: {$gt: 1}
        }
      }
    ])

    console.log(`\n📊 Encontrados ${duplicates.length} emails duplicados`)

    // Para cada duplicado, mantener solo el primero y eliminar los demás
    for (const dup of duplicates) {
      console.log(`\n🔍 Email duplicado: ${dup._id}`)
      console.log(`   Total de registros: ${dup.count}`)

      // Ordenar por fecha de creación (mantener el más antiguo)
      const users = await EnhancedUser.find({
        _id: {$in: dup.ids}
      }).sort({createdAt: 1})

      console.log(`   Manteniendo: ${users[0].email} (ID: ${users[0]._id})`)

      // Eliminar los duplicados (todos excepto el primero)
      for (let i = 1; i < users.length; i++) {
        console.log(`   ❌ Eliminando: ${users[i].email} (ID: ${users[i]._id})`)
        await EnhancedUser.findByIdAndDelete(users[i]._id)
      }
    }

    // Eliminar índice antiguo
    console.log('\n🗑️  Eliminando índice antiguo...')
    try {
      await EnhancedUser.collection.dropIndex('email_1')
    } catch (error) {
      console.log('   ℹ️  Índice no encontrado o ya eliminado')
    }

    // Crear nuevo índice con collation
    console.log('📝 Creando índice único case-insensitive...')
    await EnhancedUser.collection.createIndex(
      {email: 1},
      {
        unique: true,
        collation: {locale: 'en', strength: 2}
      }
    )

    console.log('✅ Proceso completado exitosamente')

    // Verificar estado final
    const totalUsers = await EnhancedUser.countDocuments()
    console.log(`\n📊 Total de usuarios en la base de datos: ${totalUsers}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Ejecutar script
fixDuplicateEmails()
