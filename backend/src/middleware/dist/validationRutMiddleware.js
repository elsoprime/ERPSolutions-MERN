"use strict";
/** Autor: @elsoprimeDev */
exports.__esModule = true;
exports.rutValidationMiddleware = void 0;
var validateRut_1 = require("../utils/validateRut");
/**
 * Middleware para validar el RUT en las solicitudes.
 * @param req Solicitud HTTP.
 * @param res Respuesta HTTP.
 * @param next Función para pasar al siguiente middleware.
 */
function rutValidationMiddleware(req, res, next) {
    var rutOrDni = req.body.rutOrDni;
    if (!validateRut_1.validateRut(rutOrDni)) {
        console.log(rutOrDni);
        return res.status(400).json({ message: "RUT o DNI no válido" });
    }
    next(); // Si el RUT es válido, pasa al siguiente middleware o controlador
}
exports.rutValidationMiddleware = rutValidationMiddleware;
