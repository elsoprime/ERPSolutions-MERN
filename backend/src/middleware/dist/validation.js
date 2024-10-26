"use strict";
/** Autor: @elsoprimeDEV */
exports.__esModule = true;
exports.handleInputErrors = void 0;
var express_validator_1 = require("express-validator");
exports.handleInputErrors = function (req, res, next) {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) { // Llamar a la función isEmpty()
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
