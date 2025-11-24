/**
 * API Types
 * @description: Tipos personalizados para manejo de respuestas y errores de API
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

/**
 * Estructura estándar de error de API
 */
export interface ApiError {
  error: string;
  details?: string;
  field?: string;
  code?: string;
  statusCode?: number;
}

/**
 * Respuesta genérica de API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Error de Axios con tipado
 */
export interface AxiosApiError {
  response?: {
    data: ApiError;
    status: number;
    statusText: string;
  };
  message: string;
  code?: string;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Opciones de mutación para TanStack Query
 */
export interface MutationOptions<
  TData = unknown,
  TError = ApiError,
  TVariables = unknown
> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: TError, variables: TVariables) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables
  ) => void | Promise<void>;
}
