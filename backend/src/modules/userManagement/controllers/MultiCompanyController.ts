/**
 * Multi-Company Management Controllers
 * @description: Controladores para gestión de empresas en arquitectura multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Request, Response} from 'express'
import {Types} from 'mongoose'
import EnhancedCompany from '../../companiesManagement/models/EnhancedCompany'
import EnhancedUser from '@/modules/userManagement/models/EnhancedUser'

export class MultiCompanyController {
  /**
   * Obtener todas las empresas (Solo Super Admin)
   */
  static getAllCompanies = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = (req.query.search as string) || ''
      const status = (req.query.status as string) || ''
      const plan = (req.query.plan as string) || ''

      // Construir filtros
      const filters: any = {}

      if (search) {
        filters.$or = [
          {name: {$regex: search, $options: 'i'}},
          {slug: {$regex: search, $options: 'i'}},
          {'businessInfo.businessName': {$regex: search, $options: 'i'}}
        ]
      }

      if (status) {
        filters.status = status
      }

      if (plan) {
        filters['subscription.planType'] = plan
      }

      const skip = (page - 1) * limit

      const [companies, total] = await Promise.all([
        EnhancedCompany.find(filters)
          .select('-settings.apiKeys')
          .sort({createdAt: -1})
          .skip(skip)
          .limit(limit),
        EnhancedCompany.countDocuments(filters)
      ])

      res.status(200).json({
        companies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Error al obtener empresas:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener empresa actual del contexto
   */
  static getCurrentCompany = async (req: Request, res: Response) => {
    try {
      const companyId = req.companyContext?.id

      if (!companyId) {
        return res.status(400).json({
          error: 'Contexto de empresa no encontrado'
        })
      }

      const company = await EnhancedCompany.findById(companyId).select(
        '-settings.apiKeys'
      )

      if (!company) {
        return res.status(404).json({
          error: 'Empresa no encontrada'
        })
      }

      res.status(200).json({
        company
      })
    } catch (error) {
      console.error('Error al obtener empresa actual:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Crear nueva empresa (Solo Super Admin)
   */
  static createCompany = async (req: Request, res: Response) => {
    try {
      const {
        name,
        slug,
        description,
        website,
        email,
        phone,
        address,
        settings = {},
        plan = 'free'
      } = req.body

      // Validar que el slug no exista
      const existingCompany = await EnhancedCompany.findOne({slug})
      if (existingCompany) {
        return res.status(409).json({
          error: 'Ya existe una empresa con este identificador'
        })
      }

      // Validar que el email no exista
      const existingEmail = await EnhancedCompany.findOne({email})
      if (existingEmail) {
        return res.status(409).json({
          error: 'Ya existe una empresa con este email'
        })
      }

      // Configuraciones por defecto
      const defaultSettings = {
        businessType: 'other',
        industry: 'General',
        taxId: `temp-${Date.now()}`, // Se actualizará después
        currency: 'CLP',
        fiscalYear: {
          startMonth: 1,
          endMonth: 12
        },
        features: {
          inventory: true,
          accounting: false,
          hrm: false,
          crm: false,
          projects: false
        },
        limits: {
          maxUsers:
            plan === 'enterprise'
              ? 100
              : plan === 'professional'
              ? 50
              : plan === 'basic'
              ? 10
              : 5,
          maxProducts:
            plan === 'enterprise'
              ? 10000
              : plan === 'professional'
              ? 5000
              : plan === 'basic'
              ? 1000
              : 100,
          maxTransactions:
            plan === 'enterprise'
              ? 100000
              : plan === 'professional'
              ? 50000
              : plan === 'basic'
              ? 10000
              : 1000,
          storageGB:
            plan === 'enterprise'
              ? 100
              : plan === 'professional'
              ? 50
              : plan === 'basic'
              ? 10
              : 1
        },
        branding: {
          logo: null,
          primaryColor: '#3B82F6',
          secondaryColor: '#64748B',
          favicon: null
        },
        notifications: {
          emailDomain: null,
          smsProvider: null,
          webhookUrl: null
        },
        ...settings
      }

      const newCompany = new EnhancedCompany({
        name,
        slug,
        description,
        website,
        email,
        phone,
        address: {
          street: address?.street || '',
          city: address?.city || '',
          state: address?.state || '',
          country: address?.country || 'Chile',
          postalCode: address?.postalCode || ''
        },
        status: plan === 'free' ? 'trial' : 'active',
        plan,
        settings: defaultSettings,
        createdBy: new Types.ObjectId(req.user!.id),
        ownerId: new Types.ObjectId(req.user!.id),
        stats: {
          totalUsers: 0,
          totalProducts: 0,
          lastActivity: new Date(),
          storageUsed: 0
        }
      })

      await newCompany.save()

      res.status(201).json({
        message: 'Empresa creada exitosamente',
        company: newCompany
      })
    } catch (error) {
      console.error('Error al crear empresa:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Actualizar empresa
   */
  static updateCompany = async (req: Request, res: Response) => {
    try {
      const {companyId} = req.params
      const {name, description, website, email, phone, address, settings} =
        req.body

      if (!Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({
          error: 'ID de empresa inválido'
        })
      }

      const company = await EnhancedCompany.findById(companyId)
      if (!company) {
        return res.status(404).json({
          error: 'Empresa no encontrada'
        })
      }

      // Construir campos de actualización con tipado correcto
      const updateFields: Partial<{
        name: string
        description: string
        website: string
        email: string
        phone: string
        address: {
          street: string
          city: string
          state: string
          country: string
          postalCode: string
        }
        settings: typeof company.settings
      }> = {}

      if (name) updateFields.name = name
      if (description) updateFields.description = description
      if (website) updateFields.website = website
      if (email) updateFields.email = email
      if (phone) updateFields.phone = phone
      if (address) updateFields.address = {...company.address, ...address}
      if (settings) updateFields.settings = {...company.settings, ...settings}

      const updatedCompany = await EnhancedCompany.findByIdAndUpdate(
        companyId,
        updateFields,
        {new: true, runValidators: true}
      )

      res.status(200).json({
        message: 'Empresa actualizada exitosamente',
        company: updatedCompany
      })
    } catch (error) {
      console.error('Error al actualizar empresa:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Actualizar configuración de empresa
   */
  static updateCompanySettings = async (req: Request, res: Response) => {
    try {
      const companyId = req.companyContext?.id || req.params.companyId
      const {settings} = req.body

      if (!companyId) {
        return res.status(400).json({
          error: 'ID de empresa requerido'
        })
      }

      const company = await EnhancedCompany.findById(companyId)
      if (!company) {
        return res.status(404).json({
          error: 'Empresa no encontrada'
        })
      }

      // Actualizar solo configuraciones específicas
      const updatedSettings = {
        ...company.settings,
        ...settings
      }

      const updatedCompany = await EnhancedCompany.findByIdAndUpdate(
        companyId,
        {settings: updatedSettings},
        {new: true, runValidators: true}
      ).select('-settings.apiKeys')

      res.status(200).json({
        message: 'Configuración actualizada exitosamente',
        company: updatedCompany
      })
    } catch (error) {
      console.error('Error al actualizar configuración:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Actualizar plan de empresa
   */
  static updateSubscription = async (req: Request, res: Response) => {
    try {
      const {companyId} = req.params
      const {plan, features, limits} = req.body

      if (!Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({
          error: 'ID de empresa inválido'
        })
      }

      const company = await EnhancedCompany.findById(companyId)
      if (!company) {
        return res.status(404).json({
          error: 'Empresa no encontrada'
        })
      }

      // Actualizar plan y configuraciones relacionadas
      const updateFields: Partial<{
        plan: string
        status: string
        settings: typeof company.settings
        subscriptionEndsAt: Date
      }> = {}

      if (plan) {
        updateFields.plan = plan

        // Actualizar límites según el plan
        const planLimits = {
          free: {
            maxUsers: 5,
            maxProducts: 100,
            maxTransactions: 1000,
            storageGB: 1
          },
          basic: {
            maxUsers: 10,
            maxProducts: 1000,
            maxTransactions: 10000,
            storageGB: 10
          },
          professional: {
            maxUsers: 50,
            maxProducts: 5000,
            maxTransactions: 50000,
            storageGB: 50
          },
          enterprise: {
            maxUsers: 100,
            maxProducts: 10000,
            maxTransactions: 100000,
            storageGB: 100
          }
        }

        const newLimits =
          limits ||
          planLimits[plan as keyof typeof planLimits] ||
          planLimits.free

        updateFields.settings = {
          ...company.settings,
          limits: newLimits,
          ...(features && {
            features: {...company.settings.features, ...features}
          })
        }

        // Actualizar estado si es plan de pago
        if (plan !== 'free') {
          updateFields.status = 'active'
          updateFields.subscriptionEndsAt = new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ) // 1 año
        }
      }

      const updatedCompany = await EnhancedCompany.findByIdAndUpdate(
        companyId,
        updateFields,
        {new: true, runValidators: true}
      )

      res.status(200).json({
        message: 'Plan actualizado exitosamente',
        company: updatedCompany
      })
    } catch (error) {
      console.error('Error al actualizar plan:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Suspender empresa
   */
  static suspendCompany = async (req: Request, res: Response) => {
    try {
      const {companyId} = req.params
      const {reason} = req.body

      if (!Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({
          error: 'ID de empresa inválido'
        })
      }

      const company = await EnhancedCompany.findById(companyId)
      if (!company) {
        return res.status(404).json({
          error: 'Empresa no encontrada'
        })
      }

      // Suspender empresa
      company.status = 'suspended'

      await company.save()

      // Desactivar todos los usuarios de la empresa
      await EnhancedUser.updateMany(
        {'roles.companyId': companyId},
        {
          $set: {
            'roles.$.isActive': false,
            status: 'suspended'
          }
        }
      )

      res.status(200).json({
        message: 'Empresa suspendida exitosamente',
        reason: reason || 'Suspendido por administrador'
      })
    } catch (error) {
      console.error('Error al suspender empresa:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Reactivar empresa
   */
  static reactivateCompany = async (req: Request, res: Response) => {
    try {
      const {companyId} = req.params

      if (!Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({
          error: 'ID de empresa inválido'
        })
      }

      const company = await EnhancedCompany.findById(companyId)
      if (!company) {
        return res.status(404).json({
          error: 'Empresa no encontrada'
        })
      }

      // Reactivar empresa
      company.status = 'active'

      await company.save()

      // Reactivar usuarios de la empresa
      await EnhancedUser.updateMany(
        {'roles.companyId': companyId},
        {
          $set: {
            'roles.$.isActive': true,
            status: 'active'
          }
        }
      )

      res.status(200).json({
        message: 'Empresa reactivada exitosamente'
      })
    } catch (error) {
      console.error('Error al reactivar empresa:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener estadísticas de empresa
   */
  static getCompanyStats = async (req: Request, res: Response) => {
    try {
      const companyId = req.companyContext?.id || req.params.companyId

      if (!companyId) {
        return res.status(400).json({
          error: 'ID de empresa requerido'
        })
      }

      const [company, userCount, activeUserCount] = await Promise.all([
        EnhancedCompany.findById(companyId).select('stats subscription'),
        EnhancedUser.countDocuments({'roles.companyId': companyId}),
        EnhancedUser.countDocuments({
          'roles.companyId': companyId,
          'roles.isActive': true,
          status: 'active'
        })
      ])

      if (!company) {
        return res.status(404).json({
          error: 'Empresa no encontrada'
        })
      }

      res.status(200).json({
        stats: {
          ...company.stats,
          totalUsers: userCount,
          activeUsers: activeUserCount,
          userLimit: company.settings?.limits?.maxUsers || 10,
          usagePercentage: company.settings?.limits?.maxUsers
            ? Math.round((userCount / company.settings.limits.maxUsers) * 100)
            : 0
        }
      })
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}

export default MultiCompanyController
