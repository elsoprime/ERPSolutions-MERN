/**
 * Health Check Routes
 * @description Rutas para verificación de salud del sistema
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import express from "express";
import {
  getSystemHealthStatus,
  getDatabaseHealthStatus,
  getApiHealthStatus,
  getStorageHealthStatus,
  getEmailHealthStatus,
} from "@/controllers/HealthCheckController";

// 🔒 SEGURIDAD - Middleware JWT (opcional para health checks)
import { authMiddleware } from "@/modules/userManagement/middleware/authMiddleware";
import { requireAdmin } from "@/modules/userManagement/middleware/roleMiddleware";

const router = express.Router();

// ====================================
// 🏥 HEALTH CHECK ROUTES
// ====================================

/**
 * GET /api/health
 * Estado general de todos los servicios
 * Público - Sin autenticación (para monitoreo externo)
 */
router.get("/", getSystemHealthStatus);

/**
 * GET /api/health/database
 * Estado de la base de datos
 * Protegido - Solo administradores
 */
router.get(
  "/database",
  authMiddleware.authenticate,
  requireAdmin,
  getDatabaseHealthStatus
);

/**
 * GET /api/health/api
 * Estado del servidor API
 * Protegido - Solo administradores
 */
router.get(
  "/api",
  authMiddleware.authenticate,
  requireAdmin,
  getApiHealthStatus
);

/**
 * GET /api/health/storage
 * Estado del servicio de almacenamiento
 * Protegido - Solo administradores
 */
router.get(
  "/storage",
  authMiddleware.authenticate,
  requireAdmin,
  getStorageHealthStatus
);

/**
 * GET /api/health/email
 * Estado del servicio de email
 * Protegido - Solo administradores
 */
router.get(
  "/email",
  authMiddleware.authenticate,
  requireAdmin,
  getEmailHealthStatus
);

export default router;
