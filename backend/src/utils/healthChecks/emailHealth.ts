/**
 * Email Health Checker
 * @description Verifica el estado del servicio de email (Resend)
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import {
  HealthCheckResult,
  HealthStatus,
  EmailHealthDetails,
} from "@/types/healthCheck";

export async function checkEmailHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Verificar si Resend está configurado
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return {
        status: HealthStatus.DEGRADED,
        message: "Servicio de email no configurado",
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: {
          connected: false,
          provider: "resend",
          configured: false,
        },
      };
    }

    // Verificar configuración
    const responseTime = Date.now() - startTime;

    const details: EmailHealthDetails = {
      connected: true,
      provider: "resend",
    };

    // Determinar estado
    let status = HealthStatus.HEALTHY;
    let message = "Servicio de email operativo";

    // Si la API key es de prueba, marcar como degraded
    if (resendApiKey.startsWith("re_test_")) {
      status = HealthStatus.DEGRADED;
      message = "Servicio de email en modo de prueba";
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
      message: "Error al verificar servicio de email",
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      details: {
        error: error instanceof Error ? error.message : "Error desconocido",
        connected: false,
        provider: "resend",
      },
    };
  }
}
