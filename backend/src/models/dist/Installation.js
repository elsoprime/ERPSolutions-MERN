"use strict";
/** Autor:@elsoprimeDev */
exports.__esModule = true;
exports.InstallationSchema = void 0;
var mongoose_1 = require("mongoose");
var installationsCategory = {
    NONE: "none",
    OFFICE: "office",
    PLANT: "plant",
    FACTORY: "factory",
    WAREHOUSE: "wareHouse",
    BRANCH: "branch",
    POWERPLANT: "powerPlant"
};
exports.InstallationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    typesystem: {
        type: String,
        required: true
    },
    typeInstallation: {
        type: String,
        "enum": Object.values(installationsCategory),
        "default": installationsCategory.NONE
    },
    company: {
        type: mongoose_1.Types.ObjectId,
        ref: "Company"
    },
    managingCompanies: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "Company"
        },
    ],
    generators: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "Generator"
        },
    ]
}, { timestamps: true });
var Installation = mongoose_1["default"].model("Installation", exports.InstallationSchema);
exports["default"] = Installation;
