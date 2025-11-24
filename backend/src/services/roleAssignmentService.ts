/**
 * 🔒 ROLE ASSIGNMENT SERVICE
 *
 * @description
 * Servicio para validar asignación de roles según jerarquía y contexto empresarial.
 * Implementa el principio de menor privilegio: un usuario solo puede asignar roles
 * de nivel inferior al suyo, y solo dentro de su ámbito (empresa).
 *
 * @architecture
 * - Super Admin: SIN restricciones (puede asignar cualquier rol en cualquier empresa)
 * - Admin Empresa: Solo roles inferiores (manager, employee, viewer) en SU empresa
 * - Manager: Solo roles inferiores (employee, viewer) en SU empresa
 * - Employee/Viewer: NO pueden asignar roles
 *
 * @compatibility
 * - ✅ Reutiliza ROLE_HIERARCHY de roleMiddleware.ts (NO duplica código)
 * - ✅ Compatible con sistema multiempresa existente
 * - ✅ NO modifica lógica de creación de usuarios
 * - ✅ Solo agrega validación adicional
 *
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import { Types } from "mongoose";
import {
  GlobalRole,
  CompanyRole,
} from "@/modules/userManagement/models/EnhancedUser";

/**
 * Tipo combinado de roles
 */
export type UserRole = GlobalRole | CompanyRole;

/**
 * Información del usuario que asigna el rol
 */
export interface AssignerInfo {
  userId: string;
  roles: Array<{
    roleType: "global" | "company";
    role: UserRole;
    companyId?: Types.ObjectId;
    isActive: boolean;
  }>;
}

/**
 * Jerarquía de roles por nivel (de mayor a menor privilegio)
 * NOTA: Reutiliza conceptos de ROLE_HIERARCHY de roleMiddleware.ts
 */
const ROLE_LEVELS: Record<UserRole, number> = {
  // Roles globales (nivel más alto)
  super_admin: 100,
  system_admin: 90,

  // Roles de empresa (niveles intermedios)
  admin_empresa: 50,
  manager: 40,
  employee: 30,
  viewer: 20,
};

/**
 * Roles que cada tipo de usuario puede asignar
 */
const ASSIGNABLE_ROLES: Record<CompanyRole, CompanyRole[]> = {
  admin_empresa: ["manager", "employee", "viewer"],
  manager: ["employee", "viewer"],
  employee: [], // No puede asignar roles
  viewer: [], // No puede asignar roles
};

/**
 * Servicio de validación de asignación de roles
 */
export class RoleAssignmentService {
  /**
   * Verifica si un usuario puede asignar un rol específico en una empresa
   *
   * @param assigner - Información del usuario que asigna
   * @param targetRole - Rol que se quiere asignar
   * @param targetRoleType - Tipo de rol (global o company)
   * @param targetCompanyId - ID de la empresa (requerido para roleType = company)
   * @returns true si puede asignar, false si no
   */
  static canAssignRole(
    assigner: AssignerInfo,
    targetRole: UserRole,
    targetRoleType: "global" | "company",
    targetCompanyId?: string
  ): boolean {
    // 1. Super Admin puede asignar CUALQUIER rol en CUALQUIER empresa
    const isSuperAdmin = assigner.roles.some(
      (r) => r.role === "super_admin" && r.roleType === "global" && r.isActive
    );

    if (isSuperAdmin) {
      return true;
    }

    // 2. Para roles globales: SOLO super_admin puede asignar
    if (targetRoleType === "global") {
      return false; // Ya verificamos super_admin arriba
    }

    // 3. Para roles de empresa: validar contexto y jerarquía
    if (targetRoleType === "company") {
      if (!targetCompanyId) {
        return false; // CompanyId es requerido
      }

      // 3.1 Buscar el rol más alto del assigner EN ESA EMPRESA
      const assignerRoleInCompany = this.getHighestRoleInCompany(
        assigner.roles,
        targetCompanyId
      );

      if (!assignerRoleInCompany) {
        return false; // No tiene rol en esa empresa
      }

      // 3.2 Verificar si puede asignar ese rol específico
      return this.canAssignSpecificRole(
        assignerRoleInCompany,
        targetRole as CompanyRole
      );
    }

    return false;
  }

  /**
   * Obtiene el rol más alto de un usuario en una empresa específica
   *
   * @param userRoles - Array de roles del usuario
   * @param companyId - ID de la empresa
   * @returns El rol más alto o null
   */
  private static getHighestRoleInCompany(
    userRoles: AssignerInfo["roles"],
    companyId: string
  ): CompanyRole | null {
    // Filtrar roles activos en esa empresa
    const rolesInCompany = userRoles.filter(
      (r) =>
        r.roleType === "company" &&
        r.isActive &&
        r.companyId?.toString() === companyId
    );

    if (rolesInCompany.length === 0) {
      return null;
    }

    // Encontrar el rol con mayor nivel
    let highestRole: CompanyRole | null = null;
    let highestLevel = -1;

    for (const userRole of rolesInCompany) {
      const role = userRole.role as CompanyRole;
      const level = ROLE_LEVELS[role] || 0;

      if (level > highestLevel) {
        highestLevel = level;
        highestRole = role;
      }
    }

    return highestRole;
  }

  /**
   * Verifica si un rol puede asignar otro rol específico
   *
   * @param assignerRole - Rol del usuario que asigna
   * @param targetRole - Rol que se quiere asignar
   * @returns true si puede asignar
   */
  private static canAssignSpecificRole(
    assignerRole: CompanyRole,
    targetRole: CompanyRole
  ): boolean {
    // Obtener lista de roles que puede asignar
    const allowedRoles = ASSIGNABLE_ROLES[assignerRole] || [];
    return allowedRoles.includes(targetRole);
  }

  /**
   * Obtiene los roles que un usuario puede asignar en una empresa
   *
   * @param assigner - Información del usuario que asigna
   * @param companyId - ID de la empresa
   * @returns Array de roles que puede asignar
   */
  static getAssignableRoles(
    assigner: AssignerInfo,
    companyId: string
  ): CompanyRole[] {
    // Super Admin puede asignar todos los roles
    const isSuperAdmin = assigner.roles.some(
      (r) => r.role === "super_admin" && r.roleType === "global" && r.isActive
    );

    if (isSuperAdmin) {
      return ["admin_empresa", "manager", "employee", "viewer"];
    }

    // Obtener rol más alto en la empresa
    const highestRole = this.getHighestRoleInCompany(assigner.roles, companyId);

    if (!highestRole) {
      return []; // No tiene rol en esa empresa
    }

    // Retornar roles permitidos
    return ASSIGNABLE_ROLES[highestRole] || [];
  }

  /**
   * Obtiene las empresas en las que un usuario puede asignar roles
   *
   * @param assigner - Información del usuario que asigna
   * @returns Array de IDs de empresas
   */
  static getCompaniesWhereCanAssignRoles(assigner: AssignerInfo): string[] {
    // Super Admin puede asignar en todas las empresas
    const isSuperAdmin = assigner.roles.some(
      (r) => r.role === "super_admin" && r.roleType === "global" && r.isActive
    );

    if (isSuperAdmin) {
      return ["*"]; // Indicador de "todas las empresas"
    }

    // Obtener empresas donde tiene rol de admin_empresa o manager
    const companies = assigner.roles
      .filter(
        (r) =>
          r.roleType === "company" &&
          r.isActive &&
          (r.role === "admin_empresa" || r.role === "manager") &&
          r.companyId
      )
      .map((r) => r.companyId!.toString());

    // Eliminar duplicados
    return [...new Set(companies)];
  }

  /**
   * Obtiene un mensaje de error descriptivo cuando no se puede asignar un rol
   *
   * @param assignerRole - Rol del usuario que intenta asignar
   * @param targetRole - Rol que se intenta asignar
   * @param targetCompanyId - ID de la empresa
   * @returns Mensaje de error descriptivo
   */
  static getAssignmentErrorMessage(
    assignerRole: CompanyRole | null,
    targetRole: UserRole,
    targetCompanyId?: string
  ): string {
    if (!assignerRole) {
      return `No tienes permisos para asignar roles en esta empresa`;
    }

    if (assignerRole === "employee" || assignerRole === "viewer") {
      return `Tu rol (${assignerRole}) no tiene permisos para asignar roles`;
    }

    if (assignerRole === "manager" && targetRole === "admin_empresa") {
      return `Los managers no pueden asignar el rol de Admin Empresa`;
    }

    if (assignerRole === "admin_empresa" && targetRole === "admin_empresa") {
      return `Los Admin Empresa no pueden asignar otros Admin Empresa (escalación de privilegios)`;
    }

    return `No tienes permisos para asignar el rol ${targetRole}`;
  }

  /**
   * 🔒 NUEVO: Valida si un usuario puede tener roles en múltiples empresas
   *
   * @description
   * Los roles Employee y Viewer solo pueden asignarse a UNA empresa.
   * Los roles Admin Empresa y Manager pueden tener roles en múltiples empresas.
   *
   * @param targetUserRoles - Roles actuales del usuario al que se le asignará el rol
   * @param newRole - Rol que se quiere asignar
   * @param newCompanyId - ID de la empresa donde se asignará el rol
   * @returns objeto con { allowed: boolean, reason?: string }
   */
  static canHaveMultiCompanyRole(
    targetUserRoles: Array<{
      roleType: "global" | "company";
      role: UserRole;
      companyId?: Types.ObjectId | string;
      isActive: boolean;
    }>,
    newRole: CompanyRole,
    newCompanyId: string
  ): { allowed: boolean; reason?: string } {
    // Si el usuario no tiene roles previos, puede recibir cualquier rol
    if (targetUserRoles.length === 0) {
      return { allowed: true };
    }

    // Contar roles activos de empresa que ya tiene
    const activeCompanyRoles = targetUserRoles.filter(
      (r) => r.roleType === "company" && r.isActive
    );

    // Si no tiene roles de empresa activos, puede recibir cualquier rol
    if (activeCompanyRoles.length === 0) {
      return { allowed: true };
    }

    // Verificar si ya tiene un rol en la empresa específica
    const hasRoleInCompany = activeCompanyRoles.some(
      (r) => r.companyId?.toString() === newCompanyId
    );

    if (hasRoleInCompany) {
      return {
        allowed: false,
        reason: "El usuario ya tiene un rol activo en esta empresa",
      };
    }

    // Obtener el rol existente (primer rol activo)
    const existingRole = activeCompanyRoles[0].role as CompanyRole;

    // RESTRICCIÓN: Employee y Viewer solo pueden tener ROL EN UNA EMPRESA
    if (existingRole === "employee" || existingRole === "viewer") {
      return {
        allowed: false,
        reason: `Los usuarios con rol ${existingRole} solo pueden estar asignados a una empresa. Revoca el rol actual antes de asignar uno nuevo.`,
      };
    }

    // Admin Empresa y Manager pueden tener roles en múltiples empresas
    // Pero solo del mismo nivel o inferior
    if (existingRole === "admin_empresa") {
      if (newRole !== "admin_empresa" && newRole !== "manager") {
        return {
          allowed: false,
          reason: `Un usuario con rol Admin Empresa solo puede tener roles de Admin Empresa o Manager en otras empresas`,
        };
      }
      return { allowed: true };
    }

    if (existingRole === "manager") {
      if (newRole !== "manager") {
        return {
          allowed: false,
          reason: `Un usuario con rol Manager solo puede tener roles de Manager en otras empresas`,
        };
      }
      return { allowed: true };
    }

    return { allowed: true };
  }
}

export default RoleAssignmentService;
