/**
 * Dashboard Hooks
 * @description: Hooks personalizados para el Dashboard de Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import EnhancedCompanyAPI from "@/api/EnhancedCompanyAPI";
import UserAPI, { IUser } from "@/api/UserAPI";
import { IEnhancedCompany } from "@/interfaces/EnhanchedCompany/EnhancedCompany";

// ====== QUERY KEYS ======
export const DASHBOARD_QUERY_KEYS = {
  companies: ["dashboard", "companies"],
  users: ["dashboard", "users"],
  stats: ["dashboard", "stats"],
} as const;

// ====== DASHBOARD COMPANIES HOOK ======
export function useDashboardCompanies() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.companies,
    queryFn: async () => {
      try {
        console.log("🔄 Cargando empresas desde /v2/enhanced-companies...");
        const response = await EnhancedCompanyAPI.getAllCompaniesForDashboard();
        console.log("✅ Respuesta de empresas (dashboard):", response);
        return response.data || [];
      } catch (error) {
        console.error("❌ Error al cargar empresas para dashboard:", error);
        toast.error("Error al cargar empresas");
        return [];
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const refetch = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY_KEYS.companies,
    });
  }, [queryClient]);

  return {
    companies: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch,
  };
}

// ====== DASHBOARD USERS HOOK ======
export function useDashboardUsers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.users,
    queryFn: async () => {
      try {
        console.log("🔄 Intentando cargar usuarios desde /v2/users/all...");
        const response = await UserAPI.getAllUsers({ limit: 100 });
        console.log("✅ Respuesta de usuarios:", response);
        return response.data || [];
      } catch (error) {
        console.error("❌ Error al cargar usuarios para dashboard:", error);
        // No mostrar toast de error aquí para evitar spam, solo log
        console.warn(
          "⚠️ Los usuarios no se pudieron cargar, devolviendo array vacío"
        );
        return [];
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const refetch = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY_KEYS.users,
    });
  }, [queryClient]);

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch,
  };
}

// ====== DASHBOARD STATS HOOK ======
export function useDashboardStats() {
  const { companies, isLoading: companiesLoading } = useDashboardCompanies();
  const { users, isLoading: usersLoading } = useDashboardUsers();

  const statsQuery = useQuery({
    queryKey: [...DASHBOARD_QUERY_KEYS.stats, companies.length, users.length],
    queryFn: async () => {
      console.log("🔄 Calculando estadísticas del dashboard...", {
        companiesCount: companies.length,
        usersCount: users.length,
      });

      const activeCompanies = companies.filter(
        (c: IEnhancedCompany) => c.status === "active"
      ).length;
      const activeUsers = users.filter(
        (u: IUser) => u.status === "active"
      ).length;

      const companiesByPlan = companies.reduce(
        (acc: Record<string, number>, company: IEnhancedCompany) => {
          // Manejar plan como string u objeto populated
          let planType: string;
          if (typeof company.plan === "object" && company.plan !== null) {
            planType = company.plan.type;
          } else {
            planType = company.plan || "free";
          }
          acc[planType] = (acc[planType] || 0) + 1;
          return acc;
        },
        {}
      );

      const usersByRole = users.reduce(
        (acc: Record<string, number>, user: IUser) => {
          const role = user.role || "user";
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        },
        {}
      );

      // Empresas que requieren atención
      const companiesNeedingAttention = companies
        .filter((company: IEnhancedCompany) => {
          // Empresas suspendidas
          if (company.status === "suspended") return true;

          // Empresas en trial que expiran pronto (si existe la propiedad)
          if (company.subscription?.endDate) {
            const endDate = new Date(company.subscription.endDate);
            const daysLeft = Math.ceil(
              (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            if (daysLeft <= 7 && daysLeft > 0) return true;
          }

          return false;
        })
        .slice(0, 5);

      // Actividad reciente simulada (en el futuro podría venir de la API)
      const recentActivity = [
        {
          id: "1",
          type: "company_created" as const,
          description:
            companies.length > 0
              ? `Nueva empresa registrada: ${
                  companies[companies.length - 1]?.name || "Sin nombre"
                }`
              : "No hay empresas registradas",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          company: companies[companies.length - 1]?.name || "Sin nombre",
        },
        {
          id: "2",
          type: "user_registered" as const,
          description:
            users.length > 0
              ? `${
                  users.filter((u) => {
                    const created = new Date(u.createdAt);
                    const today = new Date();
                    return created.toDateString() === today.toDateString();
                  }).length
                } nuevos usuarios registrados hoy`
              : "No hay usuarios registrados hoy",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
      ];

      const stats = {
        totalCompanies: companies.length,
        activeCompanies,
        totalUsers: users.length,
        activeUsers,
        companiesByPlan,
        usersByRole,
        companiesNeedingAttention,
        recentActivity,
      };

      console.log("✅ Estadísticas calculadas:", stats);
      return stats;
    },
    enabled: !companiesLoading && !usersLoading,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    stats: statsQuery.data,
    isLoading: companiesLoading || usersLoading || statsQuery.isLoading,
    error: statsQuery.error,
  };
}

// ====== COMBINED DASHBOARD HOOK ======
export function useDashboard() {
  const companies = useDashboardCompanies();
  const users = useDashboardUsers();
  const stats = useDashboardStats();

  const refreshAll = useCallback(() => {
    console.log("🔄 Refrescando todos los datos del dashboard...");
    companies.refetch();
    users.refetch();
  }, [companies, users]);

  // Debug logging
  useEffect(() => {
    console.log("🔍 Estado del Dashboard:", {
      companies: {
        count: companies.companies.length,
        isLoading: companies.isLoading,
        error: companies.error?.message,
      },
      users: {
        count: users.users.length,
        isLoading: users.isLoading,
        error: users.error?.message,
      },
      stats: {
        totalCompanies: stats.stats?.totalCompanies,
        totalUsers: stats.stats?.totalUsers,
        isLoading: stats.isLoading,
        error: stats.error?.message,
      },
    });
  }, [companies, users, stats]);

  return {
    companies: companies.companies,
    users: users.users,
    stats: stats.stats,
    isLoading: companies.isLoading || users.isLoading,
    error: companies.error || users.error || stats.error,
    refreshAll,
  };
}
