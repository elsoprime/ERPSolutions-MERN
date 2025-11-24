/**
 * Health Check Controller
 * @description Controlador para endpoints de verificación de salud del sistema
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import { Request, Response } from "express";
import {
  getSystemHealth,
  getDatabaseHealth,
  getApiHealth,
  getStorageHealth,
  getEmailHealth,
} from "@/services/healthCheckService";
import { HealthStatus } from "@/types/healthCheck";

/**
 * GET /api/health
 * Obtiene el estado general de todos los servicios
 */
export const getSystemHealthStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const health = await getSystemHealth();

    // Determinar código HTTP según el estado
    const statusCode = getHttpStatusCode(health.status);

    res.status(statusCode).json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al verificar salud del sistema",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * GET /api/health/database
 * Obtiene el estado de la base de datos
 */
export const getDatabaseHealthStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const health = await getDatabaseHealth();
    const statusCode = getHttpStatusCode(health.status);

    res.status(statusCode).json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al verificar salud de la base de datos",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * GET /api/health/api
 * Obtiene el estado del servidor API
 */
export const getApiHealthStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const health = await getApiHealth();
    const statusCode = getHttpStatusCode(health.status);

    res.status(statusCode).json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al verificar salud del API",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * GET /api/health/storage
 * Obtiene el estado del servicio de almacenamiento
 */
export const getStorageHealthStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const health = await getStorageHealth();
    const statusCode = getHttpStatusCode(health.status);

    res.status(statusCode).json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al verificar salud del almacenamiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * GET /api/health/email
 * Obtiene el estado del servicio de email
 */
export const getEmailHealthStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const health = await getEmailHealth();
    const statusCode = getHttpStatusCode(health.status);

    res.status(statusCode).json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al verificar salud del servicio de email",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Convierte el estado de salud a código HTTP
 */
function getHttpStatusCode(status: HealthStatus): number {
  switch (status) {
    case HealthStatus.HEALTHY:
      return 200;
    case HealthStatus.DEGRADED:
      return 200; // Sigue siendo 200 pero con warning
    case HealthStatus.UNHEALTHY:
      return 503; // Service Unavailable
    default:
      return 500;
  }
}
