/**
 * Health Check Service
 * @description Servicio principal para ejecutar verificaciones de salud del sistema
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import {
  checkDatabaseHealth,
  checkApiHealth,
  checkStorageHealth,
  checkEmailHealth,
} from "@/utils/healthChecks";
import {
  SystemHealthResponse,
  HealthStatus,
  HealthCheckResult,
} from "@/types/healthCheck";

// Caché simple para evitar verificaciones muy frecuentes
interface CacheEntry {
  data: SystemHealthResponse;
  timestamp: number;
}

let healthCache: CacheEntry | null = null;
const CACHE_DURATION = 30000; // 30 segundos

/**
 * Obtiene el estado de salud de todos los servicios del sistema
 * @returns {Promise<SystemHealthResponse>} Estado completo del sistema
 */
export async function getSystemHealth(): Promise<SystemHealthResponse> {
  // Verificar si hay caché válido
  const now = Date.now();
  if (healthCache && now - healthCache.timestamp < CACHE_DURATION) {
    return healthCache.data;
  }

  // Ejecutar todas las verificaciones en paralelo
  const [databaseHealth, apiHealth, storageHealth, emailHealth] =
    await Promise.all([
      checkDatabaseHealth(),
      checkApiHealth(),
      checkStorageHealth(),
      checkEmailHealth(),
    ]);

  // Contar estados
  const services = {
    database: databaseHealth,
    api: apiHealth,
    storage: storageHealth,
    email: emailHealth,
  };

  const overall = {
    healthy: 0,
    degraded: 0,
    unhealthy: 0,
  };

  Object.values(services).forEach((service) => {
    if (service.status === HealthStatus.HEALTHY) {
      overall.healthy++;
    } else if (service.status === HealthStatus.DEGRADED) {
      overall.degraded++;
    } else {
      overall.unhealthy++;
    }
  });

  // Determinar estado general del sistema
  let systemStatus = HealthStatus.HEALTHY;
  if (overall.unhealthy > 0) {
    systemStatus = HealthStatus.UNHEALTHY;
  } else if (overall.degraded > 0) {
    systemStatus = HealthStatus.DEGRADED;
  }

  const response: SystemHealthResponse = {
    status: systemStatus,
    timestamp: new Date(),
    services,
    overall,
  };

  // Guardar en caché
  healthCache = {
    data: response,
    timestamp: now,
  };

  return response;
}

/**
 * Obtiene el estado de salud de la base de datos
 * @returns {Promise<HealthCheckResult>} Estado de la base de datos
 */
export async function getDatabaseHealth(): Promise<HealthCheckResult> {
  return checkDatabaseHealth();
}

/**
 * Obtiene el estado de salud del API
 * @returns {Promise<HealthCheckResult>} Estado del API
 */
export async function getApiHealth(): Promise<HealthCheckResult> {
  return checkApiHealth();
}

/**
 * Obtiene el estado de salud del almacenamiento
 * @returns {Promise<HealthCheckResult>} Estado del almacenamiento
 */
export async function getStorageHealth(): Promise<HealthCheckResult> {
  return checkStorageHealth();
}

/**
 * Obtiene el estado de salud del servicio de email
 * @returns {Promise<HealthCheckResult>} Estado del servicio de email
 */
export async function getEmailHealth(): Promise<HealthCheckResult> {
  return checkEmailHealth();
}

/**
 * Limpia el caché de health checks
 */
export function clearHealthCache(): void {
  healthCache = null;
}
