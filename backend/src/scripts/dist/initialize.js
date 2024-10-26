"use strict";
/** Autor: @elsoprimeDEV */
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
exports.initializeAdminUser = exports.getOrCreateCompany = void 0;
//Modulo para inicializar las credenciales de la aplicacion
var bcrypt_1 = require("bcrypt");
var Company_1 = require("../models/Company");
var User_1 = require("../models/User");
var colors_1 = require("colors");
function getOrCreateCompany() {
    return __awaiter(this, void 0, void 0, function () {
        var dni, rutOrDniExist, newCompany, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    dni = '15.288.220-3';
                    return [4 /*yield*/, Company_1["default"].findOne({
                            rutOrDni: dni
                        })];
                case 1:
                    rutOrDniExist = _a.sent();
                    if (!rutOrDniExist) return [3 /*break*/, 2];
                    console.log(colors_1["default"].bgWhite.cyan.bold("El Rut " + rutOrDniExist.rutOrDni + " ya se encuentra registrado"));
                    return [2 /*return*/, rutOrDniExist.id]; // Retorna el ID de la empresa existente
                case 2: return [4 /*yield*/, Company_1["default"].create({
                        companyName: "ERP Soluciones SPA",
                        rutOrDni: "15.288.220-3",
                        description: "Software Developed by ELSOMEDIA",
                        email: "info@elsomediadev.com",
                        incorporationDate: new Date(),
                        industry: "technology",
                        address: "1234 Calle Ejemplo, Santiago",
                        phoneNumber: "+56 9 1234 5678",
                        facilities: []
                    })];
                case 3:
                    newCompany = _a.sent();
                    console.log(colors_1["default"].green.bold("Nueva empresa creada exitosamente"));
                    return [2 /*return*/, newCompany.id]; // Retorna el ID de la nueva empresa
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error(colors_1["default"].bgYellow.red("Error al registrar la Nueva Empresa"), error_1);
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.getOrCreateCompany = getOrCreateCompany;
function initializeAdminUser() {
    return __awaiter(this, void 0, void 0, function () {
        var adminUser, companyId, hashedPassword, passwordMatch, hashedPassword, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, User_1["default"].findOne({ email: "admin@elsomedia.cl" })];
                case 1:
                    adminUser = _a.sent();
                    if (adminUser) {
                        console.log(colors_1["default"].bgWhite.cyan("El Usuario con el Rol de Administrador " + adminUser.name + " ya se encuentra Registrado"));
                        return [2 /*return*/, adminUser.email];
                    }
                    if (!!adminUser) return [3 /*break*/, 5];
                    return [4 /*yield*/, getOrCreateCompany()];
                case 2:
                    companyId = _a.sent();
                    return [4 /*yield*/, bcrypt_1["default"].hash(process.env.USER_ADMIN_PASSWORD || "defaultpassword", 10)];
                case 3:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, User_1["default"].create({
                            name: "Admin",
                            email: "admin@elsomedia.cl",
                            password: hashedPassword,
                            status: "active",
                            token: false,
                            role: "admin",
                            companyId: companyId
                        })];
                case 4:
                    _a.sent();
                    console.log("Usuario administrador creado exitosamente.");
                    return [3 /*break*/, 10];
                case 5: return [4 /*yield*/, bcrypt_1["default"].compare(process.env.USER_ADMIN_PASSWORD || "defaultpassword", adminUser.password)];
                case 6:
                    passwordMatch = _a.sent();
                    if (!!passwordMatch) return [3 /*break*/, 9];
                    return [4 /*yield*/, bcrypt_1["default"].hash(process.env.USER_ADMIN_PASSWORD || "defaultpassword", 10)];
                case 7:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, User_1["default"].updateOne({ email: "admin@elsomedia.cl" }, { password: hashedPassword })];
                case 8:
                    _a.sent();
                    console.log("Contraseña del usuario administrador actualizada.");
                    return [3 /*break*/, 10];
                case 9:
                    console.log(colors_1["default"].bgMagenta.white("El usuario administrador ya existe y la contraseña está actualizada."));
                    _a.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_2 = _a.sent();
                    console.error(colors_1["default"].bgYellow.red("Error al inicializar el usuario administrador:"), error_2);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.initializeAdminUser = initializeAdminUser;
