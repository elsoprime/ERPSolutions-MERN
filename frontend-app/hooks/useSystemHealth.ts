/**
 * @fileoverview Custom Hook - System Health
 * @description Hook para obtener y monitorear el estado de salud de los servicios del sistema
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getSystemHealth } from "@/api/healthCheckService";
import { SystemHealthResponse } from "@/types/healthCheck";

/**
 * Hook para obtener el estado de salud general del sistema
 * Actualiza automáticamente cada 30 segundos
 */
export const useSystemHealth = (): UseQueryResult<
  SystemHealthResponse,
  Error
> => {
  return useQuery<SystemHealthResponse, Error>({
    queryKey: ["systemHealth"],
    queryFn: getSystemHealth,
    refetchInterval: 30000, // Auto-refresh cada 30 segundos
    staleTime: 25000, // Datos considerados frescos por 25 segundos
    retry: 3, // Reintentar 3 veces en caso de error
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook auxiliar para obtener estado simplificado
 */
export const useSystemHealthStatus = () => {
  const { data, isLoading, isError } = useSystemHealth();

  return {
    isHealthy: data?.status === "healthy",
    isDegraded: data?.status === "degraded",
    isUnhealthy: data?.status === "unhealthy",
    hasIssues:
      (data?.overall?.degraded ?? 0) > 0 || (data?.overall?.unhealthy ?? 0) > 0,
    services: data?.services,
    overall: data?.overall,
    isLoading,
    isError,
  };
};
