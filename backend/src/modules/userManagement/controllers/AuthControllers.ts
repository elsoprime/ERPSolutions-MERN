import type {Request, Response} from 'express'
import mongoose from 'mongoose'
import EnhancedUser, {
  IUser,
  IUserRole,
  GlobalRole,
  CompanyRole
} from '../models/EnhancedUser'
import {checkPassword, hashPassword} from '@/utils/authUtils'
import {generateToken} from '@/utils/generateToken'
import Token from '../models/Token'
import {AuthEmail} from '@/email/Resend'
import {generateJWT} from '@/utils/jwt'

export class AuthControllers {
  /**
   * @description Crear una nueva cuenta de usuario   *
   * @param req Esta es la solicitud HTTP entrante
   * @param res Esta es la respuesta HTTP saliente
   * @returns Una respuesta que indica que la ruta funciona correctamente
   * @author Esteban Leonardo Soto @elsoprimeDev
   */
  static createAccount = async (req: Request, res: Response) => {
    try {
      const {password, email, name, role = 'employee', companyId} = req.body

      // Verificar si el usuario ya existe
      const existingUser = await EnhancedUser.findOne({
        email: email.toLowerCase()
      })
      if (existingUser) {
        return res
          .status(409)
          .json({error: 'Ya existe una cuenta con este correo electrónico'})
      }

      // Validar que se proporcione companyId para roles de empresa
      if (
        !role.startsWith('super_admin') &&
        !role.startsWith('system_admin') &&
        !companyId
      ) {
        return res.status(400).json({
          error: 'Se requiere companyId para roles de empresa'
        })
      }

      // Crear estructura de rol para el nuevo usuario
      const userId = new mongoose.Types.ObjectId()
      const userRole: IUserRole = {
        roleType:
          role.startsWith('super_admin') || role.startsWith('system_admin')
            ? 'global'
            : 'company',
        role: role as GlobalRole | CompanyRole,
        companyId: companyId || undefined,
        permissions: [],
        isActive: true,
        assignedAt: new Date(),
        assignedBy: userId // Asignar a sí mismo para usuarios que se auto-registran
      }

      // Crear nuevo usuario con estructura EnhancedUser
      const userData = {
        _id: userId,
        name,
        email: email.toLowerCase(),
        password: await hashPassword(password),
        status: 'pending' as const,
        confirmed: false,
        emailVerified: false,
        roles: [userRole],
        primaryCompanyId: companyId || null,
        lastLogin: null,
        loginCount: 0,
        createdBy: null,
        preferences: {
          theme: 'light' as const,
          language: 'es',
          timezone: 'America/Santiago',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      }

      const user = new EnhancedUser(userData)

      const newToken = new Token({
        token: generateToken(),
        user: user.id,
        type: 'confirmation'
      })

      const result = await Promise.allSettled([user.save(), newToken.save()])

      const userResult = result[0]
      const tokenResult = result[1]

      if (userResult.status === 'rejected') {
        console.error('Error al guardar usuario:', userResult.reason)
        return res.status(500).json({error: 'Error al guardar el usuario'})
      }

      if (tokenResult.status === 'rejected') {
        console.error('Error al guardar token:', tokenResult.reason)
        // Eliminar usuario si el token falla
        await EnhancedUser.findByIdAndDelete(user.id)
        return res.status(500).json({error: 'Error al generar el token'})
      }

      await AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: newToken.token
      })

      res.status(201).json({
        message:
          'Cuenta creada exitosamente, revisa tu email para activar tu cuenta'
      })
    } catch (error) {
      console.error('Error al crear la cuenta:', error)
      res.status(500).json({error: 'Error al crear la cuenta'})
    }
  }

  /**
   * @description Confirmar la cuenta de usuario
   * @param req Esta es la solicitud HTTP entrante
   * @param res Esta es la respuesta HTTP saliente
   * @returns Una respuesta que indica que la cuenta ha sido confirmada
   * @author Esteban Leonardo Soto @elsoprimeDev
   */
  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const {token} = req.body

      // Buscar el token en la base de datos
      const foundToken = await Token.findOne({token})

      if (!foundToken) {
        const error = new Error('El token no es válido o ha expirado')
        return res.status(404).json({error: error.message})
      }

      const user = await EnhancedUser.findById(foundToken.user)

      if (!user) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({error: error.message})
      }

      user.confirmed = true
      user.emailVerified = true
      user.status = 'active'

      const results = await Promise.allSettled([
        user.save(),
        foundToken.deleteOne()
      ])

      // Verificar si hubo errores
      if (results[0].status === 'rejected') {
        const error = new Error('Error al confirmar la cuenta')
        return res.status(500).json({error: error.message})
      }

      res.status(200).json({message: 'Cuenta confirmada exitosamente'})
    } catch (error) {
      console.error('Error al confirmar la cuenta:', error)
      res.status(500).json({error: 'Error al confirmar la cuenta'})
    }
  }

  /**
   * @description Iniciar sesión de usuario
   * @param req Esta es la solicitud HTTP entrante
   * @param res Esta es la respuesta HTTP saliente
   * @returns Una respuesta que indica que la ruta funciona correctamente
   * @author Esteban Leonardo Soto @elsoprimeDev
   */

  static login = async (req: Request, res: Response) => {
    try {
      const {email, password} = req.body
      const user = await EnhancedUser.findOne({email: email.toLowerCase()})

      if (!user) {
        return res.status(404).json({error: 'Esta cuenta de usuario no existe'})
      }

      if (!user.confirmed) {
        const newToken = new Token({
          token: generateToken(),
          user: user.id,
          type: 'confirmation'
        })
        await newToken.save()

        // Enviar email de confirmación
        await AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: newToken.token
        })
        return res.status(401).json({
          error:
            'La cuenta no ha sido confirmada. Hemos enviado un correo electrónico para activar tu cuenta.'
        })
      }

      const isPasswordValid = await checkPassword(password, user.password)
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({error: 'La contraseña ingresada es incorrecta'})
      }

      // Actualizar estadísticas de login
      user.lastLogin = new Date()
      user.loginCount += 1
      await user.save()

      // Obtener el rol más alto del usuario
      const primaryRole = user.roles.find(role => role.isActive)
      const userRole = primaryRole ? primaryRole.role : 'viewer'
      const isGlobalRole = primaryRole?.roleType === 'global'

      // Generar JWT con información completa del usuario
      const token = generateJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole,
        companyId: isGlobalRole
          ? null
          : user.primaryCompanyId?.toString() || null
      })

      res.status(200).json({
        message: 'Autenticado...',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: userRole,
          roleType: primaryRole?.roleType || 'company',
          companyId: user.primaryCompanyId,
          companies: user.getAllCompanies(),
          confirmed: user.confirmed,
          hasGlobalRole: user.hasGlobalRole()
        }
      })
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      res.status(500).json({error: 'Error al iniciar sesión'})
    }
  }

  /**
   * @description Solicitar Codigo de Confirmación
   * @param req Esta es la solicitud HTTP entrante
   * @param res Esta es la respuesta HTTP saliente
   * @returns Una respuesta que indica que la ruta funciona correctamente
   * @author Esteban Leonardo Soto @elsoprimeDev
   */

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const {email} = req.body

      const user = await EnhancedUser.findOne({email: email.toLowerCase()})
      if (!user) {
        const error = new Error('Esta cuenta de usuario no existe')
        return res.status(404).json({error: error.message})
      }

      // Verificar si el usuario ya está confirmado
      if (user.confirmed) {
        const error = new Error('La cuenta ya ha sido confirmada')
        return res.status(403).json({error: error.message})
      }

      const newToken = new Token({
        token: generateToken(),
        user: user.id,
        type: 'confirmation'
      })
      await newToken.save()

      // Enviar email de confirmación
      await AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: newToken.token
      })
      res
        .status(200)
        .json({message: 'Código de confirmación enviado a tu correo'})
    } catch (error) {
      console.error('Error al solicitar el código de confirmación:', error)
      res
        .status(500)
        .json({error: 'Error al solicitar el código de confirmación'})
    }
  }

  /**
   * @description Olvide mi Password
   * @param req Esta es la solicitud HTTP entrante
   * @param res Esta es la respuesta HTTP saliente
   * @returns Una respuesta que indica que la ruta funciona correctamente
   * @author Esteban Leonardo Soto @elsoprimeDev
   */

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const {email} = req.body

      const user = await EnhancedUser.findOne({email: email.toLowerCase()})
      if (!user) {
        const error = new Error('Esta cuenta de usuario no existe')
        return res.status(404).json({error: error.message})
      }

      if (!user.confirmed) {
        const error = new Error(
          'La cuenta no ha sido confirmada. No se puede restablecer la contraseña'
        )
        return res.status(403).json({error: error.message})
      }
      const newToken = new Token({
        token: generateToken(),
        user: user.id,
        type: 'recovery'
      })
      await newToken.save()

      // Enviar email de restablecimiento de contraseña
      await AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: newToken.token
      })

      res.status(200).json({
        message: 'Se ha enviado un correo para restablecer tu contraseña'
      })
    } catch (error) {
      console.error('Error al solicitar el código de confirmación:', error)
      res
        .status(500)
        .json({error: 'Error al solicitar el código de confirmación'})
    }
  }

  /**
   * @description Validar el token de confirmación sin consumirlo
   * @param req Esta es la solicitud HTTP entrante
   * @param res Esta es la respuesta HTTP saliente
   * @returns Una respuesta que indica si el token es válido o no
   * @author Esteban Leonardo Soto @elsoprimeDev
   */
  static validateToken = async (req: Request, res: Response) => {
    try {
      // El middleware ya validó el token y lo adjuntó a req.body
      const {validToken} = req.body

      // Si llegamos aquí, el middleware ya confirmó que el token es válido
      // Solo necesitamos devolver la respuesta de éxito
      const tokenType =
        validToken.type === 'recovery'
          ? 'recuperación de contraseña'
          : 'confirmación de cuenta'

      res.status(200).json({
        valid: true,
        tokenType: validToken.type,
        message: `Token de ${tokenType} válido. Puedes proceder.`
      })
    } catch (error) {
      console.error('Error al validar el token:', error)
      res.status(500).json({
        valid: false,
        error: {
          message: 'Error al validar el token',
          code: 'VALIDATION_ERROR'
        }
      })
    }
  }

  /**
   * @description Actualizar la contraseña del usuario
   * @param req Esta es la solicitud HTTP entrante
   * @param res Esta es la respuesta HTTP saliente
   * @returns Una respuesta que indica que la contraseña ha sido actualizada
   * @author Esteban Leonardo Soto @elsoprimeDev
   */

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      // El token viene del parámetro de la URL, el middleware lo validó y adjuntó validToken a req.body
      const {token} = req.params
      const {validToken} = req.body
      const {password} = req.body

      console.log('Token recibido para cambio de contraseña:', {
        tokenFromParams: token,
        tokenType: validToken?.type,
        tokenId: validToken?._id,
        userId: validToken?.user
      })

      // Verificar que el token sea de tipo recovery para cambio de contraseña
      if (!validToken || validToken.type !== 'recovery') {
        return res.status(400).json({
          error: 'Este token no es válido para el cambio de contraseña'
        })
      }

      // Buscar el usuario asociado al token
      const user = await EnhancedUser.findById(validToken.user)
      if (!user) {
        console.error('Usuario no encontrado:', validToken.user)
        return res.status(404).json({
          error: 'Usuario no encontrado'
        })
      }

      console.log('Usuario encontrado:', user._id)

      // Actualizar la contraseña
      user.password = await hashPassword(password)
      console.log('Contraseña hasheada correctamente')

      try {
        // Guardar cambios - solo guardar usuario y eliminar token
        console.log('Iniciando guardado de cambios...')
        const results = await Promise.allSettled([
          user.save(),
          validToken.deleteOne() // Eliminar el token después de usarlo
        ])

        console.log(
          'Resultados de las operaciones:',
          results.map((result, index) => ({
            operation: ['user.save()', 'validToken.deleteOne()'][index],
            status: result.status,
            reason: result.status === 'rejected' ? result.reason : 'success'
          }))
        )

        // Verificar si todas las operaciones fueron exitosas
        const failedOperations = results.filter(
          result => result.status === 'rejected'
        )

        if (failedOperations.length > 0) {
          console.error('Operaciones fallidas:', failedOperations)
          return res.status(500).json({
            error:
              'Error al actualizar la contraseña. Por favor, intente nuevamente.',
            details: failedOperations.map(
              op => op.reason?.message || 'Error desconocido'
            )
          })
        }

        console.log('Contraseña actualizada exitosamente')
        res.status(200).json({
          message: 'Contraseña actualizada con éxito',
          success: true
        })
      } catch (saveError) {
        console.error('Error crítico al guardar los cambios:', saveError)
        return res.status(500).json({
          error:
            'Error al actualizar la contraseña. Por favor, intente nuevamente.',
          details: saveError.message
        })
      }
    } catch (error) {
      console.error('Error general al actualizar la contraseña:', error)
      res.status(500).json({
        error: 'Error al procesar la solicitud. Por favor, intente nuevamente.',
        details: error.message
      })
    }
  }

  /**
   * @description Renovar token JWT
   * @param req Esta es la solicitud HTTP entrante
   * @param res Esta es la respuesta HTTP saliente
   * @returns Una respuesta con el nuevo token JWT
   * @author Esteban Leonardo Soto @elsoprimeDev
   */
  static refreshToken = async (req: Request, res: Response) => {
    try {
      // El token actual viene del middleware de autenticación
      const currentUser = req.user

      if (!currentUser) {
        return res.status(401).json({
          error: 'Token inválido o expirado'
        })
      }

      // Buscar el usuario en la base de datos para obtener datos actualizados
      const user = await EnhancedUser.findById(currentUser.id)

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        })
      }

      if (!user.confirmed) {
        return res.status(401).json({
          error: 'Cuenta no confirmada'
        })
      }

      // Obtener el rol primario activo
      const primaryRole = user.roles.find(role => role.isActive)
      const userRole = primaryRole ? primaryRole.role : 'viewer'
      const isGlobalRole = primaryRole?.roleType === 'global'

      // Generar nuevo token con información actualizada
      const newToken = generateJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole,
        companyId: isGlobalRole
          ? null
          : user.primaryCompanyId?.toString() || null
      })

      console.log('Token renovado exitosamente para usuario:', user.email)

      res.status(200).json({
        message: 'Token renovado exitosamente',
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: userRole,
          roleType: primaryRole?.roleType || 'company',
          companyId: user.primaryCompanyId,
          companies: user.getAllCompanies(),
          hasGlobalRole: user.hasGlobalRole()
        }
      })
    } catch (error) {
      console.error('Error al renovar token:', error)
      res.status(500).json({
        error: 'Error interno del servidor al renovar token'
      })
    }
  }
}
