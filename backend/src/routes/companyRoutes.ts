import {Router} from 'express'
import {EnhancedCompanyController} from '../controllers/EnhancedCompanyController'
import {authMiddleware} from '../modules/userManagement/middleware/authMiddleware'

const router = Router()

/**
 * @description: Rutas para la gestión de Enhanced Companies (Super Admin)
 * @module routes/companyRoutes
 * @requires express
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware.authenticate)

// Rutas específicas (deben ir antes que las rutas con parámetros)
router.get('/slug/:slug', EnhancedCompanyController.getCompanyBySlug)
router.get('/summary', EnhancedCompanyController.getCompaniesSummary)

// Rutas principales CRUD
router.post('/', EnhancedCompanyController.createCompany)
router.get('/', EnhancedCompanyController.getAllCompanies)
router.get('/:id', EnhancedCompanyController.getCompanyById)
router.put('/:id', EnhancedCompanyController.updateCompany)
router.delete('/:id', EnhancedCompanyController.deleteCompany)

// Rutas específicas por ID
router.get('/:id/users', EnhancedCompanyController.getCompanyWithUsers)
router.get('/:id/stats', EnhancedCompanyController.getCompanyStats)
router.put('/:id/settings', EnhancedCompanyController.updateCompanySettings)

export default router
