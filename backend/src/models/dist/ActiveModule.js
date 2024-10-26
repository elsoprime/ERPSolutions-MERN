"use strict";
/** Autor:@elsoprimeDev */
exports.__esModule = true;
exports.ActiveModulesModel = void 0;
var mongoose_1 = require("mongoose");
var ActiveModulesSchema = new mongoose_1.Schema({
    companiesModule: { type: Boolean, "default": true },
    installationsModule: { type: Boolean, "default": true },
    generatorsModule: { type: Boolean, "default": true },
    collaboratorsModule: { type: Boolean, "default": true },
    inventoriesModule: { type: Boolean, "default": true },
    operationsModule: { type: Boolean, "default": true },
    activitiesModule: { type: Boolean, "default": true }
}, { timestamps: true });
exports.ActiveModulesModel = mongoose_1.model('ActiveModules', ActiveModulesSchema);
