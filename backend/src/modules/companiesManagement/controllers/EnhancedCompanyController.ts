/**
 * Enhanced Company Controller v2.0
 * @description: Controlador para el modelo EnhancedCompany con funcionalidades avanzadas refactorizado
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0
 * @updated: 28/10/2025
 */

import type {Request, Response} from 'express'
import mongoose from 'mongoose'
import EnhancedCompany, {
  IEnhancedCompanyDocument
} from '../models/EnhancedCompany'
import EnhancedUser from '../../userManagement/models/EnhancedUser'
import EnhancedCompanyService from '../services/EnhancedCompanyService'
import type {AuthenticatedUser} from '@/modules/userManagement/types/authTypes'
import {
  ICreateCompanyRequest,
  IUpdateCompanyRequest,
  ICompanyFilters,
  IPaginationOptions,
  ICompanyListResponse,
  ICompanyResponse,
  ICompaniesGlobalStats,
  ICompanyActionResult,
  CompanyStatus,
  SubscriptionPlan,
  BusinessType,
  Currency,
  DEFAULT_COMPANY_SETTINGS,
  DEFAULT_PLAN_LIMITS,
  DEFAULT_PLAN_FEATURES
} from '../types/EnhandedCompanyTypes'

// ============ INTERFACES PARA REQUEST ============

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser
    }
  }
}

// ============ CLASE CONTROLADOR ============

export class EnhancedCompanyController {
  // ============ MÉTODOS DE CREACIÓN ============

  /**
   * Crear una nueva empresa con validaciones mejoradas
   */
  static createCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyData: ICreateCompanyRequest = req.body
      const currentUser = req.authUser // Obtener usuario autenticado

      if (!currentUser) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        } as ICompanyActionResult)
        return
      }

      // ============ VALIDACIONES PREVIAS ============

      // Verificar si ya existe una empresa con el mismo taxId
      if (companyData.settings?.taxId) {
        const existingTaxId = await EnhancedCompany.findOne({
          'settings.taxId': companyData.settings.taxId
        })

        if (existingTaxId) {
          res.status(400).json({
            success: false,
            message: 'Ya existe una empresa registrada con este RUT/Tax ID',
            error: 'DUPLICATE_TAX_ID'
          } as ICompanyActionResult)
          return
        }
      }

      // Verificar si ya existe una empresa con el mismo slug
      if (companyData.slug) {
        const existingSlug = await EnhancedCompany.findOne({
          slug: companyData.slug
        })

        if (existingSlug) {
          res.status(400).json({
            success: false,
            message:
              'Ya existe una empresa con este identificador único (slug)',
            error: 'DUPLICATE_SLUG'
          } as ICompanyActionResult)
          return
        }
      }

      // Verificar si ya existe una empresa con el mismo email
      const existingEmail = await EnhancedCompany.findOne({
        email: companyData.email
      })

      if (existingEmail) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una empresa registrada con este email',
          error: 'DUPLICATE_EMAIL'
        } as ICompanyActionResult)
        return
      }

      // ============ PREPARACIÓN DE DATOS ============

      // Generar slug automáticamente si no se proporciona
      if (!companyData.slug) {
        companyData.slug = companyData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remover acentos
          .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
          .replace(/\s+/g, '-') // Reemplazar espacios con guiones
          .replace(/-+/g, '-') // Remover guiones duplicados
          .trim()
          .substring(0, 50)
      }

      // Establecer plan por defecto
      const plan = companyData.plan || SubscriptionPlan.FREE

      // Configurar configuraciones por defecto
      const defaultSettings = {
        ...DEFAULT_COMPANY_SETTINGS,
        taxId: companyData.settings.taxId,
        businessType: companyData.settings.businessType || BusinessType.OTHER,
        industry: companyData.settings.industry || 'Otros',
        currency: companyData.settings.currency || Currency.CLP,
        limits: DEFAULT_PLAN_LIMITS[plan],
        features: DEFAULT_PLAN_FEATURES[plan]
      }

      // Merge con configuraciones proporcionadas
      const finalSettings = {
        ...defaultSettings,
        ...companyData.settings,
        limits: {...defaultSettings.limits, ...companyData.settings},
        features: {
          ...defaultSettings.features,
          ...companyData.settings
        }
      }

      // ============ DETERMINAR ESTADO Y FECHAS ============

      let status: CompanyStatus = CompanyStatus.TRIAL
      let trialEndsAt: Date | undefined
      let subscriptionEndsAt: Date | undefined

      if (plan === SubscriptionPlan.FREE) {
        status = CompanyStatus.TRIAL
        trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      } else {
        status = CompanyStatus.ACTIVE
        subscriptionEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
      }

      // ============ CREAR EMPRESA ============

      const newCompanyData = {
        name: companyData.name,
        slug: companyData.slug,
        description: companyData.description,
        website: companyData.website,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        status,
        plan,
        settings: finalSettings,
        createdBy: new mongoose.Types.ObjectId(currentUser.id),
        ownerId: new mongoose.Types.ObjectId(currentUser.id),
        trialEndsAt,
        subscriptionEndsAt,
        stats: {
          totalUsers: 0,
          totalProducts: 0,
          lastActivity: new Date(),
          storageUsed: 0
        }
      }

      const newCompany = await EnhancedCompany.create(newCompanyData)

      // ============ RESPUESTA ============
      const companyObject = newCompany.toObject()

      const companyResponse: ICompanyResponse = {
        ...companyObject,
        _id: newCompany._id.toString(), // Convertir ObjectId a string
        usage: newCompany.getUsagePercentage(),
        isActiveComputed: newCompany.isActive(),
        canAddUserComputed: newCompany.canAddUser(),
        isTrialExpiredComputed: newCompany.isTrialExpired(),
        totalUsers: 0,
        // Agregar otros campos según sea necesario
        ownerInfo: {
          _id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email
        },
        creatorInfo: {
          _id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email
        }
      }
      res.status(201).json({
        success: true,
        message: 'Empresa creada correctamente',
        company: companyResponse
      } as ICompanyActionResult)
    } catch (error) {
      console.error('Error creando empresa:', error)

      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Error de validación en los datos de la empresa',
          error: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => err.message)
        })
        return
      }

      if ((error as any).code === 11000) {
        const field = Object.keys((error as any).keyPattern)[0]
        res.status(400).json({
          success: false,
          message: `Ya existe una empresa con este ${field}`,
          error: 'DUPLICATE_KEY'
        })
        return
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear la empresa',
        error: 'INTERNAL_ERROR'
      } as ICompanyActionResult)
    }
  }

  // ============ MÉTODOS DE LECTURA ============

  /**
   * Obtener todas las empresas con paginación y filtros mejorados
   */
  static getAllCompanies = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // ============ PARÁMETROS DE PAGINACIÓN ============
      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit as string) || 10)
      )
      const skip = (page - 1) * limit
      const sortBy = (req.query.sortBy as string) || 'createdAt'
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1

      // ============ FILTROS ============
      const filters: any = {}

      // Filtro por estado
      if (req.query.status) {
        const statusArray = Array.isArray(req.query.status)
          ? req.query.status
          : [req.query.status]
        filters.status = {$in: statusArray}
      }

      // Filtro por plan
      if (req.query.plan) {
        const planArray = Array.isArray(req.query.plan)
          ? req.query.plan
          : [req.query.plan]
        filters.plan = {$in: planArray}
      }

      // Filtro por tipo de negocio
      if (req.query.businessType) {
        const businessTypeArray = Array.isArray(req.query.businessType)
          ? req.query.businessType
          : [req.query.businessType]
        filters['settings.businessType'] = {$in: businessTypeArray}
      }

      // Filtro por industria
      if (req.query.industry) {
        filters['settings.industry'] = new RegExp(
          req.query.industry as string,
          'i'
        )
      }

      // Filtro por búsqueda de texto
      if (req.query.search) {
        filters.$text = {$search: req.query.search as string}
      }

      // Filtro por fecha de creación
      if (req.query.createdAfter || req.query.createdBefore) {
        filters.createdAt = {}
        if (req.query.createdAfter) {
          filters.createdAt.$gte = new Date(req.query.createdAfter as string)
        }
        if (req.query.createdBefore) {
          filters.createdAt.$lte = new Date(req.query.createdBefore as string)
        }
      }

      // Filtro por trial expirado
      if (req.query.trialExpired === 'true') {
        filters.status = CompanyStatus.TRIAL
        filters.trialEndsAt = {$lte: new Date()}
      }

      // ============ CONSULTA ============
      const [companies, total] = await Promise.all([
        EnhancedCompany.find(filters)
          .populate('createdBy', 'name email')
          .populate('ownerId', 'name email')
          .skip(skip)
          .limit(limit)
          .sort({[sortBy]: sortOrder})
          .lean(),
        EnhancedCompany.countDocuments(filters)
      ])

      // ============ PROCESAMIENTO DE DATOS ============
      const processedCompanies: ICompanyResponse[] = companies.map(company => {
        const doc = new EnhancedCompany(company) as IEnhancedCompanyDocument
        return {
          ...company,
          _id: company._id.toString(), // Convertir ObjectId a string
          usage: doc.getUsagePercentage(),
          isActiveComputed: doc.isActive(),
          canAddUserComputed: doc.canAddUser(),
          isTrialExpiredComputed: doc.isTrialExpired(),
          ownerInfo: company.ownerId
            ? {
                _id:
                  (company.ownerId as any)._id?.toString() ||
                  company.ownerId.toString(),
                name: (company.ownerId as any).name || 'Usuario',
                email: (company.ownerId as any).email || 'email@empresa.com'
              }
            : undefined,
          creatorInfo: company.createdBy
            ? {
                _id:
                  (company.createdBy as any)._id?.toString() ||
                  company.createdBy.toString(),
                name: (company.createdBy as any).name || 'Usuario',
                email: (company.createdBy as any).email || 'email@empresa.com'
              }
            : undefined
        } as ICompanyResponse
      })
      // ============ RESPUESTA ============
      const response: ICompanyListResponse = {
        data: processedCompanies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1
        },
        filters: {
          search: req.query.search as string,
          status: req.query.status
            ? Array.isArray(req.query.status)
              ? (req.query.status as CompanyStatus[])
              : [req.query.status as CompanyStatus]
            : undefined,
          plan: req.query.plan
            ? Array.isArray(req.query.plan)
              ? (req.query.plan as SubscriptionPlan[])
              : [req.query.plan as SubscriptionPlan]
            : undefined,
          businessType: req.query.businessType
            ? Array.isArray(req.query.businessType)
              ? (req.query.businessType as BusinessType[])
              : [req.query.businessType as BusinessType]
            : undefined,
          industry: req.query.industry
            ? [req.query.industry as string]
            : undefined
        }
      }

      res.json(response)
    } catch (error) {
      console.error('Error obteniendo empresas:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener las empresas desde el servidor',
        error: 'INTERNAL_ERROR'
      })
    }
  }

  /**
   * Obtener una empresa por ID con información completa
   */
  static getCompanyById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {id} = req.params

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de empresa inválido',
          error: 'INVALID_ID'
        })
        return
      }

      const company = await EnhancedCompany.findById(id)
        .populate('createdBy', 'name email')
        .populate('ownerId', 'name email')

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada',
          error: 'NOT_FOUND'
        })
        return
      }

      // Actualizar estadísticas en tiempo real
      await company.updateStats()

      const companyResponse: ICompanyResponse = {
        ...company.toObject(),
        _id: company._id.toString(), // Convertir ObjectId a string
        usage: company.getUsagePercentage(),
        isActiveComputed: company.isActive(),
        canAddUserComputed: company.canAddUser(),
        isTrialExpiredComputed: company.isTrialExpired(),
        ownerInfo: company.ownerId
          ? {
              _id:
                (company.ownerId as any)._id?.toString() ||
                company.ownerId.toString(),
              name: (company.ownerId as any).name || 'Usuario',
              email: (company.ownerId as any).email || 'email@empresa.com'
            }
          : undefined,
        creatorInfo: company.createdBy
          ? {
              _id:
                (company.createdBy as any)._id?.toString() ||
                company.createdBy.toString(),
              name: (company.createdBy as any).name || 'Usuario',
              email: (company.createdBy as any).email || 'email@empresa.com'
            }
          : undefined
      }

      res.json({
        success: true,
        company: companyResponse
      })
    } catch (error) {
      console.error('Error obteniendo empresa:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener la empresa desde el servidor',
        error: 'INTERNAL_ERROR'
      })
    }
  }

  /**
   * Obtener una empresa por slug
   */
  static getCompanyBySlug = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {slug} = req.params

      if (!slug || slug.length < 3) {
        res.status(400).json({
          success: false,
          message: 'Slug de empresa inválido',
          error: 'INVALID_SLUG'
        })
        return
      }

      const company = await EnhancedCompany.findOne({slug})
        .populate('createdBy', 'name email')
        .populate('ownerId', 'name email')

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada',
          error: 'NOT_FOUND'
        })
        return
      }

      const companyResponse: ICompanyResponse = {
        ...company.toObject(),
        _id: company._id.toString(), // Convertir ObjectId a string
        usage: company.getUsagePercentage(),
        isActiveComputed: company.isActive(),
        canAddUserComputed: company.canAddUser(),
        isTrialExpiredComputed: company.isTrialExpired()
      }

      res.json({
        success: true,
        company: companyResponse
      })
    } catch (error) {
      console.error('Error obteniendo empresa por slug:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener la empresa desde el servidor',
        error: 'INTERNAL_ERROR'
      })
    }
  }

  // ============ MÉTODOS DE ACTUALIZACIÓN ============

  /**
   * Actualizar una empresa con validaciones mejoradas
   */
  static updateCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const {id} = req.params
      const updateData: IUpdateCompanyRequest = req.body

      console.log('🔧 BACKEND - updateCompany recibiendo datos:', {
        id,
        plan: updateData.plan,
        settings: updateData.settings
      })

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de empresa inválido',
          error: 'INVALID_ID'
        })
        return
      }

      // ============ VALIDACIONES ============

      // Verificar si existe otra empresa con el mismo taxId
      if (updateData.settings?.taxId) {
        const existingCompany = await EnhancedCompany.findOne({
          'settings.taxId': updateData.settings.taxId,
          _id: {$ne: id}
        })

        if (existingCompany) {
          res.status(400).json({
            success: false,
            message: 'Ya existe otra empresa con este RUT/Tax ID',
            error: 'DUPLICATE_TAX_ID'
          })
          return
        }
      }

      // Verificar si existe otra empresa con el mismo slug
      if (updateData.slug) {
        const existingSlug = await EnhancedCompany.findOne({
          slug: updateData.slug,
          _id: {$ne: id}
        })

        if (existingSlug) {
          res.status(400).json({
            success: false,
            message: 'Ya existe otra empresa con este identificador único',
            error: 'DUPLICATE_SLUG'
          })
          return
        }
      }

      // Verificar si existe otra empresa con el mismo email
      if (updateData.email) {
        const existingEmail = await EnhancedCompany.findOne({
          email: updateData.email,
          _id: {$ne: id}
        })

        if (existingEmail) {
          res.status(400).json({
            success: false,
            message: 'Ya existe otra empresa con este email',
            error: 'DUPLICATE_EMAIL'
          })
          return
        }
      }

      // ============ ACTUALIZACIÓN ============

      // Obtener la empresa actual para comparar el plan
      const currentCompany = await EnhancedCompany.findById(id)

      if (!currentCompany) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada',
          error: 'NOT_FOUND'
        })
        return
      }

      // Si el plan cambió, usar el método changeSubscriptionPlan
      if (updateData.plan && updateData.plan !== currentCompany.plan) {
        console.log('🔄 BACKEND - Cambio de plan detectado:', {
          planAnterior: currentCompany.plan,
          planNuevo: updateData.plan
        })

        // Cambiar el plan usando el método que actualiza límites y features
        await currentCompany.changeSubscriptionPlan(updateData.plan)

        // Actualizar los demás campos (excepto plan y settings.limits, ya actualizados)
        const {plan, settings, ...restUpdateData} = updateData

        // Si hay settings, actualizarlos pero SIN sobrescribir limits y features
        if (settings) {
          console.log(
            '⚠️ BACKEND - Settings recibidos, preservando limits y features'
          )

          // Actualizar solo los campos de settings que NO sean limits ni features
          // Usamos Object.assign pero excluyendo limits y features
          const {limits, features, ...safeSettings} = settings as any
          Object.assign(currentCompany.settings, safeSettings)
        }

        // Actualizar otros campos
        Object.assign(currentCompany, restUpdateData)

        // Guardar cambios
        await currentCompany.save()

        // Repoblar los campos necesarios
        await currentCompany.populate([
          {path: 'createdBy', select: 'name email'},
          {path: 'ownerId', select: 'name email'}
        ])

        console.log('✅ BACKEND - Plan actualizado con nuevos límites:', {
          plan: currentCompany.plan,
          limits: currentCompany.settings.limits
        })
      } else {
        console.log('📝 BACKEND - Actualización sin cambio de plan')

        // Si no cambió el plan, verificar que no se estén enviando limits manualmente
        if (updateData.settings?.limits) {
          console.warn(
            '⚠️ BACKEND - Se intentó actualizar limits manualmente, ignorando...'
          )
          const settingsWithoutLimits = {...updateData.settings}
          delete (settingsWithoutLimits as any).limits
          updateData.settings = settingsWithoutLimits
        }

        // Actualizar normalmente
        const updatedCompany = await EnhancedCompany.findByIdAndUpdate(
          id,
          updateData,
          {
            new: true,
            runValidators: true,
            populate: [
              {path: 'createdBy', select: 'name email'},
              {path: 'ownerId', select: 'name email'}
            ]
          }
        )

        if (!updatedCompany) {
          res.status(404).json({
            success: false,
            message: 'Empresa no encontrada',
            error: 'NOT_FOUND'
          })
          return
        }

        // Reasignar currentCompany para usar en la respuesta
        Object.assign(currentCompany, updatedCompany.toObject())
      }

      console.log('✅ BACKEND - Empresa actualizada:', {
        id: currentCompany._id,
        plan: currentCompany.plan,
        maxUsers: currentCompany.settings.limits.maxUsers,
        updatedFields: Object.keys(updateData)
      })

      const companyResponse: ICompanyResponse = {
        ...currentCompany.toObject(),
        _id: currentCompany._id.toString(), // Convertir ObjectId a string
        usage: currentCompany.getUsagePercentage(),
        isActiveComputed: currentCompany.isActive(),
        canAddUserComputed: currentCompany.canAddUser(),
        isTrialExpiredComputed: currentCompany.isTrialExpired()
      }

      res.json({
        success: true,
        message: 'Empresa actualizada correctamente',
        company: companyResponse
      } as ICompanyActionResult)
    } catch (error) {
      console.error('Error actualizando empresa:', error)

      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Error de validación en los datos de la empresa',
          error: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => err.message)
        })
        return
      }

      if ((error as any).code === 11000) {
        const field = Object.keys((error as any).keyPattern)[0]
        res.status(400).json({
          success: false,
          message: `Ya existe una empresa con este ${field}`,
          error: 'DUPLICATE_KEY'
        })
        return
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar la empresa',
        error: 'INTERNAL_ERROR'
      })
    }
  }

  // ============ MÉTODOS DE ESTADÍSTICAS ============

  /**
   * Obtener estadísticas globales de empresas (para Super Admin)
   */
  static getCompaniesSummary = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const [
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        trialCompanies,
        planDistribution,
        industryDistribution,
        businessTypeDistribution,
        recentCompanies
      ] = await Promise.all([
        EnhancedCompany.countDocuments(),
        EnhancedCompany.countDocuments({status: CompanyStatus.ACTIVE}),
        EnhancedCompany.countDocuments({status: CompanyStatus.SUSPENDED}),
        EnhancedCompany.countDocuments({status: CompanyStatus.TRIAL}),
        EnhancedCompany.aggregate([{$group: {_id: '$plan', count: {$sum: 1}}}]),
        EnhancedCompany.aggregate([
          {$group: {_id: '$settings.industry', count: {$sum: 1}}}
        ]),
        EnhancedCompany.aggregate([
          {$group: {_id: '$settings.businessType', count: {$sum: 1}}}
        ]),
        EnhancedCompany.find()
          .select('name createdAt')
          .sort({createdAt: -1})
          .limit(10)
      ])

      // Formatear distribuciones
      const planDistributionFormatted = planDistribution.reduce((acc, item) => {
        acc[item._id as SubscriptionPlan] = item.count
        return acc
      }, {} as Record<SubscriptionPlan, number>)

      const industryDistributionFormatted = industryDistribution.reduce(
        (acc, item) => {
          acc[item._id || 'Sin especificar'] = item.count
          return acc
        },
        {} as Record<string, number>
      )

      const businessTypeDistributionFormatted = businessTypeDistribution.reduce(
        (acc, item) => {
          acc[item._id as BusinessType] = item.count
          return acc
        },
        {} as Record<BusinessType, number>
      )

      // Actividad reciente simulada
      const recentActivity = recentCompanies.map(company => ({
        companyId: company._id.toString(),
        companyName: company.name,
        action: 'Última actualización',
        timestamp: company.createdAt
      }))

      // Crecimiento mensual (simulado por ahora)
      const currentDate = new Date()
      const lastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
      const newCompaniesThisMonth = await EnhancedCompany.countDocuments({
        createdAt: {$gte: lastMonth}
      })

      const summary: ICompaniesGlobalStats = {
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        trialCompanies,
        planDistribution: planDistributionFormatted,
        industryDistribution: industryDistributionFormatted,
        businessTypeDistribution: businessTypeDistributionFormatted,
        recentActivity,
        monthlyGrowth: {
          newCompanies: newCompaniesThisMonth,
          upgrades: 0, // TODO: Implementar lógica real
          cancellations: 0 // TODO: Implementar lógica real
        }
      }

      res.json(summary)
    } catch (error) {
      console.error('Error obteniendo resumen de empresas:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener el resumen de empresas',
        error: 'INTERNAL_ERROR'
      })
    }
  }

  // ============ MÉTODOS ADICIONALES ============

  /**
   * Suspender una empresa (cambio de eliminar a suspender)
   */
  static deleteCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const {id} = req.params
      const {reason = 'manual_admin'} = req.body

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de empresa inválido',
          error: 'INVALID_ID'
        })
        return
      }

      const company = await EnhancedCompany.findById(id)

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada',
          error: 'NOT_FOUND'
        })
        return
      }

      // Verificar si la empresa ya está suspendida
      if (company.status === CompanyStatus.SUSPENDED) {
        res.status(400).json({
          success: false,
          message: 'La empresa ya está suspendida',
          error: 'ALREADY_SUSPENDED'
        })
        return
      }

      // Contar usuarios para informar al admin
      const EnhancedUser = mongoose.model('EnhancedUser')
      const activeUsers = await EnhancedUser.countDocuments({
        primaryCompanyId: id,
        status: 'active'
      })
      const inactiveUsers = await EnhancedUser.countDocuments({
        primaryCompanyId: id,
        status: 'inactive'
      })

      // Suspender empresa y usuarios
      await company.suspendCompany(
        reason,
        new mongoose.Types.ObjectId(req.authUser?.id)
      )

      res.json({
        success: true,
        message: 'Empresa suspendida correctamente',
        data: {
          companyId: company._id,
          companyName: company.name,
          usersDeactivated: activeUsers + inactiveUsers,
          activeUsers,
          inactiveUsers
        }
      } as ICompanyActionResult)
    } catch (error) {
      console.error('Error suspendiendo empresa:', error)
      res.status(500).json({
        success: false,
        message: 'Error al suspender la empresa',
        error: 'INTERNAL_ERROR'
      })
    }
  }

  /**
   * Cambiar estado de una empresa
   */
  static changeCompanyStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {id} = req.params
      const {status} = req.body

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de empresa inválido',
          error: 'INVALID_ID'
        })
        return
      }

      if (!Object.values(CompanyStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Estado de empresa inválido',
          error: 'INVALID_STATUS'
        })
        return
      }

      const company = await EnhancedCompany.findByIdAndUpdate(
        id,
        {status},
        {new: true, runValidators: true}
      )

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada',
          error: 'NOT_FOUND'
        })
        return
      }

      const companyResponse: ICompanyResponse = {
        ...company.toObject(),
        _id: company._id.toString(), // Convertir ObjectId a string
        usage: company.getUsagePercentage(),
        isActiveComputed: company.isActive(),
        canAddUserComputed: company.canAddUser(),
        isTrialExpiredComputed: company.isTrialExpired()
      }

      res.json({
        success: true,
        message: `Estado de empresa cambiado a ${status}`,
        company: companyResponse
      } as ICompanyActionResult)
    } catch (error) {
      console.error('Error cambiando estado de empresa:', error)
      res.status(500).json({
        success: false,
        message: 'Error al cambiar el estado de la empresa',
        error: 'INTERNAL_ERROR'
      })
    }
  }

  /**
   * Cambiar plan de suscripción de una empresa
   */
  static changeCompanyPlan = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {id} = req.params
      const {plan} = req.body

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de empresa inválido',
          error: 'INVALID_ID'
        })
        return
      }

      if (!Object.values(SubscriptionPlan).includes(plan)) {
        res.status(400).json({
          success: false,
          message: 'Plan de suscripción inválido',
          error: 'INVALID_PLAN'
        })
        return
      }

      const company = await EnhancedCompany.findById(id)

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada',
          error: 'NOT_FOUND'
        })
        return
      }

      await company.changeSubscriptionPlan(plan)

      const companyResponse: ICompanyResponse = {
        ...company.toObject(),
        _id: company._id.toString(), // Convertir ObjectId a string
        usage: company.getUsagePercentage(),
        isActiveComputed: company.isActive(),
        canAddUserComputed: company.canAddUser(),
        isTrialExpiredComputed: company.isTrialExpired()
      }

      res.json({
        success: true,
        message: `Plan de empresa cambiado a ${plan}`,
        company: companyResponse
      } as ICompanyActionResult)
    } catch (error) {
      console.error('Error cambiando plan de empresa:', error)
      res.status(500).json({
        success: false,
        message: 'Error al cambiar el plan de la empresa',
        error: 'INTERNAL_ERROR'
      })
    }
  }

  /**
   * Reactivar una empresa suspendida
   * @route POST /api/companies/:id/reactivate
   * @access Super Admin only
   */
  static async reactivateCompany(req: Request, res: Response): Promise<void> {
    try {
      const {id} = req.params
      const currentUser = req.authUser

      // Solo Super Admin puede reactivar empresas
      if (!currentUser || currentUser.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para reactivar empresas',
          error: 'INSUFFICIENT_PERMISSIONS'
        })
        return
      }

      // Buscar la empresa
      const company = await EnhancedCompany.findById(id)
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada',
          error: 'COMPANY_NOT_FOUND'
        })
        return
      }

      // Verificar que la empresa esté suspendida
      if (company.status !== 'suspended') {
        res.status(400).json({
          success: false,
          message: `La empresa no está suspendida (estado actual: ${company.status})`,
          error: 'INVALID_STATUS'
        })
        return
      }

      // Reactivar la empresa usando el método del modelo
      await company.reactivateCompany()

      // Reactivar usuarios que estaban activos antes de la suspensión
      const usersToReactivate = await EnhancedUser.find({
        primaryCompanyId: company._id,
        status: 'inactive',
        // Solo reactivar usuarios que fueron desactivados por la suspensión de la empresa
        deactivatedReason: 'company_suspended'
      })

      console.log(
        `🔍 Usuarios encontrados para reactivar: ${usersToReactivate.length}`
      )

      let usersReactivated = 0
      for (const user of usersToReactivate) {
        user.status = 'active'

        // Reactivar roles de la empresa
        user.roles.forEach(role => {
          if (role.companyId?.toString() === company._id.toString()) {
            role.isActive = true
          }
        })

        // Limpiar metadata de desactivación
        user.deactivatedReason = undefined
        user.deactivatedAt = undefined

        await user.save()
        usersReactivated++

        console.log(`   ✅ Usuario reactivado: ${user.email}`)
      }

      // Actualizar estadísticas de la empresa
      await company.updateStats()
      await company.save()

      console.log(
        `✅ Empresa ${company.name} reactivada por ${currentUser.name}`
      )
      console.log(`   - Usuarios reactivados: ${usersReactivated}`)

      res.json({
        success: true,
        message: `Empresa ${company.name} reactivada exitosamente`,
        data: {
          companyId: company._id,
          companyName: company.name,
          status: company.status,
          usersReactivated,
          totalActiveUsers: company.stats.totalUsers
        }
      })
    } catch (error) {
      console.error('Error reactivando empresa:', error)
      res.status(500).json({
        success: false,
        message: 'Error al reactivar la empresa',
        error: 'INTERNAL_ERROR'
      })
    }
  }

  // ============ MÉTODOS LEGACY (compatibilidad) ============

  /**
   * @deprecated Usar getCompanyById en su lugar
   */
  static getCompanyWithUsers = EnhancedCompanyController.getCompanyById

  /**
   * @deprecated Usar updateCompany en su lugar
   */
  static updateCompanySettings = EnhancedCompanyController.updateCompany

  /**
   * @deprecated Usar getCompanyById con actualización de stats
   */
  static getCompanyStats = EnhancedCompanyController.getCompanyById
}
