"use strict";
/** Autor: @elsoprimeDev */
/** Middleware Company and Facility */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.validateFacilitiesExist = exports.validateFacilityNameAndCompany = void 0;
var Facility_1 = require("../models/Facility");
var Company_1 = require("../models/Company"); // Importa tu modelo Company
var mongoose_1 = require("mongoose");
// Middleware para verificar la existencia de la empresa y la unicidad del nombre de la instalación
exports.validateFacilityNameAndCompany = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var nameFacility, companyId, company, existingFacility;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nameFacility = req.body.nameFacility;
                companyId = req.params.companyId;
                // Verificar si el ID de la empresa es válido
                if (!mongoose_1["default"].Types.ObjectId.isValid(companyId)) {
                    return [2 /*return*/, res.status(400).json({ error: 'ID de empresa no válido' })];
                }
                return [4 /*yield*/, Company_1["default"].findById(companyId)];
            case 1:
                company = _a.sent();
                if (!company) {
                    return [2 /*return*/, res.status(404).json({ error: 'Empresa no encontrada' })];
                }
                req.company = company; // Almacena la empresa en el request
                return [4 /*yield*/, Facility_1["default"].findOne({ nameFacility: nameFacility })];
            case 2:
                existingFacility = _a.sent();
                if (existingFacility) {
                    return [2 /*return*/, res.status(400).json({ error: 'El nombre de la instalación ya está registrado para una empresa.' })];
                }
                next(); // Continuar al siguiente middleware o ruta
                return [2 /*return*/];
        }
    });
}); };
exports.validateFacilitiesExist = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, facilityId, companyId, facility, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, facilityId = _a.facilityId, companyId = _a.companyId;
                // Verificar si el ID de la empresa es válido
                if (!mongoose_1["default"].Types.ObjectId.isValid(facilityId)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Acción no valida' })];
                }
                return [4 /*yield*/, Facility_1["default"].findOne({ _id: facilityId, companyId: companyId })];
            case 1:
                facility = _b.sent();
                if (!facility) {
                    error = new Error('Instalación no encontrada o no pertenece a la empresa');
                    return [2 /*return*/, res.status(404).json({ error: error.message })];
                }
                req.facility = facility; // Almacenar la instalación en el request
                next();
                return [2 /*return*/];
        }
    });
}); };
