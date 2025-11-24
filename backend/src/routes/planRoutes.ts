/**
 * @fileoverview Plan Routes
 * @description Rutas para gestión de planes de suscripción
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import express from "express";
import {
  getAllPlans,
  getActivePlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/PlanController";
import { authMiddleware } from "@/modules/userManagement/middleware/authMiddleware";
import { RoleMiddleware } from "@/modules/userManagement/middleware/roleMiddleware";

const router = express.Router();

/**
 * Ruta pública para obtener planes activos
 * Permite a usuarios no autenticados ver los planes disponibles
 */
router.get("/active", getActivePlans);

/**
 * Rutas protegidas - Solo Admin/Super Admin
 */
router.use(authMiddleware.authenticate);
router.use(RoleMiddleware.requireAdmin);

/**
 * @route   GET /api/plans
 * @desc    Obtener todos los planes
 * @access  Private (Super Admin)
 */
router.get("/", getAllPlans);

/**
 * @route   GET /api/plans/:id
 * @desc    Obtener un plan por ID
 * @access  Private (Super Admin)
 */
router.get("/:id", getPlanById);

/**
 * @route   POST /api/plans
 * @desc    Crear un nuevo plan
 * @access  Private (Super Admin)
 */
router.post("/", createPlan);

/**
 * @route   PUT /api/plans/:id
 * @desc    Actualizar un plan
 * @access  Private (Super Admin)
 */
router.put("/:id", updatePlan);

/**
 * @route   DELETE /api/plans/:id
 * @desc    Eliminar un plan
 * @access  Private (Super Admin)
 */
router.delete("/:id", deletePlan);

export default router;
