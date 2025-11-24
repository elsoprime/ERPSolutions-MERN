/**
 * Permission Service
 * @description Servicio para calcular permisos dinámicos basados en rol y plan de empresa
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import { Types } from "mongoose";
import EnhancedCompany from "@/modules/companiesManagement/models/EnhancedCompany";
import Plan from "@/models/Plan";
import { IPlanFeatures } from "@/interfaces/IPlan";
import {
  CompanyPermission,
  getPermissionsForFeatures,
  getActiveModules,
  getRestrictedModules,
  PlanFeatureKey,
} from "@/utils/modulePermissionMap";
import { CompanyRole } from "@/modules/userManagement/models/EnhancedUser";

/**
 * Permisos por defecto según rol de empresa
 */
const ROLE_DEFAULT_PERMISSIONS: Record<CompanyRole, CompanyPermission[]> = {
  admin_empresa: [
    // Gestión de usuarios
    "users.create",
    "users.edit",
    "users.delete",
    "users.view",
    "users.assign_roles",
    // Configuración
    "company.edit",
    "company.configure",
    "company.branding",
    "company.billing",
    // Inventario (si está disponible)
    "inventory.create",
    "inventory.edit",
    "inventory.delete",
    "inventory.view",
    "inventory.transfer",
    "inventory.adjust",
    // Contabilidad (si está disponible)
    "accounting.create",
    "accounting.edit",
    "accounting.delete",
    "accounting.view",
    "accounting.reports",
    // HRM (si está disponible)
    "hrm.create",
    "hrm.edit",
    "hrm.delete",
    "hrm.view",
    "hrm.payroll",
    // CRM (si está disponible)
    "crm.create",
    "crm.edit",
    "crm.delete",
    "crm.view",
    "crm.contacts",
    // Proyectos (si está disponible)
    "projects.create",
    "projects.edit",
    "projects.delete",
    "projects.view",
    "projects.assign",
    // Reportes
    "reports.view",
    "reports.export",
    "reports.create",
    // Configuraciones
    "settings.edit",
    "settings.view",
    // Ventas
    "sales.create",
    "sales.edit",
    "sales.view",
    "sales.delete",
    // Compras
    "purchases.create",
    "purchases.edit",
    "purchases.view",
    "purchases.delete",
    // API (si está disponible)
    "api.read",
    "api.write",
    // Analíticas (si está disponible)
    "analytics.view",
    "analytics.export",
    // Audit (si está disponible)
    "audit.view",
    "audit.export",
    // Integraciones (si está disponible)
    "integrations.configure",
    "integrations.view",
  ],

  manager: [
    "users.view",
    "users.assign_roles",
    "inventory.create",
    "inventory.edit",
    "inventory.view",
    "inventory.transfer",
    "accounting.view",
    "accounting.reports",
    "hrm.view",
    "crm.create",
    "crm.edit",
    "crm.view",
    "projects.create",
    "projects.edit",
    "projects.view",
    "projects.assign",
    "reports.view",
    "reports.export",
    "settings.view",
    "sales.create",
    "sales.edit",
    "sales.view",
    "purchases.create",
    "purchases.edit",
    "purchases.view",
    "analytics.view",
  ],

  employee: [
    "users.view",
    "inventory.view",
    "inventory.transfer",
    "accounting.view",
    "hrm.view",
    "crm.view",
    "projects.view",
    "reports.view",
    "settings.view",
    "sales.create",
    "sales.view",
    "purchases.view",
  ],

  viewer: [
    "inventory.view",
    "accounting.view",
    "hrm.view",
    "crm.view",
    "projects.view",
    "reports.view",
    "sales.view",
    "purchases.view",
  ],
};

/**
 * Resultado del cálculo de permisos
 */
export interface PermissionCalculationResult {
  permissions: CompanyPermission[];
  availableModules: PlanFeatureKey[];
  restrictedModules: PlanFeatureKey[];
  planName: string;
  planType: string;
}

/**
 * Servicio de cálculo de permisos
 */
export class PermissionService {
  /**
   * Obtiene las características del plan de una empresa
   */
  private static async getCompanyPlanFeatures(
    companyId: Types.ObjectId | string
  ): Promise<IPlanFeatures | null> {
    try {
      const company = await EnhancedCompany.findById(companyId).populate(
        "plan"
      );

      if (!company) {
        console.error(`❌ Empresa no encontrada: ${companyId}`);
        return null;
      }

      // Si tiene plan asignado, usar sus features
      if (company.plan) {
        const plan =
          typeof company.plan === "object" && "features" in company.plan
            ? (company.plan as unknown as { features: IPlanFeatures })
            : null;

        if (plan && plan.features) {
          // Convertir documento de Mongoose a objeto plano
          return JSON.parse(JSON.stringify(plan.features));
        }

        // Si plan es string/ObjectId, buscar el plan
        const planDoc = await Plan.findById(company.plan);
        if (planDoc?.features) {
          // Convertir documento de Mongoose a objeto plano
          return JSON.parse(JSON.stringify(planDoc.features));
        }
      }

      // Fallback: usar features de la empresa directamente
      if (company.settings?.features) {
        // Convertir documento de Mongoose a objeto plano
        return JSON.parse(JSON.stringify(company.settings.features));
      }

      console.warn(
        `⚠️ No se encontraron features para empresa ${companyId}, usando defaults`
      );
      return null;
    } catch (error) {
      console.error("Error obteniendo features del plan:", error);
      return null;
    }
  }

  /**
   * Obtiene los permisos por defecto de un rol
   */
  private static getDefaultPermissionsForRole(
    role: CompanyRole
  ): CompanyPermission[] {
    return ROLE_DEFAULT_PERMISSIONS[role] || [];
  }

  /**
   * Calcula los permisos finales basados en rol y plan de empresa
   * Fórmula: Permisos del Rol ∩ Permisos del Plan
   */
  static async calculateUserPermissions(
    role: CompanyRole,
    companyId: Types.ObjectId | string
  ): Promise<PermissionCalculationResult> {
    try {
      // 1. Obtener características del plan
      const planFeatures = await this.getCompanyPlanFeatures(companyId);

      if (!planFeatures) {
        console.warn(
          `⚠️ Plan features no disponibles para ${companyId}, asignando permisos mínimos`
        );
        return {
          permissions: ["settings.view", "company.edit"],
          availableModules: [],
          restrictedModules: [],
          planName: "Sin plan",
          planType: "unknown",
        };
      }

      // 2. Obtener permisos por defecto del rol
      const rolePermissions = this.getDefaultPermissionsForRole(role);

      // 3. Obtener permisos disponibles según el plan
      const planPermissions = getPermissionsForFeatures(planFeatures);

      // 4. Calcular intersección (solo permisos del rol que estén en el plan)
      const finalPermissions = rolePermissions.filter((permission) =>
        planPermissions.includes(permission)
      );

      // 5. Obtener módulos activos y restringidos
      const availableModules = getActiveModules(planFeatures);
      const restrictedModules = getRestrictedModules(planFeatures);

      // 6. Obtener información del plan
      const company = await EnhancedCompany.findById(companyId).populate(
        "plan"
      );
      const planDoc =
        company?.plan &&
        typeof company.plan === "object" &&
        "name" in company.plan
          ? (company.plan as unknown as { name: string; type: string })
          : null;

      const planName = planDoc?.name || "Plan Personalizado";
      const planType = planDoc?.type || "custom";

      return {
        permissions: finalPermissions,
        availableModules,
        restrictedModules,
        planName,
        planType,
      };
    } catch (error) {
      console.error("Error calculando permisos:", error);
      throw new Error("Error al calcular permisos del usuario");
    }
  }

  /**
   * Valida si un conjunto de permisos es válido para un rol y empresa
   */
  static async validatePermissions(
    permissions: string[],
    role: CompanyRole,
    companyId: Types.ObjectId | string
  ): Promise<{ valid: boolean; invalidPermissions: string[] }> {
    try {
      const result = await this.calculateUserPermissions(role, companyId);
      const validPermissions = result.permissions;

      const invalidPermissions = permissions.filter(
        (p) => !validPermissions.includes(p as CompanyPermission)
      );

      return {
        valid: invalidPermissions.length === 0,
        invalidPermissions,
      };
    } catch (error) {
      console.error("Error validando permisos:", error);
      return { valid: false, invalidPermissions: permissions };
    }
  }

  /**
   * Obtiene módulos disponibles para una empresa
   */
  static async getAvailableModules(
    companyId: Types.ObjectId | string
  ): Promise<PlanFeatureKey[]> {
    const planFeatures = await this.getCompanyPlanFeatures(companyId);
    if (!planFeatures) return [];
    return getActiveModules(planFeatures);
  }

  /**
   * Verifica si un módulo está disponible para una empresa
   */
  static async isModuleAvailable(
    companyId: Types.ObjectId | string,
    module: PlanFeatureKey
  ): Promise<boolean> {
    const planFeatures = await this.getCompanyPlanFeatures(companyId);
    if (!planFeatures) return false;
    return planFeatures[module] === true;
  }
}

export default PermissionService;
