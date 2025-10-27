/**
 * Multi-Company Management Hooks
 * @description: Hooks personalizados para gestión de empresas multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {useState, useCallback} from 'react'
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {toast} from 'react-toastify'
import MultiCompanyAPI from '@/api/MultiCompanyAPI'
import {
  IEnhancedCompany,
  ICreateCompanyRequest,
  IUpdateCompanyRequest,
  IUpdateCompanyPlanRequest,
  ICompanyFilters,
  ICompanyStats,
  CompanyPlan,
  CompanyStatus
} from '@/interfaces/MultiCompany'

// ====== QUERY KEYS ======
export const COMPANY_QUERY_KEYS = {
  all: ['companies'],
  lists: () => [...COMPANY_QUERY_KEYS.all, 'list'],
  list: (filters: ICompanyFilters) => [...COMPANY_QUERY_KEYS.lists(), filters],
  details: () => [...COMPANY_QUERY_KEYS.all, 'detail'],
  detail: (id: string) => [...COMPANY_QUERY_KEYS.details(), id],
  current: () => [...COMPANY_QUERY_KEYS.all, 'current'],
  stats: (id?: string) => [...COMPANY_QUERY_KEYS.all, 'stats', id]
} as const

// ====== COMPANY LIST HOOK ======
export function useCompanies(filters?: ICompanyFilters) {
  const [currentFilters, setCurrentFilters] = useState<ICompanyFilters>(
    filters || {}
  )

  const query = useQuery({
    queryKey: COMPANY_QUERY_KEYS.list(currentFilters),
    queryFn: () => MultiCompanyAPI.getAllCompanies(currentFilters),
    enabled: true,
    staleTime: 5 * 60 * 1000 // 5 minutos
  })

  const updateFilters = useCallback((newFilters: Partial<ICompanyFilters>) => {
    setCurrentFilters(prev => ({...prev, ...newFilters}))
  }, [])

  const clearFilters = useCallback(() => {
    setCurrentFilters({})
  }, [])

  return {
    companies: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    filters: currentFilters,
    updateFilters,
    clearFilters
  }
}

// ====== CURRENT COMPANY HOOK ======
export function useCurrentCompany() {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.current(),
    queryFn: () => MultiCompanyAPI.getCurrentCompany(),
    staleTime: 10 * 60 * 1000 // 10 minutos
  })
}

// ====== COMPANY STATS HOOK ======
export function useCompanyStats(companyId?: string) {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.stats(companyId),
    queryFn: () => MultiCompanyAPI.getCompanyStats(companyId),
    enabled: true,
    staleTime: 2 * 60 * 1000 // 2 minutos
  })
}

// ====== COMPANY MUTATIONS HOOK ======
export function useCompanyMutations() {
  const queryClient = useQueryClient()

  // Crear empresa
  const createCompany = useMutation({
    mutationFn: (companyData: ICreateCompanyRequest) =>
      MultiCompanyAPI.createCompany(companyData),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: COMPANY_QUERY_KEYS.all})
      toast.success(data.message || 'Empresa creada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear empresa')
    }
  })

  // Actualizar empresa
  const updateCompany = useMutation({
    mutationFn: ({
      companyId,
      companyData
    }: {
      companyId: string
      companyData: IUpdateCompanyRequest
    }) => MultiCompanyAPI.updateCompany(companyId, companyData),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: COMPANY_QUERY_KEYS.all})
      toast.success(data.message || 'Empresa actualizada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar empresa')
    }
  })

  // Actualizar configuraciones de empresa actual
  const updateCurrentCompanySettings = useMutation({
    mutationFn: (settings: IUpdateCompanyRequest) =>
      MultiCompanyAPI.updateCurrentCompanySettings(settings),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: COMPANY_QUERY_KEYS.current()})
      toast.success(data.message || 'Configuraciones actualizadas exitosamente')
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || 'Error al actualizar configuraciones'
      )
    }
  })

  // Actualizar plan de empresa
  const updateCompanyPlan = useMutation({
    mutationFn: ({
      companyId,
      planData
    }: {
      companyId: string
      planData: IUpdateCompanyPlanRequest
    }) => MultiCompanyAPI.updateCompanyPlan(companyId, planData),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: COMPANY_QUERY_KEYS.all})
      toast.success(data.message || 'Plan actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar plan')
    }
  })

  // Suspender empresa
  const suspendCompany = useMutation({
    mutationFn: ({companyId, reason}: {companyId: string; reason?: string}) =>
      MultiCompanyAPI.suspendCompany(companyId, reason),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: COMPANY_QUERY_KEYS.all})
      toast.success(data.message || 'Empresa suspendida exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al suspender empresa')
    }
  })

  // Reactivar empresa
  const reactivateCompany = useMutation({
    mutationFn: (companyId: string) =>
      MultiCompanyAPI.reactivateCompany(companyId),
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: COMPANY_QUERY_KEYS.all})
      toast.success(data.message || 'Empresa reactivada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al reactivar empresa')
    }
  })

  return {
    createCompany,
    updateCompany,
    updateCurrentCompanySettings,
    updateCompanyPlan,
    suspendCompany,
    reactivateCompany
  }
}

// ====== COMPANY FORM HOOK ======
export function useCompanyForm(initialCompany?: IEnhancedCompany) {
  const [formData, setFormData] = useState<Partial<ICreateCompanyRequest>>({
    name: initialCompany?.name || '',
    slug: initialCompany?.slug || '',
    description: initialCompany?.description || '',
    website: initialCompany?.website || '',
    email: initialCompany?.email || '',
    phone: initialCompany?.phone || '',
    address: {
      street: initialCompany?.address?.street || '',
      city: initialCompany?.address?.city || '',
      state: initialCompany?.address?.state || '',
      country: initialCompany?.address?.country || 'Chile',
      zipCode: initialCompany?.address?.zipCode || ''
    },
    plan: initialCompany?.plan || CompanyPlan.FREE,
    settings: {
      businessType: initialCompany?.settings?.businessType || 'other',
      industry: initialCompany?.settings?.industry || '',
      taxId: initialCompany?.settings?.taxId || '',
      currency: initialCompany?.settings?.currency || 'CLP',
      fiscalYear: {
        startMonth: initialCompany?.settings?.fiscalYear?.startMonth || 1,
        endMonth: initialCompany?.settings?.fiscalYear?.endMonth || 12
      },
      features: {
        inventory: initialCompany?.settings?.features?.inventory ?? true,
        accounting: initialCompany?.settings?.features?.accounting ?? false,
        hrm: initialCompany?.settings?.features?.hrm ?? false,
        crm: initialCompany?.settings?.features?.crm ?? false,
        projects: initialCompany?.settings?.features?.projects ?? false
      },
      limits: {
        maxUsers: initialCompany?.settings?.limits?.maxUsers || 5,
        maxProducts: initialCompany?.settings?.limits?.maxProducts || 100,
        maxTransactions:
          initialCompany?.settings?.limits?.maxTransactions || 1000,
        storageGB: initialCompany?.settings?.limits?.storageGB || 1
      },
      branding: {
        logo: initialCompany?.settings?.branding?.logo || '',
        primaryColor:
          initialCompany?.settings?.branding?.primaryColor || '#3B82F6',
        secondaryColor:
          initialCompany?.settings?.branding?.secondaryColor || '#64748B',
        favicon: initialCompany?.settings?.branding?.favicon || ''
      },
      notifications: {
        emailDomain: initialCompany?.settings?.notifications?.emailDomain || '',
        smsProvider: initialCompany?.settings?.notifications?.smsProvider || '',
        webhookUrl: initialCompany?.settings?.notifications?.webhookUrl || ''
      }
    }
  })

  const [isEditing, setIsEditing] = useState(!!initialCompany)

  const updateField = useCallback((field: string, value: any) => {
    if (field.includes('.')) {
      const keys = field.split('.')
      setFormData(prev => {
        const updated = {...prev}
        let current: any = updated
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {}
          current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
        return updated
      })
    } else {
      setFormData(prev => ({...prev, [field]: value}))
    }
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      website: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Chile',
        zipCode: ''
      },
      plan: CompanyPlan.FREE
    })
    setIsEditing(false)
  }, [])

  const validateForm = useCallback((): boolean => {
    if (!formData.name?.trim()) {
      toast.error('El nombre es requerido')
      return false
    }
    if (!formData.slug?.trim()) {
      toast.error('El identificador (slug) es requerido')
      return false
    }
    if (!formData.email?.trim()) {
      toast.error('El email es requerido')
      return false
    }
    if (!formData.address?.street?.trim()) {
      toast.error('La dirección es requerida')
      return false
    }
    if (!formData.address?.city?.trim()) {
      toast.error('La ciudad es requerida')
      return false
    }
    return true
  }, [formData])

  return {
    formData,
    isEditing,
    updateField,
    resetForm,
    validateForm,
    setIsEditing
  }
}

// ====== COMPANY FILTERS HOOK ======
export function useCompanyFilters() {
  const [filters, setFilters] = useState<ICompanyFilters>({
    search: '',
    status: undefined,
    plan: undefined,
    page: 1,
    limit: 10
  })

  const updateFilter = useCallback((key: keyof ICompanyFilters, value: any) => {
    setFilters(prev => ({...prev, [key]: value, page: 1}))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: undefined,
      plan: undefined,
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

// ====== COMPANY ACTIONS HOOK ======
export function useCompanyActions() {
  const mutations = useCompanyMutations()

  const handleCreateCompany = useCallback(
    async (companyData: ICreateCompanyRequest) => {
      try {
        await mutations.createCompany.mutateAsync(companyData)
        return true
      } catch (error) {
        return false
      }
    },
    [mutations.createCompany]
  )

  const handleUpdateCompany = useCallback(
    async (companyId: string, companyData: IUpdateCompanyRequest) => {
      try {
        await mutations.updateCompany.mutateAsync({companyId, companyData})
        return true
      } catch (error) {
        return false
      }
    },
    [mutations.updateCompany]
  )

  const handleSuspendCompany = useCallback(
    async (companyId: string, companyName: string, reason?: string) => {
      if (
        window.confirm(
          `¿Estás seguro de suspender la empresa "${companyName}"?`
        )
      ) {
        try {
          await mutations.suspendCompany.mutateAsync({companyId, reason})
          return true
        } catch (error) {
          return false
        }
      }
      return false
    },
    [mutations.suspendCompany]
  )

  const handleReactivateCompany = useCallback(
    async (companyId: string, companyName: string) => {
      if (
        window.confirm(
          `¿Estás seguro de reactivar la empresa "${companyName}"?`
        )
      ) {
        try {
          await mutations.reactivateCompany.mutateAsync(companyId)
          return true
        } catch (error) {
          return false
        }
      }
      return false
    },
    [mutations.reactivateCompany]
  )

  const handleToggleCompanyStatus = useCallback(
    async (company: IEnhancedCompany) => {
      if (company.status === CompanyStatus.SUSPENDED) {
        return handleReactivateCompany(company._id, company.name)
      } else {
        return handleSuspendCompany(company._id, company.name)
      }
    },
    [handleReactivateCompany, handleSuspendCompany]
  )

  return {
    handleCreateCompany,
    handleUpdateCompany,
    handleSuspendCompany,
    handleReactivateCompany,
    handleToggleCompanyStatus,
    isLoading:
      mutations.createCompany.isPending ||
      mutations.updateCompany.isPending ||
      mutations.suspendCompany.isPending ||
      mutations.reactivateCompany.isPending
  }
}
