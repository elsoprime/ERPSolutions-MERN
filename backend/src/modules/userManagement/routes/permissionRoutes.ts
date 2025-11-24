/**
 * Permission Routes
 * @description Rutas para endpoints de cálculo de permisos
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import { Router } from "express";
import PermissionController from "../controllers/PermissionController";
import { authMiddleware } from "@/modules/userManagement/middleware/authMiddleware";

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authMiddleware.authenticate);

/**
 * @route   GET /api/permissions/calculate
 * @desc    Calcula permisos para un rol en una empresa
 * @access  Private (requiere autenticación)
 * @query   companyId: string, role: CompanyRole
 */
router.get("/calculate", PermissionController.calculatePermissions);

/**
 * @route   GET /api/permissions/available-modules/:companyId
 * @desc    Obtiene módulos disponibles para una empresa
 * @access  Private
 * @params  companyId: string
 */
router.get(
  "/available-modules/:companyId",
  PermissionController.getAvailableModules
);

/**
 * @route   POST /api/permissions/validate
 * @desc    Valida un conjunto de permisos para un rol y empresa
 * @access  Private
 * @body    { permissions: string[], role: CompanyRole, companyId: string }
 */
router.post("/validate", PermissionController.validatePermissions);

/**
 * @route   GET /api/permissions/check-module/:companyId/:module
 * @desc    Verifica si un módulo está disponible para una empresa
 * @access  Private
 * @params  companyId: string, module: PlanFeatureKey
 */
router.get(
  "/check-module/:companyId/:module",
  PermissionController.checkModuleAvailability
);

export default router;
