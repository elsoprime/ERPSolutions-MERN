/**
 * Module to Permission Mapping
 * @description Mapeo tipado de módulos del plan a permisos de empresa
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import { IPlanFeatures } from "@/interfaces/IPlan";

/**
 * Permisos de empresa disponibles
 */
export type CompanyPermission =
  // Gestión de usuarios
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "users.view"
  | "users.assign_roles"
  // Configuración de empresa
  | "company.edit"
  | "company.configure"
  | "company.branding"
  | "company.billing"
  // Inventario
  | "inventory.create"
  | "inventory.edit"
  | "inventory.delete"
  | "inventory.view"
  | "inventory.transfer"
  | "inventory.adjust"
  // Contabilidad
  | "accounting.create"
  | "accounting.edit"
  | "accounting.delete"
  | "accounting.view"
  | "accounting.reports"
  // Recursos Humanos
  | "hrm.create"
  | "hrm.edit"
  | "hrm.delete"
  | "hrm.view"
  | "hrm.payroll"
  // CRM
  | "crm.create"
  | "crm.edit"
  | "crm.delete"
  | "crm.view"
  | "crm.contacts"
  // Gestión de Proyectos
  | "projects.create"
  | "projects.edit"
  | "projects.delete"
  | "projects.view"
  | "projects.assign"
  // Reportes
  | "reports.view"
  | "reports.export"
  | "reports.create"
  // Configuraciones
  | "settings.edit"
  | "settings.view"
  // Ventas
  | "sales.create"
  | "sales.edit"
  | "sales.view"
  | "sales.delete"
  // Compras
  | "purchases.create"
  | "purchases.edit"
  | "purchases.view"
  | "purchases.delete"
  // API Access
  | "api.read"
  | "api.write"
  // Analíticas Avanzadas
  | "analytics.view"
  | "analytics.export"
  // Audit Log
  | "audit.view"
  | "audit.export"
  // Integraciones
  | "integrations.configure"
  | "integrations.view";

/**
 * Tipo para las claves de características del plan
 */
export type PlanFeatureKey = keyof IPlanFeatures;

/**
 * Mapeo de módulos del plan a permisos
 */
export const MODULE_PERMISSION_MAP: Record<
  PlanFeatureKey,
  CompanyPermission[]
> = {
  // Gestión de Inventario
  inventoryManagement: [
    "inventory.create",
    "inventory.edit",
    "inventory.delete",
    "inventory.view",
    "inventory.transfer",
    "inventory.adjust",
  ],

  // Contabilidad
  accounting: [
    "accounting.create",
    "accounting.edit",
    "accounting.delete",
    "accounting.view",
    "accounting.reports",
  ],

  // Recursos Humanos
  hrm: ["hrm.create", "hrm.edit", "hrm.delete", "hrm.view", "hrm.payroll"],

  // CRM
  crm: ["crm.create", "crm.edit", "crm.delete", "crm.view", "crm.contacts"],

  // Gestión de Proyectos
  projectManagement: [
    "projects.create",
    "projects.edit",
    "projects.delete",
    "projects.view",
    "projects.assign",
  ],

  // Reportes
  reports: ["reports.view", "reports.export", "reports.create"],

  // Multi-moneda (no agrega permisos directos, es una funcionalidad transversal)
  multiCurrency: [],

  // Acceso API
  apiAccess: ["api.read", "api.write"],

  // Branding Personalizado (no agrega permisos, es visual)
  customBranding: [],

  // Soporte Prioritario (no agrega permisos)
  prioritySupport: [],

  // Analíticas Avanzadas
  advancedAnalytics: ["analytics.view", "analytics.export"],

  // Audit Log
  auditLog: ["audit.view", "audit.export"],

  // Integraciones Personalizadas
  customIntegrations: ["integrations.configure", "integrations.view"],

  // Cuenta Dedicada (no agrega permisos)
  dedicatedAccount: [],
};

/**
 * Permisos base que todos los usuarios tienen (independiente del plan)
 * Estos permisos son esenciales para el funcionamiento básico de cualquier empresa
 */
export const BASE_COMPANY_PERMISSIONS: CompanyPermission[] = [
  // Configuración básica de empresa
  "company.edit",
  "settings.view",
  // Gestión de usuarios (esencial para administrar la empresa)
  "users.create",
  "users.edit",
  "users.delete",
  "users.view",
  "users.assign_roles",
  // Configuración de empresa
  "company.configure",
  "company.branding",
  "company.billing",
  // Configuraciones
  "settings.edit",
];

/**
 * Obtiene los permisos disponibles para un conjunto de características
 */
export function getPermissionsForFeatures(
  features: IPlanFeatures
): CompanyPermission[] {
  const availablePermissions: CompanyPermission[] = [
    ...BASE_COMPANY_PERMISSIONS,
  ];

  console.log("🔍 getPermissionsForFeatures - Features recibidas:", features);
  console.log("🔍 BASE_COMPANY_PERMISSIONS:", BASE_COMPANY_PERMISSIONS.length);

  // Iterar sobre cada característica del plan
  (Object.keys(features) as PlanFeatureKey[]).forEach((featureKey) => {
    console.log(
      `🔍 Evaluando feature: ${featureKey} = ${features[featureKey]}`
    );
    if (features[featureKey] === true) {
      const permissions = MODULE_PERMISSION_MAP[featureKey];
      console.log(
        `✅ Feature ${featureKey} activa, agregando ${permissions.length} permisos:`,
        permissions
      );
      availablePermissions.push(...permissions);
    }
  });

  console.log(
    "🔍 Total permisos antes de eliminar duplicados:",
    availablePermissions.length
  );

  // Eliminar duplicados
  const uniquePermissions = Array.from(new Set(availablePermissions));
  console.log(
    "🔍 Total permisos después de eliminar duplicados:",
    uniquePermissions.length
  );

  return uniquePermissions;
}

/**
 * Verifica si un permiso está disponible según las características del plan
 */
export function isPermissionAvailable(
  permission: CompanyPermission,
  features: IPlanFeatures
): boolean {
  const availablePermissions = getPermissionsForFeatures(features);
  return availablePermissions.includes(permission);
}

/**
 * Obtiene los módulos activos según las características del plan
 */
export function getActiveModules(features: IPlanFeatures): PlanFeatureKey[] {
  return (Object.keys(features) as PlanFeatureKey[]).filter(
    (key) => features[key] === true
  );
}

/**
 * Obtiene los módulos restringidos según las características del plan
 */
export function getRestrictedModules(
  features: IPlanFeatures
): PlanFeatureKey[] {
  return (Object.keys(features) as PlanFeatureKey[]).filter(
    (key) => features[key] === false
  );
}
