"use strict";
/** Autor: @elsoprimeDEV */
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var CompanyController_1 = require("../controllers/CompanyController");
var validation_1 = require("../middleware/validation");
var Company_1 = require("../models/Company");
var validationRutMiddleware_1 = require("../middleware/validationRutMiddleware");
var FacilityController_1 = require("../controllers/FacilityController");
var companyMiddleware_1 = require("../middleware/companyMiddleware");
var router = express_1.Router();
// Routes Company (Empresas)
router.post('/', express_validator_1.body('companyName')
    .notEmpty()
    .withMessage('El Nombre Empresa es obligatorio'), express_validator_1.body('rutOrDni').notEmpty().withMessage('El RUT o DNI es obligatorio'), express_validator_1.body('email')
    .notEmpty()
    .withMessage('El Correo Electronico es un campo obligatorio'), express_validator_1.body('incorporationDate')
    .isDate()
    .withMessage('Fecha de Incorporación es obligatorio'), validationRutMiddleware_1.rutValidationMiddleware, // Middleware que valida el RUT antes de continuar
validation_1.handleInputErrors, CompanyController_1.CompanyController.createCompany);
router.get('/', CompanyController_1.CompanyController.getAllCompany);
router.get('/:id', express_validator_1.param('id').isMongoId().withMessage('Identificador no válido'), validation_1.handleInputErrors, CompanyController_1.CompanyController.getCompanyById);
router.put('/:id', express_validator_1.param('id').isMongoId().withMessage('Identificador no válido'), express_validator_1.body('companyName')
    .notEmpty()
    .withMessage('El Nombre de la empresa es obligatorio'), express_validator_1.body('rutOrDni').notEmpty().withMessage('El Rut es un campo obligatorio'), express_validator_1.body('email')
    .notEmpty()
    .withMessage('El Correo Electronico es un campo obligatorio'), express_validator_1.body('incorporationDate')
    .notEmpty()
    .withMessage('Debes seleccionar una fecha, campo fecha obligatorio'), express_validator_1.body('industry')
    .notEmpty()
    .withMessage('Debes seleccionar una Categoria, este es un campo obligatorio')
    .custom(function (value) { return Object.values(Company_1.industryCategory).includes(value); })
    .withMessage('La categoría seleccionada no es válida'), validationRutMiddleware_1.rutValidationMiddleware, validation_1.handleInputErrors, CompanyController_1.CompanyController.updateCompany);
router["delete"]('/:id', validation_1.handleInputErrors, CompanyController_1.CompanyController.deleteCompany);
/** Routing Facilities */
// Middleware para validar el `companyId`
router.param('companyId', companyMiddleware_1.validateFacilityNameAndCompany);
router.param('facilityId', companyMiddleware_1.validateFacilitiesExist);
// Crear una instalación (facility)
router.post('/:companyId/facilities', express_validator_1.param('companyId').isMongoId().withMessage('Identificador no válido'), express_validator_1.body('nameFacility')
    .notEmpty()
    .withMessage('El nombre de la Instalación es obligatorio'), express_validator_1.body('typeSystem')
    .notEmpty()
    .withMessage('El Tipo de Sistema es obligatorio'), express_validator_1.body('typeFacility')
    .notEmpty()
    .withMessage('El Tipo de Instalación es obligatorio'), express_validator_1.body('feeder')
    .notEmpty()
    .withMessage('la description del alimentador es obligatorio'), express_validator_1.body('startService')
    .isDate()
    .withMessage('La Fecha de Inicio de Servicio es obligatoria y debe ser una fecha válida'), express_validator_1.body('modeOperation')
    .notEmpty()
    .withMessage('Debe seleccionar un modo de operación, obligatorio'), express_validator_1.body('modeStart')
    .notEmpty()
    .withMessage('Debe seleccionar un modo de partida, obligatorio'), express_validator_1.body('installedPower')
    .isNumeric()
    .withMessage('La Potencia Instalada debe ser un número'), express_validator_1.body('availablePower')
    .isNumeric()
    .withMessage('La Potencia Disponible debe ser un número'), express_validator_1.body('location.region').notEmpty().withMessage('La Región es obligatoria'), express_validator_1.body('location.province')
    .notEmpty()
    .withMessage('La Provincia es obligatoria'), express_validator_1.body('location.comuna').notEmpty().withMessage('La Comuna es obligatoria'), validation_1.handleInputErrors, FacilityController_1.FacilityController.createFacility);
// Obtener todas las instalaciones de una compañía
router.get('/:companyId/facilities', FacilityController_1.FacilityController.getCompanyFacilities);
router.get('/:companyId/facilities/:facilityId', express_validator_1.param('facilityId')
    .isMongoId()
    .withMessage('Identificador de la instalación no válido'), FacilityController_1.FacilityController.getFacilityById);
// Actualizar una instalación
router.put('/:companyId/facilities/:facilityId', express_validator_1.param('facilityId')
    .isMongoId()
    .withMessage('Identificador de la instalación no válido'), express_validator_1.body('nameFacility')
    .notEmpty()
    .withMessage('El nombre de la Instalación es obligatorio'), express_validator_1.body('typeSystem')
    .notEmpty()
    .withMessage('El Tipo de Sistema es obligatorio'), express_validator_1.body('feeder').notEmpty().withMessage('El Feeder es obligatorio'), express_validator_1.body('startService')
    .isDate()
    .withMessage('La Fecha de Inicio de Servicio es obligatoria y debe ser una fecha válida'), express_validator_1.body('installedPower')
    .isNumeric()
    .withMessage('La Potencia Instalada debe ser un número'), express_validator_1.body('availablePower')
    .isNumeric()
    .withMessage('La Potencia Disponible debe ser un número'), express_validator_1.body('location.region').notEmpty().withMessage('La Región es obligatoria'), express_validator_1.body('location.province')
    .notEmpty()
    .withMessage('La Provincia es obligatoria'), express_validator_1.body('location.comuna').notEmpty().withMessage('La Comuna es obligatoria'), validation_1.handleInputErrors, FacilityController_1.FacilityController.updateFacility);
// Eliminar una instalación
router["delete"]('/:companyId/facilities/:facilityId', express_validator_1.param('facilityId')
    .isMongoId()
    .withMessage('Identificador de la instalación no válido'), FacilityController_1.FacilityController.deleteFacility);
exports["default"] = router;
