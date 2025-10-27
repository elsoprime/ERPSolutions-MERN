/**
 * @description Ejemplos de integración de middlewares avanzados
 * @module examples/routeExamples
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

import {Router} from 'express'
import {authMiddleware} from '../middleware/authMiddleware'
import {
  requireRole,
  requireAdmin,
  requireManagement,
  requirePermission,
  SystemRole
} from '../middleware/roleMiddleware'
import {
  requireCompanyFromParam,
  requireCompanyOwnership,
  requireActiveCompany
} from '../middleware/companyMiddleware'
import {
  authRateLimit,
  loginRateLimit,
  apiRateLimit,
  createProtectedEndpoint
} from '../middleware/rateLimitMiddleware'
import {AuthLogger} from '../utils/authLogger'

/**
 * @description Ejemplos de rutas con middlewares avanzados
 * Estos ejemplos muestran cómo integrar los nuevos middlewares
 * con tu aplicación existente
 */

const router = Router()

// ========================================
// EJEMPLOS BÁSICOS - COMPATIBILIDAD TOTAL
// ========================================

/**
 * ✅ EJEMPLO 1: Ruta protegida básica (MANTIENE COMPATIBILIDAD)
 * Esta es exactamente igual que antes, pero ahora:
 * - Usuario disponible en req.authUser
 * - Cache inteligente
 * - Logging automático
 * - Mejor manejo de errores
 */
router.get('/basic-protected', authMiddleware.authenticate, (req, res) => {
  // 🎉 NUEVO: Usuario autenticado disponible automáticamente
  const user = req.authUser

  res.json({
    message: 'Acceso autorizado',
    user: {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      role: user!.role
    }
  })
})

// ========================================
// EJEMPLOS CON ROLES GRANULARES
// ========================================

/**
 * 🔐 EJEMPLO 2: Solo administradores
 */
router.get(
  '/admin-only',
  authMiddleware.authenticate,
  requireAdmin,
  (req, res) => {
    AuthLogger.logEvent(
      'access_granted' as any,
      'info' as any,
      'Admin accessed restricted endpoint',
      req,
      req.authUser
    )

    res.json({message: 'Panel de administración'})
  }
)

/**
 * 👔 EJEMPLO 3: Roles de gestión (Manager, Admin, Super Admin)
 */
router.get(
  '/management-dashboard',
  authMiddleware.authenticate,
  requireManagement,
  (req, res) => {
    const user = req.authUser!

    res.json({
      message: 'Dashboard de gestión',
      userRole: user.role,
      permissions: ['view_reports', 'manage_employees']
    })
  }
)

/**
 * 🔑 EJEMPLO 4: Permiso específico por módulo
 */
router.post(
  '/warehouse/products',
  authMiddleware.authenticate,
  requirePermission('warehouse', 'create'),
  (req, res) => {
    res.json({message: 'Producto creado exitosamente'})
  }
)

/**
 * ⭐ EJEMPLO 5: Múltiples roles permitidos
 */
router.get(
  '/reports',
  authMiddleware.authenticate,
  requireRole(SystemRole.SUPERVISOR), // Supervisor o superior
  (req, res) => {
    const user = req.authUser!

    res.json({
      message: 'Reportes disponibles',
      accessLevel: user.role,
      availableReports: ['sales', 'inventory', 'performance']
    })
  }
)

// ========================================
// EJEMPLOS MULTI-TENANT POR EMPRESA
// ========================================

/**
 * 🏢 EJEMPLO 6: Acceso por empresa desde parámetro
 */
router.get(
  '/companies/:companyId/data',
  authMiddleware.authenticate,
  requireCompanyFromParam('companyId'),
  (req, res) => {
    const user = req.authUser!
    const companyContext = (req as any).companyContext

    res.json({
      message: 'Datos de la empresa',
      companyId: req.params.companyId,
      userRole: companyContext.userRole,
      isOwner: companyContext.isOwner
    })
  }
)

/**
 * 👑 EJEMPLO 7: Solo propietarios de empresa
 */
router.put(
  '/companies/:companyId/settings',
  authMiddleware.authenticate,
  requireCompanyFromParam('companyId'),
  requireCompanyOwnership(),
  requireActiveCompany(),
  (req, res) => {
    res.json({message: 'Configuración actualizada'})
  }
)

/**
 * 🔧 EJEMPLO 8: Middleware combinado para empresa
 */
router.delete(
  '/companies/:companyId/users/:userId',
  authMiddleware.authenticate,
  requireCompanyFromParam('companyId'),
  requireActiveCompany(),
  requireCompanyOwnership(),
  (req, res) => {
    res.json({message: 'Usuario eliminado de la empresa'})
  }
)

// ========================================
// EJEMPLOS CON RATE LIMITING
// ========================================

/**
 * 🚦 EJEMPLO 9: Login con rate limiting estricto
 */
router.post(
  '/auth/login',
  loginRateLimit, // Límite estricto para login
  (req, res) => {
    // Lógica de login aquí
    res.json({message: 'Login exitoso'})
  }
)

/**
 * 📊 EJEMPLO 10: API con rate limiting por rol
 */
router.get(
  '/api/data',
  authMiddleware.authenticate,
  apiRateLimit,
  (req, res) => {
    const user = req.authUser!

    res.json({
      message: 'Datos de API',
      userRole: user.role,
      rateLimit: 'Applied based on user role'
    })
  }
)

/**
 * 🔒 EJEMPLO 11: Endpoint crítico con protección completa
 */
router.post(
  '/critical-operation',
  ...createProtectedEndpoint('critical'), // Rate limiting + IP blocking
  authMiddleware.authenticate,
  requireAdmin,
  (req, res) => {
    AuthLogger.logEvent(
      'suspicious_activity' as any,
      'warn' as any,
      'Critical operation accessed',
      req,
      req.authUser
    )

    res.json({message: 'Operación crítica ejecutada'})
  }
)

// ========================================
// EJEMPLOS CON LOGGING AVANZADO
// ========================================

/**
 * 📝 EJEMPLO 12: Endpoint con logging personalizado
 */
router.post('/sensitive-action', authMiddleware.authenticate, (req, res) => {
  const user = req.authUser!

  // Log personalizado antes de la acción
  AuthLogger.logEvent(
    'access_granted' as any,
    'info' as any,
    `Usuario ${user.email} realizó acción sensible`,
    req,
    user,
    {action: 'sensitive_action', data: req.body}
  )

  // Ejecutar acción sensible aquí

  res.json({message: 'Acción ejecutada y registrada'})
})

/**
 * 🚨 EJEMPLO 13: Endpoint con detección de actividad sospechosa
 */
router.get(
  '/admin/users',
  authMiddleware.authenticate,
  requireAdmin,
  (req, res) => {
    const user = req.authUser!

    // Detectar patrones sospechosos
    const suspiciousActivity = AuthLogger.detectSuspiciousActivity(user.id)

    if (suspiciousActivity.length > 0) {
      AuthLogger.logSuspiciousActivity(
        req,
        user,
        `Patrones sospechosos detectados: ${suspiciousActivity
          .map(a => a.type)
          .join(', ')}`
      )
    }

    res.json({
      message: 'Lista de usuarios',
      securityAlert: suspiciousActivity.length > 0
    })
  }
)

// ========================================
// EJEMPLOS COMBINADOS AVANZADOS
// ========================================

/**
 * 🚀 EJEMPLO 14: Ruta con todas las protecciones
 */
router.put(
  '/companies/:companyId/financial-data',
  // 1. Rate limiting crítico
  ...createProtectedEndpoint('critical'),

  // 2. Autenticación básica
  authMiddleware.authenticate,

  // 3. Verificar acceso a empresa
  requireCompanyFromParam('companyId'),
  requireActiveCompany(),

  // 4. Requerir permisos específicos
  requirePermission('reports', 'financial'),

  // 5. Solo propietarios o admins
  requireCompanyOwnership(),

  // Handler principal
  (req, res) => {
    const user = req.authUser!
    const companyContext = (req as any).companyContext

    // Log de acceso a datos financieros
    AuthLogger.logEvent(
      'access_granted' as any,
      'warn' as any,
      `Acceso a datos financieros de empresa ${req.params.companyId}`,
      req,
      user,
      {
        companyId: req.params.companyId,
        userRole: companyContext.userRole,
        dataType: 'financial',
        riskLevel: 'high'
      }
    )

    res.json({
      message: 'Datos financieros actualizados',
      companyId: req.params.companyId,
      updatedBy: user.name,
      timestamp: new Date().toISOString()
    })
  }
)

/**
 * 📈 EJEMPLO 15: Endpoint de métricas de seguridad
 */
router.get(
  '/admin/security-metrics',
  authMiddleware.authenticate,
  requireRole(SystemRole.SUPER_ADMIN),
  (req, res) => {
    const securitySummary = AuthLogger.getSecuritySummary()
    const eventStats = AuthLogger.getEventStats()

    res.json({
      message: 'Métricas de seguridad',
      summary: securitySummary,
      eventStats: eventStats.slice(0, 10), // Top 10 eventos
      timestamp: new Date().toISOString()
    })
  }
)

// ========================================
// INTEGRACIÓN CON RUTAS EXISTENTES
// ========================================

/**
 * 🔄 EJEMPLO 16: Mejorando ruta existente
 * Tu ruta actual del dashboard con mejoras
 */
router.post(
  '/dashboard/home',
  // Agregar rate limiting
  apiRateLimit,

  // Mantener autenticación existente
  authMiddleware.authenticate,

  // Handler mejorado
  (req, res) => {
    const user = req.authUser! // Ahora disponible automáticamente

    // Log del acceso al dashboard
    AuthLogger.logEvent(
      'access_granted' as any,
      'info' as any,
      `Usuario ${user.email} accedió al dashboard`,
      req,
      user
    )

    res.json({
      message: 'Bienvenido al Home',
      user: {
        name: user.name,
        role: user.role,
        company: user.companyId
      },
      timestamp: new Date().toISOString()
    })
  }
)

export default router

// ========================================
// GUÍA DE MIGRACIÓN PARA RUTAS EXISTENTES
// ========================================

/*
🔧 GUÍA DE MIGRACIÓN PASO A PASO:

1. RUTAS BÁSICAS (Sin cambios):
   ANTES:
   router.post('/ruta', authMiddleware.authenticate, handler)
   
   DESPUÉS: (IGUAL)
   router.post('/ruta', authMiddleware.authenticate, handler)
   
   BENEFICIOS:
   - req.authUser disponible automáticamente
   - Cache inteligente
   - Mejor manejo de errores

2. AGREGAR ROLES:
   ANTES:
   router.post('/admin', authMiddleware.authenticate, handler)
   
   DESPUÉS:
   router.post('/admin', 
     authMiddleware.authenticate, 
     requireAdmin,  // ← Solo agregar esta línea
     handler
   )

3. AGREGAR RATE LIMITING:
   ANTES:
   router.post('/api', authMiddleware.authenticate, handler)
   
   DESPUÉS:
   router.post('/api',
     apiRateLimit,  // ← Agregar al inicio
     authMiddleware.authenticate,
     handler
   )

4. AGREGAR VALIDACIÓN DE EMPRESA:
   ANTES:
   router.get('/company/:id', authMiddleware.authenticate, handler)
   
   DESPUÉS:
   router.get('/company/:id',
     authMiddleware.authenticate,
     requireCompanyFromParam('id'),  // ← Agregar esta línea
     handler
   )

5. COMBINACIÓN COMPLETA:
   router.post('/empresa/:companyId/accion',
     apiRateLimit,                           // Rate limiting
     authMiddleware.authenticate,            // Autenticación
     requireCompanyFromParam('companyId'),   // Validar empresa
     requireManagement,                      // Solo managers+
     handler
   )

💡 REGLA GENERAL:
- Mantén authMiddleware.authenticate siempre
- Agrega otros middlewares ANTES o DESPUÉS según necesites
- Orden recomendado: Rate Limit → Auth → Company → Roles → Handler
*/
