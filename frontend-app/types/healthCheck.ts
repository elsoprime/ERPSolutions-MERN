/**
 * @fileoverview Health Check TypeScript Types
 * @description Tipos para el sistema de monitoreo de salud de servicios
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

export enum HealthStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
}

export interface DatabaseHealthDetails {
  connected: boolean;
  responseTime: number;
  connections?: {
    current: number;
    available: number;
  };
  collections?: number;
}

export interface ApiHealthDetails {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
}

export interface StorageHealthDetails {
  connected: boolean;
  responseTime: number;
  provider: string;
}

export interface EmailHealthDetails {
  connected: boolean;
  provider: string;
}

export interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  timestamp: string;
  responseTime: number;
  details:
    | DatabaseHealthDetails
    | ApiHealthDetails
    | StorageHealthDetails
    | EmailHealthDetails;
}

export interface SystemHealthResponse {
  status: HealthStatus;
  timestamp: string;
  services: {
    database: HealthCheckResult;
    api: HealthCheckResult;
    storage: HealthCheckResult;
    email: HealthCheckResult;
  };
  overall: {
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

export interface HealthCheckApiResponse<T = SystemHealthResponse> {
  success: boolean;
  data: T;
}
