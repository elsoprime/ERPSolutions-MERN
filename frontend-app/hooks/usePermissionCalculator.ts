/**
 * Permission Calculator Hook
 * @description Hook para calcular permisos dinámicamente según rol y empresa
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import { useState, useCallback } from "react";
import { UserRole } from "@/interfaces/EnhanchedCompany/MultiCompany";
import axiosInstance from "@/api/axios";

/**
 * Tipo para las claves de características del plan
 */
export type PlanFeatureKey =
  | "inventoryManagement"
  | "accounting"
  | "hrm"
  | "crm"
  | "projectManagement"
  | "reports"
  | "multiCurrency"
  | "apiAccess"
  | "customBranding"
  | "prioritySupport"
  | "advancedAnalytics"
  | "auditLog"
  | "customIntegrations"
  | "dedicatedAccount";

/**
 * Información del plan
 */
export interface PlanInfo {
  name: string;
  type: string;
}

/**
 * Metadata del cálculo
 */
export interface PermissionMetadata {
  totalPermissions: number;
  totalAvailableModules: number;
  totalRestrictedModules: number;
}

/**
 * Resultado del cálculo de permisos
 */
export interface PermissionCalculationResult {
  permissions: string[];
  availableModules: PlanFeatureKey[];
  restrictedModules: PlanFeatureKey[];
  planInfo: PlanInfo;
  metadata: PermissionMetadata;
}

/**
 * Respuesta de la API
 */
interface PermissionApiResponse {
  success: boolean;
  data: PermissionCalculationResult;
  error?: string;
}

/**
 * Estado del hook
 */
interface UsePermissionCalculatorState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para calcular permisos
 */
export const usePermissionCalculator = () => {
  const [state, setState] = useState<UsePermissionCalculatorState>({
    isLoading: false,
    error: null,
  });

  /**
   * Calcula permisos para un rol en una empresa
   */
  const calculatePermissions = useCallback(
    async (
      companyId: string,
      role: UserRole
    ): Promise<PermissionCalculationResult | null> => {
      console.log("🎯 usePermissionCalculator.calculatePermissions llamado:", {
        companyId,
        role,
        hasCompanyId: !!companyId,
        hasRole: !!role,
      });

      if (!companyId || !role) {
        console.error("❌ companyId y role son requeridos");
        setState({ isLoading: false, error: "Parámetros inválidos" });
        return null;
      }

      // No calcular para roles globales
      if (
        role === UserRole.SUPER_ADMIN ||
        (role as string) === "system_admin"
      ) {
        console.log("ℹ️ Rol global detectado, omitiendo cálculo de permisos");
        return null;
      }

      console.log("📡 Enviando request a API:", {
        url: "/v2/users/permissions/calculate",
        params: { companyId, role },
      });

      setState({ isLoading: true, error: null });

      try {
        const response = await axiosInstance.get<PermissionApiResponse>(
          `/v2/users/permissions/calculate`,
          {
            params: { companyId, role },
          }
        );

        console.log("📥 Respuesta de API recibida:", {
          success: response.data.success,
          hasData: !!response.data.data,
          data: response.data.data,
        });

        if (response.data.success && response.data.data) {
          console.log(
            `✅ Permisos calculados para ${role} en empresa ${companyId}:`,
            {
              permissions: response.data.data.permissions.length,
              availableModules: response.data.data.availableModules.length,
              restrictedModules: response.data.data.restrictedModules.length,
              planName: response.data.data.planInfo.name,
            }
          );
          setState({ isLoading: false, error: null });
          return response.data.data;
        } else {
          throw new Error(response.data.error || "Error calculando permisos");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al calcular permisos";
        console.error("❌ Error calculando permisos:", error);
        setState({ isLoading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  /**
   * Obtiene módulos disponibles para una empresa
   */
  const getAvailableModules = useCallback(
    async (companyId: string): Promise<PlanFeatureKey[]> => {
      if (!companyId) {
        console.error("❌ companyId es requerido");
        return [];
      }

      setState({ isLoading: true, error: null });

      try {
        const response = await axiosInstance.get<{
          success: boolean;
          data: { availableModules: PlanFeatureKey[] };
          error?: string;
        }>(`/v2/users/permissions/available-modules/${companyId}`);

        if (response.data.success && response.data.data) {
          setState({ isLoading: false, error: null });
          return response.data.data.availableModules;
        } else {
          throw new Error(
            response.data.error || "Error obteniendo módulos disponibles"
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al obtener módulos disponibles";
        console.error("❌ Error obteniendo módulos disponibles:", error);
        setState({ isLoading: false, error: errorMessage });
        return [];
      }
    },
    []
  );

  /**
   * Valida permisos para un rol y empresa
   */
  const validatePermissions = useCallback(
    async (
      permissions: string[],
      role: UserRole,
      companyId: string
    ): Promise<{ valid: boolean; invalidPermissions: string[] }> => {
      if (!permissions || !role || !companyId) {
        console.error("❌ Todos los parámetros son requeridos");
        return { valid: false, invalidPermissions: permissions };
      }

      setState({ isLoading: true, error: null });

      try {
        const response = await axiosInstance.post<{
          success: boolean;
          data: { valid: boolean; invalidPermissions: string[] };
          error?: string;
        }>("/v2/users/permissions/validate", {
          permissions,
          role,
          companyId,
        });

        if (response.data.success && response.data.data) {
          setState({ isLoading: false, error: null });
          return response.data.data;
        } else {
          throw new Error(response.data.error || "Error validando permisos");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al validar permisos";
        console.error("❌ Error validando permisos:", error);
        setState({ isLoading: false, error: errorMessage });
        return { valid: false, invalidPermissions: permissions };
      }
    },
    []
  );

  return {
    calculatePermissions,
    getAvailableModules,
    validatePermissions,
    isLoading: state.isLoading,
    error: state.error,
  };
};

export default usePermissionCalculator;
