/**
 * Direct Route Access Component
 * @description: Componente para manejar acceso directo a rutas específicas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React, {useEffect, useState} from 'react'
import {useRouter, usePathname} from 'next/navigation'
import {useAuth} from '@/hooks/useAuth'
import {
  getHighestRole,
  getDefaultRoute,
  hasRouteAccess,
  hasRoleAccess
} from '@/utils/roleRouting'
import {UserRole} from '@/interfaces/EnhanchedCompany/MultiCompany'

interface DirectAccessGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
}

const DirectAccessGuard: React.FC<DirectAccessGuardProps> = ({
  children,
  requiredRole,
  allowedRoles
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const {getUserData, isAuthenticated} = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Verificar autenticación
        if (!isAuthenticated()) {
          router.push('/')
          return
        }

        // Obtener datos del usuario
        const userData = getUserData()
        if (!userData) {
          router.push('/')
          return
        }

        // Obtener rol del usuario
        const userRole = getHighestRole(userData)

        // Verificar acceso según roles permitidos
        let userHasAccess = true

        if (requiredRole) {
          userHasAccess = hasRoleAccess(userRole, requiredRole)
        } else if (allowedRoles) {
          userHasAccess = allowedRoles.includes(userRole)
        }

        if (!userHasAccess) {
          // Redirigir al dashboard apropiado para su rol
          const targetRoute = getDefaultRoute(userData)
          console.log(
            `Acceso denegado a ${pathname}. Redirigiendo a:`,
            targetRoute
          )
          router.push(targetRoute)
          return
        }

        setHasAccess(true)
      } catch (error) {
        console.error('Error en DirectAccessGuard:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [
    pathname,
    router,
    getUserData,
    isAuthenticated,
    requiredRole,
    allowedRoles
  ])

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto'></div>
          <h2 className='mt-4 text-xl font-semibold text-gray-900'>
            Verificando acceso...
          </h2>
          <p className='mt-2 text-gray-600'>
            Validando permisos para esta sección
          </p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100'>
            <svg
              className='h-8 w-8 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.382 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='mt-4 text-xl font-semibold text-gray-900'>
            Acceso Denegado
          </h2>
          <p className='mt-2 text-gray-600'>
            No tienes permisos para acceder a esta sección
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * HOC para proteger componentes con roles específicos
 */
export function withRoleAccess(
  Component: React.ComponentType<any>,
  requiredRole?: UserRole,
  allowedRoles?: UserRole[]
) {
  return function ProtectedComponent(props: any) {
    return (
      <DirectAccessGuard
        requiredRole={requiredRole}
        allowedRoles={allowedRoles}
      >
        <Component {...props} />
      </DirectAccessGuard>
    )
  }
}

/**
 * Hook para verificar acceso a rutas
 */
export function useRouteAccess(
  requiredRole?: UserRole,
  allowedRoles?: UserRole[]
) {
  const {getUserData, isAuthenticated} = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = () => {
      try {
        if (!isAuthenticated()) {
          setHasAccess(false)
          setIsLoading(false)
          return
        }

        const userData = getUserData()
        if (!userData) {
          setHasAccess(false)
          setIsLoading(false)
          return
        }

        const userRole = getHighestRole(userData)
        let userHasAccess = true

        if (requiredRole) {
          userHasAccess = hasRoleAccess(userRole, requiredRole)
        } else if (allowedRoles) {
          userHasAccess = allowedRoles.includes(userRole)
        }

        setHasAccess(userHasAccess)
      } catch (error) {
        console.error('Error checking route access:', error)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [getUserData, isAuthenticated, requiredRole, allowedRoles])

  return {hasAccess, isLoading}
}

export default DirectAccessGuard
