"use strict";
/** Autor:@elsoprimeDev */
exports.__esModule = true;
exports.GeneralSettingsModel = void 0;
var mongoose_1 = require("mongoose");
var GeneralSettingsSchema = new mongoose_1.Schema({
    siteName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    enableUserRegistration: { type: Boolean, "default": true },
    defaultLanguage: { type: String, "default": "es" },
    timezone: { type: String, "default": "America/Santiago" }
}, { timestamps: true });
exports.GeneralSettingsModel = mongoose_1.model("GeneralSettings", GeneralSettingsSchema);
