/**
 * Module Navigation Hook
 * @description: Hook para manejar la navegación entre módulos del sistema
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {useRouter} from 'next/navigation'
import {useCallback} from 'react'
import {toast} from 'react-toastify'

export interface ModuleRoute {
  id: string
  name: string
  path: string
  description: string
  requiredRole?: string
  isActive: boolean
}

export const useModuleNavigation = () => {
  const router = useRouter()

  const modules: ModuleRoute[] = [
    {
      id: 'companies',
      name: 'Gestión de Empresas',
      path: '/dashboard/companies',
      description: 'Administrar empresas del sistema',
      requiredRole: 'super_admin',
      isActive: true
    },
    {
      id: 'users',
      name: 'Gestión de Usuarios',
      path: '/dashboard/users',
      description: 'Administrar usuarios de todas las empresas',
      requiredRole: 'super_admin',
      isActive: true
    },
    {
      id: 'analytics',
      name: 'Analytics y Reportes',
      path: '/dashboard/analytics',
      description: 'Métricas y reportes del sistema',
      requiredRole: 'super_admin',
      isActive: false // Beta
    },
    {
      id: 'settings',
      name: 'Configuración Global',
      path: '/dashboard/settings',
      description: 'Configuraciones globales del sistema',
      requiredRole: 'super_admin',
      isActive: true
    }
  ]

  const navigateToModule = useCallback(
    (moduleId: string) => {
      const module = modules.find(m => m.id === moduleId)

      if (!module) {
        toast.error('Módulo no encontrado')
        return
      }

      if (!module.isActive) {
        toast.warning('Este módulo aún no está disponible')
        return
      }

      try {
        router.push(module.path)
        toast.success(`Navegando a ${module.name}`)
      } catch (error) {
        console.error('Error al navegar:', error)
        toast.error('Error al navegar al módulo')
      }
    },
    [router, modules]
  )

  const navigateToCompanies = useCallback(() => {
    navigateToModule('companies')
  }, [navigateToModule])

  const navigateToUsers = useCallback(() => {
    navigateToModule('users')
  }, [navigateToModule])

  const navigateToAnalytics = useCallback(() => {
    navigateToModule('analytics')
  }, [navigateToModule])

  const navigateToSettings = useCallback(() => {
    navigateToModule('settings')
  }, [navigateToModule])

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const goToDashboard = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  return {
    modules,
    navigateToModule,
    navigateToCompanies,
    navigateToUsers,
    navigateToAnalytics,
    navigateToSettings,
    goBack,
    goToDashboard
  }
}

export default useModuleNavigation
