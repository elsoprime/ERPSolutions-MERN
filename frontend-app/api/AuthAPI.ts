import {
  ConfirmToken,
  ForgotPasswordForm,
  ChangePasswordForm,
  RequestConfirmationCodeForm,
  UserLoginForm,
  UserRegistrationForm
} from '@/schemas/userSchema'
import axiosInstance from './axios'
import {isAxiosError} from 'axios'
import {
  setAuthToken,
  removeAuthToken,
  setUserData,
  removeUserData,
  getUserDataFromCookies
} from '@/utils/cookies'

export async function createAccount(formData: UserRegistrationForm) {
  try {
    const {data} = await axiosInstance.post<string>(
      `/auth/create-account`,
      formData
    )
    return data
  } catch (error) {
    if (isAxiosError(error)) {
      console.log('Error response:', error.response?.data)
      const errorData = error.response?.data

      // Manejar errores de validación (array de errores)
      if (
        errorData?.errors &&
        Array.isArray(errorData.errors) &&
        errorData.errors.length > 0
      ) {
        // Tomar el primer mensaje de error de validación
        const validationError = errorData.errors[0]
        throw new Error(validationError.msg)
      }

      // Si el error viene como objeto con mensaje
      if (typeof errorData === 'object' && errorData !== null) {
        const message =
          errorData.error?.message ||
          errorData.error ||
          errorData.message ||
          'Error al crear la cuenta'
        throw new Error(message)
      }

      // Si el error viene como string directo
      if (typeof errorData === 'string') {
        throw new Error(errorData)
      }

      // Si no podemos extraer un mensaje específico
      throw new Error(
        'Error al crear la cuenta. Por favor, intente nuevamente.'
      )
    }
    // Si no es un error de Axios
    throw new Error('Error de conexión. Por favor, intente nuevamente.')
  }
}

/**
 * @description Función para confirmar la cuenta de usuario mediante un token
 * @param token El token de confirmación enviado al correo del usuario
 * @returns Una promesa que resuelve con la respuesta del servidor
 */

type ConfirmAccountResponse = {
  message: string
}
export async function confirmAccount(formData: ConfirmToken) {
  try {
    const {data} = await axiosInstance.post<ConfirmAccountResponse>(
      `/auth/confirm-account`,
      formData
    )

    return data.message || 'Cuenta confirmada exitosamente'
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      // Retorna toda la estructura de error del backend
      throw new Error(error.response.data.error)
    }
  }
}

/**
 *@description Función para solicitar un nuevo código de confirmación
 *@param formData Objeto que contiene el email del usuario
 *@returns Una promesa que resuelve con la respuesta del servidor
 */

export async function requestConfirmationCode(
  formData: RequestConfirmationCodeForm
): Promise<string> {
  try {
    const response = await axiosInstance.post(`/auth/request-code`, formData)

    return response?.data ?? 'Código enviado correctamente'
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      // Retorna toda la estructura de error del backend
      throw new Error(error.response.data.error)
    }
    // Si no es un error de Axios, lanzar un error genérico
    throw new Error('Error de conexión. Por favor, intente nuevamente.')
  }
}

/**
 * @description Autenticación del Usuario mediante correo y contraseña
 * @param email Correo electrónico del usuario
 * @param password Contraseña del usuario
 * @returns Una promesa que resuelve con el token de autenticación y datos del usuario
 */

type AuthResponse = {
  message: string
  token: string
  user?: {
    id: string
    name: string
    email: string
    role: string
    companyId?: string
    confirmed: boolean
  }
}

export async function authenticateUser(formData: UserLoginForm) {
  try {
    const url = `/auth/login`
    const {data} = await axiosInstance.post<AuthResponse>(url, formData)
    console.log('Authentication response data:', data)

    // Verificar que tenemos el token
    if (!data.token) {
      throw new Error('No se recibió un token válido del servidor')
    }

    // 🔥 FIX: Asegurar que guardamos todo correctamente con orden y doble persistencia
    try {
      // Primero limpiar cualquier dato anterior
      localStorage.removeItem('AUTH_TOKEN_VALIDATE')
      localStorage.removeItem('USER_DATA')

      // Guardar token en localStorage y cookies (doble persistencia)
      localStorage.setItem('AUTH_TOKEN_VALIDATE', data.token)
      setAuthToken(data.token)

      // Guardar datos del usuario si están disponibles (doble persistencia)
      if (data.user) {
        console.log('Guardando datos del usuario:', data.user)
        localStorage.setItem('USER_DATA', JSON.stringify(data.user))
        setUserData(data.user) // También guardar en cookies para middleware

        // Verificar que se guardó correctamente en ambos lugares
        const savedDataLS = localStorage.getItem('USER_DATA')
        const savedDataCookies = getUserDataFromCookies()
        console.log('Verificación - localStorage:', savedDataLS)
        console.log('Verificación - cookies:', savedDataCookies)
      } else {
        console.log('No se recibieron datos del usuario en la respuesta')
      }
    } catch (storageError) {
      console.error('Error al guardar en localStorage:', storageError)
      throw new Error('Error al guardar la sesión')
    }

    return {
      token: data.token,
      user: data.user,
      message: data.message
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const errorData = error.response.data

      // Si el error viene como un objeto con mensaje específico
      if (typeof errorData === 'object' && errorData !== null) {
        // Para errores de validación (array de errores)
        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          throw new Error(errorData.errors[0].msg)
        }

        // Para errores específicos del backend
        const message =
          errorData.error?.message ||
          errorData.error ||
          (error.response.status === 404
            ? 'Usuario no encontrado'
            : error.response.status === 401
            ? 'Credenciales inválidas'
            : 'Error al autenticar. Por favor, verifique sus credenciales.')

        throw new Error(message)
      }

      // Si el error viene como string directo
      if (typeof errorData === 'string') {
        throw new Error(errorData)
      }
    }
    throw new Error('Error de conexión. Por favor, intente nuevamente.')
  }
}

/**
 * @description Restablecimiento de contraseña
 * @param email Correo electrónico del usuario
 * @param password Contraseña del usuario
 * @returns Una promesa que resuelve con el token de autenticación
 */
export async function forgetPassword(
  formData: ForgotPasswordForm
): Promise<string> {
  try {
    const url = `/auth/forgot-password`
    const {data} = await axiosInstance.post(url, formData)
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const errorData = error.response.data

      // Si el error viene como un objeto con mensaje específico
      if (typeof errorData === 'object' && errorData !== null) {
        // Para errores de validación (array de errores)
        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          throw new Error(errorData.errors[0].msg)
        }

        // Para errores específicos del backend
        const message =
          errorData.error?.message ||
          errorData.error ||
          (error.response.status === 404
            ? 'Usuario no encontrado'
            : error.response.status === 401
            ? 'Credenciales inválidas'
            : 'Error al autenticar. Por favor, verifique sus credenciales.')

        throw new Error(message)
      }

      // Si el error viene como string directo
      if (typeof errorData === 'string') {
        throw new Error(errorData)
      }
    }
    throw new Error('Error de conexión. Por favor, intente nuevamente.')
  }
}

/**
 * @description Función para validar el token de confirmación sin consumirlo
 * @param token El token de confirmación a validar
 * @returns Una promesa que resuelve con los datos de validación
 */

export type ValidateTokenResponse = {
  valid: boolean
  message: string
  alreadyConfirmed: boolean
  user: {
    email: string
    name: string
  }
}

export type ValidateTokenError = {
  error: {
    message: string
    code: string
  }
}

export async function validateToken(formData: ConfirmToken) {
  try {
    const url = `/auth/validate-token`
    const {data} = await axiosInstance.post<ValidateTokenResponse>(
      url,
      formData
    )
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const errorData = error.response.data as ValidateTokenError

      const message =
        errorData?.error?.message ||
        'El token de confirmación no es válido o ha expirado'

      throw new Error(message)
    }
    throw new Error('Error de conexión. Por favor, intente nuevamente.')
  }
}

/**
 * @description Función para actualizar la contraseña con un token de recuperación
 * @param token El token de recuperación
 * @param formData Los datos de la nueva contraseña
 * @returns Una promesa que resuelve con la respuesta del servidor
 */
export async function updatePasswordWithToken({
  token,
  formData
}: {
  token: ConfirmToken['token']
  formData: ChangePasswordForm
}) {
  try {
    const url = `/auth/update-password/${token}`
    const {data} = await axiosInstance.post(url, formData)
    return data.message || 'Contraseña actualizada con éxito'
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const errorData = error.response.data

      // Si el error viene como un objeto con mensaje específico
      if (typeof errorData === 'object' && errorData !== null) {
        // Para errores de validación (array de errores)
        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          throw new Error(errorData.errors[0].msg)
        }

        // Para errores específicos del backend
        const message =
          errorData.error?.message ||
          errorData.error ||
          errorData.message ||
          'Error al actualizar la contraseña'

        throw new Error(message)
      }

      // Si el error viene como string directo
      if (typeof errorData === 'string') {
        throw new Error(errorData)
      }
    }
    throw new Error('Error de conexión. Por favor, intente nuevamente.')
  }
}

/**
 * @description Obtener datos del usuario autenticado desde el dashboard
 * @returns Una promesa que resuelve con los datos del dashboard
 */
export async function getCurrentUser() {
  try {
    const url = `/dashboard/home`
    const {data} = await axiosInstance.post(url, {})
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const errorData = error.response.data

      if (error.response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('AUTH_TOKEN_VALIDATE')
        localStorage.removeItem('USER_DATA')
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.')
      }

      const message =
        errorData.error?.message ||
        errorData.error ||
        'Error al obtener datos del usuario'
      throw new Error(message)
    }
    throw new Error('Error de conexión. Por favor, intente nuevamente.')
  }
}

/**
 * @description Logout del usuario
 */
export function logout() {
  localStorage.removeItem('AUTH_TOKEN_VALIDATE')
  localStorage.removeItem('USER_DATA')
  removeAuthToken()
  removeUserData() // 🔥 NUEVO: También limpiar cookies de datos de usuario
}

/**
 * @description Obtener token del localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null // SSR
  return localStorage.getItem('AUTH_TOKEN_VALIDATE')
}

/**
 * @description Obtener datos del usuario del localStorage
 */
export function getUserData() {
  if (typeof window === 'undefined') return null // SSR
  const userData = localStorage.getItem('USER_DATA')
  return userData ? JSON.parse(userData) : null
}

/**
 * @description Verificar si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false // SSR

  const token = getAuthToken()
  // Solo verificar que existe el token, los datos del usuario son opcionales
  return !!token
}

/**
 * @description Renovar token JWT
 * @returns Una promesa que resuelve con el nuevo token y datos del usuario
 */
export async function refreshAuthToken() {
  try {
    const currentToken = getAuthToken()

    if (!currentToken) {
      throw new Error('No hay token para renovar')
    }

    const url = `/auth/refresh-token`
    const {data} = await axiosInstance.post(url, {})

    console.log('Token refresh response:', data)

    // Verificar que tenemos el nuevo token
    if (!data.token) {
      throw new Error('No se recibió un token válido del servidor')
    }

    // Guardar nuevo token en localStorage y cookies
    localStorage.setItem('AUTH_TOKEN_VALIDATE', data.token)
    setAuthToken(data.token)

    // Actualizar datos del usuario si están disponibles
    if (data.user) {
      console.log('Actualizando datos del usuario:', data.user)
      localStorage.setItem('USER_DATA', JSON.stringify(data.user))
      setUserData(data.user) // 🔥 NUEVO: También actualizar en cookies
    }

    return {
      token: data.token,
      user: data.user,
      message: data.message
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const errorData = error.response.data

      if (error.response.status === 401) {
        // Token expirado o inválido - limpiar sesión
        localStorage.removeItem('AUTH_TOKEN_VALIDATE')
        localStorage.removeItem('USER_DATA')
        removeAuthToken()
        removeUserData() // 🔥 NUEVO: También limpiar cookies
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.')
      }

      const message =
        errorData.error?.message || errorData.error || 'Error al renovar token'
      throw new Error(message)
    }
    throw new Error('Error de conexión al renovar token')
  }
}
