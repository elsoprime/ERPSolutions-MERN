import {Router} from 'express'
import authRoutes from '@/modules/userManagement/routes/authRoutes'
import userManagementRoutes from '@/modules/userManagement/routes'
import enhancedCompanyRoutes from '@/modules/companiesManagement/routes/enhancedCompanyRoutes'
import warehouseRoutes from '@/modules/warehouseManagement/routes/warehouseRoutes'
import domainsRoutes from '@/routes/domainRoutes'

/**
 * @description: Retorno de las rutas globales de la aplicación
 * @module routes/appRoutes
 * @requires express
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

const router = Router()

// Rutas de los módulos principales
router.use('/auth', authRoutes) // Rutas de autenticación de usuario

router.use('/dashboard', domainsRoutes) // Rutas de inicio

// Rutas del Módulo de Gestión de Usuarios Multiempresa [v2.0]
router.use('/v2', userManagementRoutes)

// Rutas Protegidas de Gestión de EnhancedCompany [v2.0]
router.use('/v2/enhanced-companies', enhancedCompanyRoutes) // Rutas de gestión de empresas Enhanced
router.use('/v2/warehouse', warehouseRoutes)

export default router
