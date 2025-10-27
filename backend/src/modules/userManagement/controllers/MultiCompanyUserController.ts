/**
 * Multi-Company User Management Controllers
 * @description: Controladores para gestión de usuarios en arquitectura multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Request, Response} from 'express'
import {Types} from 'mongoose'
import EnhancedUser from '../../../models/EnhancedUser'
import EnhancedCompany from '../../../models/EnhancedCompany'
import MultiCompanyPermissionChecker from '../../../utils/multiCompanyPermissions'
import {hashPassword} from '../../../utils/authUtils'
import {generateJWT} from '../../../utils/jwt'

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
        users,
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
        users,
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

      // Validar que el email no exista
      const existingUser = await EnhancedUser.findOne({
        email: email.toLowerCase()
      })
      if (existingUser) {
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
          return res.status(400).json({
            error: 'La empresa ha alcanzado el límite de usuarios'
          })
        }
      }

      // Crear el usuario
      const hashedPassword = await hashPassword(password)

      const newUser = new EnhancedUser({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        status: 'active',
        confirmed: true,
        emailVerified: true,
        createdBy: req.user?.id,
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
            assignedBy: new Types.ObjectId(req.user!.id)
          }
        ],
        primaryCompanyId:
          roleType === 'company' ? new Types.ObjectId(companyId) : undefined
      })

      await newUser.save()

      // Actualizar estadísticas de la empresa
      if (roleType === 'company') {
        await EnhancedCompany.findByIdAndUpdate(companyId, {
          $inc: {'stats.totalUsers': 1},
          $set: {'stats.lastActivity': new Date()}
        })
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
      const currentUser = req.user
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
        assignedBy: new Types.ObjectId(req.user!.id)
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
      const userId = req.user?.id

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
}

export default MultiCompanyUserController
