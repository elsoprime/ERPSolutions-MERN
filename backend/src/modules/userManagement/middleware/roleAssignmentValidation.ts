/**
 * 🔒 ROLE ASSIGNMENT VALIDATION MIDDLEWARE
 *
 * @description
 * Middleware para validar que un usuario solo pueda asignar roles
 * de nivel inferior al suyo y solo dentro de su ámbito empresarial.
 *
 * @usage
 * Se agrega ANTES de createUser en userRoutes.ts:
 *
 * router.post('/users',
 *   authenticate,
 *   roleAssignmentValidation.validateRoleAssignment,
 *   userValidation.validateCreateUser,
 *   MultiCompanyUserController.createUser
 * );
 *
 * @architecture
 * - Super Admin: Bypass total (puede asignar cualquier rol)
 * - Admin Empresa: Validación estricta (solo roles inferiores en SU empresa)
 * - Manager: Validación estricta (solo employee/viewer en SU empresa)
 * - Employee/Viewer: Rechazo total
 *
 * @compatibility
 * - ✅ Se agrega a la cadena de middleware existente
 * - ✅ NO modifica lógica de createUser
 * - ✅ Compatible con validaciones existentes
 * - ✅ Tipado estricto (sin any)
 *
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import { Request, Response, NextFunction } from "express";
import RoleAssignmentService, {
  AssignerInfo,
} from "@/services/roleAssignmentService";
import {
  CompanyRole,
  GlobalRole,
} from "@/modules/userManagement/models/EnhancedUser";
import EnhancedUser from "@/modules/userManagement/models/EnhancedUser";

/**
 * Clase de validación de asignación de roles
 */
export class RoleAssignmentValidation {
  /**
   * Middleware para validar asignación de roles en creación de usuarios
   *
   * Valida que:
   * 1. El usuario que asigna tenga permisos para asignar ese rol
   * 2. El rol sea apropiado para el contexto (global vs company)
   * 3. La empresa sea válida si es rol de company
   *
   * @middleware
   */
  static validateRoleAssignment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { roleType, role, companyId } = req.body;
      const currentUser = req.authUser;

      // 1. Verificar que el usuario esté autenticado
      if (!currentUser || !currentUser.id) {
        return res.status(401).json({
          error: "Usuario no autenticado",
          code: "UNAUTHENTICATED",
        });
      }

      // 2. Obtener información completa del usuario desde la BD (con array de roles)
      const userFromDB = await EnhancedUser.findById(currentUser.id).select(
        "roles"
      );

      if (!userFromDB) {
        return res.status(401).json({
          error: "Usuario no encontrado",
          code: "USER_NOT_FOUND",
        });
      }

      // 3. Construir información del usuario que asigna
      const assignerInfo: AssignerInfo = {
        userId: currentUser.id,
        roles: userFromDB.roles.map((r) => ({
          roleType: r.roleType,
          role: r.role,
          companyId: r.companyId,
          isActive: r.isActive,
        })),
      };

      // 4. Super Admin: BYPASS total (puede asignar cualquier rol)
      const isSuperAdmin = assignerInfo.roles.some(
        (r) => r.role === "super_admin" && r.roleType === "global" && r.isActive
      );

      if (isSuperAdmin) {
        console.log("✅ Super Admin asignando rol - sin restricciones");
        return next(); // Continuar sin validaciones
      }

      // 4. Validar que roleType y role estén presentes
      if (!roleType || !role) {
        return res.status(400).json({
          error: "roleType y role son requeridos",
          code: "MISSING_ROLE_INFO",
        });
      }

      // 5. Validar que companyId esté presente para roles de empresa
      if (roleType === "company" && !companyId) {
        return res.status(400).json({
          error: "companyId es requerido para roles de empresa",
          code: "MISSING_COMPANY_ID",
        });
      }

      // 6. Verificar si puede asignar el rol solicitado
      const canAssign = RoleAssignmentService.canAssignRole(
        assignerInfo,
        role as CompanyRole | GlobalRole,
        roleType,
        companyId
      );

      if (!canAssign) {
        // Obtener rol del usuario en esa empresa (para mensaje de error descriptivo)
        const assignerRoleInCompany =
          roleType === "company" && companyId
            ? assignerInfo.roles.find(
                (r) =>
                  r.roleType === "company" &&
                  r.isActive &&
                  r.companyId?.toString() === companyId
              )
            : null;

        const errorMessage = RoleAssignmentService.getAssignmentErrorMessage(
          assignerRoleInCompany?.role as CompanyRole | null,
          role as CompanyRole | GlobalRole,
          companyId
        );

        console.log(`❌ Intento de asignación de rol rechazado:`, {
          assigner: currentUser.email,
          assignerRole: assignerRoleInCompany?.role || "ninguno",
          targetRole: role,
          targetRoleType: roleType,
          companyId,
        });

        return res.status(403).json({
          error: errorMessage,
          code: "INSUFFICIENT_ROLE_PRIVILEGES",
          details: {
            requiredPrivilege: "Asignar roles de nivel inferior",
            currentRole: assignerRoleInCompany?.role || "ninguno",
            attemptedRole: role,
          },
        });
      }

      // 7. Validación exitosa - continuar con la creación
      console.log(`✅ Validación de asignación de rol exitosa:`, {
        assigner: currentUser.email,
        targetRole: role,
        targetRoleType: roleType,
        companyId,
      });

      next();
    } catch (error) {
      console.error("Error en validación de asignación de rol:", error);
      return res.status(500).json({
        error: "Error interno al validar asignación de rol",
        code: "VALIDATION_ERROR",
      });
    }
  };

  /**
   * Middleware para validar asignación de roles en actualización de usuarios
   * Similar a validateRoleAssignment pero para actualizaciones
   *
   * @middleware
   */
  static validateRoleUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { roleType, role, companyId } = req.body;
      const currentUser = req.authUser;

      // Si no se está actualizando el rol, continuar
      if (!roleType && !role) {
        return next();
      }

      // Reutilizar la misma validación de creación
      return RoleAssignmentValidation.validateRoleAssignment(req, res, next);
    } catch (error) {
      console.error("Error en validación de actualización de rol:", error);
      return res.status(500).json({
        error: "Error interno al validar actualización de rol",
        code: "VALIDATION_ERROR",
      });
    }
  };
}

export const roleAssignmentValidation = RoleAssignmentValidation;
export default RoleAssignmentValidation;
