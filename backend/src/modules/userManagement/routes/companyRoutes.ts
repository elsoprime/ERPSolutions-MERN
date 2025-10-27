/**
 * Multi-Company Routes
 * @description: Rutas para gestión de empresas en arquitectura multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Router} from 'express'
import MultiCompanyController from '../controllers/MultiCompanyController'
import {authMiddleware} from '../../../modules/userManagement/middleware/authMiddleware'
import MultiCompanyMiddleware from '../../../middleware/multiCompanyMiddleware'
import {companyValidation} from '../middleware/companyValidation'

const router = Router()

/**
 * Rutas para Super Admin (gestión global de empresas)
 */

// Obtener todas las empresas del sistema
router.get(
  '/all',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  MultiCompanyController.getAllCompanies
)

// Crear nueva empresa
router.post(
  '/',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  companyValidation.validateCreateCompany,
  MultiCompanyController.createCompany
)

// Actualizar empresa específica
router.put(
  '/:companyId',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  companyValidation.validateUpdateCompany,
  MultiCompanyController.updateCompany
)

// Actualizar suscripción de empresa
router.put(
  '/:companyId/subscription',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  companyValidation.validateUpdateSubscription,
  MultiCompanyController.updateSubscription
)

// Suspender empresa
router.post(
  '/:companyId/suspend',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  MultiCompanyController.suspendCompany
)

// Reactivar empresa
router.post(
  '/:companyId/reactivate',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  MultiCompanyController.reactivateCompany
)

// Obtener estadísticas de empresa específica
router.get(
  '/:companyId/stats',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  MultiCompanyController.getCompanyStats
)

/**
 * Rutas para Admin de Empresa (gestión de su propia empresa)
 */

// Obtener empresa actual del contexto
router.get(
  '/current',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission('company.edit'),
  MultiCompanyController.getCurrentCompany
)

// Actualizar configuración de la empresa actual
router.put(
  '/current/settings',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission('company.edit'),
  companyValidation.validateUpdateSettings,
  MultiCompanyController.updateCompanySettings
)

// Obtener estadísticas de la empresa actual
router.get(
  '/current/stats',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission('company.edit'),
  MultiCompanyController.getCompanyStats
)

export default router
