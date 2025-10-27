import {useQuery} from '@tanstack/react-query'
import {validateToken} from '@/api/AuthAPI'

/**
 * Hook personalizado para validar tokens de confirmación
 * @param token El token a validar
 * @returns Objeto con estado de la validación, datos y funciones
 */
export const useValidateToken = (token: string) => {
  const query = useQuery({
    queryKey: ['validateToken', token],
    queryFn: () => validateToken({token}),
    retry: false, // No reintentar si el token es inválido
    enabled: !!token, // Solo ejecutar si hay token
    staleTime: 0, // Siempre considerar los datos como obsoletos
    gcTime: 0, // No cachear los resultados
    refetchOnWindowFocus: false, // No refetch al cambiar de ventana
    refetchOnMount: false // No refetch al montar de nuevo
  })

  return {
    // Estados de carga y error
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,

    // Datos de validación
    data: query.data,
    isValid: query.data?.valid || false,
    alreadyConfirmed: query.data?.alreadyConfirmed || false,
    user: query.data?.user,

    // Función para refetch manual si es necesario
    refetch: query.refetch
  }
}
