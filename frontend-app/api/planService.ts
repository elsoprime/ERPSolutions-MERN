/**
 * @fileoverview Plan Management API Service
 * @description Servicio para gestionar planes de suscripción
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import axiosInstance from "./axios";
import {
  IPlan,
  CreatePlanDTO,
  UpdatePlanDTO,
  PlanApiResponse,
  PlansListApiResponse,
} from "@/types/plan";

/**
 * Obtiene todos los planes del sistema
 */
export const getAllPlans = async (): Promise<IPlan[]> => {
  const response = await axiosInstance.get<PlansListApiResponse>("/plans");
  return response.data.data;
};

/**
 * Obtiene un plan por ID
 */
export const getPlanById = async (id: string): Promise<IPlan> => {
  const response = await axiosInstance.get<PlanApiResponse>(`/plans/${id}`);
  return response.data.data;
};

/**
 * Crea un nuevo plan
 */
export const createPlan = async (planData: CreatePlanDTO): Promise<IPlan> => {
  const response = await axiosInstance.post<PlanApiResponse>(
    "/plans",
    planData
  );
  return response.data.data;
};

/**
 * Actualiza un plan existente
 */
export const updatePlan = async (
  id: string,
  planData: UpdatePlanDTO
): Promise<IPlan> => {
  const response = await axiosInstance.put<PlanApiResponse>(
    `/plans/${id}`,
    planData
  );
  return response.data.data;
};

/**
 * Elimina un plan
 */
export const deletePlan = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/plans/${id}`);
};

/**
 * Obtiene solo planes activos
 */
export const getActivePlans = async (): Promise<IPlan[]> => {
  const response = await axiosInstance.get<PlansListApiResponse>(
    "/plans/active"
  );
  return response.data.data;
};
