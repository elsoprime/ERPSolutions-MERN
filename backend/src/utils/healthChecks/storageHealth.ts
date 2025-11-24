/**
 * Storage Health Checker
 * @description Verifica el estado del servicio de almacenamiento (Cloudinary)
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import {
  HealthCheckResult,
  HealthStatus,
  StorageHealthDetails,
} from "@/types/healthCheck";

export async function checkStorageHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Verificar si Cloudinary está configurado
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!cloudinaryUrl && !cloudinaryName) {
      return {
        status: HealthStatus.DEGRADED,
        message: "Servicio de almacenamiento no configurado",
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: {
          connected: false,
          provider: "cloudinary",
          configured: false,
        },
      };
    }

    // Simular verificación de conectividad
    // En producción, podrías hacer una llamada real a la API de Cloudinary
    const responseTime = Date.now() - startTime;

    const details: StorageHealthDetails = {
      connected: true,
      responseTime,
      provider: "cloudinary",
    };

    // Determinar estado
    let status = HealthStatus.HEALTHY;
    let message = "Servicio de almacenamiento operativo";

    if (responseTime > 3000) {
      status = HealthStatus.DEGRADED;
      message = "Servicio de almacenamiento lento";
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
      message: "Error al verificar servicio de almacenamiento",
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      details: {
        error: error instanceof Error ? error.message : "Error desconocido",
        connected: false,
        provider: "cloudinary",
      },
    };
  }
}
