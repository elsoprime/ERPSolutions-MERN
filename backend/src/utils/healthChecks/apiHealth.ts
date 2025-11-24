/**
 * API Health Checker
 * @description Verifica el estado del servidor API
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import os from "os";
import {
  HealthCheckResult,
  HealthStatus,
  ApiHealthDetails,
} from "@/types/healthCheck";

export async function checkApiHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Uptime del proceso en segundos
    const uptime = process.uptime();

    // Uso de memoria
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    // CPU usage (aproximado)
    const cpuUsage = process.cpuUsage();
    const cpuPercentage = calculateCpuPercentage(cpuUsage);

    const responseTime = Date.now() - startTime;

    const details: ApiHealthDetails = {
      uptime,
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
      cpu: {
        usage: Math.round(cpuPercentage * 100) / 100,
      },
    };

    // Determinar estado basado en uso de recursos
    let status = HealthStatus.HEALTHY;
    let message = "API servidor operativo";

    if (memoryPercentage > 80 || cpuPercentage > 80) {
      status = HealthStatus.DEGRADED;
      message = "API servidor con alto uso de recursos";
    }

    if (memoryPercentage > 95 || cpuPercentage > 95) {
      status = HealthStatus.UNHEALTHY;
      message = "API servidor sobrecargado";
    }

    return {
      status,
      message,
      timestamp: new Date(),
      responseTime,
      details,
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: "Error al verificar estado del API",
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      details: {
        error: error instanceof Error ? error.message : "Error desconocido",
      },
    };
  }
}

function calculateCpuPercentage(cpuUsage: NodeJS.CpuUsage): number {
  const totalCpu = cpuUsage.user + cpuUsage.system;
  const totalTime = process.uptime() * 1000000; // microsegundos
  return (totalCpu / totalTime) * 100;
}
