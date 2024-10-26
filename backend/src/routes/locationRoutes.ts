/** Autor: @elsoprimeDev */

import {Router} from 'express'
import {
  getRegiones,
  getProvinciasByRegion,
  getComunasByProvincia
} from '../controllers/LocaltionsController'

const router = Router()

// Ruta para obtener todas las regiones
router.get('/regiones', getRegiones)

// Ruta para obtener provincias de una región específica
router.get('/provincias/:codigoRegion', getProvinciasByRegion)

// Ruta para obtener comunas de una provincia específica
router.get('/comunas/:codigoProvincia', getComunasByProvincia)

export default router
