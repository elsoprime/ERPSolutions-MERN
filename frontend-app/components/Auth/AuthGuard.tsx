/**
 * AuthGuard Component
 * @description: Componente para proteger rutas del lado del cliente
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import {useEffect, useState, ReactNode} from 'react'
import {useRouter} from 'next/navigation'
import {isAuthenticated, getCurrentUser} from '@/api/AuthAPI'
import {getDefaultRoute} from '@/utils/roleRouting'
import {getAuthToken, getUserDataFromCookies} from '@/utils/cookies'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({
  children,
  fallback = <div>Cargando...</div>,
  requireAuth = true
}: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 🔥 FIX: Delay más largo para asegurar que localStorage esté completamente actualizado
        await new Promise(resolve => setTimeout(resolve, 500))

        // 🔥 MEJORADO: Verificar autenticación con fallback a cookies
        let authenticated = isAuthenticated()
        let tokenFromStorage = localStorage.getItem('AUTH_TOKEN_VALIDATE')
        let userDataFromStorage = localStorage.getItem('USER_DATA')

        // Si no hay datos en localStorage, intentar obtener de cookies
        if (!tokenFromStorage || !userDataFromStorage) {
          console.log(
            'AuthGuard - No hay datos en localStorage, verificando cookies...'
          )
          const tokenFromCookies = getAuthToken()
          const userDataFromCookies = getUserDataFromCookies()

          if (tokenFromCookies && userDataFromCookies) {
            console.log('AuthGuard - Restaurando datos desde cookies')
            // Restaurar localStorage desde cookies
            localStorage.setItem('AUTH_TOKEN_VALIDATE', tokenFromCookies)
            localStorage.setItem(
              'USER_DATA',
              JSON.stringify(userDataFromCookies)
            )

            tokenFromStorage = tokenFromCookies
            userDataFromStorage = JSON.stringify(userDataFromCookies)
            authenticated = true
          }
        }

        console.log('AuthGuard - requireAuth:', requireAuth)
        console.log('AuthGuard - authenticated:', authenticated)
        console.log('AuthGuard - localStorage token:', tokenFromStorage)
        console.log('AuthGuard - localStorage user:', userDataFromStorage)

        if (requireAuth) {
          if (!authenticated) {
            console.log('AuthGuard - No autenticado, redirigiendo a /')
            router.push('/')
            return
          }

          // 🔥 FIX: Verificar que tenemos tanto token como datos de usuario
          const token = tokenFromStorage
          const userData = userDataFromStorage

          if (!token) {
            console.log('AuthGuard - No hay token, redirigiendo a /')
            router.push('/')
            return
          }

          // Opcional: Verificar que el token es válido con el servidor
          try {
            await getCurrentUser()
            console.log('AuthGuard - Token válido, usuario autenticado')
            setIsAuthed(true)
          } catch (error) {
            console.error('AuthGuard - Token inválido:', error)
            // Limpiar localStorage en caso de token inválido
            localStorage.removeItem('AUTH_TOKEN_VALIDATE')
            localStorage.removeItem('USER_DATA')
            router.push('/')
            return
          }
        } else {
          // Si no requiere autenticación pero está autenticado, redirigir al dashboard apropiado
          if (authenticated) {
            try {
              // 🔥 FIX: Usar datos ya verificados (con fallback de cookies)
              const userDataStr = userDataFromStorage
              if (userDataStr) {
                const userData = JSON.parse(userDataStr)
                const targetRoute = getDefaultRoute(userData)
                console.log(
                  'AuthGuard - Usuario autenticado, redirigiendo a:',
                  targetRoute
                )

                // 🔥 FIX: Evitar redirecciones múltiples usando replace
                window.location.replace(targetRoute)
                return
              } else {
                // Si hay token pero no datos de usuario, redirigir a home por defecto
                const token = tokenFromStorage
                if (token) {
                  console.log(
                    'AuthGuard - Token válido pero sin datos de usuario, redirigiendo a /home'
                  )
                  window.location.replace('/home')
                  return
                } else {
                  console.log(
                    'AuthGuard - Usuario autenticado, redirigiendo a /dashboard/viewer (fallback)'
                  )
                  window.location.replace('/dashboard/viewer')
                  return
                }
              }
            } catch (error) {
              console.error(
                'AuthGuard - Error al obtener ruta de destino:',
                error
              )
              window.location.replace('/dashboard/viewer')
              return
            }
          }
          console.log('AuthGuard - Usuario no autenticado, mostrando login')
          setIsAuthed(false)
        }
      } catch (error) {
        console.error('AuthGuard - Error al verificar autenticación:', error)
        if (requireAuth) {
          router.push('/')
        } else {
          setIsAuthed(false)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requireAuth])

  // Mostrar fallback mientras está cargando
  if (isLoading) {
    return <>{fallback}</>
  }

  // Para rutas que requieren autenticación
  if (requireAuth) {
    return isAuthed ? <>{children}</> : <>{fallback}</>
  }

  // Para rutas que NO requieren autenticación (como login)
  // Mostrar children (el formulario de login) cuando NO está autenticado
  return !isAuthed ? <>{children}</> : <>{fallback}</>
}
