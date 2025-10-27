import {authMiddleware} from '@/modules/userManagement/middleware/authMiddleware'
import {Router} from 'express'

const router = Router()

//Endpoint de Home principal de la aplicación
router.post(
  '/home',
  authMiddleware.authenticate,

  (req, res) => {
    res.json({message: 'Bienvenido al Home'})
  }
)

export default router
