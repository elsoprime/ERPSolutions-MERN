"use strict";
/** Autor: @elsoprimeDEV */
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    token: {
        type: Boolean,
        "default": false
    },
    role: {
        type: String,
        required: true
    },
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
});
var User = mongoose_1["default"].model('User', UserSchema);
exports["default"] = User;
