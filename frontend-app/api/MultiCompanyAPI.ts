/**
 * Multi-Company API Service
 * @description: Servicio de API para gestión multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import api from './axios'
import {
  IEnhancedUser,
  IEnhancedCompany,
  ICreateUserRequest,
  IUpdateUserRequest,
  IAssignRoleRequest,
  ICreateCompanyRequest,
  IUpdateCompanyRequest,
  IUpdateCompanyPlanRequest,
  IUserListResponse,
  ICompanyListResponse,
  ICompanyStats,
  IUserFilters,
  ICompanyFilters,
  IApiResponse
} from '@/interfaces/MultiCompany'

export class MultiCompanyAPI {
  private static readonly BASE_URL = '/v2'

  // ====== USER MANAGEMENT ======

  /**
   * Obtener todos los usuarios (Super Admin)
   */
  static async getAllUsers(filters?: IUserFilters): Promise<IUserListResponse> {
    const params = new URLSearchParams()

    if (filters?.search) params.append('search', filters.search)
    if (filters?.role) params.append('role', filters.role)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(
      `${this.BASE_URL}/users/all?${params.toString()}`
    )
    return response.data
  }

  /**
   * Obtener usuarios de empresa
   */
  static async getCompanyUsers(
    filters?: IUserFilters
  ): Promise<IUserListResponse> {
    const params = new URLSearchParams()

    if (filters?.search) params.append('search', filters.search)
    if (filters?.role) params.append('role', filters.role)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(
      `${this.BASE_URL}/users/company?${params.toString()}`
    )
    return response.data
  }

  /**
   * Obtener perfil del usuario actual
   */
  static async getUserProfile(): Promise<IApiResponse<IEnhancedUser>> {
    const response = await api.get(`${this.BASE_URL}/users/profile`)
    return response.data
  }

  /**
   * Crear nuevo usuario
   */
  static async createUser(
    userData: ICreateUserRequest
  ): Promise<IApiResponse<IEnhancedUser>> {
    const response = await api.post(`${this.BASE_URL}/users`, userData)
    return response.data
  }

  /**
   * Crear usuario en empresa
   */
  static async createCompanyUser(
    userData: Omit<ICreateUserRequest, 'roleType' | 'companyId'>
  ): Promise<IApiResponse<IEnhancedUser>> {
    const response = await api.post(`${this.BASE_URL}/users/company`, userData)
    return response.data
  }

  /**
   * Actualizar usuario
   */
  static async updateUser(
    userId: string,
    userData: IUpdateUserRequest
  ): Promise<IApiResponse<IEnhancedUser>> {
    const response = await api.put(`${this.BASE_URL}/users/${userId}`, userData)
    return response.data
  }

  /**
   * Asignar rol a usuario
   */
  static async assignRole(
    userId: string,
    roleData: IAssignRoleRequest
  ): Promise<IApiResponse<IEnhancedUser>> {
    const response = await api.post(
      `${this.BASE_URL}/users/${userId}/roles`,
      roleData
    )
    return response.data
  }

  /**
   * Revocar rol de usuario
   */
  static async revokeRole(
    userId: string,
    roleIndex: number
  ): Promise<IApiResponse<void>> {
    const response = await api.delete(
      `${this.BASE_URL}/users/${userId}/roles`,
      {
        data: {roleIndex}
      }
    )
    return response.data
  }

  /**
   * Eliminar usuario
   */
  static async deleteUser(userId: string): Promise<IApiResponse<void>> {
    const response = await api.delete(`${this.BASE_URL}/users/${userId}`)
    return response.data
  }

  // ====== COMPANY MANAGEMENT ======

  /**
   * Obtener todas las empresas (Super Admin)
   */
  static async getAllCompanies(
    filters?: ICompanyFilters
  ): Promise<ICompanyListResponse> {
    const params = new URLSearchParams()

    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.plan) params.append('plan', filters.plan)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(
      `${this.BASE_URL}/companies/all?${params.toString()}`
    )
    return response.data
  }

  /**
   * Obtener empresa actual
   */
  static async getCurrentCompany(): Promise<IApiResponse<IEnhancedCompany>> {
    const response = await api.get(`${this.BASE_URL}/companies/current`)
    return response.data
  }

  /**
   * Crear nueva empresa
   */
  static async createCompany(
    companyData: ICreateCompanyRequest
  ): Promise<IApiResponse<IEnhancedCompany>> {
    const response = await api.post(`${this.BASE_URL}/companies`, companyData)
    return response.data
  }

  /**
   * Actualizar empresa
   */
  static async updateCompany(
    companyId: string,
    companyData: IUpdateCompanyRequest
  ): Promise<IApiResponse<IEnhancedCompany>> {
    const response = await api.put(
      `${this.BASE_URL}/companies/${companyId}`,
      companyData
    )
    return response.data
  }

  /**
   * Actualizar configuraciones de empresa actual
   */
  static async updateCurrentCompanySettings(
    settings: IUpdateCompanyRequest
  ): Promise<IApiResponse<IEnhancedCompany>> {
    const response = await api.put(
      `${this.BASE_URL}/companies/current/settings`,
      {settings}
    )
    return response.data
  }

  /**
   * Actualizar plan de empresa
   */
  static async updateCompanyPlan(
    companyId: string,
    planData: IUpdateCompanyPlanRequest
  ): Promise<IApiResponse<IEnhancedCompany>> {
    const response = await api.put(
      `${this.BASE_URL}/companies/${companyId}/subscription`,
      planData
    )
    return response.data
  }

  /**
   * Suspender empresa
   */
  static async suspendCompany(
    companyId: string,
    reason?: string
  ): Promise<IApiResponse<void>> {
    const response = await api.post(
      `${this.BASE_URL}/companies/${companyId}/suspend`,
      {reason}
    )
    return response.data
  }

  /**
   * Reactivar empresa
   */
  static async reactivateCompany(
    companyId: string
  ): Promise<IApiResponse<void>> {
    const response = await api.post(
      `${this.BASE_URL}/companies/${companyId}/reactivate`
    )
    return response.data
  }

  /**
   * Obtener estadísticas de empresa
   */
  static async getCompanyStats(
    companyId?: string
  ): Promise<IApiResponse<ICompanyStats>> {
    const url = companyId
      ? `${this.BASE_URL}/companies/${companyId}/stats`
      : `${this.BASE_URL}/companies/current/stats`

    const response = await api.get(url)
    return response.data
  }

  // ====== UTILITY METHODS ======

  /**
   * Cambiar contexto de empresa
   */
  static async switchCompanyContext(companyId: string): Promise<void> {
    // Esto podría implementarse como un header en axios o en el contexto de autenticación
    api.defaults.headers.common['X-Company-ID'] = companyId
  }

  /**
   * Limpiar contexto de empresa
   */
  static clearCompanyContext(): void {
    delete api.defaults.headers.common['X-Company-ID']
  }

  // ====== PERMISSION HELPERS ======

  /**
   * Verificar permisos del usuario actual
   */
  static async checkPermissions(): Promise<
    IApiResponse<{global: string[]; company: string[]}>
  > {
    const response = await api.get(`${this.BASE_URL}/users/profile`)
    return {
      data: {
        global: response.data.user?.permissions?.global || [],
        company: response.data.user?.permissions?.company || []
      }
    }
  }
}

export default MultiCompanyAPI
