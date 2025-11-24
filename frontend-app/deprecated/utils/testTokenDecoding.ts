/**
 * Test Token Decoding - Utilities for testing JWT token decoding
 * @description: Test utility to verify what data is available in current JWT token
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {decodeJWT, getUserFromToken} from './jwtUtils'
import {UserRole} from '../types/roles'

/**
 * Test function to decode and log current token information
 */
export function testCurrentToken() {
  if (typeof window === 'undefined') {
    console.log('Running in server environment, cannot access localStorage')
    return null
  }

  const token = localStorage.getItem('AUTH_TOKEN_VALIDATE')

  if (!token) {
    console.log('No token found in localStorage')
    return null
  }

  console.log('=== ANÁLISIS DEL TOKEN ACTUAL ===')
  console.log('Token:', token.substring(0, 50) + '...')

  // Decodificar el token completo
  const decodedToken = decodeJWT(token)
  console.log('Token decodificado completo:', decodedToken)

  // Extraer datos del usuario usando nuestra función
  const userData = getUserFromToken(token)
  console.log('Datos del usuario extraídos:', userData)

  // Análisis detallado
  if (decodedToken) {
    console.log('\n=== CAMPOS DISPONIBLES EN EL TOKEN ===')
    console.log(
      'ID disponible:',
      !!decodedToken.id,
      '- Valor:',
      decodedToken.id
    )
    console.log(
      'Email disponible:',
      !!decodedToken.email,
      '- Valor:',
      decodedToken.email
    )
    console.log(
      'Name disponible:',
      !!decodedToken.name,
      '- Valor:',
      decodedToken.name
    )
    console.log(
      'Role disponible:',
      !!decodedToken.role,
      '- Valor:',
      decodedToken.role
    )
    console.log(
      'Company disponible:',
      !!decodedToken.company,
      '- Valor:',
      decodedToken.company
    )
    console.log('IAT (issued at):', new Date((decodedToken.iat || 0) * 1000))
    console.log('EXP (expires):', new Date((decodedToken.exp || 0) * 1000))

    // Mostrar todos los campos disponibles
    console.log('\n=== TODOS LOS CAMPOS DEL TOKEN ===')
    Object.keys(decodedToken).forEach(key => {
      console.log(`${key}:`, decodedToken[key])
    })
  }

  return {
    raw: decodedToken,
    user: userData
  }
}

/**
 * Create demo user data based on available token information
 */
export function createDemoUserFromToken() {
  const token = localStorage.getItem('AUTH_TOKEN_VALIDATE')

  if (!token) {
    return {
      id: 'demo-user',
      name: 'Usuario Demo',
      email: 'demo@empresa.com',
      role: 'admin' as UserRole,
      isAuthenticated: true
    }
  }

  const userData = getUserFromToken(token)

  // Validar que el role sea un UserRole válido
  const validRoles: UserRole[] = [
    'super_admin',
    'admin',
    'manager',
    'employee',
    'viewer'
  ]
  const userRole =
    userData?.role && validRoles.includes(userData.role as UserRole)
      ? (userData.role as UserRole)
      : ('admin' as UserRole)

  // Si tenemos datos del token, usarlos; si no, crear datos demo basados en lo que tenemos
  return {
    id: userData?.id || 'user-from-token',
    name: userData?.name || userData?.email?.split('@')[0] || 'Usuario',
    email: userData?.email || 'usuario@empresa.com',
    role: userRole,
    company: userData?.company,
    isAuthenticated: true,
    avatar: userData?.name
      ? userData.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
      : 'U'
  }
}
