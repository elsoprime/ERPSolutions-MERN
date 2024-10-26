"use strict";
/** Autor:@elsoprimeDev */
exports.__esModule = true;
exports.SecuritySettingsModel = void 0;
var mongoose_1 = require("mongoose");
var SecuritySettingsSchema = new mongoose_1.Schema({
    passwordPolicy: {
        minLength: { type: Number, "default": 8 },
        requireNumbers: { type: Boolean, "default": true },
        requireSpecialChars: { type: Boolean, "default": true }
    },
    accountLockout: {
        threshold: { type: Number, "default": 5 },
        lockoutDuration: { type: Number, "default": 30 }
    }
}, { timestamps: true });
exports.SecuritySettingsModel = mongoose_1.model('SecuritySettings', SecuritySettingsSchema);
