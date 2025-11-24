/**
 * Token Refresh Testing Utilities
 * @description: Utilidades para probar el sistema de refresh de tokens
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {decodeJWT} from './jwtUtils'
import {getAuthToken} from './cookies'
import {tokenRefreshManager, getTokenStatus} from './tokenRefreshManager'

/**
 * Simular un token próximo a expirar para testing
 */
export function simulateExpiringToken(minutesLeft: number = 2): void {
  console.log(`🧪 Simulando token que expira en ${minutesLeft} minutos...`)

  const currentToken = getAuthToken()
  if (!currentToken) {
    console.error('❌ No hay token para simular')
    return
  }

  const decoded = decodeJWT(currentToken)
  if (!decoded) {
    console.error('❌ No se pudo decodificar el token')
    return
  }

  // Calcular nueva fecha de expiración
  const newExp = Math.floor(Date.now() / 1000) + minutesLeft * 60

  console.log(`⏰ Token actual expira: ${new Date(decoded.exp * 1000)}`)
  console.log(`⏰ Simulando expiración: ${new Date(newExp * 1000)}`)

  // Crear nuevo payload con expiración modificada
  const modifiedPayload = {
    ...decoded,
    exp: newExp
  }

  // Crear token falso para testing (SOLO PARA DESARROLLO)
  const fakeToken = `fake.${btoa(JSON.stringify(modifiedPayload))}.testing`

  localStorage.setItem('AUTH_TOKEN_VALIDATE', fakeToken)
  console.log('✅ Token modificado para testing')
}

/**
 * Restaurar token original desde el servidor
 */
export async function restoreOriginalToken(): Promise<void> {
  console.log('🔄 Restaurando token original...')

  try {
    const success = await tokenRefreshManager.forceRefresh()
    if (success) {
      console.log('✅ Token original restaurado')
    } else {
      console.error('❌ No se pudo restaurar el token')
    }
  } catch (error) {
    console.error('❌ Error al restaurar token:', error)
  }
}

/**
 * Ejecutar suite de pruebas completa
 */
export async function runTokenRefreshTests(): Promise<void> {
  console.log('🧪 === INICIANDO PRUEBAS DE TOKEN REFRESH ===')

  // Test 1: Verificar estado inicial
  console.log('\n📋 Test 1: Estado inicial del token')
  const initialStatus = getTokenStatus()
  console.log('Estado inicial:', initialStatus)

  if (!initialStatus.hasToken) {
    console.error('❌ No hay token para probar. Inicia sesión primero.')
    return
  }

  // Test 2: Simular token próximo a expirar
  console.log('\n📋 Test 2: Simulando token próximo a expirar')
  simulateExpiringToken(2) // 2 minutos

  await new Promise(resolve => setTimeout(resolve, 1000))

  const statusAfterSim = getTokenStatus()
  console.log('Estado después de simulación:', statusAfterSim)

  if (statusAfterSim.needsRefresh) {
    console.log('✅ Sistema detectó correctamente que necesita refresh')
  } else {
    console.log('❌ Sistema no detectó la necesidad de refresh')
  }

  // Test 3: Forzar refresh manual
  console.log('\n📋 Test 3: Ejecutando refresh manual')
  const refreshSuccess = await tokenRefreshManager.forceRefresh()

  if (refreshSuccess) {
    console.log('✅ Refresh manual exitoso')
  } else {
    console.log('❌ Refresh manual falló')
  }

  // Test 4: Verificar estado final
  console.log('\n📋 Test 4: Estado final del token')
  const finalStatus = getTokenStatus()
  console.log('Estado final:', finalStatus)

  console.log('\n🎯 === PRUEBAS COMPLETADAS ===')
}

/**
 * Monitor en tiempo real del estado del token
 */
export function startTokenMonitor(intervalSeconds: number = 5): () => void {
  console.log(`🔍 Iniciando monitor de token (cada ${intervalSeconds}s)`)

  const interval = setInterval(() => {
    const status = getTokenStatus()
    console.log(`📊 [${new Date().toLocaleTimeString()}] Token Status:`, {
      válido: status.hasToken && !status.isExpired,
      tiempoRestante: status.timeUntilExpiration,
      necesitaRefresh: status.needsRefresh,
      renovando: status.isRefreshing
    })
  }, intervalSeconds * 1000)

  // Retornar función para detener el monitor
  return () => {
    clearInterval(interval)
    console.log('⏹️ Monitor de token detenido')
  }
}

// Funciones para usar en la consola del navegador
if (typeof window !== 'undefined') {
  ;(window as any).tokenTests = {
    simulate: simulateExpiringToken,
    restore: restoreOriginalToken,
    runTests: runTokenRefreshTests,
    monitor: startTokenMonitor,
    status: getTokenStatus,
    forceRefresh: () => tokenRefreshManager.forceRefresh()
  }

  console.log('🧪 Token testing utilities disponibles en window.tokenTests')
  console.log(
    'Ejemplo: tokenTests.simulate(1) // Simula token que expira en 1 minuto'
  )
}
