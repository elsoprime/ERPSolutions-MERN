/**
 * Multi-Company User Management Controllers
 * @description: Controladores para gestión de usuarios en arquitectura multicompañía
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Request, Response} from 'express'
import {Types} from 'mongoose'
import EnhancedUser from '../models/EnhancedUser'
import EnhancedCompany from '../../companiesManagement/models/EnhancedCompany'
import MultiCompanyPermissionChecker from '../../../utils/multiCompanyPermissions'
import {hashPassword} from '../../../utils/authUtils'
import {generateJWT} from '../../../utils/jwt'
import {AuthEmail} from '../../../email/AuthEmail'

export class MultiCompanyUserController {
  /**
   * Obtener todos los usuarios (Solo Super Admin)
   */
  static getAllUsers = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = (req.query.search as string) || ''
      const role = (req.query.role as string) || ''
      const status = (req.query.status as string) || ''

      // Construir filtros
      const filters: any = {}

      if (search) {
        filters.$or = [
          {name: {$regex: search, $options: 'i'}},
          {email: {$regex: search, $options: 'i'}}
        ]
      }

      if (status) {
        filters.status = status
      }

      // Filtro por rol (buscar en el array de roles)
      if (role) {
        filters['roles.role'] = role
      }

      const skip = (page - 1) * limit

      const [users, total] = await Promise.all([
        EnhancedUser.find(filters)
          .select('-password')
          .populate('primaryCompanyId', 'name slug')
          .populate('roles.companyId', 'name slug')
          .sort({createdAt: -1})
          .skip(skip)
          .limit(limit),
        EnhancedUser.countDocuments(filters)
      ])

      res.status(200).json({
        data: users, // ✅ Cambiado de "users" a "data" para consistencia
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener usuarios de una empresa específica
   */
  static getCompanyUsers = async (req: Request, res: Response) => {
    try {
      const companyId = req.companyContext?.id
      if (!companyId) {
        return res.status(400).json({
          error: 'ID de empresa requerido'
        })
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = (req.query.search as string) || ''
      const role = (req.query.role as string) || ''

      // Construir filtros
      const filters: any = {
        roles: {
          $elemMatch: {
            companyId: companyId,
            isActive: true
          }
        }
      }

      if (search) {
        filters.$or = [
          {name: {$regex: search, $options: 'i'}},
          {email: {$regex: search, $options: 'i'}}
        ]
      }

      if (role) {
        filters['roles'] = {
          $elemMatch: {
            companyId: companyId,
            role: role,
            isActive: true
          }
        }
      }

      const skip = (page - 1) * limit

      const [users, total] = await Promise.all([
        EnhancedUser.find(filters)
          .select('-password')
          .populate('primaryCompanyId', 'name slug')
          .sort({createdAt: -1})
          .skip(skip)
          .limit(limit),
        EnhancedUser.countDocuments(filters)
      ])

      res.status(200).json({
        data: users, // ✅ Cambiado de "users" a "data" para consistencia
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        company: req.companyContext
      })
    } catch (error) {
      console.error('Error al obtener usuarios de la empresa:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Crear un nuevo usuario
   */
  static createUser = async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        roleType,
        role,
        companyId,
        permissions = []
      } = req.body

      console.log('📋 Permisos recibidos:', permissions)

      // Normalizar email
      const normalizedEmail = email.toLowerCase().trim()

      // Validar que el email no exista (case-insensitive)
      const existingUser = await EnhancedUser.findOne({
        email: {$regex: new RegExp(`^${normalizedEmail}$`, 'i')}
      })

      if (existingUser) {
        console.log(`❌ Email duplicado: ${normalizedEmail}`)
        return res.status(409).json({
          error: 'Ya existe un usuario con este correo electrónico'
        })
      }

      // Validar empresa si es rol de empresa
      if (roleType === 'company') {
        if (!companyId) {
          return res.status(400).json({
            error: 'ID de empresa requerido para roles de empresa'
          })
        }

        const company = await EnhancedCompany.findById(companyId)
        if (!company) {
          return res.status(404).json({
            error: 'Empresa no encontrada'
          })
        }

        // Verificar si la empresa puede agregar más usuarios
        if (!company.canAddUser()) {
          console.log(`❌ Límite de usuarios alcanzado para ${company.name}:`, {
            totalUsers: company.stats.totalUsers,
            maxUsers: company.settings.limits.maxUsers
          })
          return res.status(400).json({
            error: `La empresa ha alcanzado el límite de usuarios (${company.stats.totalUsers}/${company.settings.limits.maxUsers})`
          })
        }
      }

      // Crear el usuario
      const hashedPassword = await hashPassword(password)

      console.log('💾 Guardando usuario con permisos:', permissions)

      const newUser = new EnhancedUser({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        status: 'active',
        confirmed: true,
        emailVerified: true,
        createdBy: req.authUser?.id,
        roles: [
          {
            roleType,
            role,
            companyId:
              roleType === 'company'
                ? new Types.ObjectId(companyId)
                : undefined,
            permissions,
            isActive: true,
            assignedAt: new Date(),
            assignedBy: req.authUser?.id
              ? new Types.ObjectId(req.authUser.id)
              : undefined
          }
        ],
        primaryCompanyId:
          roleType === 'company' ? new Types.ObjectId(companyId) : undefined
      })

      await newUser.save()

      console.log(
        '✅ Usuario guardado con permisos:',
        newUser.roles[0].permissions
      )

      // Actualizar estadísticas de la empresa
      if (roleType === 'company') {
        await EnhancedCompany.findByIdAndUpdate(companyId, {
          $inc: {'stats.totalUsers': 1},
          $set: {'stats.lastActivity': new Date()}
        })
      }

      // Enviar email de bienvenida
      try {
        let companyName = 'ERPSolutions Platform'
        if (roleType === 'company' && companyId) {
          const company = await EnhancedCompany.findById(companyId).select(
            'name'
          )
          if (company) {
            companyName = company.name
          }
        }

        await AuthEmail.sendWelcomeEmail({
          email: newUser.email,
          name: newUser.name,
          companyName,
          role
        })
        console.log(
          `✅ Email de bienvenida enviado via Resend a: ${newUser.email}`
        )
      } catch (emailError) {
        console.error(
          '⚠️ Error al enviar email de bienvenida (Resend):',
          emailError
        )
        // No fallar la creación del usuario si el email falla
      }

      // Devolver usuario sin password
      const userResponse = await EnhancedUser.findById(newUser._id)
        .select('-password')
        .populate('primaryCompanyId', 'name slug')
        .populate('roles.companyId', 'name slug')

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: userResponse
      })
    } catch (error) {
      console.error('Error al crear usuario:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Actualizar un usuario
   */
  static updateUser = async (req: Request, res: Response) => {
    try {
      const {userId} = req.params
      const {name, phone, status, preferences} = req.body

      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          error: 'ID de usuario inválido'
        })
      }

      const user = await EnhancedUser.findById(userId)
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        })
      }

      // Verificar permisos para editar este usuario
      const currentUser = req.authUser
      const companyId = req.companyContext?.id

      if (!currentUser) {
        return res.status(401).json({
          error: 'Usuario no autenticado'
        })
      }

      // Super admin puede editar cualquier usuario
      const isSuperAdmin =
        req.userPermissions?.global.includes('companies.list_all')

      // Admin de empresa puede editar usuarios de su empresa
      const isCompanyAdmin = companyId && user.hasRoleInCompany(companyId)

      if (!isSuperAdmin && !isCompanyAdmin) {
        return res.status(403).json({
          error: 'No tienes permisos para editar este usuario'
        })
      }

      // Actualizar campos permitidos
      const updateFields: any = {}
      if (name) updateFields.name = name
      if (phone) updateFields.phone = phone
      if (status) updateFields.status = status
      if (preferences)
        updateFields.preferences = {...user.preferences, ...preferences}

      const updatedUser = await EnhancedUser.findByIdAndUpdate(
        userId,
        updateFields,
        {new: true, runValidators: true}
      )
        .select('-password')
        .populate('primaryCompanyId', 'name slug')
        .populate('roles.companyId', 'name slug')

      res.status(200).json({
        message: 'Usuario actualizado exitosamente',
        user: updatedUser
      })
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Asignar rol a un usuario
   */
  static assignRole = async (req: Request, res: Response) => {
    try {
      const {userId} = req.params
      const {roleType, role, companyId, permissions = []} = req.body

      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          error: 'ID de usuario inválido'
        })
      }

      const user = await EnhancedUser.findById(userId)
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        })
      }

      // Validar empresa si es rol de empresa
      if (roleType === 'company' && companyId) {
        const company = await EnhancedCompany.findById(companyId)
        if (!company) {
          return res.status(404).json({
            error: 'Empresa no encontrada'
          })
        }
      }

      // Verificar si ya tiene un rol activo en esta empresa
      if (roleType === 'company' && companyId) {
        const existingRole = user.roles.find(
          r =>
            r.roleType === 'company' &&
            r.companyId?.toString() === companyId &&
            r.isActive
        )

        if (existingRole) {
          return res.status(400).json({
            error: 'El usuario ya tiene un rol activo en esta empresa'
          })
        }
      }

      // Agregar nuevo rol
      user.roles.push({
        roleType,
        role,
        companyId:
          roleType === 'company' ? new Types.ObjectId(companyId) : undefined,
        permissions,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: req.authUser?.id
          ? new Types.ObjectId(req.authUser.id)
          : undefined
      })

      // Si es el primer rol de empresa, establecerlo como primario
      if (roleType === 'company' && !user.primaryCompanyId) {
        user.primaryCompanyId = new Types.ObjectId(companyId)
      }

      await user.save()

      const updatedUser = await EnhancedUser.findById(userId)
        .select('-password')
        .populate('primaryCompanyId', 'name slug')
        .populate('roles.companyId', 'name slug')

      res.status(200).json({
        message: 'Rol asignado exitosamente',
        user: updatedUser
      })
    } catch (error) {
      console.error('Error al asignar rol:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Revocar rol de un usuario
   */
  static revokeRole = async (req: Request, res: Response) => {
    try {
      const {userId} = req.params
      const {roleIndex} = req.body

      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          error: 'ID de usuario inválido'
        })
      }

      const user = await EnhancedUser.findById(userId)
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        })
      }

      if (roleIndex < 0 || roleIndex >= user.roles.length) {
        return res.status(400).json({
          error: 'Índice de rol inválido'
        })
      }

      // Desactivar el rol
      user.roles[roleIndex].isActive = false

      await user.save()

      const updatedUser = await EnhancedUser.findById(userId)
        .select('-password')
        .populate('primaryCompanyId', 'name slug')
        .populate('roles.companyId', 'name slug')

      res.status(200).json({
        message: 'Rol revocado exitosamente',
        user: updatedUser
      })
    } catch (error) {
      console.error('Error al revocar rol:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  static deleteUser = async (req: Request, res: Response) => {
    try {
      const {userId} = req.params

      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          error: 'ID de usuario inválido'
        })
      }

      const user = await EnhancedUser.findById(userId)
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        })
      }

      // Soft delete - cambiar status a inactive
      user.status = 'inactive'

      // Desactivar todos los roles
      user.roles.forEach(role => {
        role.isActive = false
      })

      await user.save()

      res.status(200).json({
        message: 'Usuario eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  static getProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.authUser?.id

      if (!userId) {
        return res.status(401).json({
          error: 'Usuario no autenticado'
        })
      }

      const user = await EnhancedUser.findById(userId)
        .select('-password')
        .populate('primaryCompanyId', 'name slug')
        .populate('roles.companyId', 'name slug')

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        })
      }

      res.status(200).json({
        user
      })
    } catch (error) {
      console.error('Error al obtener perfil:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener estadísticas de usuarios (Solo Super Admin)
   */
  static getUsersStats = async (req: Request, res: Response) => {
    try {
      // Total de usuarios
      const totalUsers = await EnhancedUser.countDocuments()

      // Usuarios por estado
      const [activeUsers, inactiveUsers, suspendedUsers] = await Promise.all([
        EnhancedUser.countDocuments({status: 'active'}),
        EnhancedUser.countDocuments({status: 'inactive'}),
        EnhancedUser.countDocuments({status: 'suspended'})
      ])

      // Distribución por roles
      const allUsers = await EnhancedUser.find({status: {$ne: 'inactive'}})
      const roleDistribution: Record<string, number> = {}

      allUsers.forEach(user => {
        user.roles
          .filter(r => r.isActive)
          .forEach(r => {
            const roleName = r.role || 'sin_rol'
            roleDistribution[roleName] = (roleDistribution[roleName] || 0) + 1
          })
      })

      // Distribución por empresa
      const companyDistribution: Record<string, number> = {}
      const companies = await EnhancedCompany.find({status: 'active'}).select(
        'name'
      )

      for (const company of companies) {
        const count = await EnhancedUser.countDocuments({
          'roles.companyId': company._id,
          'roles.isActive': true
        })
        if (count > 0) {
          companyDistribution[company.name] = count
        }
      }

      // Usuarios sin empresa (solo roles globales)
      const usersWithoutCompany = await EnhancedUser.countDocuments({
        primaryCompanyId: null,
        status: {$ne: 'inactive'}
      })
      if (usersWithoutCompany > 0) {
        companyDistribution['Sin empresa'] = usersWithoutCompany
      }

      // Actividad reciente (últimos 10 usuarios activos)
      const recentUsers = await EnhancedUser.find({status: {$ne: 'inactive'}})
        .select('name email lastLogin createdAt')
        .sort({lastLogin: -1})
        .limit(10)
        .lean()

      const recentActivity = recentUsers.map((user: any) => ({
        userId: user._id.toString(),
        userName: user.name,
        action: user.lastLogin ? 'Inició sesión' : 'Cuenta creada',
        timestamp: user.lastLogin || user.createdAt
      }))

      // Crecimiento mensual
      const currentDate = new Date()
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      )

      const newUsersThisMonth = await EnhancedUser.countDocuments({
        createdAt: {$gte: firstDayOfMonth}
      })

      // Usuarios activados este mes (cambiados de inactive a active)
      const activationsThisMonth = await EnhancedUser.countDocuments({
        status: 'active',
        updatedAt: {$gte: firstDayOfMonth}
      })

      // Usuarios desactivados este mes
      const deactivationsThisMonth = await EnhancedUser.countDocuments({
        status: 'inactive',
        updatedAt: {$gte: firstDayOfMonth}
      })

      // Tendencias mensuales (últimos 6 meses)
      const monthlyTrends = []
      const monthNames = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic'
      ]

      for (let i = 5; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        )
        const nextDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i + 1,
          1
        )

        const [totalInMonth, activeInMonth, inactiveInMonth, newInMonth] =
          await Promise.all([
            EnhancedUser.countDocuments({
              createdAt: {$lt: nextDate}
            }),
            EnhancedUser.countDocuments({
              status: 'active',
              createdAt: {$lt: nextDate}
            }),
            EnhancedUser.countDocuments({
              status: 'inactive',
              createdAt: {$lt: nextDate}
            }),
            EnhancedUser.countDocuments({
              createdAt: {$gte: date, $lt: nextDate}
            })
          ])

        monthlyTrends.push({
          month: monthNames[date.getMonth()],
          total: totalInMonth,
          active: activeInMonth,
          inactive: inactiveInMonth,
          newUsers: newInMonth
        })
      }

      res.status(200).json({
        success: true,
        data: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          suspended: suspendedUsers,
          byRole: roleDistribution,
          byCompany: companyDistribution,
          recent: recentActivity,
          monthlyGrowth: {
            newUsers: newUsersThisMonth,
            activations: activationsThisMonth,
            deactivations: deactivationsThisMonth
          },
          monthlyTrends
        }
      })
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }
}

export default MultiCompanyUserController
