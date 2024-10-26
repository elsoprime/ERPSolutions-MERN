/** Autor: @elsoprimeDev */

import {Router} from 'express'
import {CategoryServiceController} from '../controllers/CategoryServiceController'

const router = Router()

//Definir Ruta para obtener los Rubros de la Empresas
router.get('/industry-category', CategoryServiceController.getIndustryCategory)
router.get('/systems-types', CategoryServiceController.getSystemsTypes)
router.get('/facilities-types', CategoryServiceController.getFacilitiesSystem)
router.get('/operation-mode', CategoryServiceController.getOperationMode)
router.get('/start-mode', CategoryServiceController.getStartMode)

export default router
