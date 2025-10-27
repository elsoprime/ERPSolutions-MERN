import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {
  getUserDataFromCookies,
  hasAccessToRoute,
  getRedirectRoute,
  isDashboardRoute,
  getRoleFromDashboardPath
} from '@/utils/serverSideAuth'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('AUTH_TOKEN_VALIDATE')?.value
  const {pathname} = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/confirm-account',
    '/auth/request-new-code',
    '/auth/forgot-password',
    '/auth/reset-password'
  ]

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = [
    '/home',
    '/dashboard',
    '/users',
    '/companies',
    '/inventory',
    '/sales',
    '/purchases',
    '/reports',
    '/settings',
    '/billing',
    '/system',
    '/analytics'
  ]

  // Si el usuario intenta acceder a /auth, redirigir al login (/)
  if (pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Validación específica para la ruta de confirmación de cuenta
  if (pathname.startsWith('/auth/confirm-account')) {
    // Permitir acceso a /auth/confirm-account (entrada manual)
    if (pathname === '/auth/confirm-account') {
      return NextResponse.next()
    }

    // Validar el formato del token en la URL para /auth/confirm-account/[token]
    const tokenMatch = pathname.match(/^\/auth\/confirm-account\/([^\/]+)$/)
    if (tokenMatch) {
      const token = tokenMatch[1]

      // Validar que el token tenga exactamente 6 caracteres alfanuméricos
      // Ajusta esta regex según el formato de tu token
      if (!/^[A-Za-z0-9]{6}$/.test(token)) {
        // Si el token no es válido, redirigir a la entrada manual
        return NextResponse.redirect(
          new URL('/auth/confirm-account', request.url)
        )
      }

      // Token válido, permitir acceso
      return NextResponse.next()
    }
  }

  // Si el usuario está autenticado y trata de acceder al login, redirigir al dashboard apropiado
  if (authToken && pathname === '/') {
    const userData = getUserDataFromCookies(request)
    if (userData) {
      const redirectRoute = getRedirectRoute(userData)
      return NextResponse.redirect(new URL(redirectRoute, request.url))
    }
    // Fallback a /home si no se pueden obtener los datos del usuario
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Si el usuario está autenticado y trata de acceder a rutas de auth, redirigir al dashboard
  if (
    authToken &&
    pathname.startsWith('/auth/') &&
    pathname !== '/auth/logout'
  ) {
    const userData = getUserDataFromCookies(request)
    if (userData) {
      const redirectRoute = getRedirectRoute(userData)
      return NextResponse.redirect(new URL(redirectRoute, request.url))
    }
    // Fallback a /home si no se pueden obtener los datos del usuario
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Si el usuario no está autenticado y trata de acceder a una ruta protegida
  if (!authToken && (isProtectedRoute || !isPublicRoute)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Verificación de autorización role-based para usuarios autenticados
  if (authToken && isProtectedRoute) {
    const userData = getUserDataFromCookies(request)

    if (userData) {
      // Verificar acceso a rutas específicas de dashboard
      if (isDashboardRoute(pathname)) {
        const requiredRole = getRoleFromDashboardPath(pathname)
        if (requiredRole && !hasAccessToRoute(userData, pathname)) {
          // Redirigir al dashboard apropiado para su rol
          const redirectRoute = getRedirectRoute(userData)
          return NextResponse.redirect(new URL(redirectRoute, request.url))
        }
      }

      // Verificar acceso a otras rutas protegidas
      if (!hasAccessToRoute(userData, pathname)) {
        // Redirigir al dashboard apropiado para su rol
        const redirectRoute = getRedirectRoute(userData)
        return NextResponse.redirect(new URL(redirectRoute, request.url))
      }
    }
  }

  return NextResponse.next()
}

// Configurar las rutas que serán manejadas por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (imágenes estáticas)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)'
  ]
}
