/**
 * Multi-Company User Management Routes
 * @description: Rutas para gestión de usuarios en arquitectura multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { Router } from "express";
import MultiCompanyUserController from "../controllers/MultiCompanyUserController";
import { authMiddleware } from "../../../modules/userManagement/middleware/authMiddleware";
import MultiCompanyMiddleware from "../../companiesManagement/middleware/multiCompanyMiddleware";
import { userValidation } from "../middleware/userValidation";
import { roleAssignmentValidation } from "../middleware/roleAssignmentValidation";
import permissionRoutes from "./permissionRoutes";

const router = Router();

/**
 * Subrutas para cálculo de permisos
 */
router.use("/permissions", permissionRoutes);

/**
 * Rutas para Super Admin (gestión global de usuarios)
 */

// Obtener estadísticas de usuarios del sistema
router.get(
  "/stats",
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission("companies.list_all"),
  MultiCompanyUserController.getUsersStats
);

// Obtener todos los usuarios del sistema
router.get(
  "/all",
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission("companies.list_all"),
  MultiCompanyUserController.getAllUsers
);

// Crear usuario con rol global o de empresa
// 🔒 NOTA: roleAssignmentValidation valida que el usuario solo pueda asignar roles permitidos
router.post(
  "/",
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission("companies.list_all"),
  roleAssignmentValidation.validateRoleAssignment, // ✅ Validación de jerarquía de roles
  userValidation.validateCreateUser,
  MultiCompanyUserController.createUser
);

/**
 * Rutas para Admin de Empresa (gestión de usuarios de su empresa)
 */

// Obtener usuarios de la empresa del contexto actual
router.get(
  "/company",
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission("users.view"),
  MultiCompanyUserController.getCompanyUsers
);

// Crear usuario en la empresa del contexto actual
// 🔒 NOTA: roleAssignmentValidation valida que admin_empresa solo asigne roles inferiores
router.post(
  "/company",
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission("users.create"),
  roleAssignmentValidation.validateRoleAssignment, // ✅ Validación de jerarquía de roles
  userValidation.validateCreateCompanyUser,
  MultiCompanyUserController.createUser
);

/**
 * Rutas para gestión individual de usuarios
 */

// Obtener perfil del usuario actual
router.get(
  "/profile",
  authMiddleware.authenticate,
  MultiCompanyUserController.getProfile
);

// Cambiar contraseña de usuario (requiere contraseña actual)
router.put(
  "/:id/password",
  authMiddleware.authenticate,
  MultiCompanyUserController.changePassword
);

// Actualizar usuario específico (NO incluye contraseña)
router.put(
  "/:userId",
  authMiddleware.authenticate,
  MultiCompanyMiddleware.setCompanyContext(),
  MultiCompanyMiddleware.requireCompanyPermission("users.edit"),
  userValidation.validateUpdateUser,
  MultiCompanyUserController.updateUser
);

// Suspender usuario
router.put(
  "/:userId/suspend",
  authMiddleware.authenticate,
  MultiCompanyUserController.suspendUser
);

// Reactivar usuario suspendido
router.put(
  "/:userId/reactivate",
  authMiddleware.authenticate,
  MultiCompanyUserController.reactivateUser
);

// Asignar rol a usuario
router.post(
  "/:userId/roles",
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission("companies.list_all"),
  userValidation.validateAssignRole,
  MultiCompanyUserController.assignRole
);

// Revocar rol de usuario
router.delete(
  "/:userId/roles",
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireGlobalPermission("companies.list_all"),
  userValidation.validateRevokeRole,
  MultiCompanyUserController.revokeRole
);

// Eliminar usuario (soft delete) - Super Admin
router.delete(
  "/:userId",
  authMiddleware.authenticate,
  MultiCompanyUserController.deleteUser
);

export default router;
