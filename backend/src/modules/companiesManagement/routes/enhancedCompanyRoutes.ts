import { Router } from "express";
import { EnhancedCompanyController } from "@/modules/companiesManagement/controllers/EnhancedCompanyController";
import { authMiddleware } from "@/modules/userManagement/middleware/authMiddleware";
import CompanyValidationMiddleware from "@/modules/companiesManagement/middleware/companyValidationMiddleware";

const router = Router();

/**
 * @description: Rutas para la gestión de Enhanced Companies v2.0
 * @module routes/companyRoutes
 * @requires express
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware.authenticate);

// Rutas específicas (deben ir antes que las rutas con parámetros)
router.get(
  "/slug/:slug",
  CompanyValidationMiddleware.validateCompanySlug,
  EnhancedCompanyController.getCompanyBySlug
);

router.get("/summary", EnhancedCompanyController.getCompaniesSummary);

// Rutas principales CRUD
router.post(
  "/",
  CompanyValidationMiddleware.validateCreateCompany,
  EnhancedCompanyController.createCompany
);

router.get(
  "/",
  CompanyValidationMiddleware.validateSearchFilters,
  EnhancedCompanyController.getAllCompanies
);

router.get(
  "/:id",
  CompanyValidationMiddleware.validateCompanyId,
  EnhancedCompanyController.getCompanyById
);

router.put(
  "/:id",
  CompanyValidationMiddleware.validateCompanyId,
  CompanyValidationMiddleware.validateUpdateCompany,
  EnhancedCompanyController.updateCompany
);

router.delete(
  "/:id",
  CompanyValidationMiddleware.validateCompanyId,
  EnhancedCompanyController.deleteCompany
);

router.delete(
  "/:id/suspend",
  CompanyValidationMiddleware.validateCompanyId,
  EnhancedCompanyController.suspendCompany
);

// Rutas específicas por ID con validación
router.get(
  "/:id/users",
  CompanyValidationMiddleware.validateCompanyId,
  EnhancedCompanyController.getCompanyWithUsers
);

router.get(
  "/:id/stats",
  CompanyValidationMiddleware.validateCompanyId,
  EnhancedCompanyController.getCompanyStats
);

router.put(
  "/:id/settings",
  CompanyValidationMiddleware.validateCompanyId,
  CompanyValidationMiddleware.validateUpdateCompany,
  EnhancedCompanyController.updateCompanySettings
);

// Rutas de gestión de estado y plan
router.put(
  "/:id/status",
  CompanyValidationMiddleware.validateCompanyId,
  CompanyValidationMiddleware.validateStatusChange,
  EnhancedCompanyController.changeCompanyStatus
);

router.put(
  "/:id/plan",
  CompanyValidationMiddleware.validateCompanyId,
  CompanyValidationMiddleware.validatePlanChange,
  EnhancedCompanyController.changeCompanyPlan
);

// Ruta de reactivación de empresas (Super Admin only)
router.post(
  "/:id/reactivate",
  CompanyValidationMiddleware.validateCompanyId,
  EnhancedCompanyController.reactivateCompany
);

export default router;
