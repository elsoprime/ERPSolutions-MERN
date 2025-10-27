/**
 * User Model Migration Script
 * @description: Script para migrar el modelo de User al nuevo sistema role-based
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {config} from 'dotenv'
import {connectDB} from '@/config/database'
import User from '@/modules/userManagement/models/User'
import colors from 'colors'

// Cargar variables de entorno
config()

/**
 * Migrar usuarios existentes al nuevo sistema de roles
 */
export async function migrateUserRoles(): Promise<void> {
  try {
    console.log(
      colors.bold.cyan('🔄 Migrando usuarios al nuevo sistema de roles...')
    )

    // Obtener todos los usuarios existentes
    const users = await User.find({})

    if (users.length === 0) {
      console.log(colors.yellow('ℹ️  No hay usuarios para migrar'))
      return
    }

    console.log(
      colors.cyan(`📊 Encontrados ${users.length} usuarios para migrar`)
    )

    for (const user of users) {
      let newRole = user.role

      // Mapear roles antiguos a nuevos
      switch (user.role) {
        case 'admin':
          newRole = 'super_admin'
          break
        case 'company_admin':
          newRole = 'admin_empresa'
          break
        case 'user':
          newRole = 'employee'
          break
        case 'readonly':
          newRole = 'viewer'
          break
        default:
          // Si ya está en el nuevo formato, mantener
          if (
            [
              'super_admin',
              'admin_empresa',
              'manager',
              'employee',
              'viewer'
            ].includes(user.role)
          ) {
            newRole = user.role
          } else {
            newRole = 'employee' // Rol por defecto
          }
      }

      // Actualizar usuario si el rol cambió
      if (newRole !== user.role) {
        await User.updateOne(
          {_id: user._id},
          {
            role: newRole,
            status: user.status || 'active',
            confirmed: user.confirmed !== undefined ? user.confirmed : true
          }
        )
        console.log(
          colors.green(
            `✅ Usuario ${user.name} migrado: ${user.role} → ${newRole}`
          )
        )
      } else {
        console.log(
          colors.gray(
            `➡️  Usuario ${user.name} ya tiene rol válido: ${user.role}`
          )
        )
      }
    }

    console.log(colors.bold.green('🎉 Migración de usuarios completada'))
  } catch (error) {
    console.error(colors.red.bold('❌ Error durante la migración:'))
    console.error(colors.red(error))
    throw error
  }
}

/**
 * Script principal de migración
 */
async function runMigration() {
  try {
    console.log(colors.bold.magenta('🔄 Script de Migración de Usuarios'))
    console.log(colors.bold.magenta('='.repeat(50)))

    // Conectar a la base de datos
    console.log(colors.cyan('🔌 Conectando a la base de datos...'))
    await connectDB()
    console.log(colors.green('✅ Conexión establecida exitosamente'))

    // Ejecutar migración
    await migrateUserRoles()
  } catch (error) {
    console.error(colors.red.bold('❌ Error durante la migración:'))
    console.error(colors.red(error))
    process.exit(1)
  } finally {
    // Cerrar conexión y terminar proceso
    process.exit(0)
  }
}

// Verificar si se ejecuta directamente
if (require.main === module) {
  runMigration()
}

export default {
  migrateUserRoles,
  runMigration
}
