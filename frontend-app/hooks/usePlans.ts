/**
 * @fileoverview Custom Hook - Plan Management
 * @description Hook para gestionar planes de suscripción con React Query
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getActivePlans,
} from "@/api/planService";
import { IPlan, CreatePlanDTO, UpdatePlanDTO } from "@/types/plan";

/**
 * Query keys para planes
 */
export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (filters?: string) => [...planKeys.lists(), { filters }] as const,
  details: () => [...planKeys.all, "detail"] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  active: () => [...planKeys.all, "active"] as const,
};

/**
 * Hook para obtener todos los planes
 */
export const usePlans = (): UseQueryResult<IPlan[], Error> => {
  return useQuery<IPlan[], Error>({
    queryKey: planKeys.lists(),
    queryFn: getAllPlans,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener solo planes activos
 */
export const useActivePlans = (): UseQueryResult<IPlan[], Error> => {
  return useQuery<IPlan[], Error>({
    queryKey: planKeys.active(),
    queryFn: getActivePlans,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener un plan por ID
 */
export const usePlan = (id: string): UseQueryResult<IPlan, Error> => {
  return useQuery<IPlan, Error>({
    queryKey: planKeys.detail(id),
    queryFn: () => getPlanById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para crear un plan
 */
export const useCreatePlan = (): UseMutationResult<
  IPlan,
  Error,
  CreatePlanDTO
> => {
  const queryClient = useQueryClient();

  return useMutation<IPlan, Error, CreatePlanDTO>({
    mutationFn: createPlan,
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.active() });
    },
  });
};

/**
 * Hook para actualizar un plan
 */
export const useUpdatePlan = (): UseMutationResult<
  IPlan,
  Error,
  { id: string; data: UpdatePlanDTO }
> => {
  const queryClient = useQueryClient();

  return useMutation<IPlan, Error, { id: string; data: UpdatePlanDTO }>({
    mutationFn: ({ id, data }) => updatePlan(id, data),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.active() });
      queryClient.invalidateQueries({
        queryKey: planKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook para eliminar un plan
 */
export const useDeletePlan = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deletePlan,
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.active() });
    },
  });
};

/**
 * Hook auxiliar para obtener estadísticas de planes
 */
export const usePlanStats = () => {
  const { data: plans } = usePlans();

  const stats = {
    total: plans?.length ?? 0,
    active: plans?.filter((p) => p.status === "active").length ?? 0,
    inactive: plans?.filter((p) => p.status === "inactive").length ?? 0,
    deprecated: plans?.filter((p) => p.status === "deprecated").length ?? 0,
  };

  return stats;
};
