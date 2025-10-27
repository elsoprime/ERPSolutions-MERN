/**
 * Multi-Company User Management Routes
 * @description: Rutas para gestión de usuarios en arquitectura multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Router} from 'express'
import MultiCompanyUserController from '../controllers/MultiCompanyUserController'
import {authMiddleware} from '../../../modules/userManagement/middleware/authMiddleware'
import MultiCompanyMiddleware from '../../../middleware/multiCompanyMiddleware'
import {userValidation} from '../middleware/userValidation'

const router = Router()

/**
 * Rutas para Super Admin (gestión global de usuarios)
 */

// Obtener todos los usuarios del sistema
router.get(
  '/all',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  MultiCompanyUserController.getAllUsers
)

// Crear usuario con rol global o de empresa
router.post(
  '/',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  userValidation.validateCreateUser,
  MultiCompanyUserController.createUser
)

/**
 * Rutas para Admin de Empresa (gestión de usuarios de su empresa)
 */

// Obtener usuarios de la empresa del contexto actual
router.get(
  '/company',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission('users.view'),
  MultiCompanyUserController.getCompanyUsers
)

// Crear usuario en la empresa del contexto actual
router.post(
  '/company',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission('users.create'),
  userValidation.validateCreateCompanyUser,
  MultiCompanyUserController.createUser
)

/**
 * Rutas para gestión individual de usuarios
 */

// Obtener perfil del usuario actual
router.get(
  '/profile',
  authMiddleware.authenticate,
  MultiCompanyUserController.getProfile
)

// Actualizar usuario específico
router.put(
  '/:userId',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission('users.edit'),
  userValidation.validateUpdateUser,
  MultiCompanyUserController.updateUser
)

// Asignar rol a usuario
router.post(
  '/:userId/roles',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  userValidation.validateAssignRole,
  MultiCompanyUserController.assignRole
)

// Revocar rol de usuario
router.delete(
  '/:userId/roles',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission('companies.list_all'),
  userValidation.validateRevokeRole,
  MultiCompanyUserController.revokeRole
)

// Eliminar usuario (soft delete)
router.delete(
  '/:userId',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission('users.delete'),
  MultiCompanyUserController.deleteUser
)

export default router
