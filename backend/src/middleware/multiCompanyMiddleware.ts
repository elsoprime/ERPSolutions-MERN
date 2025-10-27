/**
 * Multi-Company Middleware
 * @description: Middleware para gestión de contexto empresarial
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Request, Response, NextFunction} from 'express'
import {Types} from 'mongoose'
import MultiCompanyPermissionChecker, {
  COMPANY_PERMISSIONS
} from '../utils/multiCompanyPermissions'
import type {
  GlobalPermission,
  CompanyPermission
} from '../utils/multiCompanyPermissions'

// Interfaz temporal para el usuario multiempresa
interface MultiCompanyUser {
  id: string
  email: string
  name: string
  role?: string // Rol actual (temporal)
  roles?: any[] // Array de roles multiempresa (futuro)
  companyId?: Types.ObjectId
}

// Extender el Request para incluir información de empresa
declare global {
  namespace Express {
    interface Request {
      multiUser?: MultiCompanyUser
      companyContext?: {
        id: Types.ObjectId
        slug: string
        name: string
        canAccess: boolean
      }
      userPermissions?: {
        global: GlobalPermission[]
        company: CompanyPermission[]
      }
    }
  }
}

export class MultiCompanyMiddleware {
  /**
   * Middleware temporal para verificar permisos globales
   * (Versión simplificada hasta migrar a la estructura multiempresa)
   */
  static requireGlobalPermission(permission: GlobalPermission) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Usuario no autenticado'
          })
        }

        // 🔥 ACTUALIZADO: Mapear rol legacy a sistema Enhanced
        const userRole = req.user.role || 'viewer'

        // Conversión más robusta para roles legacy
        const roleMapping: Record<string, string> = {
          super_admin: 'super_admin',
          admin_empresa: 'admin_empresa',
          admin: 'admin_empresa', // Compatibilidad
          manager: 'manager',
          employee: 'employee',
          viewer: 'viewer'
        }

        const mappedRole = roleMapping[userRole] || 'viewer'

        // Simular estructura de roles para compatibilidad
        const mockRoles = [
          {
            roleType: mappedRole === 'super_admin' ? 'global' : 'company',
            role: mappedRole,
            isActive: true
          }
        ]

        const hasPermission = MultiCompanyPermissionChecker.hasGlobalPermission(
          mockRoles,
          permission
        )

        if (!hasPermission) {
          return res.status(403).json({
            error: 'No tienes permisos para realizar esta acción',
            requiredPermission: permission,
            currentRole: userRole
          })
        }

        next()
      } catch (error) {
        console.error('Error en verificación de permisos globales:', error)
        res.status(500).json({
          error: 'Error interno del servidor'
        })
      }
    }
  }

  /**
   * Middleware para establecer contexto de empresa
   * (Versión simplificada usando companyId del usuario actual)
   */
  static setCompanyContext() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Usuario no autenticado'
          })
        }

        // Obtener ID de empresa desde diferentes fuentes
        let companyId: string | null = null

        // 1. Desde el usuario actual
        if (req.user.companyId) {
          companyId = req.user.companyId.toString()
        }
        // 2. Desde parámetros de ruta
        else if (req.params.companyId) {
          companyId = req.params.companyId
        }
        // 3. Desde query parameters
        else if (req.query.companyId) {
          companyId = req.query.companyId as string
        }
        // 4. Desde headers
        else if (req.headers['x-company-id']) {
          companyId = req.headers['x-company-id'] as string
        }

        if (!companyId) {
          return res.status(400).json({
            error: 'ID de empresa requerido'
          })
        }

        // Validar formato de ObjectId
        if (!Types.ObjectId.isValid(companyId)) {
          return res.status(400).json({
            error: 'ID de empresa inválido'
          })
        }

        const companyObjectId = new Types.ObjectId(companyId)

        // 🔥 ACTUALIZADO: Mapear rol para verificar acceso
        const userRole = req.user.role || 'viewer'
        const roleMapping: Record<string, string> = {
          super_admin: 'super_admin',
          admin_empresa: 'admin_empresa',
          admin: 'admin_empresa', // Compatibilidad
          manager: 'manager',
          employee: 'employee',
          viewer: 'viewer'
        }

        const mappedRole = roleMapping[userRole] || 'viewer'

        // Para la versión actual, admins y super_admins pueden acceder a cualquier empresa
        const canAccess =
          mappedRole === 'super_admin' ||
          mappedRole === 'admin_empresa' ||
          req.user.companyId?.toString() === companyId

        if (!canAccess) {
          return res.status(403).json({
            error: 'No tienes acceso a esta empresa'
          })
        }

        // Establecer contexto de empresa
        req.companyContext = {
          id: companyObjectId,
          slug: `company-${companyId}`,
          name: 'Empresa',
          canAccess: true
        }

        // 🔥 ACTUALIZADO: Permisos basados en roles Enhanced
        req.userPermissions = {
          global:
            mappedRole === 'super_admin'
              ? (['companies.list_all'] as GlobalPermission[])
              : [],
          company:
            mappedRole === 'super_admin' || mappedRole === 'admin_empresa'
              ? (Object.keys(COMPANY_PERMISSIONS) as CompanyPermission[])
              : mappedRole === 'manager'
              ? ([
                  'users.view',
                  'inventory.view',
                  'reports.view'
                ] as CompanyPermission[])
              : (['inventory.view'] as CompanyPermission[])
        }

        next()
      } catch (error) {
        console.error(
          'Error en establecimiento de contexto empresarial:',
          error
        )
        res.status(500).json({
          error: 'Error interno del servidor'
        })
      }
    }
  }

  /**
   * Middleware para verificar permisos dentro de una empresa
   */
  static requireCompanyPermission(permission: CompanyPermission) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Usuario no autenticado'
          })
        }

        if (!req.companyContext) {
          return res.status(400).json({
            error: 'Contexto de empresa no establecido'
          })
        }

        // Verificar permisos usando la lógica simulada
        const hasPermission =
          req.userPermissions?.company.includes(permission) ||
          req.userPermissions?.global.includes('companies.list_all')

        if (!hasPermission) {
          return res.status(403).json({
            error:
              'No tienes permisos para realizar esta acción en esta empresa',
            requiredPermission: permission,
            company: req.companyContext.id
          })
        }

        next()
      } catch (error) {
        console.error('Error en verificación de permisos empresariales:', error)
        res.status(500).json({
          error: 'Error interno del servidor'
        })
      }
    }
  }

  /**
   * Middleware para verificar si el usuario es Super Admin
   */
  static requireSuperAdmin() {
    return MultiCompanyMiddleware.requireGlobalPermission('companies.list_all')
  }

  /**
   * Middleware para verificar si el usuario es Admin de la empresa
   */
  static requireCompanyAdmin() {
    return MultiCompanyMiddleware.requireCompanyPermission('users.assign_roles')
  }

  /**
   * Middleware simplificado para logging
   */
  static logCompanyAction(action: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const logData = {
          action,
          userId: req.user?.id,
          companyId: req.companyContext?.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: new Date()
        }

        console.log('Company Action Log:', logData)
        next()
      } catch (error) {
        console.error('Error en logging de acción empresarial:', error)
        next()
      }
    }
  }
}

export default MultiCompanyMiddleware
