'use client'

// Función para obtener una cookie por nombre
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const cookies = document.cookie.split(';')
  const cookie = cookies.find(c => c.trim().startsWith(name + '='))
  return cookie ? cookie.split('=')[1] : undefined
}

// Función para establecer una cookie
export function setCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return
  const maxAge = days * 24 * 60 * 60
  const cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`
  document.cookie =
    process.env.NODE_ENV === 'production' ? cookie + ';secure' : cookie
}

// Función para eliminar una cookie
export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`
}

// Funciones específicas para el token de autenticación
export function setAuthToken(token: string) {
  setCookie('AUTH_TOKEN_VALIDATE', token)
}

export function getAuthToken(): string | undefined {
  return getCookie('AUTH_TOKEN_VALIDATE')
}

export function removeAuthToken() {
  deleteCookie('AUTH_TOKEN_VALIDATE')
}

// 🔥 NUEVO: Funciones para datos del usuario en cookies
export function setUserData(userData: any) {
  setCookie('USER_DATA', encodeURIComponent(JSON.stringify(userData)))
}

export function getUserDataFromCookies(): any | null {
  try {
    const userDataCookie = getCookie('USER_DATA')
    if (!userDataCookie) return null
    return JSON.parse(decodeURIComponent(userDataCookie))
  } catch (error) {
    console.error('Error parsing user data from cookies:', error)
    return null
  }
}

export function removeUserData() {
  deleteCookie('USER_DATA')
}
