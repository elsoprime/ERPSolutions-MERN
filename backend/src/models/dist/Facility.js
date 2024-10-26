"use strict";
/** Autor:@elsoprimeDev */
/** Models Facility */
exports.__esModule = true;
exports.FacilitySchema = void 0;
//Listado Tipo de Sistema
var listTypeSystem = {
    NONE: 'none',
    SIC: 'sic',
    PMGD: 'pmgd',
    NTX: 'ntx',
    SSMM: 'ssmm',
    SSAA: 'ssaa',
    PFV: 'pfv',
    RRCC: 'rrcc'
};
var mongoose_1 = require("mongoose");
//Listado de Tipos de Instalaciones
var listFacility = {
    NONE: 'none',
    OFFICE: 'office',
    PLANT: 'plant',
    FACTORY: 'factory',
    WAREHOUSE: 'wareHouse',
    BRANCH: 'branch',
    POWERPLANT: 'powerPlant'
};
//Listado de Modo de Operación
var listModeOperation = {
    NONE: 'none',
    ISLAND: 'island',
    PARALLEL: 'parallel',
    PARALLELISLAND: 'parallelisland'
};
// Listado de Modeo de Partida
var listModeStart = {
    NONE: 'none',
    LOCAL: 'local',
    REMOTE: 'remote',
    REMOTECONTROL: 'remotecontrol',
    LOCALREMOTE: 'localremote'
};
exports.FacilitySchema = new mongoose_1.Schema({
    nameFacility: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    typeSystem: {
        type: String,
        "enum": Object.values(listTypeSystem),
        "default": listTypeSystem.NONE
    },
    typeFacility: {
        type: String,
        "enum": Object.values(listFacility),
        "default": listFacility.NONE
    },
    feeder: {
        type: String,
        required: true
    },
    startService: {
        type: Date,
        required: true
    },
    modeOperation: {
        type: String,
        "enum": Object.values(listModeOperation),
        "default": listModeOperation.NONE
    },
    modeStart: {
        type: String,
        "enum": Object.values(listModeStart),
        "default": listModeStart.NONE
    },
    installedPower: {
        type: Number,
        required: false
    },
    availablePower: {
        type: Number,
        required: false
    },
    profileImage: {
        type: String,
        required: false
    },
    location: {
        region: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        comuna: {
            type: String,
            required: true
        }
    },
    company: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Company'
    },
    generators: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: 'Generator'
        }
    ]
}, { timestamps: true });
var Facility = mongoose_1["default"].model('Facility', exports.FacilitySchema);
exports["default"] = Facility;
