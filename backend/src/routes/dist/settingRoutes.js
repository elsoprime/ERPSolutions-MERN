"use strict";
/** Autor: @elsoprimeDev */
exports.__esModule = true;
var express_1 = require("express");
var GeneralSettingController_1 = require("../controllers/GeneralSettingController");
var ServiceSettingController_1 = require("../controllers/ServiceSettingController");
var ActiveControllerController_1 = require("../controllers/ActiveControllerController");
var router = express_1["default"].Router();
// General Settings Routes
router.get('/general-settings', GeneralSettingController_1.getGeneralSettings);
router.put('/general-settings', GeneralSettingController_1.updateGeneralSettings);
// Security Settings Routes
router.get('/security-settings', ServiceSettingController_1.getSecuritySettings);
router.put('/security-settings', ServiceSettingController_1.updateSecuritySettings);
// Active Modules Routes
router.get('/active-modules', ActiveControllerController_1.getActiveModules);
router.put('/active-modules', ActiveControllerController_1.updateActiveModules);
exports["default"] = router;
