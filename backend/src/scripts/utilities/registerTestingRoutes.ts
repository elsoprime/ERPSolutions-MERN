/**
 * @description Script para registrar las rutas de testing automáticamente
 * @module scripts/registerTestingRoutes
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @note Este archivo permite activar/desactivar fácilmente las rutas de testing
 */

import {Express} from 'express'
import testingRoutes from '@/modules/userManagement/routes/testingRoutes'

/**
 * Configuración para las rutas de testing
 */
interface TestingConfig {
  enabled: boolean
  basePath: string
  environment: 'development' | 'testing' | 'production'
  logRequests: boolean
}

/**
 * Configuración por defecto
 */
const defaultConfig: TestingConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  basePath: '/api/testing/auth',
  environment: (process.env.NODE_ENV as any) || 'development',
  logRequests: true
}

/**
 * Registra las rutas de testing en la aplicación
 * @param app - Instancia de Express
 * @param config - Configuración opcional
 */
export function registerTestingRoutes(
  app: Express,
  config: Partial<TestingConfig> = {}
): void {
  const finalConfig = {...defaultConfig, ...config}

  // Solo registrar en desarrollo y testing
  if (!finalConfig.enabled) {
    console.log('🚫 Rutas de testing deshabilitadas (Producción)')
    return
  }

  // Middleware de logging específico para testing
  if (finalConfig.logRequests) {
    app.use(finalConfig.basePath, (req, res, next) => {
      console.log(`🧪 TESTING: ${req.method} ${req.path}`)
      next()
    })
  }

  // Registrar las rutas
  app.use(finalConfig.basePath, testingRoutes)

  console.log(`🧪 Rutas de testing registradas en: ${finalConfig.basePath}`)
  console.log(`📝 Documentación: ${finalConfig.basePath}/help`)

  // Ruta de ayuda automática
  app.get(`${finalConfig.basePath}/help`, (req, res) => {
    const availableRoutes = [
      {
        category: '🧪 Testing Básico',
        routes: [
          {
            method: 'GET',
            path: '/basic-auth',
            description: 'Verificar middleware básico mejorado'
          },
          {
            method: 'GET',
            path: '/middleware-config',
            description: 'Ver configuración del middleware (Admin)'
          }
        ]
      },
      {
        category: '🎭 Testing de Roles',
        routes: [
          {
            method: 'GET',
            path: '/admin-only',
            description: 'Solo administradores'
          },
          {
            method: 'GET',
            path: '/management-only',
            description: 'Roles de gestión'
          },
          {
            method: 'GET',
            path: '/employee-plus',
            description: 'Empleado o superior'
          },
          {
            method: 'GET',
            path: '/warehouse-create',
            description: 'Permiso warehouse.create'
          },
          {
            method: 'GET',
            path: '/my-permissions',
            description: 'Ver mis permisos'
          }
        ]
      },
      {
        category: '🏢 Testing Multi-tenant',
        routes: [
          {
            method: 'GET',
            path: '/company/:companyId/info',
            description: 'Acceso por empresa'
          },
          {
            method: 'GET',
            path: '/company/:companyId/owner-action',
            description: 'Solo propietarios'
          },
          {method: 'GET', path: '/my-companies', description: 'Mis empresas'}
        ]
      },
      {
        category: '🚦 Testing Rate Limiting',
        routes: [
          {
            method: 'GET',
            path: '/rate-limit-test',
            description: 'Rate limiting básico'
          },
          {
            method: 'GET',
            path: '/rate-limit-strict',
            description: 'Rate limiting estricto'
          },
          {
            method: 'POST',
            path: '/critical-operation',
            description: 'Endpoint crítico (Admin)'
          }
        ]
      },
      {
        category: '📊 Testing Logging',
        routes: [
          {
            method: 'GET',
            path: '/security-metrics',
            description: 'Métricas de seguridad (Admin)'
          },
          {method: 'GET', path: '/my-activity', description: 'Mi actividad'},
          {
            method: 'POST',
            path: '/simulate-suspicious',
            description: 'Simular actividad sospechosa (Admin)'
          }
        ]
      },
      {
        category: '🚀 Testing Avanzado',
        routes: [
          {
            method: 'PUT',
            path: '/ultimate-protection/:companyId',
            description: 'Máxima protección'
          },
          {
            method: 'GET',
            path: '/system-status',
            description: 'Estado del sistema'
          }
        ]
      }
    ]

    res.json({
      title: '🧪 Guía de Rutas de Testing - JWT Middleware',
      description: 'Rutas para probar todas las funcionalidades implementadas',
      baseUrl: `${req.protocol}://${req.get('host')}${finalConfig.basePath}`,
      environment: finalConfig.environment,
      categories: availableRoutes,
      notes: [
        '🔑 Todas las rutas requieren autenticación JWT',
        '🏢 Algunas rutas requieren parámetros de empresa',
        '👑 Rutas marcadas como (Admin) requieren rol de administrador',
        '⚡ Rate limiting activo en todas las rutas',
        '📝 Todas las acciones se registran en logs'
      ],
      examples: {
        basicAuth: `GET ${finalConfig.basePath}/basic-auth`,
        adminRoute: `GET ${finalConfig.basePath}/admin-only`,
        companyRoute: `GET ${finalConfig.basePath}/company/123/info`,
        systemStatus: `GET ${finalConfig.basePath}/system-status`
      }
    })
  })
}

/**
 * Configuraciones predefinidas para diferentes entornos
 */
export const TestingConfigs = {
  development: {
    enabled: true,
    basePath: '/api/testing/auth',
    environment: 'development' as const,
    logRequests: true
  },

  testing: {
    enabled: true,
    basePath: '/api/test/auth',
    environment: 'testing' as const,
    logRequests: false
  },

  production: {
    enabled: false,
    basePath: '',
    environment: 'production' as const,
    logRequests: false
  }
} as const

export default registerTestingRoutes
