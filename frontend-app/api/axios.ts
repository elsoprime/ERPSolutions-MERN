/**
 * Autor: Esteban Soto @elsoprimeDev
 */

/**
 * Definiendo Conexion a nuestra API con Axios
 */

import axios from 'axios'

// Crea una instancia de Axios
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 10000, // Tiempo de espera máximo para una solicitud
  headers: {
    'Content-Type': 'application/json' // Tipo de contenido por defecto
    // Agrega aquí otros encabezados si es necesario
  }
})

// Interceptor de solicitudes
axiosInstance.interceptors.request.use(
  config => {
    // Agrega el token de autenticación a las solicitudes, si existe
    const token = localStorage.getItem('AUTH_TOKEN_VALIDATE')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    // Manejo de errores en la solicitud antes de ser enviada
    console.error('Error en la solicitud:', error)
    return Promise.reject(error)
  }
)

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
  response => {
    // Lógica para manejar la respuesta antes de ser retornada al componente
    return response
  },
  error => {
    // Manejo de errores en la respuesta
    if (error.response) {
      const {status, data} = error.response

      // Manejo de errores específicos por estado
      switch (status) {
        case 401:
          // 🔥 FIX CRÍTICO: NO limpiar localStorage automáticamente aquí
          // El localStorage solo debe limpiarse en logout explícito o en funciones específicas
          console.warn('No autorizado - Token expirado o inválido')
          // Solo loggar el error, la limpieza se hará en AuthAPI si es necesario
          break
        case 403:
          console.error('Acceso prohibido - Permisos insuficientes')
          break
        case 400:
          console.error('Solicitud incorrecta:', data?.message || data)
          break
        case 500:
          console.error('Error del servidor:', data?.message || data)
          break
        default:
          console.error('Error en la respuesta:', data?.message || data)
      }
    } else if (error.request) {
      // No se recibió respuesta del servidor
      console.error('No se recibió respuesta del servidor:', error.request)
    } else {
      // Otro tipo de error (configuración, etc.)
      console.error('Error al configurar la solicitud:', error.message)
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
