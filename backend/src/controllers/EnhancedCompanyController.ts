/**
 * Enhanced Company Controller
 * @description: Controlador para el modelo EnhancedCompany con funcionalidades avanzadas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import type {Request, Response} from 'express'
import mongoose from 'mongoose'
import EnhancedCompany, {IEnhancedCompany} from '../models/EnhancedCompany'
import User from '../modules/userManagement/models/User'
import type {AuthenticatedUser} from '../modules/userManagement/types/authTypes'

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser
    }
  }
}

export class EnhancedCompanyController {
  /**
   * Crear una nueva empresa
   */
  static createCompany = async (req: Request, res: Response) => {
    try {
      const companyData = req.body

      // Verificar si ya existe una empresa con el mismo taxId
      const existingCompany = await EnhancedCompany.findOne({
        'settings.taxId': companyData.settings?.taxId
      })

      if (existingCompany) {
        return res.status(400).json({
          message: 'Ya existe una empresa registrada con este RUT/Tax ID'
        })
      }

      // Verificar si ya existe una empresa con el mismo slug
      if (companyData.slug) {
        const existingSlug = await EnhancedCompany.findOne({
          slug: companyData.slug
        })

        if (existingSlug) {
          return res.status(400).json({
            message: 'Ya existe una empresa con este identificador único (slug)'
          })
        }
      }

      // Asignar valores por defecto si no se proporcionan
      if (!companyData.slug) {
        companyData.slug = companyData.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      }

      // Configuraciones por defecto
      companyData.settings = {
        businessType: 'other',
        industry: companyData.industry || 'Otros',
        currency: 'CLP',
        fiscalYear: {startMonth: 1, endMonth: 12},
        features: {
          inventory: true,
          accounting: false,
          hrm: false,
          crm: false,
          projects: false
        },
        limits: {
          maxUsers: 5,
          maxProducts: 100,
          maxTransactions: 1000,
          storageGB: 1
        },
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#64748B'
        },
        notifications: {},
        ...companyData.settings
      }

      // Determinar el status basado en el plan seleccionado
      if (!companyData.status) {
        if (companyData.plan === 'free') {
          companyData.status = 'trial'
          // Establecer fecha de fin de trial (30 días)
          companyData.trialEndsAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          )
        } else {
          companyData.status = 'active'
          // Establecer fecha de fin de suscripción (1 año)
          companyData.subscriptionEndsAt = new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          )
        }
      }

      // Asignar usuario creador si está en el token
      companyData.createdBy = req.authUser?.id || null
      companyData.ownerId = req.authUser?.id || null

      const newCompany = await EnhancedCompany.create(companyData)

      res.status(201).json({
        message: 'Empresa creada correctamente',
        company: newCompany
      })
    } catch (error) {
      console.error('Error creando empresa:', error)

      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          error: 'Error de validación',
          details: error.message
        })
      }

      res.status(500).json({
        error: 'Error interno del servidor al crear la empresa'
      })
    }
  }

  /**
   * Obtener todas las empresas con paginación y filtros
   */
  static getAllCompanies = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const skip = (page - 1) * limit

      // Filtros opcionales
      const filters: any = {}

      if (req.query.status) {
        filters.status = req.query.status
      }

      if (req.query.plan) {
        filters.plan = req.query.plan
      }

      if (req.query.industry) {
        filters['settings.industry'] = new RegExp(
          req.query.industry as string,
          'i'
        )
      }

      const [companies, total] = await Promise.all([
        EnhancedCompany.find(filters)
          .populate('createdBy', 'name email')
          .populate('ownerId', 'name email')
          .skip(skip)
          .limit(limit)
          .sort({createdAt: -1}),
        EnhancedCompany.countDocuments(filters)
      ])

      res.json({
        data: companies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Error obteniendo empresas:', error)
      res.status(500).json({
        error: 'Error al obtener las empresas desde el servidor'
      })
    }
  }

  /**
   * Obtener una empresa por ID
   */
  static getCompanyById = async (req: Request, res: Response) => {
    try {
      const {id} = req.params

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: 'ID de empresa inválido'})
      }

      const company = await EnhancedCompany.findById(id)
        .populate('createdBy', 'name email')
        .populate('ownerId', 'name email')

      if (!company) {
        return res.status(404).json({error: 'Empresa no encontrada'})
      }

      res.json(company)
    } catch (error) {
      console.error('Error obteniendo empresa:', error)
      res.status(500).json({
        error: 'Error al obtener la empresa desde el servidor'
      })
    }
  }

  /**
   * Obtener una empresa por slug
   */
  static getCompanyBySlug = async (req: Request, res: Response) => {
    try {
      const {slug} = req.params

      const company = await EnhancedCompany.findOne({slug})
        .populate('createdBy', 'name email')
        .populate('ownerId', 'name email')

      if (!company) {
        return res.status(404).json({error: 'Empresa no encontrada'})
      }

      res.json(company)
    } catch (error) {
      console.error('Error obteniendo empresa por slug:', error)
      res.status(500).json({
        error: 'Error al obtener la empresa desde el servidor'
      })
    }
  }

  /**
   * Obtener empresa con sus usuarios
   */
  static getCompanyWithUsers = async (req: Request, res: Response) => {
    try {
      const {id} = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const skip = (page - 1) * limit

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: 'ID de empresa inválido'})
      }

      const company = await EnhancedCompany.findById(id)
        .populate('createdBy', 'name email')
        .populate('ownerId', 'name email')

      if (!company) {
        return res.status(404).json({error: 'Empresa no encontrada'})
      }

      const [users, totalUsers] = await Promise.all([
        User.find({companyId: id})
          .select('name email role status confirmed')
          .skip(skip)
          .limit(limit)
          .sort({createdAt: -1}),
        User.countDocuments({companyId: id})
      ])

      res.json({
        company,
        users,
        totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        usage: company.getUsagePercentage()
      })
    } catch (error) {
      console.error('Error obteniendo empresa con usuarios:', error)
      res.status(500).json({
        error: 'Error al obtener la empresa y sus usuarios'
      })
    }
  }

  /**
   * Actualizar una empresa
   */
  static updateCompany = async (req: Request, res: Response) => {
    try {
      const {id} = req.params
      const updateData = req.body

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: 'ID de empresa inválido'})
      }

      // Verificar si existe otra empresa con el mismo taxId
      if (updateData.settings?.taxId) {
        const existingCompany = await EnhancedCompany.findOne({
          'settings.taxId': updateData.settings.taxId,
          _id: {$ne: id}
        })

        if (existingCompany) {
          return res.status(400).json({
            message: 'Ya existe otra empresa con este RUT/Tax ID'
          })
        }
      }

      // Verificar si existe otra empresa con el mismo slug
      if (updateData.slug) {
        const existingSlug = await EnhancedCompany.findOne({
          slug: updateData.slug,
          _id: {$ne: id}
        })

        if (existingSlug) {
          return res.status(400).json({
            message: 'Ya existe otra empresa con este identificador único'
          })
        }
      }

      const updatedCompany = await EnhancedCompany.findByIdAndUpdate(
        id,
        updateData,
        {new: true, runValidators: true}
      ).populate('createdBy ownerId', 'name email')

      if (!updatedCompany) {
        return res.status(404).json({error: 'Empresa no encontrada'})
      }

      res.json({
        message: 'Empresa actualizada correctamente',
        company: updatedCompany
      })
    } catch (error) {
      console.error('Error actualizando empresa:', error)

      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          error: 'Error de validación',
          details: error.message
        })
      }

      res.status(500).json({
        error: 'Error al actualizar la empresa'
      })
    }
  }

  /**
   * Eliminar una empresa
   */
  static deleteCompany = async (req: Request, res: Response) => {
    try {
      const {id} = req.params

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: 'ID de empresa inválido'})
      }

      // Verificar si la empresa tiene usuarios asociados
      const userCount = await User.countDocuments({companyId: id})

      if (userCount > 0) {
        return res.status(400).json({
          error:
            'No se puede eliminar la empresa porque tiene usuarios asociados',
          userCount
        })
      }

      const company = await EnhancedCompany.findById(id)

      if (!company) {
        return res.status(404).json({error: 'Empresa no encontrada'})
      }

      await company.deleteOne()

      res.json({
        message: 'Empresa eliminada correctamente'
      })
    } catch (error) {
      console.error('Error eliminando empresa:', error)
      res.status(500).json({
        error: 'Error al eliminar la empresa'
      })
    }
  }

  /**
   * Obtener estadísticas de la empresa
   */
  static getCompanyStats = async (req: Request, res: Response) => {
    try {
      const {id} = req.params

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: 'ID de empresa inválido'})
      }

      const company = await EnhancedCompany.findById(id)

      if (!company) {
        return res.status(404).json({error: 'Empresa no encontrada'})
      }

      // Actualizar estadísticas en tiempo real
      const userCount = await User.countDocuments({companyId: id})

      await EnhancedCompany.findByIdAndUpdate(id, {
        'stats.totalUsers': userCount,
        'stats.lastActivity': new Date()
      })

      const updatedCompany = await EnhancedCompany.findById(id)

      res.json({
        stats: updatedCompany!.stats,
        usage: updatedCompany!.getUsagePercentage(),
        limits: updatedCompany!.settings.limits,
        isActive: updatedCompany!.isActive(),
        canAddUser: updatedCompany!.canAddUser(),
        isTrialExpired: updatedCompany!.isTrialExpired()
      })
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      res.status(500).json({
        error: 'Error al obtener las estadísticas de la empresa'
      })
    }
  }

  /**
   * Actualizar configuraciones de la empresa
   */
  static updateCompanySettings = async (req: Request, res: Response) => {
    try {
      const {id} = req.params
      const {settings} = req.body

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: 'ID de empresa inválido'})
      }

      const company = await EnhancedCompany.findByIdAndUpdate(
        id,
        {$set: {settings}},
        {new: true, runValidators: true}
      )

      if (!company) {
        return res.status(404).json({error: 'Empresa no encontrada'})
      }

      res.json({
        message: 'Configuraciones actualizadas correctamente',
        settings: company.settings
      })
    } catch (error) {
      console.error('Error actualizando configuraciones:', error)
      res.status(500).json({
        error: 'Error al actualizar las configuraciones'
      })
    }
  }

  /**
   * Obtener resumen general de todas las empresas (Dashboard Super Admin)
   */
  static getCompaniesSummary = async (req: Request, res: Response) => {
    try {
      const [
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        trialCompanies,
        companiesData
      ] = await Promise.all([
        EnhancedCompany.countDocuments(),
        EnhancedCompany.countDocuments({status: 'active'}),
        EnhancedCompany.countDocuments({status: 'suspended'}),
        EnhancedCompany.countDocuments({plan: 'free'}),
        EnhancedCompany.find()
          .select('plan settings.industry name createdAt')
          .sort({createdAt: -1})
          .limit(10)
      ])

      // Distribución por planes
      const planDistribution = await EnhancedCompany.aggregate([
        {$group: {_id: '$plan', count: {$sum: 1}}}
      ])

      // Distribución por industria
      const industryDistribution = await EnhancedCompany.aggregate([
        {$group: {_id: '$settings.industry', count: {$sum: 1}}}
      ])

      // Formatear datos para el response
      const planDistributionFormatted = planDistribution.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {})

      const industryDistributionFormatted = industryDistribution.reduce(
        (acc, item) => {
          acc[item._id || 'Sin especificar'] = item.count
          return acc
        },
        {}
      )

      // Actividad reciente (simulada por ahora)
      const recentActivity = companiesData.map(company => ({
        companyId: company._id.toString(),
        companyName: company.name,
        action: 'Última actualización',
        timestamp: new Date()
      }))

      res.json({
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        trialCompanies,
        planDistribution: planDistributionFormatted,
        industryDistribution: industryDistributionFormatted,
        recentActivity
      })
    } catch (error) {
      console.error('Error obteniendo resumen de empresas:', error)
      res.status(500).json({
        error: 'Error al obtener el resumen de empresas'
      })
    }
  }
}
