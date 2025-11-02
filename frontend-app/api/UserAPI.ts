/**
 * User API Client
 * @description: Cliente API para gestión de usuarios por Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import api from './axios'

export interface IUser {
  _id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'suspended'
  role: string
  company?: {
    _id: string
    name: string
    plan: string
  }
  createdAt: string
  updatedAt: string
  lastLogin?: string
  isVerified: boolean
}

export interface IUserFilters {
  search?: string
  status?: string
  role?: string
  companyId?: string
}

export interface IUserListResponse {
  data: IUser[]
  pagination: {
    currentPage: number
    total: number
    page: number
    limit: number
    totalPages: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  success: boolean
  message: string
}

export interface IUserActionResult {
  success: boolean
  message: string
  user?: IUser
}

export class UserAPI {
  private static baseURL = '/v2/users'

  /**
   * Obtener todos los usuarios (Solo Super Admin)
   */
  static async getAllUsers(params?: {
    page?: number
    limit?: number
    filters?: IUserFilters
  }): Promise<IUserListResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.filters?.search)
        queryParams.append('search', params.filters.search)
      if (params?.filters?.status)
        queryParams.append('status', params.filters.status)
      if (params?.filters?.role) queryParams.append('role', params.filters.role)
      if (params?.filters?.companyId)
        queryParams.append('companyId', params.filters.companyId)

      const response = await api.get(
        `${this.baseURL}/all?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      throw error
    }
  }

  /**
   * Obtener un usuario por ID
   */
  static async getUserById(id: string): Promise<IUser> {
    try {
      const response = await api.get(`${this.baseURL}/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener usuario:', error)
      throw error
    }
  }

  /**
   * Suspender usuario
   */
  static async suspendUser(id: string): Promise<IUserActionResult> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/suspend`)
      return response.data
    } catch (error) {
      console.error('Error al suspender usuario:', error)
      throw error
    }
  }

  /**
   * Reactivar usuario
   */
  static async reactivateUser(id: string): Promise<IUserActionResult> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/reactivate`)
      return response.data
    } catch (error) {
      console.error('Error al reactivar usuario:', error)
      throw error
    }
  }

  /**
   * Eliminar usuario
   */
  static async deleteUser(id: string): Promise<IUserActionResult> {
    try {
      const response = await api.delete(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getUsersStats(): Promise<{
    total: number
    active: number
    inactive: number
    suspended: number
    byRole: Record<string, number>
    byCompany: Record<string, number>
    recent: Array<{
      userId: string
      userName: string
      action: string
      timestamp: Date
    }>
    monthlyGrowth: {
      newUsers: number
      activations: number
      deactivations: number
    }
    monthlyTrends: Array<{
      month: string
      total: number
      active: number
      inactive: number
      newUsers: number
    }>
  }> {
    try {
      const response = await api.get(`${this.baseURL}/stats`)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error)
      throw error
    }
  }

  /**
   * Exportar usuarios a CSV
   */
  static async exportUsersToCSV(filters?: IUserFilters): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.search) queryParams.append('search', filters.search)
      if (filters?.status) queryParams.append('status', filters.status)
      if (filters?.role) queryParams.append('role', filters.role)
      if (filters?.companyId) queryParams.append('companyId', filters.companyId)

      const response = await api.get(
        `${this.baseURL}/export?${queryParams.toString()}`,
        {
          responseType: 'blob'
        }
      )

      return new Blob([response.data], {type: 'text/csv'})
    } catch (error) {
      console.error('Error al exportar usuarios:', error)
      throw error
    }
  }
}

export default UserAPI
