/**
 * Permission Controller
 * @description Controlador para endpoints de cálculo de permisos
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import { Request, Response } from "express";
import { Types } from "mongoose";
import PermissionService from "@/services/permissionService";
import { CompanyRole } from "@/modules/userManagement/models/EnhancedUser";
import { PlanFeatureKey } from "@/utils/modulePermissionMap";

/**
 * Query params para calcular permisos
 */
interface CalculatePermissionsQuery {
  companyId: string;
  role: CompanyRole;
}

/**
 * Controlador de permisos
 */
export class PermissionController {
  /**
   * Calcula los permisos para un rol en una empresa específica
   * @route GET /api/permissions/calculate?companyId=xxx&role=admin_empresa
   */
  static calculatePermissions = async (
    req: Request<object, object, object, CalculatePermissionsQuery>,
    res: Response
  ): Promise<void> => {
    try {
      const { companyId, role } = req.query;

      // Validar parámetros requeridos
      if (!companyId || !role) {
        res.status(400).json({
          success: false,
          error: "Se requieren los parámetros 'companyId' y 'role'",
        });
        return;
      }

      // Validar ObjectId
      if (!Types.ObjectId.isValid(companyId)) {
        res.status(400).json({
          success: false,
          error: "ID de empresa inválido",
        });
        return;
      }

      // Validar rol
      const validRoles: CompanyRole[] = [
        "admin_empresa",
        "manager",
        "employee",
        "viewer",
      ];
      if (!validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          error: `Rol inválido. Debe ser uno de: ${validRoles.join(", ")}`,
        });
        return;
      }

      // Calcular permisos
      const result = await PermissionService.calculateUserPermissions(
        role,
        companyId
      );

      console.log(
        `📊 Permisos calculados - Empresa: ${companyId}, Rol: ${role}, Permisos: ${result.permissions.length}`
      );

      res.status(200).json({
        success: true,
        data: {
          permissions: result.permissions,
          availableModules: result.availableModules,
          restrictedModules: result.restrictedModules,
          planInfo: {
            name: result.planName,
            type: result.planType,
          },
          metadata: {
            totalPermissions: result.permissions.length,
            totalAvailableModules: result.availableModules.length,
            totalRestrictedModules: result.restrictedModules.length,
          },
        },
      });
    } catch (error) {
      console.error("Error en calculatePermissions:", error);
      res.status(500).json({
        success: false,
        error: "Error al calcular permisos",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  };

  /**
   * Obtiene los módulos disponibles para una empresa
   * @route GET /api/permissions/available-modules/:companyId
   */
  static getAvailableModules = async (
    req: Request<{ companyId: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { companyId } = req.params;

      // Validar ObjectId
      if (!Types.ObjectId.isValid(companyId)) {
        res.status(400).json({
          success: false,
          error: "ID de empresa inválido",
        });
        return;
      }

      // Obtener módulos disponibles
      const availableModules = await PermissionService.getAvailableModules(
        companyId
      );

      res.status(200).json({
        success: true,
        data: {
          companyId,
          availableModules,
          totalModules: availableModules.length,
        },
      });
    } catch (error) {
      console.error("Error en getAvailableModules:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener módulos disponibles",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  };

  /**
   * Valida un conjunto de permisos para un rol y empresa
   * @route POST /api/permissions/validate
   */
  static validatePermissions = async (
    req: Request<
      object,
      object,
      { permissions: string[]; role: CompanyRole; companyId: string }
    >,
    res: Response
  ): Promise<void> => {
    try {
      const { permissions, role, companyId } = req.body;

      // Validar parámetros
      if (!permissions || !role || !companyId) {
        res.status(400).json({
          success: false,
          error: "Se requieren 'permissions', 'role' y 'companyId'",
        });
        return;
      }

      if (!Types.ObjectId.isValid(companyId)) {
        res.status(400).json({
          success: false,
          error: "ID de empresa inválido",
        });
        return;
      }

      if (!Array.isArray(permissions)) {
        res.status(400).json({
          success: false,
          error: "'permissions' debe ser un array",
        });
        return;
      }

      // Validar permisos
      const validation = await PermissionService.validatePermissions(
        permissions,
        role,
        companyId
      );

      res.status(200).json({
        success: true,
        data: {
          valid: validation.valid,
          invalidPermissions: validation.invalidPermissions,
          totalValidated: permissions.length,
          totalInvalid: validation.invalidPermissions.length,
        },
      });
    } catch (error) {
      console.error("Error en validatePermissions:", error);
      res.status(500).json({
        success: false,
        error: "Error al validar permisos",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  };

  /**
   * Verifica si un módulo está disponible para una empresa
   * @route GET /api/permissions/check-module/:companyId/:module
   */
  static checkModuleAvailability = async (
    req: Request<{ companyId: string; module: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { companyId, module } = req.params;

      if (!Types.ObjectId.isValid(companyId)) {
        res.status(400).json({
          success: false,
          error: "ID de empresa inválido",
        });
        return;
      }

      const isAvailable = await PermissionService.isModuleAvailable(
        companyId,
        module as PlanFeatureKey
      );

      res.status(200).json({
        success: true,
        data: {
          companyId,
          module,
          available: isAvailable,
        },
      });
    } catch (error) {
      console.error("Error en checkModuleAvailability:", error);
      res.status(500).json({
        success: false,
        error: "Error al verificar disponibilidad del módulo",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  };
}

export default PermissionController;
