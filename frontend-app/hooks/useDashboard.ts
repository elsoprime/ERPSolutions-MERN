/**
 * Dashboard Hooks
 * @description: Hooks personalizados para el Dashboard de Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useCallback, useEffect} from 'react'
import {toast} from 'react-toastify'
import EnhancedCompanyAPI from '@/api/EnhancedCompanyAPI'
import UserAPI, {IUser} from '@/api/UserAPI'
import {IEnhancedCompany} from '@/interfaces/EnhanchedCompany/EnhancedCompany'

// ====== MOCK DATA FOR DEVELOPMENT ======
const mockCompanies: IEnhancedCompany[] = [
  {
    _id: 'mock-1',
    name: 'TechCorp Solutions',
    slug: 'techcorp-solutions',
    description: 'Empresa de tecnología y desarrollo de software',
    website: 'https://techcorp.com',
    phone: '+56912345678',
    email: 'admin@techcorp.com',
    status: 'active',
    plan: 'professional',
    createdAt: new Date(),
    updatedAt: new Date(),
    subscription: {
      status: 'active',
      startDate: new Date(),
      autoRenew: true
    },
    address: {
      street: '123 Tech Street',
      city: 'Santiago',
      state: 'RM',
      country: 'Chile',
      postalCode: '12345'
    },
    settings: {
      businessType: 'technology',
      industry: 'Tecnología y Software',
      taxId: '12345678-9',
      currency: 'CLP',
      fiscalYear: {startMonth: 1, endMonth: 12},
      features: {
        inventory: true,
        accounting: true,
        hrm: true,
        crm: true,
        projects: true
      },
      limits: {
        maxUsers: 25,
        maxProducts: 5000,
        maxTransactions: 25000,
        storageGB: 10
      },
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af'
      },
      notifications: {}
    },
    statistics: {
      userCount: 8,
      productCount: 150,
      transactionCount: 450,
      storageUsed: 2.5,
      lastActivity: new Date(),
      usage: {
        users: {current: 8, limit: 25, percentage: 32},
        products: {current: 150, limit: 5000, percentage: 3},
        transactions: {current: 450, limit: 25000, percentage: 2},
        storage: {current: 2.5, limit: 10, percentage: 25}
      }
    },
    verified: true
  },
  {
    _id: 'mock-2',
    name: 'InnovateLab',
    slug: 'innovatelab',
    description: 'Laboratorio de innovación y consultoría',
    website: 'https://innovatelab.com',
    phone: '+56987654321',
    email: 'contact@innovatelab.com',
    status: 'active',
    plan: 'basic',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
    subscription: {
      status: 'active',
      startDate: new Date(Date.now() - 86400000),
      autoRenew: true
    },
    address: {
      street: '456 Innovation Ave',
      city: 'Valparaíso',
      state: 'V',
      country: 'Chile',
      postalCode: '54321'
    },
    settings: {
      businessType: 'consulting',
      industry: 'Consultoría',
      taxId: '98765432-1',
      currency: 'CLP',
      fiscalYear: {startMonth: 1, endMonth: 12},
      features: {
        inventory: false,
        accounting: true,
        hrm: true,
        crm: false,
        projects: true
      },
      limits: {
        maxUsers: 10,
        maxProducts: 1000,
        maxTransactions: 5000,
        storageGB: 5
      },
      branding: {
        primaryColor: '#10b981',
        secondaryColor: '#059669'
      },
      notifications: {}
    },
    statistics: {
      userCount: 3,
      productCount: 0,
      transactionCount: 12,
      storageUsed: 0.8,
      lastActivity: new Date(),
      usage: {
        users: {current: 3, limit: 10, percentage: 30},
        products: {current: 0, limit: 1000, percentage: 0},
        transactions: {current: 12, limit: 5000, percentage: 0.24},
        storage: {current: 0.8, limit: 5, percentage: 16}
      }
    },
    verified: true
  }
]

const mockUsers: IUser[] = [
  {
    _id: 'user-1',
    name: 'Juan Pérez',
    email: 'juan@techcorp.com',
    status: 'active',
    role: 'admin',
    company: {
      _id: 'mock-1',
      name: 'TechCorp Solutions',
      plan: 'professional'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: true
  },
  {
    _id: 'user-2',
    name: 'María González',
    email: 'maria@innovatelab.com',
    status: 'active',
    role: 'manager',
    company: {
      _id: 'mock-2',
      name: 'InnovateLab',
      plan: 'basic'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: true
  },
  {
    _id: 'user-3',
    name: 'Carlos Rodríguez',
    email: 'carlos@techcorp.com',
    status: 'active',
    role: 'user',
    company: {
      _id: 'mock-1',
      name: 'TechCorp Solutions',
      plan: 'professional'
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: true
  }
]

// ====== QUERY KEYS ======
export const DASHBOARD_QUERY_KEYS = {
  companies: ['dashboard', 'companies'],
  users: ['dashboard', 'users'],
  stats: ['dashboard', 'stats']
} as const

// ====== DASHBOARD COMPANIES HOOK ======
export function useDashboardCompanies() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.companies,
    queryFn: async () => {
      try {
        console.log('🔄 Cargando empresas desde /v2/enhanced-companies...')
        const response = await EnhancedCompanyAPI.getAllCompaniesForDashboard()
        console.log('✅ Respuesta de empresas (dashboard):', response)
        return response.data || []
      } catch (error) {
        console.warn(
          '⚠️ Error en endpoint principal, usando datos mock...',
          error
        )
        // En desarrollo, usar datos mock
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Usando datos mock para desarrollo...')
          return mockCompanies
        }
        toast.error('Error al cargar empresas')
        return []
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000)
  })

  const refetch = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY_KEYS.companies
    })
  }, [queryClient])

  return {
    companies: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch
  }
}

// ====== DASHBOARD USERS HOOK ======
export function useDashboardUsers() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.users,
    queryFn: async () => {
      try {
        console.log('🔄 Intentando cargar usuarios desde /v2/users/all...')
        const response = await UserAPI.getAllUsers({limit: 100})
        console.log('✅ Respuesta de usuarios:', response)
        return response.data || []
      } catch (error) {
        console.error('❌ Error al cargar usuarios para dashboard:', error)
        // No mostrar toast de error aquí para evitar spam, solo log
        console.warn(
          '⚠️ Los usuarios no se pudieron cargar, devolviendo array vacío'
        )
        return []
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000)
  })

  const refetch = useCallback(() => {
    return queryClient.invalidateQueries({queryKey: DASHBOARD_QUERY_KEYS.users})
  }, [queryClient])

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch
  }
}

// ====== DASHBOARD STATS HOOK ======
export function useDashboardStats() {
  const {companies, isLoading: companiesLoading} = useDashboardCompanies()
  const {users, isLoading: usersLoading} = useDashboardUsers()

  const statsQuery = useQuery({
    queryKey: [...DASHBOARD_QUERY_KEYS.stats, companies.length, users.length],
    queryFn: async () => {
      console.log('🔄 Calculando estadísticas del dashboard...', {
        companiesCount: companies.length,
        usersCount: users.length
      })

      const activeCompanies = companies.filter(
        (c: IEnhancedCompany) => c.status === 'active'
      ).length
      const activeUsers = users.filter(
        (u: IUser) => u.status === 'active'
      ).length

      const companiesByPlan = companies.reduce(
        (acc: Record<string, number>, company: IEnhancedCompany) => {
          const plan = company.plan || 'free'
          acc[plan] = (acc[plan] || 0) + 1
          return acc
        },
        {}
      )

      const usersByRole = users.reduce(
        (acc: Record<string, number>, user: IUser) => {
          const role = user.role || 'user'
          acc[role] = (acc[role] || 0) + 1
          return acc
        },
        {}
      )

      // Empresas que requieren atención
      const companiesNeedingAttention = companies
        .filter((company: IEnhancedCompany) => {
          // Empresas suspendidas
          if (company.status === 'suspended') return true

          // Empresas en trial que expiran pronto (si existe la propiedad)
          if (company.subscription?.endDate) {
            const endDate = new Date(company.subscription.endDate)
            const daysLeft = Math.ceil(
              (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            if (daysLeft <= 7 && daysLeft > 0) return true
          }

          return false
        })
        .slice(0, 5)

      // Actividad reciente simulada (en el futuro podría venir de la API)
      const recentActivity = [
        {
          id: '1',
          type: 'company_created' as const,
          description:
            companies.length > 0
              ? `Nueva empresa registrada: ${
                  companies[companies.length - 1]?.name || 'Sin nombre'
                }`
              : 'No hay empresas registradas',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          company: companies[companies.length - 1]?.name || 'Sin nombre'
        },
        {
          id: '2',
          type: 'user_registered' as const,
          description:
            users.length > 0
              ? `${
                  users.filter(u => {
                    const created = new Date(u.createdAt)
                    const today = new Date()
                    return created.toDateString() === today.toDateString()
                  }).length
                } nuevos usuarios registrados hoy`
              : 'No hay usuarios registrados hoy',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
        }
      ]

      const stats = {
        totalCompanies: companies.length,
        activeCompanies,
        totalUsers: users.length,
        activeUsers,
        companiesByPlan,
        usersByRole,
        companiesNeedingAttention,
        recentActivity
      }

      console.log('✅ Estadísticas calculadas:', stats)
      return stats
    },
    enabled: !companiesLoading && !usersLoading,
    staleTime: 2 * 60 * 1000 // 2 minutos
  })

  return {
    stats: statsQuery.data,
    isLoading: companiesLoading || usersLoading || statsQuery.isLoading,
    error: statsQuery.error
  }
}

// ====== COMBINED DASHBOARD HOOK ======
export function useDashboard() {
  const companies = useDashboardCompanies()
  const users = useDashboardUsers()
  const stats = useDashboardStats()

  const refreshAll = useCallback(() => {
    console.log('🔄 Refrescando todos los datos del dashboard...')
    companies.refetch()
    users.refetch()
  }, [companies, users])

  // Debug logging
  useEffect(() => {
    console.log('🔍 Estado del Dashboard:', {
      companies: {
        count: companies.companies.length,
        isLoading: companies.isLoading,
        error: companies.error?.message
      },
      users: {
        count: users.users.length,
        isLoading: users.isLoading,
        error: users.error?.message
      },
      stats: {
        totalCompanies: stats.stats?.totalCompanies,
        totalUsers: stats.stats?.totalUsers,
        isLoading: stats.isLoading,
        error: stats.error?.message
      }
    })
  }, [companies, users, stats])

  return {
    companies: companies.companies,
    users: users.users,
    stats: stats.stats,
    isLoading: companies.isLoading || users.isLoading,
    error: companies.error || users.error || stats.error,
    refreshAll
  }
}
