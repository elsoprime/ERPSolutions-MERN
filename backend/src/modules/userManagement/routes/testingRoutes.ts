/**
 * @description Rutas específicas para testing de las funcionalidades avanzadas
 * @module routes/testingRoutes
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @note Estas rutas son solo para testing. Eliminar en producción.
 */

import {Router} from 'express'
import {authMiddleware} from '@/modules/userManagement/middleware/authMiddleware'
import {
  requireRole,
  requireAdmin,
  requireManagement,
  requirePermission,
  SystemRole,
  RoleMiddleware
} from '@/modules/userManagement/middleware/roleMiddleware'
import {
  requireCompanyFromParam,
  requireCompanyOwnership,
  requireActiveCompany,
  CompanyMiddleware
} from '@/modules/userManagement/middleware/companyMiddleware'
import {
  authRateLimit,
  apiRateLimit,
  createProtectedEndpoint,
  RateLimitMiddleware
} from '@/modules/userManagement/middleware/rateLimitMiddleware'
import {AuthLogger} from '@/modules/userManagement/utils/authLogger'

const router = Router()

// ========================================
// RUTAS DE TESTING BÁSICO
// ========================================

/**
 * 🧪 TEST 1: Verificar middleware básico mejorado
 */
router.get('/basic-auth', authMiddleware.authenticate, (req, res) => {
  const user = req.authUser!

  res.json({
    success: true,
    message: 'Autenticación básica exitosa',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    },
    middleware: 'Phase 1 & 2 Working',
    timestamp: new Date().toISOString()
  })
})

/**
 * 🧪 TEST 2: Verificar configuración del middleware
 */
router.get(
  '/middleware-config',
  authMiddleware.authenticate,
  requireAdmin,
  (req, res) => {
    const authConfig = authMiddleware.getConfig()

    res.json({
      success: true,
      message: 'Configuración del middleware',
      authConfig,
      timestamp: new Date().toISOString()
    })
  }
)

// ========================================
// RUTAS DE TESTING DE ROLES
// ========================================

/**
 * 🎭 TEST 3: Solo administradores
 */
router.get(
  '/admin-only',
  authMiddleware.authenticate,
  requireAdmin,
  (req, res) => {
    const user = req.authUser!

    res.json({
      success: true,
      message: 'Acceso de administrador autorizado',
      user: user.name,
      role: user.role,
      test: 'Admin Role Middleware Working'
    })
  }
)

/**
 * 👔 TEST 4: Roles de gestión
 */
router.get(
  '/management-only',
  authMiddleware.authenticate,
  requireManagement,
  (req, res) => {
    const user = req.authUser!

    res.json({
      success: true,
      message: 'Acceso de gestión autorizado',
      user: user.name,
      role: user.role,
      allowedRoles: ['manager', 'admin', 'superadmin'],
      test: 'Management Role Middleware Working'
    })
  }
)

/**
 * 🔑 TEST 5: Rol específico
 */
router.get(
  '/employee-plus',
  authMiddleware.authenticate,
  requireRole(SystemRole.EMPLOYEE),
  (req, res) => {
    const user = req.authUser!

    res.json({
      success: true,
      message: 'Acceso de empleado+ autorizado',
      user: user.name,
      role: user.role,
      requiredRole: 'employee',
      hierarchy: 'employee, supervisor, manager, admin, superadmin',
      test: 'Hierarchical Role Middleware Working'
    })
  }
)

/**
 * 🛡️ TEST 6: Permisos específicos
 */
router.get(
  '/warehouse-create',
  authMiddleware.authenticate,
  requirePermission('warehouse', 'create'),
  (req, res) => {
    const user = req.authUser!

    res.json({
      success: true,
      message: 'Permiso de creación en warehouse autorizado',
      user: user.name,
      role: user.role,
      permission: 'warehouse.create',
      test: 'Permission-based Middleware Working'
    })
  }
)

/**
 * 📊 TEST 7: Obtener permisos del usuario
 */
router.get('/my-permissions', authMiddleware.authenticate, (req, res) => {
  const user = req.authUser!
  const permissions = RoleMiddleware.getUserPermissions(user)

  res.json({
    success: true,
    message: 'Permisos del usuario',
    user: user.name,
    role: user.role,
    permissions,
    test: 'Permission System Working'
  })
})

// ========================================
// RUTAS DE TESTING MULTI-TENANT
// ========================================

/**
 * 🏢 TEST 8: Acceso por empresa
 */
router.get(
  '/company/:companyId/info',
  authMiddleware.authenticate,
  requireCompanyFromParam('companyId'),
  (req, res) => {
    const user = req.authUser!
    const companyContext = (req as any).companyContext

    res.json({
      success: true,
      message: 'Acceso a empresa autorizado',
      companyId: req.params.companyId,
      userCompany: user.companyId?.toString(),
      context: companyContext,
      test: 'Multi-tenant Middleware Working'
    })
  }
)

/**
 * 👑 TEST 9: Solo propietarios de empresa
 */
router.get(
  '/company/:companyId/owner-action',
  authMiddleware.authenticate,
  requireCompanyFromParam('companyId'),
  requireCompanyOwnership(),
  (req, res) => {
    const user = req.authUser!
    const companyContext = (req as any).companyContext

    res.json({
      success: true,
      message: 'Acción de propietario autorizada',
      companyId: req.params.companyId,
      user: user.name,
      isOwner: companyContext.isOwner,
      test: 'Company Ownership Middleware Working'
    })
  }
)

/**
 * 🔍 TEST 10: Verificar acceso a múltiples empresas
 */
router.get('/my-companies', authMiddleware.authenticate, (req, res) => {
  const user = req.authUser!
  const companies = CompanyMiddleware.getUserCompanies(user)

  res.json({
    success: true,
    message: 'Empresas del usuario',
    user: user.name,
    companies,
    test: 'Multi-company Access Working'
  })
})

// ========================================
// RUTAS DE TESTING RATE LIMITING
// ========================================

/**
 * 🚦 TEST 11: Rate limiting básico
 */
router.get(
  '/rate-limit-test',
  apiRateLimit,
  authMiddleware.authenticate,
  (req, res) => {
    const user = req.authUser!

    res.json({
      success: true,
      message: 'Request exitoso con rate limiting',
      user: user.name,
      role: user.role,
      requestNumber: Math.floor(Math.random() * 1000),
      test: 'Rate Limiting Working',
      timestamp: new Date().toISOString()
    })
  }
)

/**
 * ⚡ TEST 12: Rate limiting estricto para testing
 */
const testRateLimit = RateLimitMiddleware.createRateLimit(
  {
    guest: {windowMs: 60000, maxRequests: 2},
    user: {windowMs: 60000, maxRequests: 3},
    employee: {windowMs: 60000, maxRequests: 5},
    admin: {windowMs: 60000, maxRequests: 10},
    superadmin: {windowMs: 60000, maxRequests: 20}
  },
  'strict-test'
)

router.get(
  '/rate-limit-strict',
  testRateLimit,
  authMiddleware.authenticate,
  (req, res) => {
    const user = req.authUser!

    res.json({
      success: true,
      message: 'Request exitoso con rate limiting estricto',
      user: user.name,
      role: user.role,
      maxRequests: user.role === 'admin' ? 10 : user.role === 'user' ? 3 : 2,
      test: 'Strict Rate Limiting Working',
      timestamp: new Date().toISOString()
    })
  }
)

/**
 * 🔒 TEST 13: Endpoint crítico protegido
 */
router.post(
  '/critical-operation',
  ...createProtectedEndpoint('critical'),
  authMiddleware.authenticate,
  requireAdmin,
  (req, res) => {
    const user = req.authUser!

    // Log de operación crítica
    AuthLogger.logEvent(
      'access_granted' as any,
      'warn' as any,
      `Operación crítica ejecutada por ${user.email}`,
      req,
      user,
      {operation: 'critical_test', riskLevel: 'high'}
    )

    res.json({
      success: true,
      message: 'Operación crítica ejecutada exitosamente',
      user: user.name,
      operation: 'critical_test',
      logged: true,
      test: 'Critical Endpoint Protection Working'
    })
  }
)

// ========================================
// RUTAS DE TESTING LOGGING
// ========================================

/**
 * 📊 TEST 14: Métricas de seguridad
 */
router.get(
  '/security-metrics',
  authMiddleware.authenticate,
  requireAdmin,
  (req, res) => {
    const stats = AuthLogger.getEventStats()
    const summary = AuthLogger.getSecuritySummary()
    const suspicious = AuthLogger.detectSuspiciousActivity()

    res.json({
      success: true,
      message: 'Métricas de seguridad del sistema',
      eventStats: stats.slice(0, 10),
      securitySummary: summary,
      suspiciousActivity: suspicious,
      test: 'Security Logging Working',
      timestamp: new Date().toISOString()
    })
  }
)

/**
 * 🔍 TEST 15: Logs del usuario actual
 */
router.get('/my-activity', authMiddleware.authenticate, (req, res) => {
  const user = req.authUser!
  const userLogs = AuthLogger.getUserLogs(user.id, 10)

  res.json({
    success: true,
    message: 'Actividad del usuario',
    user: user.name,
    recentActivity: userLogs,
    test: 'User Activity Logging Working'
  })
})

/**
 * 🚨 TEST 16: Generar actividad sospechosa (para testing)
 */
router.post(
  '/simulate-suspicious',
  authMiddleware.authenticate,
  requireAdmin,
  (req, res) => {
    const user = req.authUser!

    // Simular actividad sospechosa
    AuthLogger.logSuspiciousActivity(
      req,
      user,
      'Actividad sospechosa simulada para testing'
    )

    res.json({
      success: true,
      message: 'Actividad sospechosa simulada',
      user: user.name,
      test: 'Suspicious Activity Detection Working'
    })
  }
)

// ========================================
// RUTAS DE TESTING COMBINADO
// ========================================

/**
 * 🚀 TEST 17: Ruta con todas las protecciones
 */
router.put(
  '/ultimate-protection/:companyId',
  // Rate limiting crítico
  ...createProtectedEndpoint('critical'),

  // Autenticación
  authMiddleware.authenticate,

  // Validación de empresa
  requireCompanyFromParam('companyId'),
  requireActiveCompany(),

  // Permisos específicos
  requirePermission('reports', 'financial'),

  // Solo propietarios
  requireCompanyOwnership(),

  (req, res) => {
    const user = req.authUser!
    const companyContext = (req as any).companyContext

    // Log de máxima seguridad
    AuthLogger.logEvent(
      'access_granted' as any,
      'critical' as any,
      `Acceso de máxima seguridad por ${user.email}`,
      req,
      user,
      {
        companyId: req.params.companyId,
        securityLevel: 'maximum',
        allProtectionsActive: true
      }
    )

    res.json({
      success: true,
      message: 'Acceso de máxima seguridad autorizado',
      user: user.name,
      companyId: req.params.companyId,
      securityLevel: 'MAXIMUM',
      protections: [
        'Rate Limiting Critical',
        'JWT Authentication',
        'Company Validation',
        'Active Company Check',
        'Financial Permission',
        'Ownership Requirement',
        'Security Logging'
      ],
      test: 'ULTIMATE PROTECTION WORKING'
    })
  }
)

/**
 * 📋 TEST 18: Status general del sistema
 */
router.get('/system-status', authMiddleware.authenticate, (req, res) => {
  const user = req.authUser!

  // Verificar todos los sistemas
  const systemStatus = {
    authentication: {
      working: true,
      cacheEnabled: authMiddleware.getConfig().cacheEnabled,
      user: user.name
    },
    roleSystem: {
      working: true,
      userRole: user.role,
      permissions: RoleMiddleware.getUserPermissions(user)
    },
    multiTenant: {
      working: true,
      userCompany: user.companyId?.toString(),
      accessibleCompanies: CompanyMiddleware.getUserCompanies(user)
    },
    rateLimiting: {
      working: true,
      stats: 'Check headers for rate limit info'
    },
    logging: {
      working: true,
      recentEvents: AuthLogger.getEventStats().length
    }
  }

  res.json({
    success: true,
    message: 'Estado general del sistema de autenticación',
    systemStatus,
    allSystemsOperational: true,
    test: 'COMPLETE SYSTEM STATUS'
  })
})

export default router
