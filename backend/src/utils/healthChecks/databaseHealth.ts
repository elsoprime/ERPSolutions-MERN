/**
 * Database Health Checker
 * @description Verifica el estado de la conexión a MongoDB
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import mongoose from "mongoose";
import {
  HealthCheckResult,
  HealthStatus,
  DatabaseHealthDetails,
} from "@/types/healthCheck";

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const state = mongoose.connection.readyState;

    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state !== 1) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: "Base de datos desconectada",
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: {
          connected: false,
          connectionState: getConnectionStateName(state),
        },
      };
    }

    // Realizar un ping para verificar latencia
    await mongoose.connection.db.admin().ping();

    const responseTime = Date.now() - startTime;

    // Obtener estadísticas de conexión
    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    const details: DatabaseHealthDetails = {
      connected: true,
      responseTime,
      connections: {
        current: mongoose.connections.length,
        available: 100, // Puedes ajustar según tu configuración
      },
      collections: collections.length,
    };

    // Determinar estado basado en latencia
    let status = HealthStatus.HEALTHY;
    let message = "Base de datos operativa";

    if (responseTime > 1000) {
      status = HealthStatus.DEGRADED;
      message = "Base de datos operativa pero lenta";
    } else if (responseTime > 2000) {
      status = HealthStatus.UNHEALTHY;
      message = "Base de datos con alta latencia";
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
      message: "Error al verificar base de datos",
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      details: {
        error: error instanceof Error ? error.message : "Error desconocido",
        connected: false,
      },
    };
  }
}

function getConnectionStateName(state: number): string {
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[state] || "unknown";
}
