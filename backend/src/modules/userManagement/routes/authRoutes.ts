import {Router} from 'express'
import {body, param} from 'express-validator'
import {handleInputErrors} from '@/middleware/validation'
import {AuthControllers} from '../controllers/AuthControllers'
import {routesMiddleware} from '@/middleware/routesMiddleware'
import {authMiddleware} from '../middleware/authMiddleware'

/**
 * @description User routes definition
 * @traductor Ruta de usuarios
 * @module routes/userRoutes
 * @requires express
 * @requires ../controllers/userController
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

const router = Router()

// Endpoint de Registro de usuario
router.post(
  '/create-account',
  body('name').notEmpty().withMessage('Nombre de usuario es requerido'),
  body('password')
    .isLength({min: 6})
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('passwordConfirmation').custom((value: string, {req}) => {
    if (value !== req.body.password) {
      throw new Error('Las contraseñas no coinciden')
    }
    return true
  }),
  body('email')
    .isEmail()
    .withMessage('Se requiere un correo electrónico válido'),
  handleInputErrors,
  AuthControllers.createAccount
)

// Endpoint de confirmación de cuenta
router.post(
  '/confirm-account',
  body('token').notEmpty().withMessage('Se requiere un token de verificación'),
  handleInputErrors,
  AuthControllers.confirmAccount
)

// Endpoint de Login de usuario
router.post(
  '/login',
  body('email')
    .isEmail()
    .withMessage('Se requiere un correo electrónico válido'),
  body('password').notEmpty().withMessage('Se requiere una contraseña'),
  handleInputErrors,
  AuthControllers.login
)

// Endpoint de solicitud de código de confirmación
router.post(
  '/request-code',
  body('email')
    .isEmail()
    .withMessage('Se requiere un correo electrónico válido'),
  handleInputErrors,
  AuthControllers.requestConfirmationCode
)

// Endpoint de recuperación de contraseña
// Endpoint de solicitud de código de confirmación
router.post(
  '/forgot-password',
  body('email')
    .isEmail()
    .withMessage('Se requiere un correo electrónico válido'),
  handleInputErrors,
  AuthControllers.forgotPassword
)

// Endpoint para validación del Token de confirmación (antes de renderizar la vista)
router.post(
  '/validate-token',
  body('token').notEmpty().withMessage('El token es requerido'),
  handleInputErrors,
  routesMiddleware, // Middleware que valida la existencia y validez del token
  AuthControllers.validateToken // Controlador que procesa la respuesta
)

router.post(
  '/update-password/:token',
  param('token')
    .isNumeric()
    .notEmpty()
    .withMessage(
      'Token de verificación es requerido en la URL y debe ser válido'
    ),
  body('password')
    .isLength({min: 6})
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('passwordConfirmation').custom((value: string, {req}) => {
    if (value !== req.body.password) {
      throw new Error('Las contraseñas no coinciden')
    }
    return true
  }),
  handleInputErrors,
  routesMiddleware,
  AuthControllers.updatePasswordWithToken
)

// Endpoint para renovar token JWT
router.post(
  '/refresh-token',
  authMiddleware.authenticate, // Requiere token válido
  AuthControllers.refreshToken
)

export default router
