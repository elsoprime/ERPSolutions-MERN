/**
 * Multi-Company User Management Hooks
 * @description: Hooks personalizados para gestión de usuarios multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import MultiCompanyAPI from "@/api/MultiCompanyAPI";
import {
  IEnhancedUser,
  ICreateUserRequest,
  IUpdateUserRequest,
  IAssignRoleRequest,
  IUserFilters,
  UserRole,
  UserStatus,
  IApiResponse,
} from "@/interfaces/EnhanchedCompany/MultiCompany";
import { ApiError, AxiosApiError } from "@/types/api.types";

// ====== QUERY KEYS ======
export const USER_QUERY_KEYS = {
  all: ["users"],
  lists: () => [...USER_QUERY_KEYS.all, "list"],
  list: (filters: IUserFilters) => [...USER_QUERY_KEYS.lists(), filters],
  details: () => [...USER_QUERY_KEYS.all, "detail"],
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id],
  profile: () => [...USER_QUERY_KEYS.all, "profile"],
  company: (companyId?: string) => [
    ...USER_QUERY_KEYS.all,
    "company",
    companyId,
  ],
} as const;

// ====== USER LIST HOOK ======
export function useUsers(filters?: IUserFilters, isCompanyScope = false) {
  // Use the filters provided by the caller (e.g. useUserFilters hook) so
  // changes to those filters trigger the query correctly.
  const currentFilters: IUserFilters = filters || {};

  const query = useQuery({
    queryKey: isCompanyScope
      ? USER_QUERY_KEYS.company(currentFilters.companyId)
      : USER_QUERY_KEYS.list(currentFilters),
    queryFn: async () => {
      const result = isCompanyScope
        ? await MultiCompanyAPI.getCompanyUsers(currentFilters)
        : await MultiCompanyAPI.getAllUsers(currentFilters);

      return result;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  const users = query.data?.data || [];

  return {
    users,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    filters: currentFilters,
  };
}

// ====== USER PROFILE HOOK ======
export function useUserProfile() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.profile(),
    queryFn: () => MultiCompanyAPI.getUserProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// ====== USER MUTATIONS HOOK ======
export function useUserMutations() {
  const queryClient = useQueryClient();

  // Crear usuario
  const createUser = useMutation<
    IApiResponse<IEnhancedUser>,
    AxiosApiError,
    ICreateUserRequest
  >({
    mutationFn: (userData: ICreateUserRequest) =>
      MultiCompanyAPI.createUser(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success(data.message || "Usuario creado exitosamente");
    },
    onError: (error: AxiosApiError) => {
      const errorMessage =
        error.response?.data?.error || "Error al crear usuario";
      toast.error(errorMessage);
    },
  });

  // Crear usuario en empresa
  const createCompanyUser = useMutation<
    IApiResponse<IEnhancedUser>,
    AxiosApiError,
    Omit<ICreateUserRequest, "roleType" | "companyId">
  >({
    mutationFn: (
      userData: Omit<ICreateUserRequest, "roleType" | "companyId">
    ) => MultiCompanyAPI.createCompanyUser(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success(data.message || "Usuario creado exitosamente");
    },
    onError: (error: AxiosApiError) => {
      const errorMessage =
        error.response?.data?.error || "Error al crear usuario";
      toast.error(errorMessage);
    },
  });

  // Actualizar usuario
  const updateUser = useMutation<
    IApiResponse<IEnhancedUser>,
    AxiosApiError,
    { userId: string; userData: IUpdateUserRequest }
  >({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string;
      userData: IUpdateUserRequest;
    }) => MultiCompanyAPI.updateUser(userId, userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success(data.message || "Usuario actualizado exitosamente");
    },
    onError: (error: AxiosApiError) => {
      const errorMessage =
        error.response?.data?.error || "Error al actualizar usuario";
      toast.error(errorMessage);
    },
  });

  // Asignar rol
  const assignRole = useMutation<
    IApiResponse<IEnhancedUser>,
    AxiosApiError,
    { userId: string; roleData: IAssignRoleRequest }
  >({
    mutationFn: ({
      userId,
      roleData,
    }: {
      userId: string;
      roleData: IAssignRoleRequest;
    }) => MultiCompanyAPI.assignRole(userId, roleData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success(data.message || "Rol asignado exitosamente");
    },
    onError: (error: AxiosApiError) => {
      const errorMessage =
        error.response?.data?.error || "Error al asignar rol";
      toast.error(errorMessage);
    },
  });

  // Revocar rol
  const revokeRole = useMutation<
    IApiResponse<void>,
    AxiosApiError,
    { userId: string; roleIndex: number }
  >({
    mutationFn: ({
      userId,
      roleIndex,
    }: {
      userId: string;
      roleIndex: number;
    }) => MultiCompanyAPI.revokeRole(userId, roleIndex),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success(data.message || "Rol revocado exitosamente");
    },
    onError: (error: AxiosApiError) => {
      const errorMessage =
        error.response?.data?.error || "Error al revocar rol";
      toast.error(errorMessage);
    },
  });

  // Suspender usuario
  const suspendUser = useMutation<
    IApiResponse<IEnhancedUser>,
    AxiosApiError,
    { userId: string; reason?: string }
  >({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      MultiCompanyAPI.suspendUser(userId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success(data.message || "Usuario suspendido exitosamente");
    },
    onError: (error: AxiosApiError) => {
      const errorMessage =
        error.response?.data?.error || "Error al suspender usuario";
      toast.error(errorMessage);
    },
  });

  // Reactivar usuario
  const reactivateUser = useMutation<
    IApiResponse<IEnhancedUser>,
    AxiosApiError,
    string
  >({
    mutationFn: (userId: string) => MultiCompanyAPI.reactivateUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success(data.message || "Usuario reactivado exitosamente");
    },
    onError: (error: AxiosApiError) => {
      const errorMessage =
        error.response?.data?.error || "Error al reactivar usuario";
      toast.error(errorMessage);
    },
  });

  // Eliminar usuario
  const deleteUser = useMutation<IApiResponse<void>, AxiosApiError, string>({
    mutationFn: (userId: string) => MultiCompanyAPI.deleteUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success(data.message || "Usuario eliminado exitosamente");
    },
    onError: (error: AxiosApiError) => {
      const errorMessage =
        error.response?.data?.error || "Error al eliminar usuario";
      toast.error(errorMessage);
    },
  });

  return {
    createUser,
    createCompanyUser,
    updateUser,
    assignRole,
    revokeRole,
    suspendUser,
    reactivateUser,
    deleteUser,
  };
}

// ====== USER FORM HOOK ======
export function useUserForm(initialUser?: IEnhancedUser) {
  const [formData, setFormData] = useState<Partial<ICreateUserRequest>>({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    phone: initialUser?.phone || "",
    role: initialUser?.roles?.[0]?.role || UserRole.VIEWER,
    permissions: initialUser?.roles?.[0]?.permissions || [],
  });

  const [isEditing, setIsEditing] = useState(!!initialUser);

  const updateField = useCallback(
    (field: keyof ICreateUserRequest, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: UserRole.VIEWER,
      permissions: [],
    });
    setIsEditing(false);
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.name?.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }
    if (!formData.email?.trim()) {
      toast.error("El email es requerido");
      return false;
    }
    // En modo creación, la contraseña es obligatoria
    // En modo edición, es opcional (solo se valida si el usuario la proporciona)
    if (!isEditing && !formData.password?.trim()) {
      toast.error("La contraseña es requerida para crear un usuario");
      return false;
    }
    // Si está editando Y proporcionó una contraseña, validarla
    if (isEditing && formData.password && formData.password.trim()) {
      if (formData.password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres");
        return false;
      }
      if (!/[A-Z]/.test(formData.password)) {
        toast.error("La contraseña debe contener al menos una mayúscula");
        return false;
      }
      if (!/[a-z]/.test(formData.password)) {
        toast.error("La contraseña debe contener al menos una minúscula");
        return false;
      }
      if (!/\d/.test(formData.password)) {
        toast.error("La contraseña debe contener al menos un número");
        return false;
      }
    }
    if (!formData.role) {
      toast.error("El rol es requerido");
      return false;
    }
    return true;
  }, [formData, isEditing]);

  return {
    formData,
    isEditing,
    updateField,
    resetForm,
    validateForm,
    setIsEditing,
  };
}

// ====== USER FILTERS HOOK ======
export function useUserFilters() {
  const [filters, setFilters] = useState<IUserFilters>({
    search: "",
    role: undefined,
    status: undefined,
    companyId: undefined,
    page: 1,
    limit: 5,
  });

  const updateFilter = useCallback(
    <K extends keyof IUserFilters>(key: K, value: IUserFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 })); // Reset page on filter change
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      role: undefined,
      status: undefined,
      companyId: undefined,
      page: 1,
      limit: 5,
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  return {
    filters,
    updateFilter,
    clearFilters,
    setPage,
    setLimit,
  };
}

// ====== USER ACTIONS HOOK ======
export function useUserActions() {
  const mutations = useUserMutations();

  const handleCreateUser = useCallback(
    async (userData: ICreateUserRequest) => {
      try {
        await mutations.createUser.mutateAsync(userData);
        return true;
      } catch (error) {
        return false;
      }
    },
    [mutations.createUser]
  );

  const handleUpdateUser = useCallback(
    async (userId: string, userData: IUpdateUserRequest) => {
      try {
        await mutations.updateUser.mutateAsync({ userId, userData });
        return true;
      } catch (error) {
        return false;
      }
    },
    [mutations.updateUser]
  );

  const handleSuspendUser = useCallback(
    async (userId: string, reason?: string) => {
      try {
        await mutations.suspendUser.mutateAsync({ userId, reason });
        return true;
      } catch (error) {
        console.error("Error suspendiendo usuario:", error);
        return false;
      }
    },
    [mutations.suspendUser]
  );

  const handleReactivateUser = useCallback(
    async (userId: string) => {
      try {
        await mutations.reactivateUser.mutateAsync(userId);
        return true;
      } catch (error) {
        console.error("Error reactivando usuario:", error);
        return false;
      }
    },
    [mutations.reactivateUser]
  );

  const handleDeleteUser = useCallback(
    async (userId: string, userName?: string) => {
      try {
        await mutations.deleteUser.mutateAsync(userId);
        return true;
      } catch (error) {
        console.error("Error eliminando usuario:", error);
        return false;
      }
    },
    [mutations.deleteUser]
  );

  const handleToggleUserStatus = useCallback(
    async (user: IEnhancedUser) => {
      const newStatus =
        user.status === UserStatus.ACTIVE
          ? UserStatus.INACTIVE
          : UserStatus.ACTIVE;
      try {
        await mutations.updateUser.mutateAsync({
          userId: user._id,
          userData: { status: newStatus },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    [mutations.updateUser]
  );

  return {
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleUserStatus,
    handleSuspendUser,
    handleReactivateUser,
    isLoading:
      mutations.createUser.isPending ||
      mutations.updateUser.isPending ||
      mutations.deleteUser.isPending ||
      mutations.suspendUser.isPending ||
      mutations.reactivateUser.isPending,
  };
}

// ====== ROLE ASSIGNMENT HOOK ======
export function useRoleAssignment() {
  const mutations = useUserMutations();

  const handleAssignRole = useCallback(
    async (userId: string, roleData: IAssignRoleRequest) => {
      try {
        await mutations.assignRole.mutateAsync({ userId, roleData });
        return true;
      } catch (error) {
        console.error("Error asignando rol:", error);
        return false;
      }
    },
    [mutations.assignRole]
  );

  const handleRevokeRole = useCallback(
    async (userId: string, roleIndex: number) => {
      try {
        await mutations.revokeRole.mutateAsync({ userId, roleIndex });
        return true;
      } catch (error) {
        console.error("Error revocando rol:", error);
        return false;
      }
    },
    [mutations.revokeRole]
  );

  return {
    handleAssignRole,
    handleRevokeRole,
    isLoading: mutations.assignRole.isPending || mutations.revokeRole.isPending,
  };
}
