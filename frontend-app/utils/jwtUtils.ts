/**
 * JWT Utils
 * @description: Utilidades para decodificar y manejar JWT tokens
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

/**
 * Decodificar JWT token (sin verificar firma - solo para leer datos)
 */
export function decodeJWT(token: string) {
  try {
    // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido')
    }

    // Decodificar el payload (segunda parte)
    const payload = parts[1]

    // Agregar padding si es necesario para base64
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4)

    // Decodificar de base64
    const decodedPayload = atob(paddedPayload)

    // Parsear JSON
    return JSON.parse(decodedPayload)
  } catch (error) {
    console.error('Error al decodificar JWT:', error)
    return null
  }
}

/**
 * Verificar si un token JWT ha expirado
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) {
      return true
    }

    // exp está en segundos, Date.now() está en milisegundos
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

/**
 * Obtener datos del usuario desde el token JWT
 */
export function getUserFromToken(token: string) {
  try {
    const decoded = decodeJWT(token)
    if (!decoded) {
      return null
    }

    // Los datos del usuario normalmente están en el payload del JWT
    return {
      id: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.username,
      role: decoded.role,
      company: decoded.company,
      permissions: decoded.permissions,
      iat: decoded.iat, // issued at
      exp: decoded.exp // expiration
    }
  } catch (error) {
    console.error('Error al extraer datos del usuario del token:', error)
    return null
  }
}
