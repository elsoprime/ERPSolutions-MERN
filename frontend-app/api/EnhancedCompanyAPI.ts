/**
 * Enhanced Company API Client
 * @description: Cliente API para gestión de empresas Enhanced por Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import api from './axios'
import {
  IEnhancedCompany,
  ICreateCompanyFormData,
  IUpdateCompanyFormData,
  ICompanyFilters,
  ICompanyListResponse,
  ICompanyActionResult,
  ICompanyStatistics
} from '@/interfaces/EnhancedCompany'

export class EnhancedCompanyAPI {
  private static baseURL = '/enhanced-companies'

  /**
   * Obtener todas las empresas (Solo Super Admin)
   */
  static async getAllCompanies(params?: {
    page?: number
    limit?: number
    filters?: ICompanyFilters
  }): Promise<ICompanyListResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.filters?.search)
        queryParams.append('search', params.filters.search)
      if (params?.filters?.plan) queryParams.append('plan', params.filters.plan)
      if (params?.filters?.status)
        queryParams.append('status', params.filters.status)
      if (params?.filters?.industry)
        queryParams.append('industry', params.filters.industry)
      if (params?.filters?.businessType)
        queryParams.append('businessType', params.filters.businessType)

      const response = await api.get(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Error al obtener empresas:', error)
      throw error
    }
  }

  /**
   * Obtener empresa por ID
   */
  static async getCompanyById(companyId: string): Promise<IEnhancedCompany> {
    try {
      const response = await api.get(`${this.baseURL}/${companyId}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener empresa:', error)
      throw error
    }
  }

  /**
   * Crear nueva empresa (Solo Super Admin)
   */
  static async createCompany(
    companyData: ICreateCompanyFormData
  ): Promise<ICompanyActionResult> {
    try {
      // Transformar datos del frontend al formato del backend
      const backendData = {
        name: companyData.name,
        email: companyData.email,
        description: companyData.description,
        website: companyData.website,
        phone: companyData.phone,
        address: companyData.address,
        // Mapear subscription.plan a plan
        plan: companyData.subscription.plan,
        // Mapear settings con todos los campos necesarios
        settings: {
          ...companyData.settings,
          // Asegurar que los features estén en settings
          features: companyData.features,
          // Mapear branding dentro de settings
          branding: companyData.branding
        }
      }

      console.log('📤 Datos transformados para backend:', backendData)

      const url = this.baseURL
      const response = await api.post(url, backendData)
      return {
        success: true,
        message: 'Empresa creada exitosamente',
        company: response.data.company
      }
    } catch (error: any) {
      console.error('Error al crear empresa:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear la empresa'
      }
    }
  }

  /**
   * Actualizar empresa (Solo Super Admin)
   */
  static async updateCompany(
    companyId: string,
    companyData: IUpdateCompanyFormData
  ): Promise<ICompanyActionResult> {
    try {
      const response = await api.put(
        `${this.baseURL}/${companyId}`,
        companyData
      )
      return {
        success: true,
        message: 'Empresa actualizada exitosamente',
        company: response.data.company
      }
    } catch (error: any) {
      console.error('Error al actualizar empresa:', error)
      return {
        success: false,
        message:
          error.response?.data?.message || 'Error al actualizar la empresa'
      }
    }
  }

  /**
   * Suspender empresa (Solo Super Admin)
   * NOTA: Esta funcionalidad requiere implementación en backend
   */
  static async suspendCompany(
    companyId: string,
    reason?: string
  ): Promise<ICompanyActionResult> {
    try {
      // Por ahora, actualizar el status a suspended
      const response = await api.put(`${this.baseURL}/${companyId}`, {
        status: 'suspended',
        suspensionReason: reason
      })
      return {
        success: true,
        message: 'Empresa suspendida exitosamente',
        company: response.data.company
      }
    } catch (error: any) {
      console.error('Error al suspender empresa:', error)
      return {
        success: false,
        message:
          error.response?.data?.message || 'Error al suspender la empresa'
      }
    }
  }

  /**
   * Reactivar empresa (Solo Super Admin)
   * NOTA: Esta funcionalidad requiere implementación en backend
   */
  static async reactivateCompany(
    companyId: string
  ): Promise<ICompanyActionResult> {
    try {
      // Por ahora, actualizar el status a active
      const response = await api.put(`${this.baseURL}/${companyId}`, {
        status: 'active'
      })
      return {
        success: true,
        message: 'Empresa reactivada exitosamente',
        company: response.data.company
      }
    } catch (error: any) {
      console.error('Error al reactivar empresa:', error)
      return {
        success: false,
        message:
          error.response?.data?.message || 'Error al reactivar la empresa'
      }
    }
  }

  /**
   * Eliminar empresa (Solo Super Admin) - Soft delete
   */
  static async deleteCompany(companyId: string): Promise<ICompanyActionResult> {
    try {
      const response = await api.delete(`${this.baseURL}/${companyId}`)
      return {
        success: true,
        message: 'Empresa eliminada exitosamente'
      }
    } catch (error: any) {
      console.error('Error al eliminar empresa:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar la empresa'
      }
    }
  }

  /**
   * Obtener estadísticas de empresa
   */
  static async getCompanyStatistics(
    companyId: string
  ): Promise<ICompanyStatistics> {
    try {
      const response = await api.get(`${this.baseURL}/${companyId}/stats`)
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw error
    }
  }

  /**
   * Actualizar suscripción de empresa
   * NOTA: Esta funcionalidad usar updateCompany por ahora
   */
  static async updateSubscription(
    companyId: string,
    subscriptionData: {
      plan: 'free' | 'basic' | 'professional' | 'enterprise'
      autoRenew?: boolean
      endDate?: Date
    }
  ): Promise<ICompanyActionResult> {
    try {
      const response = await api.put(`${this.baseURL}/${companyId}`, {
        plan: subscriptionData.plan
      })
      return {
        success: true,
        message: 'Suscripción actualizada exitosamente',
        company: response.data.company
      }
    } catch (error: any) {
      console.error('Error al actualizar suscripción:', error)
      return {
        success: false,
        message:
          error.response?.data?.message || 'Error al actualizar la suscripción'
      }
    }
  }

  /**
   * Verificar disponibilidad de slug
   * NOTA: Esta funcionalidad requiere implementación en backend
   */
  static async checkSlugAvailability(
    slug: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      // Por ahora retornamos true (disponible)
      // TODO: Implementar endpoint en backend
      console.warn('checkSlugAvailability: Endpoint no implementado en backend')
      return true
    } catch (error) {
      console.error('Error al verificar slug:', error)
      return false
    }
  }

  /**
   * Verificar disponibilidad de Tax ID
   * NOTA: Esta funcionalidad requiere implementación en backend
   */
  static async checkTaxIdAvailability(
    taxId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      // Por ahora retornamos true (disponible)
      // TODO: Implementar endpoint en backend
      console.warn(
        'checkTaxIdAvailability: Endpoint no implementado en backend'
      )
      return true
    } catch (error) {
      console.error('Error al verificar Tax ID:', error)
      return false
    }
  }

  /**
   * Obtener resumen general de todas las empresas (Dashboard Super Admin)
   */
  static async getCompaniesSummary(): Promise<{
    totalCompanies: number
    activeCompanies: number
    suspendedCompanies: number
    trialCompanies: number
    planDistribution: Record<string, number>
    industryDistribution: Record<string, number>
    recentActivity: Array<{
      companyId: string
      companyName: string
      action: string
      timestamp: Date
    }>
  }> {
    try {
      const response = await api.get(`${this.baseURL}/summary`)
      return response.data
    } catch (error) {
      console.error('Error al obtener resumen de empresas:', error)
      throw error
    }
  }

  /**
   * Exportar lista de empresas a CSV
   * NOTA: Esta funcionalidad requiere implementación en backend
   */
  static async exportCompaniesToCSV(filters?: ICompanyFilters): Promise<Blob> {
    try {
      // Por ahora lanzamos error indicando que no está implementado
      throw new Error('Funcionalidad de exportación no implementada en backend')
    } catch (error) {
      console.error('Error al exportar empresas:', error)
      throw error
    }
  }

  /**
   * Clonar empresa (crear copia con configuraciones similares)
   * NOTA: Esta funcionalidad requiere implementación en backend
   */
  static async cloneCompany(
    sourceCompanyId: string,
    newCompanyData: Partial<ICreateCompanyFormData>
  ): Promise<ICompanyActionResult> {
    try {
      // Por ahora lanzamos error indicando que no está implementado
      throw new Error('Funcionalidad de clonación no implementada en backend')
    } catch (error: any) {
      console.error('Error al clonar empresa:', error)
      return {
        success: false,
        message: 'Funcionalidad de clonación no implementada en backend'
      }
    }
  }
}

export default EnhancedCompanyAPI
