/**
 * Quick test to verify model registration
 */
import mongoose from 'mongoose'

async function testModelRegistration() {
  try {
    console.log('🔍 Verificando registro de modelos...')

    // Verificar que los modelos estén registrados
    const registeredModels = mongoose.modelNames()
    console.log('📋 Modelos registrados:', registeredModels)

    // Verificar específicamente nuestros modelos
    const hasEnhancedUser = registeredModels.includes('EnhancedUser')
    const hasEnhancedCompany = registeredModels.includes('EnhancedCompany')

    console.log('✅ EnhancedUser registrado:', hasEnhancedUser)
    console.log('✅ EnhancedCompany registrado:', hasEnhancedCompany)

    if (hasEnhancedUser && hasEnhancedCompany) {
      console.log('🎉 Todos los modelos están correctamente registrados')
    } else {
      console.log('❌ Faltan modelos por registrar')
    }

    return {hasEnhancedUser, hasEnhancedCompany, registeredModels}
  } catch (error) {
    console.error('❌ Error verificando modelos:', error)
    return null
  }
}

export {testModelRegistration}
