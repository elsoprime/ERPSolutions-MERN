"use strict";
/** Autor: @elsoprimeDev */
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
exports.CompanyController = void 0;
var mongoose_1 = require("mongoose");
var Company_1 = require("../models/Company");
var CompanyController = /** @class */ (function () {
    function CompanyController() {
    }
    // Crear las compañías
    CompanyController.createCompany = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var company, isRutExist, savedCompany, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    company = new Company_1["default"](req.body);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Company_1["default"].findOne({
                            rutOrDni: req.body.rutOrDni
                        })];
                case 2:
                    isRutExist = _a.sent();
                    if (isRutExist) {
                        return [2 /*return*/, res
                                .status(400)
                                .json({ message: 'Este RUT ya se encuentra registrado' })];
                    }
                    return [4 /*yield*/, company.save()];
                case 3:
                    savedCompany = _a.sent();
                    res
                        .status(201)
                        .json({ message: 'Empresa creada correctamente' });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    res.status(500).json({ error: error_1.message }); // Devolver el mensaje de error directamente
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Obtener todas las compañías con paginación
    CompanyController.getAllCompany = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var page, limit, skip, _a, companies, total, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    page = parseInt(req.query.page) || 1 // Página actual
                    ;
                    limit = parseInt(req.query.limit) || 5 // Límite de registros por página
                    ;
                    skip = (page - 1) * limit // Registros a omitir
                    ;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.all([
                            Company_1["default"].find({}).skip(skip).limit(limit),
                            Company_1["default"].countDocuments() // Contar el total de documentos
                        ])];
                case 2:
                    _a = _b.sent(), companies = _a[0], total = _a[1];
                    res.json({ companies: companies, total: total }); // Devolver las compañías y el total
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    console.error(error_2);
                    // Manejo específico de errores de validación de Mongoose
                    if (error_2 instanceof mongoose_1["default"].Error.ValidationError) {
                        return [2 /*return*/, res
                                .status(400)
                                .json({ error: 'Error de validación: ' + error_2.message })];
                    }
                    // Error general del servidor
                    res
                        .status(500)
                        .json({ error: 'Error al obtener las compañías desde el Servidor' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Obtener compañía por ID
    CompanyController.getCompanyById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, company, error, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Company_1["default"].findById(id).populate('facilities')];
                case 2:
                    company = _a.sent();
                    if (!company) {
                        error = new Error('Empresa no Encontrada');
                        return [2 /*return*/, res.status(404).json({ error: error.message })];
                    }
                    res.json(company);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error al obtener la compañía:', error_3);
                    // Manejo específico de errores de Mongoose
                    if (error_3 instanceof mongoose_1["default"].Error.CastError) {
                        return [2 /*return*/, res.status(400).json({ error: 'ID de compañía inválido' })];
                    }
                    // Error general del servidor
                    res
                        .status(500)
                        .json({ error: 'Error al obtener la compañía desde el Servidor' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Actualizar compañias
    CompanyController.updateCompany = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, isCompanyExist, company, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    // Validar si el ID es un ObjectId válido
                    if (!mongoose_1["default"].Types.ObjectId.isValid(id)) {
                        return [2 /*return*/, res.status(400).json({ error: 'ID inválido' })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Company_1["default"].findOne({
                            rutOrDni: req.body.rutOrDni,
                            _id: { $ne: id } // Excluir la compañía actual de la búsqueda
                        })];
                case 2:
                    isCompanyExist = _a.sent();
                    if (isCompanyExist) {
                        return [2 /*return*/, res.status(400).json({
                                message: 'Este Rut ya se encuentra registrado en la plataforma'
                            })];
                    }
                    return [4 /*yield*/, Company_1["default"].findByIdAndUpdate(id, req.body)
                        // Si no se encuentra la compañía, responder con un error 404
                    ];
                case 3:
                    company = _a.sent();
                    // Si no se encuentra la compañía, responder con un error 404
                    if (!company) {
                        return [2 /*return*/, res.status(404).json({ error: 'Empresa no encontrada' })];
                    }
                    res.json('Empresa Actualizada Correctamente');
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    // Manejar cualquier error inesperado
                    console.error('Error al actualizar la compañía:', error_4);
                    res.status(500).json({ error: 'Error al actualizar la compañía' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Eliminar una Compañía por su Id
    CompanyController.deleteCompany = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, company, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    // Validar si el ID es un ObjectId válido
                    if (!mongoose_1["default"].Types.ObjectId.isValid(id)) {
                        return [2 /*return*/, res.status(400).json({ error: 'ID inválido' })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Company_1["default"].findById(id)
                        // Si no se encuentra la compañía, responder con un error 404
                    ];
                case 2:
                    company = _a.sent();
                    // Si no se encuentra la compañía, responder con un error 404
                    if (!company) {
                        return [2 /*return*/, res
                                .status(404)
                                .json({ error: 'La compañía o empresa no encontrada' })];
                    }
                    // Si la compañía existe, proceder a eliminarla
                    return [4 /*yield*/, company.deleteOne()];
                case 3:
                    // Si la compañía existe, proceder a eliminarla
                    _a.sent();
                    res.json('Empresa Eliminada Correctamente');
                    return [3 /*break*/, 5];
                case 4:
                    error_5 = _a.sent();
                    // Manejar cualquier error inesperado
                    console.error('Error al eliminar la compañía:', error_5);
                    res.status(500).json({ error: 'Error al eliminar la compañía' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return CompanyController;
}());
exports.CompanyController = CompanyController;
