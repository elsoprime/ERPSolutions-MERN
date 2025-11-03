/**
 * Enhanced Multi-Company Middleware v2.0
 * @description: Middleware para gestión de contexto empresarial Enhanced
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0
 * @updated: 28/10/2025
 */

import {Request, Response, NextFunction} from 'express'
import {Types} from 'mongoose'
import EnhancedCompany from '../models/EnhancedCompany'
import MultiCompanyPermissionChecker, {
  COMPANY_PERMISSIONS
} from '../../../utils/multiCompanyPermissions'
import type {
  GlobalPermission,
  CompanyPermission
} from '../../../utils/multiCompanyPermissions'
import type {AuthenticatedUser} from '@/modules/userManagement/types/authTypes'

// Interfaz para el contexto de empresa Enhanced
interface EnhancedCompanyContext {
  id: Types.ObjectId
  slug: string
  name: string
  plan: string
  status: string
  canAccess: boolean
}

// Extender el Request para incluir información Enhanced
declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser
      companyContext?: EnhancedCompanyContext
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
        if (!req.authUser) {
          return res.status(401).json({
            error: 'Usuario no autenticado'
          })
        }

        // Obtener rol del usuario autenticado
        const userRole = req.authUser.role || 'viewer'

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
   * Middleware para establecer contexto de empresa Enhanced
   */
  static setCompanyContext() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.authUser) {
          return res.status(401).json({
            error: 'Usuario no autenticado'
          })
        }

        // Obtener ID de empresa desde diferentes fuentes
        let companyId: string | null = null

        // 1. Desde el usuario actual
        if (req.authUser.companyId) {
          companyId = req.authUser.companyId.toString()
        }
        // 2. Desde parámetros de ruta
        else if (req.params.companyId) {
          companyId = req.params.companyId
        }
        // 3. Desde el body (para operaciones de actualización)
        else if (req.body.companyId) {
          companyId = req.body.companyId
        }
        // 4. Desde query parameters
        else if (req.query.companyId) {
          companyId = req.query.companyId as string
        }
        // 5. Desde headers
        else if (req.headers['x-company-id']) {
          companyId = req.headers['x-company-id'] as string
        }

        // Si no hay companyId y el usuario es super_admin, permitir continuar sin contexto
        if (!companyId && req.authUser.role === 'super_admin') {
          // Super admin puede operar sin contexto de empresa
          next()
          return
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

        // Buscar empresa en la base de datos
        const company = await EnhancedCompany.findById(companyId)

        if (!company) {
          return res.status(404).json({
            error: 'Empresa no encontrada'
          })
        }

        // Verificar que la empresa no esté suspendida
        // Solo Super Admin puede acceder a empresas suspendidas
        const userRole = req.authUser.role || 'viewer'
        const isSuperAdmin = userRole === 'super_admin'

        if (company.status === 'suspended' && !isSuperAdmin) {
          return res.status(403).json({
            error: 'Esta empresa se encuentra suspendida',
            reason: company.suspensionReason || 'No especificado',
            suspendedAt: company.suspendedAt,
            message:
              'Contacte al administrador del sistema para más información'
          })
        }

        // Verificar acceso del usuario a la empresa
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
          req.authUser.companyId?.toString() === companyId

        if (!canAccess) {
          return res.status(403).json({
            error: 'No tienes acceso a esta empresa'
          })
        }

        // Establecer contexto de empresa Enhanced
        req.companyContext = {
          id: company._id as Types.ObjectId,
          slug: company.slug,
          name: company.name,
          plan: company.plan,
          status: company.status,
          canAccess: true
        }

        // Establecer permisos basados en roles Enhanced
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
          'Error en establecimiento de contexto empresarial Enhanced:',
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
        if (!req.authUser) {
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
          userId: req.authUser?.id,
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
