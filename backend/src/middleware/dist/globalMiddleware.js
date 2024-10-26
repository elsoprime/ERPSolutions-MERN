"use strict";
/** Autor: @elsoprimeDev */
exports.__esModule = true;
exports.globalErrorHandler = void 0;
function globalErrorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ message: "Ocurrió un error en el servidor" });
}
exports.globalErrorHandler = globalErrorHandler;
