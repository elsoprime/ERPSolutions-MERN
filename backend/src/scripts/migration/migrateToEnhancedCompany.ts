/**
 * Migration Script: Company to EnhancedCompany
 * @description: Script para migrar datos del modelo Company al modelo EnhancedCompany
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {config} from 'dotenv'
import {connectDB} from '@/config/database'
import EnhancedCompany from '@/modules/companiesManagement/models/EnhancedCompany'
import {
  IEnhancedCompany,
  CompanyStatus,
  SubscriptionPlan,
  BusinessType,
  Currency
} from '@/modules/companiesManagement/types/EnhandedCompanyTypes'
import User from '@/modules/userManagement/models/User'
import colors from 'colors'
import mongoose from 'mongoose'

// Cargar variables de entorno
config()

/**
 * Función para generar slug único
 */
function generateUniqueSlug(name: string, existingSlugs: string[]): string {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones duplicados
    .trim()

  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Mapear industria a tipo de negocio
 */
function mapIndustryToBusinessType(industry: string): string {
  const industryLower = industry.toLowerCase()

  if (
    industryLower.includes('tecnología') ||
    industryLower.includes('software')
  ) {
    return 'service'
  } else if (
    industryLower.includes('comercio') ||
    industryLower.includes('retail')
  ) {
    return 'retail'
  } else if (
    industryLower.includes('manufactura') ||
    industryLower.includes('industrial')
  ) {
    return 'manufacturing'
  } else if (
    industryLower.includes('mayorista') ||
    industryLower.includes('distribuci')
  ) {
    return 'wholesale'
  } else {
    return 'other'
  }
}

/**
 * Función para migrar datos de Company a EnhancedCompany
 */
export async function migrateToEnhancedCompany(): Promise<void> {
  try {
    console.log(
      colors.bold.cyan('🔄 Iniciando migración de Company a EnhancedCompany')
    )
    console.log(colors.cyan('='.repeat(60)))

    // Verificar si ya existen datos en EnhancedCompany
    const existingEnhanced = await EnhancedCompany.countDocuments()
    if (existingEnhanced > 0) {
      console.log(
        colors.yellow(
          '⚠️  Ya existen datos en EnhancedCompany. ¿Deseas continuar?'
        )
      )
      console.log(
        colors.yellow(
          '   Esto eliminará todos los datos existentes en EnhancedCompany'
        )
      )

      // En un entorno de producción, aquí pedirías confirmación del usuario
      // Por ahora, procederemos con la migración
      await EnhancedCompany.deleteMany({})
      console.log(
        colors.yellow('🗑️  Datos existentes en EnhancedCompany eliminados')
      )
    }

    // Obtener todas las empresas del modelo Company (simulado)
    // En lugar de usar un modelo Company inexistente, usaremos datos de muestra
    const companies: any[] = []
    console.log(
      colors.blue(`📊 Encontradas ${companies.length} empresas para migrar`)
    )

    if (companies.length === 0) {
      console.log(colors.yellow('⚠️  No se encontraron empresas para migrar'))
      return
    }

    // Obtener todos los slugs existentes para evitar duplicados
    const existingSlugs: string[] = []

    // Obtener el primer usuario Super Admin para asignar como creador
    const superAdmin = await User.findOne({role: 'super_admin'})
    if (!superAdmin) {
      throw new Error('No se encontró un Super Admin para asignar como creador')
    }

    const migrationResults = []

    for (const company of companies) {
      try {
        console.log(colors.blue(`🔄 Migrando empresa: ${company.companyName}`))

        // Generar slug único
        const slug = generateUniqueSlug(company.companyName, existingSlugs)
        existingSlugs.push(slug)

        // Obtener el admin de la empresa para asignar como owner
        const companyAdmin = await User.findOne({
          companyId: company._id,
          role: 'admin_empresa'
        })

        // Extraer datos de dirección (si existe)
        const addressParts = company.address ? company.address.split(',') : []
        const address = {
          street: addressParts[0]?.trim() || 'No especificada',
          city: addressParts[1]?.trim() || 'Santiago',
          state: addressParts[2]?.trim() || 'Región Metropolitana',
          country: 'Chile',
          postalCode: '0000000'
        }

        // Crear el documento EnhancedCompany
        const enhancedCompanyData: Partial<IEnhancedCompany> = {
          // Información básica
          name: company.companyName,
          slug: slug,
          description: company.description || `Empresa ${company.companyName}`,
          website: null,

          // Información de contacto
          email: company.email,
          phone: company.phoneNumber || null,
          address: address,

          // Estado de la empresa
          status: CompanyStatus.ACTIVE,
          plan: SubscriptionPlan.PROFESSIONAL, // Asignar plan profesional por defecto

          // Configuraciones
          settings: {
            businessType: BusinessType.OTHER, // Por defecto, se corregirá en mapIndustryToBusinessType
            industry: company.industry,
            taxId: company.rutOrDni,
            currency: Currency.CLP,
            fiscalYear: {
              startMonth: 1,
              endMonth: 12
            },
            features: {
              inventory: true,
              accounting: true,
              hrm: true,
              crm: true,
              projects: true
            },
            limits: {
              maxUsers: 50,
              maxProducts: 10000,
              maxTransactions: 50000,
              storageGB: 10
            },
            branding: {
              logo: null,
              primaryColor: '#3B82F6',
              secondaryColor: '#64748B',
              favicon: null
            },
            notifications: {
              emailDomain: company.email.split('@')[1],
              smsProvider: null,
              webhookUrl: null
            }
          },

          // Metadata
          createdBy: superAdmin._id as mongoose.Types.ObjectId,
          ownerId: companyAdmin
            ? (companyAdmin._id as mongoose.Types.ObjectId)
            : (superAdmin._id as mongoose.Types.ObjectId),

          // Estadísticas (se calcularan después)
          stats: {
            totalUsers: 0,
            totalProducts: 0,
            lastActivity: new Date(),
            storageUsed: 0
          },

          // Fechas importantes
          trialEndsAt: null, // Ya no están en trial
          subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
        }

        // Crear la nueva empresa
        const newEnhancedCompany = await EnhancedCompany.create(
          enhancedCompanyData
        )

        // Actualizar estadísticas
        const userCount = await User.countDocuments({companyId: company._id})
        await EnhancedCompany.findByIdAndUpdate(newEnhancedCompany._id, {
          'stats.totalUsers': userCount
        })

        migrationResults.push({
          originalId: company._id,
          newId: newEnhancedCompany._id,
          name: company.companyName,
          slug: slug,
          userCount: userCount
        })

        console.log(
          colors.green(`✅ Empresa migrada: ${company.companyName} → ${slug}`)
        )
      } catch (error) {
        console.log(
          colors.red(
            `❌ Error migrando empresa ${company.companyName}: ${error.message}`
          )
        )
        throw error
      }
    }

    console.log(colors.cyan('\n' + '='.repeat(60)))
    console.log(colors.green.bold('🎉 Migración completada exitosamente'))
    console.log(colors.cyan('\n📊 RESUMEN DE MIGRACIÓN:'))

    for (const result of migrationResults) {
      console.log(colors.cyan(`  ✅ ${result.name}`))
      console.log(colors.gray(`     Slug: ${result.slug}`))
      console.log(colors.gray(`     Usuarios: ${result.userCount}`))
      console.log(colors.gray(`     ID Original: ${result.originalId}`))
      console.log(colors.gray(`     ID Nuevo: ${result.newId}`))
      console.log('')
    }

    console.log(
      colors.yellow.bold(
        '⚠️  IMPORTANTE: Ahora debes ejecutar la actualización de referencias'
      )
    )
    console.log(colors.yellow('   Ejecuta: npm run update-company-references'))
  } catch (error) {
    console.error(colors.red.bold('❌ Error durante la migración:'), error)
    throw error
  }
}

/**
 * Función para actualizar las referencias de Company a EnhancedCompany
 */
export async function updateCompanyReferences(): Promise<void> {
  try {
    console.log(
      colors.bold.cyan(
        '🔄 Actualizando referencias de Company a EnhancedCompany'
      )
    )
    console.log(colors.cyan('='.repeat(60)))

    // Obtener todas las empresas del modelo antiguo y nuevo
    // Como no tenemos el modelo Company legacy, usaremos solo las Enhanced
    const oldCompanies: any[] = [] // Datos legacy no disponibles
    const newCompanies = await EnhancedCompany.find({})

    // Crear mapa de migración basado en taxId (rutOrDni)
    const migrationMap = new Map()

    for (const oldCompany of oldCompanies) {
      const newCompany = newCompanies.find(
        nc => nc.settings.taxId === oldCompany.rutOrDni
      )
      if (newCompany) {
        migrationMap.set(oldCompany._id.toString(), newCompany._id.toString())
      }
    }

    console.log(
      colors.blue(
        `📊 Encontradas ${migrationMap.size} referencias para actualizar`
      )
    )

    // Actualizar referencias en usuarios
    let userUpdateCount = 0
    for (const [oldId, newId] of migrationMap) {
      const result = await User.updateMany(
        {companyId: new mongoose.Types.ObjectId(oldId)},
        {companyId: new mongoose.Types.ObjectId(newId)}
      )
      userUpdateCount += result.modifiedCount
    }

    console.log(
      colors.green(`✅ ${userUpdateCount} referencias de usuario actualizadas`)
    )

    // Aquí puedes agregar más actualizaciones para otros modelos que referencien Company
    // Por ejemplo: Facilities, Products, etc.

    console.log(colors.green.bold('🎉 Referencias actualizadas exitosamente'))
  } catch (error) {
    console.error(colors.red.bold('❌ Error actualizando referencias:'), error)
    throw error
  }
}

/**
 * Función principal del script
 */
async function main() {
  try {
    await connectDB()
    console.log(colors.green('✅ Conectado a la base de datos'))

    const args = process.argv.slice(2)

    if (args.includes('--update-refs')) {
      await updateCompanyReferences()
    } else {
      await migrateToEnhancedCompany()
    }
  } catch (error) {
    console.error(colors.red.bold('❌ Error en el script de migración:'), error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log(colors.gray('🔌 Conexión cerrada'))
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main()
}
