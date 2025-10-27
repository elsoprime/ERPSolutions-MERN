/** Autor: @elsoprimeDev */

import express from 'express'
import {
  getGeneralSettings,
  updateGeneralSettings
} from '../controllers/GeneralSettingController'
import {
  getSecuritySettings,
  updateSecuritySettings
} from '../controllers/ServiceSettingController'
import {
  getActiveModules,
  updateActiveModules
} from '../controllers/ActiveControllerController'
import {handleInputErrors} from '../middleware/validation'
import {param} from 'express-validator'

// 🔒 SEGURIDAD AVANZADA - Middleware JWT
import {authMiddleware} from '@/modules/userManagement/middleware/authMiddleware'
import {
  requireAdmin,
  requireManagement,
  requirePermission,
  SystemRole
} from '@/modules/userManagement/middleware/roleMiddleware'
import {createProtectedEndpoint} from '@/modules/userManagement/middleware/rateLimitMiddleware'

const router = express.Router()

// 🔒 APLICAR AUTENTICACIÓN A TODAS LAS RUTAS DE SETTINGS
router.use(authMiddleware.authenticate)

// ====================================
// 🏢 GENERAL SETTINGS ROUTES
// ====================================

// GET General Settings - Solo management+ puede ver configuraciones
router.get('/general-settings', requireManagement, getGeneralSettings)

// PUT General Settings - Solo admins pueden modificar configuraciones
router.put(
  '/general-settings/:id',
  ...createProtectedEndpoint('critical'), // Rate limiting crítico para configuraciones
  requireAdmin,
  param('id').isMongoId().withMessage('Identificador no válido'),
  handleInputErrors,
  updateGeneralSettings
)

// ====================================
// 🛡️ SECURITY SETTINGS ROUTES (CRÍTICO)
// ====================================

// GET Security Settings - Solo admins pueden ver configuraciones de seguridad
router.get('/security-settings', requireAdmin, getSecuritySettings)

// PUT Security Settings - Solo superadmins pueden modificar seguridad
router.put(
  '/security-settings/:id',
  ...createProtectedEndpoint('critical'), // Rate limiting crítico
  requireAdmin, // Solo admins pueden modificar configuraciones de seguridad
  handleInputErrors,
  updateSecuritySettings
)

// ====================================
// ⚙️ ACTIVE MODULES ROUTES
// ====================================

// GET Active Modules - Management+ puede ver módulos activos
router.get('/active-modules', requireManagement, getActiveModules)

// PUT Active Modules - Solo admins pueden activar/desactivar módulos
router.put(
  '/active-modules/:id',
  ...createProtectedEndpoint('critical'), // Rate limiting crítico para módulos
  requireAdmin,
  handleInputErrors,
  updateActiveModules
)

export default router
