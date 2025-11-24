/**
 * @fileoverview Health Check API Service
 * @description Servicio para consultar el estado de salud de los servicios del backend
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import axiosInstance from "./axios";
import {
  SystemHealthResponse,
  HealthCheckResult,
  HealthCheckApiResponse,
} from "@/types/healthCheck";

/**
 * Obtiene el estado de salud de todos los servicios
 */
export const getSystemHealth = async (): Promise<SystemHealthResponse> => {
  const response = await axiosInstance.get<
    HealthCheckApiResponse<SystemHealthResponse>
  >("/health");
  return response.data.data;
};

/**
 * Obtiene el estado de salud de la base de datos MongoDB
 */
export const getDatabaseHealth = async (): Promise<HealthCheckResult> => {
  const response = await axiosInstance.get<
    HealthCheckApiResponse<HealthCheckResult>
  >("/health/database");
  return response.data.data;
};

/**
 * Obtiene el estado de salud del servidor API
 */
export const getApiHealth = async (): Promise<HealthCheckResult> => {
  const response = await axiosInstance.get<
    HealthCheckApiResponse<HealthCheckResult>
  >("/health/api");
  return response.data.data;
};

/**
 * Obtiene el estado de salud del servicio de almacenamiento (Cloudinary)
 */
export const getStorageHealth = async (): Promise<HealthCheckResult> => {
  const response = await axiosInstance.get<
    HealthCheckApiResponse<HealthCheckResult>
  >("/health/storage");
  return response.data.data;
};

/**
 * Obtiene el estado de salud del servicio de email (Resend)
 */
export const getEmailHealth = async (): Promise<HealthCheckResult> => {
  const response = await axiosInstance.get<
    HealthCheckApiResponse<HealthCheckResult>
  >("/health/email");
  return response.data.data;
};
