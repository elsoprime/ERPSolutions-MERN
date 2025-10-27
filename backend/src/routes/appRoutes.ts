import {Router} from 'express'
import authRoutes from '@/modules/userManagement/routes/authRoutes'
import companyRoutes from '@/routes/companyRoutes'
import warehouseRoutes from '@/modules/warehouseManagement/routes/warehouseRoutes'
import domainsRoutes from '@/routes/domainRoutes'

/**
 * @description: Retorno de las rutas globales de la aplicación
 * @module routes/appRoutes
 * @requires express
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

const router = Router()

// Agrega aquí otras rutas globales si es necesario
router.use('/auth', authRoutes) // Rutas de autenticación de usuario
router.use('/dashboard', domainsRoutes) // Rutas de inicio
router.use('/companies', companyRoutes) // Rutas de gestión de empresas
router.use('/warehouse', warehouseRoutes)

export default router
