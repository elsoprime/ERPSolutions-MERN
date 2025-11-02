/**
 * Multi-Company User Management Hooks
 * @description: Hooks personalizados para gestión de usuarios multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {useState, useCallback} from 'react'
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {toast} from 'react-toastify'
import MultiCompanyAPI from '@/api/MultiCompanyAPI'
import {
  IEnhancedUser,
  ICreateUserRequest,
  IUpdateUserRequest,
  IAssignRoleRequest,
  IUserFilters,
  UserRole,
  UserStatus
} from '@/interfaces/EnhanchedCompany/MultiCompany'

// ====== QUERY KEYS ======
export const USER_QUERY_KEYS = {
  all: ['users'],
  lists: () => [...USER_QUERY_KEYS.all, 'list'],
  list: (filters: IUserFilters) => [...USER_QUERY_KEYS.lists(), filters],
  details: () => [...USER_QUERY_KEYS.all, 'detail'],
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id],
  profile: () => [...USER_QUERY_KEYS.all, 'profile'],
  company: (companyId?: string) => [
    ...USER_QUERY_KEYS.all,
    'company',
    companyId
  ]
} as const

// ====== USER LIST HOOK ======
export function useUsers(filters?: IUserFilters, isCompanyScope = false) {
  // Use the filters provided by the caller (e.g. useUserFilters hook) so
  // changes to those filters trigger the query correctly.
  const currentFilters: IUserFilters = filters || {}

  const query = useQuery({
    queryKey: isCompanyScope
      ? USER_QUERY_KEYS.company(currentFilters.companyId)
      : USER_QUERY_KEYS.list(currentFilters),
    queryFn: async () => {
      const result = isCompanyScope
        ? await MultiCompanyAPI.getCompanyUsers(currentFilters)
        : await MultiCompanyAPI.getAllUsers(currentFilters)

      return result
    },
    enabled: true,
    staleTime: 5 * 60 * 1000
  })

  const users = query.data?.data || []

  return {
    users,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    filters: currentFilters
  }
}

// ====== USER PROFILE HOOK ======
export function useUserProfile() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.profile(),
    queryFn: () => MultiCompanyAPI.getUserProfile(),
    staleTime: 10 * 60 * 1000 // 10 minutos
  })
}

// ====== USER MUTATIONS HOOK ======
export function useUserMutations() {
  const queryClient = useQueryClient()

  // Crear usuario
  const createUser = useMutation({
    mutationFn: (userData: ICreateUserRequest) =>
      MultiCompanyAPI.createUser(userData),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: USER_QUERY_KEYS.all})
      toast.success(data.message || 'Usuario creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear usuario')
    }
  })

  // Crear usuario en empresa
  const createCompanyUser = useMutation({
    mutationFn: (
      userData: Omit<ICreateUserRequest, 'roleType' | 'companyId'>
    ) => MultiCompanyAPI.createCompanyUser(userData),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: USER_QUERY_KEYS.all})
      toast.success(data.message || 'Usuario creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear usuario')
    }
  })

  // Actualizar usuario
  const updateUser = useMutation({
    mutationFn: ({
      userId,
      userData
    }: {
      userId: string
      userData: IUpdateUserRequest
    }) => MultiCompanyAPI.updateUser(userId, userData),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: USER_QUERY_KEYS.all})
      toast.success(data.message || 'Usuario actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar usuario')
    }
  })

  // Asignar rol
  const assignRole = useMutation({
    mutationFn: ({
      userId,
      roleData
    }: {
      userId: string
      roleData: IAssignRoleRequest
    }) => MultiCompanyAPI.assignRole(userId, roleData),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: USER_QUERY_KEYS.all})
      toast.success(data.message || 'Rol asignado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al asignar rol')
    }
  })

  // Revocar rol
  const revokeRole = useMutation({
    mutationFn: ({userId, roleIndex}: {userId: string; roleIndex: number}) =>
      MultiCompanyAPI.revokeRole(userId, roleIndex),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: USER_QUERY_KEYS.all})
      toast.success(data.message || 'Rol revocado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al revocar rol')
    }
  })

  // Eliminar usuario
  const deleteUser = useMutation({
    mutationFn: (userId: string) => MultiCompanyAPI.deleteUser(userId),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: USER_QUERY_KEYS.all})
      toast.success(data.message || 'Usuario eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar usuario')
    }
  })

  return {
    createUser,
    createCompanyUser,
    updateUser,
    assignRole,
    revokeRole,
    deleteUser
  }
}

// ====== USER FORM HOOK ======
export function useUserForm(initialUser?: IEnhancedUser) {
  const [formData, setFormData] = useState<Partial<ICreateUserRequest>>({
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
    role: initialUser?.roles?.[0]?.role || UserRole.VIEWER,
    permissions: initialUser?.roles?.[0]?.permissions || []
  })

  const [isEditing, setIsEditing] = useState(!!initialUser)

  const updateField = useCallback(
    (field: keyof ICreateUserRequest, value: any) => {
      setFormData(prev => ({...prev, [field]: value}))
    },
    []
  )

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: UserRole.VIEWER,
      permissions: []
    })
    setIsEditing(false)
  }, [])

  const validateForm = useCallback((): boolean => {
    if (!formData.name?.trim()) {
      toast.error('El nombre es requerido')
      return false
    }
    if (!formData.email?.trim()) {
      toast.error('El email es requerido')
      return false
    }
    if (!isEditing && !formData.password?.trim()) {
      toast.error('La contraseña es requerida')
      return false
    }
    if (!formData.role) {
      toast.error('El rol es requerido')
      return false
    }
    return true
  }, [formData, isEditing])

  return {
    formData,
    isEditing,
    updateField,
    resetForm,
    validateForm,
    setIsEditing
  }
}

// ====== USER FILTERS HOOK ======
export function useUserFilters() {
  const [filters, setFilters] = useState<IUserFilters>({
    search: '',
    role: undefined,
    status: undefined,
    page: 1,
    limit: 10
  })

  const updateFilter = useCallback((key: keyof IUserFilters, value: any) => {
    setFilters(prev => ({...prev, [key]: value, page: 1})) // Reset page on filter change
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      role: undefined,
      status: undefined,
      page: 1,
      limit: 10
    })
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({...prev, page}))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setFilters(prev => ({...prev, limit, page: 1}))
  }, [])

  return {
    filters,
    updateFilter,
    clearFilters,
    setPage,
    setLimit
  }
}

// ====== USER ACTIONS HOOK ======
export function useUserActions() {
  const mutations = useUserMutations()

  const handleCreateUser = useCallback(
    async (userData: ICreateUserRequest) => {
      try {
        await mutations.createUser.mutateAsync(userData)
        return true
      } catch (error) {
        return false
      }
    },
    [mutations.createUser]
  )

  const handleUpdateUser = useCallback(
    async (userId: string, userData: IUpdateUserRequest) => {
      try {
        await mutations.updateUser.mutateAsync({userId, userData})
        return true
      } catch (error) {
        return false
      }
    },
    [mutations.updateUser]
  )

  const handleDeleteUser = useCallback(
    async (userId: string, userName: string) => {
      if (
        window.confirm(`¿Estás seguro de eliminar al usuario "${userName}"?`)
      ) {
        try {
          await mutations.deleteUser.mutateAsync(userId)
          return true
        } catch (error) {
          return false
        }
      }
      return false
    },
    [mutations.deleteUser]
  )

  const handleToggleUserStatus = useCallback(
    async (user: IEnhancedUser) => {
      const newStatus =
        user.status === UserStatus.ACTIVE
          ? UserStatus.INACTIVE
          : UserStatus.ACTIVE
      try {
        await mutations.updateUser.mutateAsync({
          userId: user._id,
          userData: {status: newStatus}
        })
        return true
      } catch (error) {
        return false
      }
    },
    [mutations.updateUser]
  )

  return {
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleUserStatus,
    isLoading:
      mutations.createUser.isPending ||
      mutations.updateUser.isPending ||
      mutations.deleteUser.isPending
  }
}
