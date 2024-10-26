"use strict";
/** Autor: @elsoprimeDev */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.InstallationController = void 0;
var Facility_1 = require("../models/Facility");
var mongoose_1 = require("mongoose");
var InstallationController = /** @class */ (function () {
    function InstallationController() {
    }
    // Crear Las Instalaciones
    InstallationController.createInstallation = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var installation, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    installation = new Facility_1["default"](__assign(__assign({}, req.body), { company: req.company.id }));
                    // Agregar la instalación al array de la empresa
                    req.company.installations.push(installation.id);
                    // Guardar la empresa con la nueva instalación   
                    return [4 /*yield*/, Promise.allSettled([installation.save(), req.company.save()])];
                case 1:
                    // Guardar la empresa con la nueva instalación   
                    _a.sent();
                    res.send("Instalación creada correctamente");
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error(error_1);
                    res.status(500).json({ error: "Error al crear la instalación" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Obtener Las Instalaciones
    InstallationController.getCompanyInstalls = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var installations, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Facility_1["default"].find({
                            company: req.company._id
                        }).populate("company")];
                case 1:
                    installations = _a.sent();
                    res.json(installations);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error(error_2);
                    res.status(500).json({ error: "Error al obtener las instalaciones" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Obtener las Instalaciones por su ID
    InstallationController.getInstallationsById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, install, error, error, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, Facility_1["default"].findById(id)];
                case 1:
                    install = _a.sent();
                    if (!install) {
                        error = new Error("Instalación no encontrada");
                        return [2 /*return*/, res.status(404).json({ error: error.message })];
                    }
                    if (install.company.toString() !== req.company.id.toString()) {
                        error = new Error("Acción no válida, la instalación no pertenece a la empresa");
                        return [2 /*return*/, res.status(400).json({ error: error.message })];
                    }
                    res.json(install);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    res.status(500).json({ error: "Error al obtener la Instalación" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    InstallationController.updateInstallation = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, install, error, error, installExist, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // Validar si el ID es un ObjectId válido
                    if (!mongoose_1.Types.ObjectId.isValid(id)) {
                        return [2 /*return*/, res.status(400).json({ error: "ID inválido" })];
                    }
                    return [4 /*yield*/, Facility_1["default"].findByIdAndUpdate(id, req.body)];
                case 2:
                    install = _a.sent();
                    if (!install) {
                        error = new Error("Instalación no encontrada");
                        return [2 /*return*/, res.status(400).json({ error: error.message })];
                    }
                    if (install.company.toString() !== req.company.id.toString()) {
                        error = new Error("Acción no válida, la instalación no pertenece a la empresa");
                        return [2 /*return*/, res.status(400).json({ error: error.message })];
                    }
                    return [4 /*yield*/, Facility_1["default"].findOne({ name: req.body.name, _id: { $ñe: id } })];
                case 3:
                    installExist = _a.sent();
                    if (installExist) {
                        return [2 /*return*/, res.status(400).json({ message: "El nombre de la Instalación ya está registrado" })];
                    }
                    res.send("Instalación actualizada correctamente");
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error(error_4);
                    res.status(500).json({ error: "Error al actualizar la instalación" });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return InstallationController;
}());
exports.InstallationController = InstallationController;
