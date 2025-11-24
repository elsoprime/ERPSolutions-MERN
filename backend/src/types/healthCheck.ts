/**
 * Health Check Types
 * @description Tipos para el sistema de monitoreo de salud
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

export enum HealthStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
}

export interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  timestamp: Date;
  responseTime?: number;
  details?:
    | DatabaseHealthDetails
    | ApiHealthDetails
    | StorageHealthDetails
    | EmailHealthDetails
    | Record<string, unknown>;
}

export interface DatabaseHealthDetails {
  connected: boolean;
  responseTime: number;
  connections: {
    current: number;
    available: number;
  };
  collections: number;
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
  quota?: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface EmailHealthDetails {
  connected: boolean;
  provider: string;
  rateLimit?: {
    remaining: number;
    total: number;
    resetAt?: Date;
  };
  lastSent?: Date;
}

export interface SystemHealthResponse {
  status: HealthStatus;
  timestamp: Date;
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
