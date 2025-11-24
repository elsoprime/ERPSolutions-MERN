/**
 * Plan API
 * @description API para gestionar planes de suscripción
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import api from "./axios";
import {
  IPlan,
  IPlanFeatures,
  IPlanLimits,
  IPlanPrice,
} from "@/interfaces/Plan/IPlan";

// Re-exportar interfaces para facilitar imports
export type { IPlan, IPlanFeatures, IPlanLimits, IPlanPrice };

// ============ RESPONSE INTERFACES ============

export interface IPlansResponse {
  success: boolean;
  data: IPlan[];
  message: string;
}

export interface IPlanResponse {
  success: boolean;
  data: IPlan;
  message: string;
}

// ============ PLAN API ============

class PlanAPI {
  private static baseURL = "/plans";

  /**
   * Obtener todos los planes activos (Ruta pública)
   */
  static async getActivePlans(): Promise<IPlansResponse> {
    try {
      const response = await api.get(`${this.baseURL}/active`);
      return response.data;
    } catch (error: any) {
      console.error("Error al obtener planes activos:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Error al obtener planes activos",
      };
    }
  }

  /**
   * Obtener todos los planes (Admin)
   */
  static async getAllPlans(): Promise<IPlansResponse> {
    try {
      const response = await api.get(this.baseURL);
      return response.data;
    } catch (error: any) {
      console.error("Error al obtener planes:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Error al obtener planes",
      };
    }
  }

  /**
   * Obtener un plan por ID
   */
  static async getPlanById(planId: string): Promise<IPlanResponse> {
    try {
      const response = await api.get(`${this.baseURL}/${planId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error al obtener plan:", error);
      throw error;
    }
  }

  /**
   * Buscar plan por tipo
   */
  static async getPlanByType(
    planType: "trial" | "free" | "basic" | "professional" | "enterprise",
    plans?: IPlan[]
  ): Promise<IPlan | null> {
    try {
      // Si ya tenemos los planes cargados, buscar en memoria
      if (plans && plans.length > 0) {
        return plans.find((p) => p.type === planType) || null;
      }

      // Si no, obtener planes del servidor
      const response = await this.getActivePlans();
      if (response.success && response.data) {
        return response.data.find((p) => p.type === planType) || null;
      }

      return null;
    } catch (error) {
      console.error("Error al buscar plan por tipo:", error);
      return null;
    }
  }

  /**
   * Crear un nuevo plan (Admin)
   */
  static async createPlan(planData: Partial<IPlan>): Promise<IPlanResponse> {
    try {
      const response = await api.post(this.baseURL, planData);
      return response.data;
    } catch (error: any) {
      console.error("Error al crear plan:", error);
      throw error;
    }
  }

  /**
   * Actualizar un plan (Admin)
   */
  static async updatePlan(
    planId: string,
    planData: Partial<IPlan>
  ): Promise<IPlanResponse> {
    try {
      const response = await api.put(`${this.baseURL}/${planId}`, planData);
      return response.data;
    } catch (error: any) {
      console.error("Error al actualizar plan:", error);
      throw error;
    }
  }

  /**
   * Eliminar un plan (Admin)
   */
  static async deletePlan(
    planId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`${this.baseURL}/${planId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error al eliminar plan:", error);
      throw error;
    }
  }
}

export default PlanAPI;
