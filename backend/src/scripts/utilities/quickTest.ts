/**
 * @description Script de verificación rápida para testing del middleware JWT
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @note Ejecuta este script para verificar que todo está funcionando correctamente
 */

// Configuración
const CONFIG = {
  baseURL: process.env.BASE_URL || 'http://localhost:4000',
  testingPath: '/api/testing/auth',
  timeout: 5000
}

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  responseTime?: number
}

class MiddlewareQuickTest {
  private jwt_token: string = ''
  private results: TestResult[] = []

  constructor(token?: string) {
    this.jwt_token = token || process.env.JWT_TOKEN || ''
  }

  /**
   * Crear configuración de fetch con headers
   */
  private createFetchConfig(path: string = ''): {
    url: string
    options: RequestInit
  } {
    return {
      url: `${CONFIG.baseURL}${CONFIG.testingPath}${path}`,
      options: {
        headers: {
          Authorization: `Bearer ${this.jwt_token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(CONFIG.timeout)
      }
    }
  }

  /**
   * Realizar petición HTTP con fetch
   */
  private async fetchWithConfig(
    path: string,
    method: string = 'GET'
  ): Promise<Response> {
    const {url, options} = this.createFetchConfig(path)

    const response = await fetch(url, {
      ...options,
      method
    })

    return response
  }

  /**
   * Test individual
   */
  private async runTest(
    name: string,
    testFn: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now()

    try {
      await testFn()
      const responseTime = Date.now() - startTime

      this.results.push({
        name,
        status: 'PASS',
        message: 'Test exitoso',
        responseTime
      })

      console.log(`✅ ${name} - PASS (${responseTime}ms)`)
    } catch (error: any) {
      const responseTime = Date.now() - startTime

      this.results.push({
        name,
        status: 'FAIL',
        message: error.message || 'Error desconocido',
        responseTime
      })

      console.log(`❌ ${name} - FAIL (${responseTime}ms): ${error.message}`)
    }
  }

  /**
   * Test 1: Verificar que las rutas están disponibles
   */
  private async testRoutesAvailable(): Promise<void> {
    await this.runTest('Rutas de Testing Disponibles', async () => {
      const response = await this.fetchWithConfig('/help')

      if (!response.ok) {
        throw new Error(`Status ${response.status}`)
      }

      const data = (await response.json()) as any

      if (!data.title || !data.categories) {
        throw new Error('Respuesta de help inválida')
      }
    })
  }

  /**
   * Test 2: Verificar autenticación básica
   */
  private async testBasicAuth(): Promise<void> {
    if (!this.jwt_token) {
      this.results.push({
        name: 'Autenticación Básica',
        status: 'SKIP',
        message: 'Token JWT no proporcionado'
      })
      console.log(`⏭️ Autenticación Básica - SKIP (Token JWT no proporcionado)`)
      return
    }

    await this.runTest('Autenticación Básica', async () => {
      const response = await this.fetchWithConfig('/basic-auth')

      if (!response.ok) {
        throw new Error(`Status ${response.status}`)
      }

      const data = (await response.json()) as any

      if (!data.user || !data.user.email) {
        throw new Error('Datos de usuario inválidos en respuesta')
      }
    })
  }

  /**
   * Test 3: Verificar estado del sistema
   */
  private async testSystemStatus(): Promise<void> {
    if (!this.jwt_token) {
      this.results.push({
        name: 'Estado del Sistema',
        status: 'SKIP',
        message: 'Token JWT no proporcionado'
      })
      console.log(`⏭️ Estado del Sistema - SKIP (Token JWT no proporcionado)`)
      return
    }

    await this.runTest('Estado del Sistema', async () => {
      const response = await this.fetchWithConfig('/system-status')

      if (!response.ok) {
        throw new Error(`Status ${response.status}`)
      }

      const data = (await response.json()) as any
      const {systemStatus} = data

      if (
        !systemStatus ||
        !systemStatus.authentication ||
        !systemStatus.roleSystem
      ) {
        throw new Error('Estado del sistema incompleto')
      }
    })
  }

  /**
   * Test 4: Verificar rate limiting
   */
  private async testRateLimiting(): Promise<void> {
    await this.runTest('Rate Limiting', async () => {
      const response = await this.fetchWithConfig('/rate-limit-test')

      // Aceptar tanto 200 (éxito) como 429 (rate limited)
      if (![200, 429].includes(response.status)) {
        throw new Error(`Status inesperado ${response.status}`)
      }

      // Verificar headers de rate limiting
      const rateLimitHeaders = response.headers.get('x-ratelimit-limit')
      if (!rateLimitHeaders) {
        throw new Error('Headers de rate limiting no encontrados')
      }
    })
  }

  /**
   * Test 5: Verificar conectividad del servidor
   */
  private async testServerConnectivity(): Promise<void> {
    await this.runTest('Conectividad del Servidor', async () => {
      const response = await fetch(`${CONFIG.baseURL}/`, {
        signal: AbortSignal.timeout(CONFIG.timeout)
      })

      // Solo verificar que el servidor responde
      if (!response.status) {
        throw new Error('Servidor no responde')
      }
    })
  }

  /**
   * Ejecutar todos los tests
   */
  public async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Iniciando verificación rápida del middleware JWT...\n')
    console.log(`📍 URL Base: ${CONFIG.baseURL}${CONFIG.testingPath}`)
    console.log(
      `🔑 Token JWT: ${this.jwt_token ? 'Configurado' : 'No configurado'}\n`
    )

    // Ejecutar tests en orden
    await this.testServerConnectivity()
    await this.testRoutesAvailable()
    await this.testBasicAuth()
    await this.testSystemStatus()
    await this.testRateLimiting()

    // Resumen
    this.printSummary()

    return this.results
  }

  /**
   * Imprimir resumen de tests
   */
  private printSummary(): void {
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const skipped = this.results.filter(r => r.status === 'SKIP').length
    const total = this.results.length

    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMEN DE TESTS')
    console.log('='.repeat(50))
    console.log(`✅ Exitosos: ${passed}/${total}`)
    console.log(`❌ Fallidos: ${failed}/${total}`)
    console.log(`⏭️ Omitidos: ${skipped}/${total}`)

    if (failed === 0 && passed > 0) {
      console.log('\n🎉 ¡Todos los tests disponibles pasaron exitosamente!')
      console.log('✨ El middleware JWT está funcionando correctamente')
    } else if (failed > 0) {
      console.log(
        '\n⚠️ Algunos tests fallaron. Revisar los errores anteriores.'
      )
    }

    if (skipped > 0) {
      console.log('\n💡 Para ejecutar todos los tests:')
      console.log('   1. Configura una variable JWT_TOKEN con un token válido')
      console.log('   2. Asegúrate de que tu servidor esté ejecutándose')
      console.log('   3. Verifica que las rutas de testing estén habilitadas')
    }

    console.log('\n📚 Para tests más detallados:')
    console.log(
      '   - Importa la collection de Postman: JWT_Middleware_Testing.postman_collection.json'
    )
    console.log('   - Revisa la guía completa: TESTING_GUIDE.md')
    console.log('   - Consulta la integración: INTEGRATION_GUIDE.md')
    console.log('='.repeat(50))
  }
}

/**
 * Función principal para ejecutar desde línea de comandos
 */
async function main() {
  const token = process.argv[2] || process.env.JWT_TOKEN

  if (!token) {
    console.log('💡 Uso: npm run test:quick [JWT_TOKEN]')
    console.log('💡 O configura la variable de entorno JWT_TOKEN')
    console.log('⚠️ Sin token, algunos tests se omitirán\n')
  }

  const tester = new MiddlewareQuickTest(token)
  await tester.runAllTests()
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export {MiddlewareQuickTest, CONFIG}
export default MiddlewareQuickTest

/*
🚀 CÓMO USAR ESTE SCRIPT:

1. Desde línea de comandos:
   node dist/scripts/quickTest.js [JWT_TOKEN]

2. Con variables de entorno:
   JWT_TOKEN=tu_token_aqui node dist/scripts/quickTest.js

3. Como script npm (agrega a package.json):
   "test:quick": "tsx src/scripts/quickTest.ts"

4. Importando en otros archivos:
   import MiddlewareQuickTest from './scripts/quickTest'
   const tester = new MiddlewareQuickTest('token')
   await tester.runAllTests()

📋 TESTS QUE EJECUTA:
- ✅ Conectividad del servidor
- ✅ Disponibilidad de rutas de testing  
- ✅ Autenticación básica (si hay token)
- ✅ Estado del sistema (si hay token)
- ✅ Rate limiting básico

🎯 PROPÓSITO:
Verificación rápida (< 30 segundos) para confirmar que:
- El servidor está funcionando
- Las rutas de testing están registradas
- Los middlewares básicos responden correctamente
- No hay errores críticos de configuración
*/
