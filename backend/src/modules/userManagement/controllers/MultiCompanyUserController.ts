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

        // 🔒 Verificar que la empresa no esté suspendida
        if (company.status === 'suspended') {
          console.log(
            `🚫 Intento de crear usuario en empresa suspendida: ${company.name}`
          )
          return res.status(403).json({
            error: 'No se pueden crear usuarios en una empresa suspendida',
            details: {
              companyName: company.name,
              suspendedAt: company.suspendedAt,
              suspensionReason: company.suspensionReason
            }
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

      // ✅ Actualizar estadísticas de la empresa usando el método updateStats
      if (roleType === 'company' && companyId) {
        const company = await EnhancedCompany.findById(companyId)
        if (company) {
          await company.updateStats()
          console.log(`✅ Estadísticas actualizadas para empresa ${companyId}`)
        }
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
   * @description: Actualiza información del usuario excepto la contraseña (usar /password para eso)
   */
  static updateUser = async (req: Request, res: Response) => {
    try {
      const {userId} = req.params
      const {
        name,
        email,
        phone,
        status,
        preferences,
        password, // ⚠️ Ya no se acepta - usar endpoint /password
        role,
        permissions,
        companyId,
        roleType
      } = req.body

      // 🚫 Rechazar intentos de cambiar contraseña por este endpoint
      if (password !== undefined) {
        return res.status(400).json({
          success: false,
          error:
            'No se puede cambiar la contraseña desde este endpoint. Use PUT /api/users/:id/password',
          hint: 'Para cambiar la contraseña, use el endpoint dedicado que requiere la contraseña actual'
        })
      }

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
      const contextCompanyId = req.companyContext?.id

      if (!currentUser) {
        return res.status(401).json({
          error: 'Usuario no autenticado'
        })
      }

      // Super admin puede editar cualquier usuario - Verificación directa por rol
      const isSuperAdmin = currentUser.role === 'super_admin'

      // Admin de empresa puede editar usuarios de su empresa
      const isCompanyAdmin =
        (contextCompanyId && user.hasRoleInCompany(contextCompanyId)) ||
        (currentUser.role === 'admin_empresa' &&
          user.primaryCompanyId &&
          currentUser.companyId?.toString() ===
            user.primaryCompanyId.toString())

      if (!isSuperAdmin && !isCompanyAdmin) {
        return res.status(403).json({
          error: 'No tienes permisos para editar este usuario'
        })
      }

      // Guardar el status anterior para detectar cambios
      const previousStatus = user.status

      // 🔒 Si se intenta activar un usuario, verificar que la empresa no esté suspendida
      if (
        status === 'active' &&
        previousStatus !== 'active' &&
        user.primaryCompanyId
      ) {
        const company = await EnhancedCompany.findById(user.primaryCompanyId)
        if (company && company.status === 'suspended') {
          console.log(
            `🚫 Intento de activar usuario en empresa suspendida: ${company.name}`
          )
          return res.status(403).json({
            error: 'No se pueden activar usuarios en una empresa suspendida',
            details: {
              companyName: company.name,
              suspendedAt: company.suspendedAt,
              suspensionReason: company.suspensionReason
            }
          })
        }
      }

      // Actualizar campos básicos
      const updateFields: any = {}
      if (name) updateFields.name = name
      if (phone) updateFields.phone = phone
      if (status) updateFields.status = status
      if (preferences)
        updateFields.preferences = {...user.preferences, ...preferences}

      // � Si se proporciona un nuevo email, validar que no exista
      if (email && email.trim()) {
        const normalizedEmail = email.toLowerCase().trim()

        // Verificar que no sea el mismo email actual (case-insensitive)
        if (normalizedEmail !== user.email.toLowerCase()) {
          // Verificar que no exista otro usuario con ese email
          const existingUser = await EnhancedUser.findOne({
            email: {$regex: new RegExp(`^${normalizedEmail}$`, 'i')},
            _id: {$ne: userId} // Excluir el usuario actual
          })

          if (existingUser) {
            return res.status(409).json({
              error: 'Ya existe otro usuario con este correo electrónico'
            })
          }

          console.log(
            `📧 Actualizando email de ${user.email} a ${normalizedEmail}`
          )
          updateFields.email = normalizedEmail
        }
      }

      // 🔄 Si se proporcionan datos de rol, actualizar el rol principal
      if (role && roleType !== undefined) {
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

          // Verificar que la empresa no esté suspendida
          if (company.status === 'suspended') {
            return res.status(403).json({
              error: 'No se pueden asignar roles en una empresa suspendida',
              details: {
                companyName: company.name,
                suspendedAt: company.suspendedAt,
                suspensionReason: company.suspensionReason
              }
            })
          }
        }

        // Actualizar el rol principal (primer rol del array)
        const updatedRoles = [
          {
            roleType,
            role,
            companyId:
              roleType === 'company' && companyId
                ? new Types.ObjectId(companyId)
                : undefined,
            permissions: permissions || [],
            isActive: true,
            assignedAt: user.roles[0]?.assignedAt || new Date(),
            assignedBy:
              user.roles[0]?.assignedBy ||
              (currentUser?.id ? new Types.ObjectId(currentUser.id) : undefined)
          },
          // Mantener roles adicionales si existen
          ...user.roles.slice(1)
        ]

        updateFields.roles = updatedRoles
        updateFields.primaryCompanyId =
          roleType === 'company' && companyId
            ? new Types.ObjectId(companyId)
            : undefined

        console.log(`🔄 Actualizando rol de ${user.email}:`, {
          roleType,
          role,
          companyId,
          permissionsCount: permissions?.length || 0
        })
      } else if (permissions !== undefined && user.roles.length > 0) {
        // Si solo se actualizan permisos sin cambiar el rol
        const updatedRoles = [...user.roles]
        updatedRoles[0] = {
          ...updatedRoles[0],
          permissions
        }
        updateFields.roles = updatedRoles
        console.log(
          `📝 Actualizando permisos de ${user.email}: ${permissions.length} permisos`
        )
      }

      const updatedUser = await EnhancedUser.findByIdAndUpdate(
        userId,
        updateFields,
        {new: true, runValidators: true}
      )
        .select('-password')
        .populate('primaryCompanyId', 'name slug')
        .populate('roles.companyId', 'name slug')

      // ✅ Actualizar estadísticas de empresas si hubo cambios relevantes
      const previousCompanyId = user.primaryCompanyId?.toString()
      const newCompanyId = updateFields.primaryCompanyId?.toString()

      // Caso 1: Si cambió de empresa
      if (newCompanyId && previousCompanyId !== newCompanyId) {
        console.log(
          `🔄 Usuario cambió de empresa: ${previousCompanyId} → ${newCompanyId}`
        )

        // Actualizar estadísticas de la empresa anterior (decrementar)
        if (previousCompanyId) {
          const previousCompany = await EnhancedCompany.findById(
            previousCompanyId
          )
          if (previousCompany) {
            await previousCompany.updateStats()
            console.log(
              `📉 Estadísticas actualizadas para empresa anterior: ${previousCompany.name} (usuario removido)`
            )
          }
        }

        // Actualizar estadísticas de la nueva empresa (incrementar)
        const newCompany = await EnhancedCompany.findById(newCompanyId)
        if (newCompany) {
          await newCompany.updateStats()
          console.log(
            `📈 Estadísticas actualizadas para nueva empresa: ${newCompany.name} (usuario agregado)`
          )
        }
      }
      // Caso 2: Si solo cambió el status (sin cambio de empresa)
      else if (status && status !== previousStatus && user.primaryCompanyId) {
        const company = await EnhancedCompany.findById(user.primaryCompanyId)
        if (company) {
          await company.updateStats()
          console.log(
            `✅ Estadísticas actualizadas para empresa ${user.primaryCompanyId} por cambio de status de usuario`
          )
        }
      }

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

        // 🔒 Verificar que la empresa no esté suspendida
        if (company.status === 'suspended') {
          console.log(
            `🚫 Intento de asignar rol en empresa suspendida: ${company.name}`
          )
          return res.status(403).json({
            error: 'No se pueden asignar roles en una empresa suspendida',
            details: {
              companyName: company.name,
              suspendedAt: company.suspendedAt,
              suspensionReason: company.suspensionReason
            }
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
      const currentUser = req.authUser

      if (!currentUser) {
        return res.status(401).json({
          error: 'Usuario no autenticado'
        })
      }

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

      // ✅ Validar permisos - Verificación directa por rol para Super Admin
      const isSuperAdmin = currentUser.role === 'super_admin'
      const isCompanyAdmin =
        user.primaryCompanyId &&
        currentUser.companyId?.toString() ===
          user.primaryCompanyId.toString() &&
        (req.userPermissions?.company.includes('users.delete') ||
          currentUser.role === 'admin_empresa')

      if (!isSuperAdmin && !isCompanyAdmin) {
        console.log('❌ Permiso denegado:', {
          currentUserRole: currentUser.role,
          currentUserCompanyId: currentUser.companyId?.toString(),
          targetUserCompanyId: user.primaryCompanyId?.toString(),
          isSuperAdmin,
          isCompanyAdmin
        })
        return res.status(403).json({
          error: 'No tienes permisos para eliminar este usuario'
        })
      }

      // Obtener la empresa principal del usuario para actualizar estadísticas
      const companyId = user.primaryCompanyId

      // Soft delete - cambiar status a inactive
      user.status = 'inactive'

      // Desactivar todos los roles
      user.roles.forEach(role => {
        role.isActive = false
      })

      await user.save()

      console.log(
        `🗑️ Usuario ${userId} marcado como inactivo por ${currentUser.name}`
      )

      // ✅ Actualizar estadísticas de la empresa
      if (companyId) {
        const company = await EnhancedCompany.findById(companyId)
        if (company) {
          await company.updateStats()
          console.log(`✅ Estadísticas actualizadas para empresa ${companyId}`)
        }
      }

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

  /**
   * Cambiar contraseña de usuario
   * @description: Endpoint dedicado para cambio de contraseña que requiere contraseña actual
   * @route PUT /api/users/:id/password
   */
  static changePassword = async (req: Request, res: Response) => {
    try {
      const {id} = req.params
      const {currentPassword, newPassword, confirmPassword} = req.body

      // Validar que todos los campos estén presentes
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Todos los campos son requeridos'
        })
      }

      // Validar que las contraseñas nuevas coincidan
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña y la confirmación no coinciden'
        })
      }

      // Validar requisitos de contraseña
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe tener al menos 8 caracteres'
        })
      }

      if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe contener al menos una mayúscula'
        })
      }

      if (!/[a-z]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe contener al menos una minúscula'
        })
      }

      if (!/\d/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe contener al menos un número'
        })
      }

      // Buscar usuario con contraseña
      const user = await EnhancedUser.findById(id).select('+password')

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        })
      }

      // Verificar contraseña actual
      const isPasswordCorrect = await user.checkPassword(currentPassword)

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          error: 'La contraseña actual es incorrecta'
        })
      }

      // Verificar que la nueva contraseña sea diferente
      const isSamePassword = await user.checkPassword(newPassword)
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe ser diferente a la actual'
        })
      }

      // Hashear y guardar nueva contraseña
      user.password = await hashPassword(newPassword)
      await user.save()

      // Log de auditoría
      console.log(
        `✅ Contraseña cambiada exitosamente - Usuario: ${user.email} (${user._id})`
      )

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      })
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }
}

export default MultiCompanyUserController
