// Script para probar la decodificación del token desde la consola del navegador
// Ejecutar esto en la consola del navegador para ver qué datos contiene el token actual

console.log('=== DEBUGGING TOKEN ===')

// Obtener el token
const token = localStorage.getItem('AUTH_TOKEN_VALIDATE')
if (!token) {
  console.log('❌ No hay token en localStorage')
} else {
  console.log('✅ Token encontrado:', token.substring(0, 50) + '...')

  // Función para decodificar JWT
  function decodeJWT(token) {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido')
      }
      const payload = parts[1]
      const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4)
      const decodedPayload = atob(paddedPayload)
      return JSON.parse(decodedPayload)
    } catch (error) {
      console.error('Error al decodificar JWT:', error)
      return null
    }
  }

  // Decodificar y mostrar
  const decoded = decodeJWT(token)
  console.log('📄 Token decodificado:', decoded)

  if (decoded) {
    console.log('🔍 Análisis de campos:')
    console.log('- ID:', decoded.id)
    console.log('- Email:', decoded.email)
    console.log('- Name:', decoded.name)
    console.log('- Role:', decoded.role)
    console.log('- Company:', decoded.company)
    console.log('- Issued at:', new Date((decoded.iat || 0) * 1000))
    console.log('- Expires at:', new Date((decoded.exp || 0) * 1000))

    console.log('\n📋 Todos los campos disponibles:')
    Object.keys(decoded).forEach(key => {
      console.log(`  ${key}:`, decoded[key])
    })
  }
}

// Obtener datos de localStorage
const userData = localStorage.getItem('USER_DATA')
console.log(
  '\n👤 Datos de usuario en localStorage:',
  userData ? JSON.parse(userData) : null
)
