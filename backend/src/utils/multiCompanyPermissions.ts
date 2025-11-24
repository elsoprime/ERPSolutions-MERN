/**
 * Multi-Company Permission System
 * @description: Sistema de permisos para arquitectura multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { Types } from "mongoose";

// Definir permisos globales (Solo Super Admin)
export const GLOBAL_PERMISSIONS = {
  // Gestión de empresas
  "companies.create": "Crear nuevas empresas",
  "companies.delete": "Eliminar empresas",
  "companies.list_all": "Listar todas las empresas",
  "companies.edit_any": "Editar cualquier empresa",
  "companies.suspend": "Suspender empresas",

  // Gestión global de usuarios
  "users.manage_global": "Gestionar usuarios globalmente",
  "users.assign_global_roles": "Asignar roles globales",
  "users.view_all": "Ver todos los usuarios del sistema",

  // Configuración del sistema
  "system.configure": "Configurar el sistema",
  "system.maintenance": "Modo mantenimiento",
  "system.backup": "Gestionar backups",
  "system.logs": "Ver logs del sistema",

  // Facturación y suscripciones
  "billing.manage_all": "Gestionar facturación de todas las empresas",
  "billing.view_revenue": "Ver ingresos totales",

  // Analytics cross-empresa
  "analytics.cross_company": "Ver analytics de múltiples empresas",
  "analytics.system_metrics": "Ver métricas del sistema",

  // Soporte
  "support.access_all": "Acceder a datos de soporte de todas las empresas",
} as const;

// Definir permisos por empresa (Admin Empresa, Manager, etc.)
export const COMPANY_PERMISSIONS = {
  // Gestión de usuarios de la empresa
  "users.create": "Crear usuarios en la empresa",
  "users.edit": "Editar usuarios de la empresa",
  "users.delete": "Eliminar usuarios de la empresa",
  "users.view": "Ver usuarios de la empresa",
  "users.assign_roles": "Asignar roles en la empresa",
  "users.suspend": "Suspender/reactivar usuarios de la empresa",

  // Configuración de la empresa
  "company.edit": "Editar información de la empresa",
  "company.configure": "Configurar empresa",
  "company.branding": "Gestionar branding",
  "company.billing": "Ver facturación de la empresa",

  // Inventario
  "inventory.create": "Crear productos",
  "inventory.edit": "Editar productos",
  "inventory.delete": "Eliminar productos",
  "inventory.view": "Ver inventario",
  "inventory.transfer": "Transferir productos",
  "inventory.adjust": "Ajustar stock",

  // Reportes
  "reports.view": "Ver reportes de la empresa",
  "reports.export": "Exportar reportes",
  "reports.create": "Crear reportes personalizados",

  // Configuraciones
  "settings.edit": "Editar configuraciones",
  "settings.view": "Ver configuraciones",

  // Facturación/Ventas
  "sales.create": "Crear ventas",
  "sales.edit": "Editar ventas",
  "sales.view": "Ver ventas",
  "sales.delete": "Eliminar ventas",

  // Compras
  "purchases.create": "Crear compras",
  "purchases.edit": "Editar compras",
  "purchases.view": "Ver compras",
  "purchases.delete": "Eliminar compras",
} as const;

// Tipos de permisos
export type GlobalPermission = keyof typeof GLOBAL_PERMISSIONS;
export type CompanyPermission = keyof typeof COMPANY_PERMISSIONS;
export type Permission = GlobalPermission | CompanyPermission;

// Roles y sus permisos por defecto
export const ROLE_PERMISSIONS = {
  // Roles globales
  super_admin: Object.keys(GLOBAL_PERMISSIONS) as GlobalPermission[],
  system_admin: [
    "system.configure",
    "system.maintenance",
    "system.backup",
    "system.logs",
  ] as GlobalPermission[],

  // Roles por empresa
  admin_empresa: [
    "users.create",
    "users.edit",
    "users.delete",
    "users.view",
    "users.assign_roles",
    "users.suspend",
    "company.edit",
    "company.configure",
    "company.branding",
    "company.billing",
    "inventory.create",
    "inventory.edit",
    "inventory.delete",
    "inventory.view",
    "inventory.transfer",
    "inventory.adjust",
    "reports.view",
    "reports.export",
    "reports.create",
    "settings.edit",
    "settings.view",
    "sales.create",
    "sales.edit",
    "sales.view",
    "sales.delete",
    "purchases.create",
    "purchases.edit",
    "purchases.view",
    "purchases.delete",
  ] as CompanyPermission[],

  manager: [
    "users.view",
    "users.assign_roles",
    "inventory.create",
    "inventory.edit",
    "inventory.view",
    "inventory.transfer",
    "reports.view",
    "reports.export",
    "settings.view",
    "sales.create",
    "sales.edit",
    "sales.view",
    "purchases.create",
    "purchases.edit",
    "purchases.view",
  ] as CompanyPermission[],

  employee: [
    "users.view",
    "inventory.view",
    "inventory.transfer",
    "reports.view",
    "settings.view",
    "sales.create",
    "sales.view",
    "purchases.view",
  ] as CompanyPermission[],

  viewer: [
    "inventory.view",
    "reports.view",
    "sales.view",
    "purchases.view",
  ] as CompanyPermission[],
} as const;

/**
 * Clase para verificar permisos multiempresa
 */
export class MultiCompanyPermissionChecker {
  /**
   * Verificar si un usuario tiene un permiso global
   */
  static hasGlobalPermission(
    userRoles: any[],
    permission: GlobalPermission
  ): boolean {
    // Verificar si tiene roles globales activos
    const globalRoles = userRoles.filter(
      (role) => role.roleType === "global" && role.isActive
    );

    for (const userRole of globalRoles) {
      const rolePermissions = ROLE_PERMISSIONS[
        userRole.role as keyof typeof ROLE_PERMISSIONS
      ] as readonly GlobalPermission[];
      if (
        rolePermissions &&
        (rolePermissions as readonly string[]).includes(permission)
      ) {
        return true;
      }

      // Verificar permisos adicionales específicos
      if (userRole.permissions && userRole.permissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verificar si un usuario tiene un permiso en una empresa específica
   */
  static hasCompanyPermission(
    userRoles: any[],
    permission: CompanyPermission,
    companyId: Types.ObjectId
  ): boolean {
    // Super admins tienen todos los permisos
    if (this.hasGlobalPermission(userRoles, "users.manage_global")) {
      return true;
    }

    // Verificar roles específicos de la empresa
    const companyRoles = userRoles.filter(
      (role) =>
        role.roleType === "company" &&
        role.isActive &&
        role.companyId?.toString() === companyId.toString()
    );

    for (const userRole of companyRoles) {
      const rolePermissions = ROLE_PERMISSIONS[
        userRole.role as keyof typeof ROLE_PERMISSIONS
      ] as readonly CompanyPermission[];
      if (
        rolePermissions &&
        (rolePermissions as readonly string[]).includes(permission)
      ) {
        return true;
      }

      // Verificar permisos adicionales específicos
      if (userRole.permissions && userRole.permissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Obtener todas las empresas a las que un usuario tiene acceso
   */
  static getAccessibleCompanies(userRoles: any[]): Types.ObjectId[] {
    // Super admins tienen acceso a todas las empresas
    if (this.hasGlobalPermission(userRoles, "companies.list_all")) {
      return []; // Array vacío significa "todas las empresas"
    }

    // Obtener empresas específicas
    return userRoles
      .filter((role) => role.roleType === "company" && role.isActive)
      .map((role) => role.companyId)
      .filter(
        (id, index, self) =>
          index ===
          self.findIndex((otherId) => otherId.toString() === id.toString())
      ); // Eliminar duplicados
  }

  /**
   * Verificar si un usuario puede acceder a una empresa
   */
  static canAccessCompany(
    userRoles: any[],
    companyId: Types.ObjectId
  ): boolean {
    // Super admins pueden acceder a todas las empresas
    if (this.hasGlobalPermission(userRoles, "companies.list_all")) {
      return true;
    }

    // Verificar acceso específico a la empresa
    return userRoles.some(
      (role) =>
        role.roleType === "company" &&
        role.isActive &&
        role.companyId?.toString() === companyId.toString()
    );
  }

  /**
   * Obtener el rol más alto de un usuario en una empresa
   */
  static getHighestRoleInCompany(
    userRoles: any[],
    companyId: Types.ObjectId
  ): string | null {
    const companyRoles = userRoles.filter(
      (role) =>
        role.roleType === "company" &&
        role.isActive &&
        role.companyId?.toString() === companyId.toString()
    );

    if (companyRoles.length === 0) return null;

    // Jerarquía de roles (mayor a menor)
    const hierarchy = ["admin_empresa", "manager", "employee", "viewer"];

    for (const hierarchyRole of hierarchy) {
      if (companyRoles.some((role) => role.role === hierarchyRole)) {
        return hierarchyRole;
      }
    }

    return null;
  }

  /**
   * Obtener todos los permisos de un usuario en una empresa
   */
  static getAllPermissionsInCompany(
    userRoles: any[],
    companyId: Types.ObjectId
  ): CompanyPermission[] {
    const permissions = new Set<CompanyPermission>();

    // Super admins tienen todos los permisos
    if (this.hasGlobalPermission(userRoles, "users.manage_global")) {
      Object.keys(COMPANY_PERMISSIONS).forEach((p) =>
        permissions.add(p as CompanyPermission)
      );
      return Array.from(permissions);
    }

    // Recopilar permisos de todos los roles en la empresa
    const companyRoles = userRoles.filter(
      (role) =>
        role.roleType === "company" &&
        role.isActive &&
        role.companyId?.toString() === companyId.toString()
    );

    for (const userRole of companyRoles) {
      // Permisos del rol
      const rolePermissions = ROLE_PERMISSIONS[
        userRole.role as keyof typeof ROLE_PERMISSIONS
      ] as readonly CompanyPermission[];
      if (rolePermissions) {
        (rolePermissions as readonly string[]).forEach((p) =>
          permissions.add(p as CompanyPermission)
        );
      }

      // Permisos adicionales específicos
      if (userRole.permissions) {
        userRole.permissions
          .filter((p: string) => p in COMPANY_PERMISSIONS)
          .forEach((p: string) => permissions.add(p as CompanyPermission));
      }
    }

    return Array.from(permissions);
  }
}

export default MultiCompanyPermissionChecker;
