/**
 * User Validation Middleware
 * @description: Middleware para validación de datos de usuarios multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Request, Response, NextFunction} from 'express'
import {body, param, validationResult} from 'express-validator'
import {Types} from 'mongoose'

export class UserValidation {
  /**
   * Manejar errores de validación
   */
  static handleValidationErrors(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      })
    }
    next()
  }

  /**
   * Validación para crear usuario
   */
  static validateCreateUser = [
    body('name')
      .trim()
      .isLength({min: 2, max: 50})
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),

    body('password')
      .isLength({min: 8})
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      ),

    body('phone')
      .optional()
      .isMobilePhone('es-CL')
      .withMessage('Número de teléfono inválido'),

    body('roleType')
      .isIn(['global', 'company'])
      .withMessage('Tipo de rol debe ser global o company'),

    body('role')
      .isIn(['super_admin', 'admin_empresa', 'manager', 'employee', 'viewer'])
      .withMessage('Rol inválido'),

    body('companyId')
      .if(body('roleType').equals('company'))
      .custom(value => {
        if (!Types.ObjectId.isValid(value)) {
          throw new Error('ID de empresa inválido')
        }
        return true
      }),

    body('permissions')
      .optional()
      .isArray()
      .withMessage('Los permisos deben ser un array'),

    UserValidation.handleValidationErrors
  ]

  /**
   * Validación para crear usuario en empresa
   */
  static validateCreateCompanyUser = [
    body('name')
      .trim()
      .isLength({min: 2, max: 50})
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),

    body('password')
      .isLength({min: 8})
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      ),

    body('phone')
      .optional()
      .isMobilePhone('es-CL')
      .withMessage('Número de teléfono inválido'),

    body('role')
      .isIn(['manager', 'employee', 'viewer'])
      .withMessage('Rol debe ser manager, employee o viewer'),

    body('permissions')
      .optional()
      .isArray()
      .withMessage('Los permisos deben ser un array'),

    // Forzar roleType a 'company' para estas rutas
    (req: Request, res: Response, next: NextFunction) => {
      req.body.roleType = 'company'
      req.body.companyId = req.companyContext?.id
      next()
    },

    UserValidation.handleValidationErrors
  ]

  /**
   * Validación para actualizar usuario
   */
  static validateUpdateUser = [
    param('userId').custom(value => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error('ID de usuario inválido')
      }
      return true
    }),

    body('name')
      .optional()
      .trim()
      .isLength({min: 2, max: 50})
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

    body('phone')
      .optional()
      .isMobilePhone('es-CL')
      .withMessage('Número de teléfono inválido'),

    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('Estado inválido'),

    body('preferences')
      .optional()
      .isObject()
      .withMessage('Las preferencias deben ser un objeto'),

    UserValidation.handleValidationErrors
  ]

  /**
   * Validación para asignar rol
   */
  static validateAssignRole = [
    param('userId').custom(value => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error('ID de usuario inválido')
      }
      return true
    }),

    body('roleType')
      .isIn(['global', 'company'])
      .withMessage('Tipo de rol debe ser global o company'),

    body('role')
      .isIn(['super_admin', 'admin_empresa', 'manager', 'employee', 'viewer'])
      .withMessage('Rol inválido'),

    body('companyId')
      .if(body('roleType').equals('company'))
      .custom(value => {
        if (!Types.ObjectId.isValid(value)) {
          throw new Error('ID de empresa inválido')
        }
        return true
      }),

    body('permissions')
      .optional()
      .isArray()
      .withMessage('Los permisos deben ser un array'),

    UserValidation.handleValidationErrors
  ]

  /**
   * Validación para revocar rol
   */
  static validateRevokeRole = [
    param('userId').custom(value => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error('ID de usuario inválido')
      }
      return true
    }),

    body('roleIndex')
      .isInt({min: 0})
      .withMessage('Índice de rol debe ser un número entero positivo'),

    UserValidation.handleValidationErrors
  ]

  /**
   * Validación para cambio de contraseña
   */
  static validateChangePassword = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Contraseña actual requerida'),

    body('newPassword')
      .isLength({min: 8})
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'
      ),

    body('confirmPassword').custom((value, {req}) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden')
      }
      return true
    }),

    UserValidation.handleValidationErrors
  ]

  /**
   * Validación para actualización de perfil
   */
  static validateUpdateProfile = [
    body('name')
      .optional()
      .trim()
      .isLength({min: 2, max: 50})
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

    body('phone')
      .optional()
      .isMobilePhone('es-CL')
      .withMessage('Número de teléfono inválido'),

    body('preferences')
      .optional()
      .isObject()
      .withMessage('Las preferencias deben ser un objeto'),

    body('preferences.language')
      .optional()
      .isIn(['es', 'en'])
      .withMessage('Idioma debe ser es o en'),

    body('preferences.timezone')
      .optional()
      .isString()
      .withMessage('Zona horaria inválida'),

    body('preferences.theme')
      .optional()
      .isIn(['light', 'dark', 'auto'])
      .withMessage('Tema debe ser light, dark o auto'),

    UserValidation.handleValidationErrors
  ]
}

export const userValidation = UserValidation
