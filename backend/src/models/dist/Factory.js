"use strict";
/** Autor:@elsoprimeDev */
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var categoryFactory = {
    office: "Oficina",
    plant: "Planta de Proceso",
    warehouse: "Bodega",
    branch: "Sucursal", powerPlan: "Central Electrica"
};
var categorySystem = {
    SIC: "Sistema SIC",
    TStandard: "Norma Técnica (NTx)",
    CustomerSupport: "Respaldo Clientes (RC)",
    PMGD: "Sistema PMGD",
    SSMM: "Sistema Mediano (SSMM)",
    SSAA: "Sistema Aislado (SSAA)"
};
var categoryOperationMode = {
    LOCAL: "Local",
    REMOTE: "Remoto",
    REMOTECONTROL: "Telecomando"
};
var categoryStartMode = {
    ISLAND: "Isla",
    PARALLEL: "Paralelo"
};
var PlantSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    typesystem: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    zone: {
        type: String,
        required: true
    },
    inchargeof: {
        type: String,
        required: true
    },
    feeder: {
        type: String,
        required: true
    },
    startMode: {
        type: String,
        required: true
    },
    operationMode: {
        type: String,
        required: true
    },
    installedPower: {
        type: Number,
        required: true
    },
    availablePower: {
        type: Number,
        required: true
    },
    unlineal: {
        type: String,
        required: false
    },
    ownerCompany: {
        type: mongoose_1.Types.ObjectId,
        ref: "Company",
        required: false
    },
    managingCompanies: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "Company"
        },
    ],
    company: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Company",
        required: false
    },
    generators: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "Generator"
        },
    ]
}, { timestamps: true });
var Plant = mongoose_1["default"].model("Plant", PlantSchema);
exports["default"] = Plant;
