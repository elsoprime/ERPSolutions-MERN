/** Autor: @elsoprimeDEV */

import {Router} from 'express'
import {query} from 'express-validator'
import {body, param} from 'express-validator'
import {CompanyController} from '../controllers/CompanyController'
import {handleInputErrors} from '../middleware/validation'
import {rutValidationMiddleware} from '../middleware/validationRutMiddleware'
import {FacilityController} from '../controllers/FacilityController'
import {validateCompaniesExists} from '../middleware/companies'
import {
  facilitylongsToCompany,
  validateFacilitiesExist
} from '../middleware/facilities'

const router = Router()

// Routes Company (Empresas)
router.post(
  '/',
  body('companyName')
    .notEmpty()
    .withMessage('El Nombre Empresa es obligatorio'),
  body('rutOrDni').notEmpty().withMessage('El RUT o DNI es obligatorio'),
  body('email')
    .notEmpty()
    .withMessage('El Correo Electronico es un campo obligatorio'),
  body('incorporationDate')
    .isDate()
    .withMessage('Fecha de Incorporación es obligatorio'),
  rutValidationMiddleware, // Middleware que valida el RUT antes de continuar
  handleInputErrors,
  CompanyController.createCompany
)

router.get('/', CompanyController.getAllCompany)

router.get(
  '/:id',
  param('id').isMongoId().withMessage('Identificador no válido'),
  handleInputErrors,
  CompanyController.getCompanyById
)
//Enpoint para obtener una empresa con sus instalaciones y pagina de instalaciones
router.get(
  '/:id/facilities',
  param('id').isMongoId().withMessage('Identificador no válido'),
  query('page')
    .optional()
    .isInt({min: 1})
    .withMessage('Página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({min: 1})
    .withMessage('Límite debe ser un número entero positivo'),
  handleInputErrors,
  CompanyController.getCompanyWithFacilities
)

router.put(
  '/:id',
  param('id').isMongoId().withMessage('Identificador no válido'),
  body('companyName')
    .notEmpty()
    .withMessage('El Nombre de la empresa es obligatorio'),
  body('rutOrDni').notEmpty().withMessage('El Rut es un campo obligatorio'),
  body('email')
    .notEmpty()
    .withMessage('El Correo Electronico es un campo obligatorio'),
  body('incorporationDate')
    .notEmpty()
    .withMessage('Debes seleccionar una fecha, campo fecha obligatorio'),
  body('industry')
    .notEmpty()
    .withMessage(
      'Debes seleccionar una Categoria, este es un campo obligatorio'
    ),
  rutValidationMiddleware,
  handleInputErrors,
  CompanyController.updateCompany
)

router.delete('/:id', handleInputErrors, CompanyController.deleteCompany)

/** Routing Facilities */
// Middleware para validar el `companyId`
router.param('companyId', validateCompaniesExists)
router.param('facilityId', validateFacilitiesExist)
router.param('facilityId', facilitylongsToCompany)
// Crear una instalación (facility)
router.post(
  '/:companyId/facilities',
  param('companyId').isMongoId().withMessage('Identificador no válido'),
  body('nameFacility')
    .notEmpty()
    .withMessage('El nombre de la Instalación es obligatorio'),
  body('systemType')
    .notEmpty()
    .withMessage('El Tipo de Sistema es obligatorio'),
  body('facilitySystem')
    .notEmpty()
    .withMessage('El Tipo de Instalación es obligatorio'),
  body('feeder')
    .notEmpty()
    .withMessage('la description del alimentador es obligatorio'),
  body('startService')
    .isDate()
    .withMessage(
      'La Fecha de Inicio de Servicio es obligatoria y debe ser una fecha válida'
    ),
  body('operationMode')
    .notEmpty()
    .withMessage('Debe seleccionar un modo de operación, obligatorio'),
  body('startMode')
    .notEmpty()
    .withMessage('Debe seleccionar un modo de partida, obligatorio'),
  body('installedPower')
    .isNumeric()
    .withMessage('La Potencia Instalada debe ser un número'),
  body('availablePower')
    .isNumeric()
    .withMessage('La Potencia Disponible debe ser un número'),
  body('location.region').notEmpty().withMessage('La Región es obligatoria'),
  body('location.province')
    .notEmpty()
    .withMessage('La Provincia es obligatoria'),
  body('location.comuna').notEmpty().withMessage('La Comuna es obligatoria'),
  handleInputErrors,
  FacilityController.createFacility
)

// Obtener todas las instalaciones de una compañía
router.get('/:companyId/facilities', FacilityController.getCompanyFacilities)

router.get(
  '/:companyId/facilities/:facilityId',
  param('facilityId')
    .isMongoId()
    .withMessage('Identificador de la instalación no válido'),
  FacilityController.getFacilityById
)

// Actualizar una instalación
router.put(
  '/:companyId/facilities/:facilityId',
  param('companyId').isMongoId().withMessage('Identificador no válido'),
  param('facilityId').isMongoId().withMessage('Identificador no válido'),
  body('nameFacility')
    .notEmpty()
    .withMessage('El nombre de la Instalación es obligatorio'),
  body('systemType')
    .notEmpty()
    .withMessage('El Tipo de Sistema es obligatorio'),
  body('facilitySystem')
    .notEmpty()
    .withMessage('El Tipo de Instalación es obligatorio'),
  body('feeder')
    .notEmpty()
    .withMessage('la description del alimentador es obligatorio'),
  body('startService')
    .isDate()
    .withMessage(
      'La Fecha de Inicio de Servicio es obligatoria y debe ser una fecha válida'
    ),
  body('operationMode')
    .notEmpty()
    .withMessage('Debe seleccionar un modo de operación, obligatorio'),
  body('startMode')
    .notEmpty()
    .withMessage('Debe seleccionar un modo de partida, obligatorio'),
  body('installedPower')
    .isNumeric()
    .withMessage('La Potencia Instalada debe ser un número'),
  body('availablePower')
    .isNumeric()
    .withMessage('La Potencia Disponible debe ser un número'),
  body('location.region').notEmpty().withMessage('La Región es obligatoria'),
  body('location.province')
    .notEmpty()
    .withMessage('La Provincia es obligatoria'),
  body('location.comuna').notEmpty().withMessage('La Comuna es obligatoria'),
  handleInputErrors,
  FacilityController.updateFacility
)

// Eliminar una instalación
router.delete(
  '/:companyId/facilities/:facilityId',
  param('facilityId')
    .isMongoId()
    .withMessage('Identificador de la instalación no válido'),
  FacilityController.deleteFacility
)

export default router
