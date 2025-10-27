/**
 * Company Validation Middleware
 * @description: Middleware para validación de datos de empresas multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Request, Response, NextFunction} from 'express'
import {body, param, validationResult} from 'express-validator'
import {Types} from 'mongoose'

export class CompanyValidation {
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
   * Validación para crear empresa
   */
  static validateCreateCompany = [
    body('name')
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('slug')
      .trim()
      .isSlug()
      .isLength({min: 3, max: 50})
      .withMessage('El slug debe tener entre 3 y 50 caracteres y ser válido'),

    body('description')
      .optional()
      .trim()
      .isLength({max: 500})
      .withMessage('La descripción no puede exceder 500 caracteres'),

    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email de la empresa inválido'),

    body('phone')
      .optional()
      .isMobilePhone('es-CL')
      .withMessage('Número de teléfono inválido'),

    body('website')
      .optional()
      .isURL()
      .withMessage('URL del sitio web inválida'),

    body('address.street')
      .optional()
      .trim()
      .isLength({max: 200})
      .withMessage('La dirección no puede exceder 200 caracteres'),

    body('address.city')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),

    body('address.state')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('La región debe tener entre 2 y 100 caracteres'),

    body('address.country')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('El país debe tener entre 2 y 100 caracteres'),

    body('address.postalCode')
      .optional()
      .trim()
      .isLength({min: 3, max: 20})
      .withMessage('El código postal debe tener entre 3 y 20 caracteres'),

    body('plan')
      .optional()
      .isIn(['free', 'basic', 'professional', 'enterprise'])
      .withMessage('Plan inválido'),

    body('settings.businessType')
      .optional()
      .isIn(['retail', 'wholesale', 'manufacturing', 'service', 'other'])
      .withMessage('Tipo de negocio inválido'),

    body('settings.industry')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('La industria debe tener entre 2 y 100 caracteres'),

    body('settings.taxId')
      .optional()
      .trim()
      .matches(/^\d{7,8}-[\dkK]$/)
      .withMessage('RUT inválido (formato: 12345678-9)'),

    body('settings.currency')
      .optional()
      .isIn(['CLP', 'USD', 'EUR', 'ARS', 'PEN', 'COL'])
      .withMessage('Moneda inválida'),

    CompanyValidation.handleValidationErrors
  ]

  /**
   * Validación para actualizar empresa
   */
  static validateUpdateCompany = [
    param('companyId').custom(value => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error('ID de empresa inválido')
      }
      return true
    }),

    body('name')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('description')
      .optional()
      .trim()
      .isLength({max: 500})
      .withMessage('La descripción no puede exceder 500 caracteres'),

    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email de la empresa inválido'),

    body('phone')
      .optional()
      .isMobilePhone('es-CL')
      .withMessage('Número de teléfono inválido'),

    body('website')
      .optional()
      .isURL()
      .withMessage('URL del sitio web inválida'),

    body('address.street')
      .optional()
      .trim()
      .isLength({max: 200})
      .withMessage('La dirección no puede exceder 200 caracteres'),

    body('address.city')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),

    body('address.state')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('La región debe tener entre 2 y 100 caracteres'),

    body('address.country')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('El país debe tener entre 2 y 100 caracteres'),

    body('address.postalCode')
      .optional()
      .trim()
      .isLength({min: 3, max: 20})
      .withMessage('El código postal debe tener entre 3 y 20 caracteres'),

    body('settings.businessType')
      .optional()
      .isIn([
        'retail',
        'manufacturing',
        'services',
        'technology',
        'healthcare',
        'education',
        'finance',
        'real_estate',
        'transportation',
        'food_beverage',
        'consulting',
        'other'
      ])
      .withMessage('Tipo de negocio inválido'),

    body('settings.industry')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('La industria debe tener entre 2 y 100 caracteres'),

    body('settings.taxId')
      .optional()
      .trim()
      .matches(/^\d{7,8}-[\dkK]$/)
      .withMessage('RUT inválido (formato: 12345678-9)'),

    body('settings.currency')
      .optional()
      .isIn(['CLP', 'USD', 'EUR', 'ARS', 'PEN', 'COL'])
      .withMessage('Moneda inválida'),

    body('settings.branding.primaryColor')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color primario debe ser un código hexadecimal válido'),

    body('settings.branding.secondaryColor')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color secundario debe ser un código hexadecimal válido'),

    CompanyValidation.handleValidationErrors
  ]

  /**
   * Validación para actualizar configuración
   */
  static validateUpdateSettings = [
    body('settings.timezone')
      .optional()
      .isString()
      .withMessage('Zona horaria inválida'),

    body('settings.language')
      .optional()
      .isIn(['es', 'en'])
      .withMessage('Idioma debe ser es o en'),

    body('settings.currency')
      .optional()
      .isIn(['CLP', 'USD', 'EUR'])
      .withMessage('Moneda debe ser CLP, USD o EUR'),

    body('settings.dateFormat')
      .optional()
      .isIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
      .withMessage('Formato de fecha inválido'),

    body('settings.notifications.email')
      .optional()
      .isBoolean()
      .withMessage('Configuración de email debe ser booleana'),

    body('settings.notifications.push')
      .optional()
      .isBoolean()
      .withMessage('Configuración de push debe ser booleana'),

    body('settings.notifications.sms')
      .optional()
      .isBoolean()
      .withMessage('Configuración de SMS debe ser booleana'),

    body('settings.features.inventory')
      .optional()
      .isBoolean()
      .withMessage('Feature de inventario debe ser booleana'),

    body('settings.features.accounting')
      .optional()
      .isBoolean()
      .withMessage('Feature de contabilidad debe ser booleana'),

    body('settings.features.crm')
      .optional()
      .isBoolean()
      .withMessage('Feature de CRM debe ser booleana'),

    body('settings.features.reports')
      .optional()
      .isBoolean()
      .withMessage('Feature de reportes debe ser booleana'),

    body('settings.features.integrations')
      .optional()
      .isBoolean()
      .withMessage('Feature de integraciones debe ser booleana'),

    CompanyValidation.handleValidationErrors
  ]

  /**
   * Validación para actualizar suscripción
   */
  static validateUpdateSubscription = [
    param('companyId').custom(value => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error('ID de empresa inválido')
      }
      return true
    }),

    body('planType')
      .isIn(['trial', 'basic', 'professional', 'enterprise'])
      .withMessage('Tipo de plan inválido'),

    body('features')
      .optional()
      .isObject()
      .withMessage('Las características deben ser un objeto'),

    body('limits')
      .optional()
      .isObject()
      .withMessage('Los límites deben ser un objeto'),

    body('limits.users')
      .optional()
      .isInt({min: 1, max: 10000})
      .withMessage('Límite de usuarios debe ser entre 1 y 10000'),

    body('limits.storage')
      .optional()
      .isInt({min: 1})
      .withMessage('Límite de almacenamiento debe ser positivo'),

    body('limits.products')
      .optional()
      .isInt({min: 1})
      .withMessage('Límite de productos debe ser positivo'),

    body('limits.transactions')
      .optional()
      .isInt({min: 1})
      .withMessage('Límite de transacciones debe ser positivo'),

    CompanyValidation.handleValidationErrors
  ]

  /**
   * Validación para suspender/reactivar empresa
   */
  static validateSuspendCompany = [
    param('companyId').custom(value => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error('ID de empresa inválido')
      }
      return true
    }),

    body('reason')
      .optional()
      .trim()
      .isLength({min: 10, max: 500})
      .withMessage('La razón debe tener entre 10 y 500 caracteres'),

    CompanyValidation.handleValidationErrors
  ]

  /**
   * Validación para actualizar branding
   */
  static validateUpdateBranding = [
    body('branding.primaryColor')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color primario debe ser un código hexadecimal válido'),

    body('branding.secondaryColor')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color secundario debe ser un código hexadecimal válido'),

    body('branding.logo')
      .optional()
      .isURL()
      .withMessage('URL del logo inválida'),

    body('branding.favicon')
      .optional()
      .isURL()
      .withMessage('URL del favicon inválida'),

    body('branding.customCss')
      .optional()
      .isString()
      .withMessage('CSS personalizado debe ser texto'),

    CompanyValidation.handleValidationErrors
  ]
}

export const companyValidation = CompanyValidation
