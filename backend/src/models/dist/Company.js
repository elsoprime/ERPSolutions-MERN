"use strict";
/** Autor:@elsoprimeDev */
/** Models Company */
exports.__esModule = true;
exports.CompanySchema = exports.industryCategory = void 0;
var mongoose_1 = require("mongoose");
exports.industryCategory = {
    NONE: 'noneCategory',
    TECHNOLOGY: 'technology',
    FINANCE: 'finance',
    HEALTHCARE: 'healthcare',
    EDUCATION: 'education',
    CONSTRUCTION: 'construction',
    RETAIL: 'retail',
    MANUFACTURING: 'manufacturing',
    TRANSPORTATION: 'transportation',
    AGRICULTURE: 'agriculture',
    ENERGY: 'energy',
    ENTERTAINMENT: 'entertainment',
    HOSPITALITY: 'hospitality',
    REAL_ESTATE: 'realEstate',
    LEGAL: 'legal',
    FOOD_BEVERAGE: 'foodAndBeverage'
};
exports.CompanySchema = new mongoose_1.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    rutOrDni: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    incorporationDate: {
        type: Date,
        required: true
    },
    industry: {
        type: String,
        "enum": Object.values(exports.industryCategory),
        "default": exports.industryCategory.NONE,
        required: true
    },
    address: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    facilities: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: 'Facility'
        }
    ]
}, { timestamps: true });
var Company = mongoose_1["default"].model('Company', exports.CompanySchema);
exports["default"] = Company;
