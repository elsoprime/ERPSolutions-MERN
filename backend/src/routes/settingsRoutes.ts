/** Autor: @elsoprimeDev */

import express from "express";
import {
  getGeneralSettings,
  updateGeneralSettings,
} from "../controllers/GeneralSettingController";
import {
  getSecuritySettings,
  updateSecuritySettings,
} from "../controllers/ServiceSettingController";
import {
  getActiveModules,
  updateActiveModules,
} from "../controllers/ActiveControllerController";
import { handleInputErrors } from "../middleware/validation";
import { param } from "express-validator";

const router = express.Router();

// General Settings Routes
router.get("/general-settings", getGeneralSettings);
router.put(
  "/general-settings/:id",
  param("id").isMongoId().withMessage("Identificador no válido"),
  handleInputErrors,
  updateGeneralSettings
);

// Security Settings Routes
router.get("/security-settings", getSecuritySettings);
router.put("/security-settings/:id", handleInputErrors, updateSecuritySettings);

// Active Modules Routes
router.get("/active-modules", getActiveModules);
router.put("/active-modules/:id", handleInputErrors, updateActiveModules);

export default router;
