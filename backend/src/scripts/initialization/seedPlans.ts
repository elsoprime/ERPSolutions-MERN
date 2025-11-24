/**
 * Plan Seeding Script
 * @description Script para crear planes base en la base de datos
 * @author Esteban Soto Ojeda @elsoprimeDev
 * @version 1.0.0
 */

import colors from "colors";
import mongoose from "mongoose";
import Plan from "@/models/Plan";
import { PlanType, PlanStatus } from "@/interfaces/IPlan";
import type { IPlan } from "@/interfaces/IPlan";

// ============ TIPOS ============

interface PlanSeedData {
  name: string;
  description: string;
  type: PlanType;
  status: PlanStatus;
  price: {
    monthly: number;
    annual: number;
    currency: string;
    discount: number;
  };
  limits: {
    maxUsers: number;
    maxProducts: number;
    maxMonthlyTransactions: number;
    storageGB: number;
    maxApiCalls: number;
    maxBranches: number;
  };
  features: {
    inventoryManagement: boolean;
    accounting: boolean;
    hrm: boolean;
    crm: boolean;
    projectManagement: boolean;
    reports: boolean;
    multiCurrency: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    auditLog: boolean;
    customIntegrations: boolean;
    dedicatedAccount: boolean;
  };
  displayOrder: number;
  isRecommended: boolean;
  isPublic: boolean;
}

// ============ DATOS DE PLANES ============

const PLAN_SEEDS: PlanSeedData[] = [
  {
    name: "Trial",
    description: "Plan de prueba por 30 días con acceso completo",
    type: PlanType.TRIAL,
    status: PlanStatus.ACTIVE,
    price: {
      monthly: 0,
      annual: 0,
      currency: "CLP",
      discount: 0,
    },
    limits: {
      maxUsers: 5,
      maxProducts: 100,
      maxMonthlyTransactions: 1000,
      storageGB: 1,
      maxApiCalls: 1000,
      maxBranches: 1,
    },
    features: {
      inventoryManagement: true,
      accounting: true,
      hrm: true,
      crm: true,
      projectManagement: true,
      reports: true,
      multiCurrency: false,
      apiAccess: true,
      customBranding: false,
      prioritySupport: false,
      advancedAnalytics: false,
      auditLog: false,
      customIntegrations: false,
      dedicatedAccount: false,
    },
    displayOrder: 1,
    isRecommended: false,
    isPublic: true,
  },
  {
    name: "Gratuito",
    description: "Plan gratuito ideal para comenzar",
    type: PlanType.FREE,
    status: PlanStatus.ACTIVE,
    price: {
      monthly: 0,
      annual: 0,
      currency: "CLP",
      discount: 0,
    },
    limits: {
      maxUsers: 2,
      maxProducts: 50,
      maxMonthlyTransactions: 100,
      storageGB: 0.5,
      maxApiCalls: 500,
      maxBranches: 1,
    },
    features: {
      inventoryManagement: true,
      accounting: false,
      hrm: false,
      crm: false,
      projectManagement: false,
      reports: false,
      multiCurrency: false,
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      advancedAnalytics: false,
      auditLog: false,
      customIntegrations: false,
      dedicatedAccount: false,
    },
    displayOrder: 2,
    isRecommended: false,
    isPublic: true,
  },
  {
    name: "Básico",
    description: "Plan básico para pequeñas empresas",
    type: PlanType.BASIC,
    status: PlanStatus.ACTIVE,
    price: {
      monthly: 29990,
      annual: 323892, // 10% descuento anual
      currency: "CLP",
      discount: 10,
    },
    limits: {
      maxUsers: 10,
      maxProducts: 1000,
      maxMonthlyTransactions: 5000,
      storageGB: 5,
      maxApiCalls: 5000,
      maxBranches: 2,
    },
    features: {
      inventoryManagement: true,
      accounting: true,
      hrm: false,
      crm: false,
      projectManagement: false,
      reports: true,
      multiCurrency: false,
      apiAccess: true,
      customBranding: false,
      prioritySupport: false,
      advancedAnalytics: false,
      auditLog: false,
      customIntegrations: false,
      dedicatedAccount: false,
    },
    displayOrder: 3,
    isRecommended: false,
    isPublic: true,
  },
  {
    name: "Profesional",
    description: "Plan profesional para empresas en crecimiento",
    type: PlanType.PROFESSIONAL,
    status: PlanStatus.ACTIVE,
    price: {
      monthly: 79990,
      annual: 863892, // 10% descuento anual
      currency: "CLP",
      discount: 10,
    },
    limits: {
      maxUsers: 25,
      maxProducts: 5000,
      maxMonthlyTransactions: 25000,
      storageGB: 10,
      maxApiCalls: 25000,
      maxBranches: 5,
    },
    features: {
      inventoryManagement: true,
      accounting: true,
      hrm: true,
      crm: true,
      projectManagement: false,
      reports: true,
      multiCurrency: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
      advancedAnalytics: true,
      auditLog: true,
      customIntegrations: false,
      dedicatedAccount: false,
    },
    displayOrder: 4,
    isRecommended: true,
    isPublic: true,
  },
  {
    name: "Empresarial",
    description: "Plan empresarial para grandes organizaciones",
    type: PlanType.ENTERPRISE,
    status: PlanStatus.ACTIVE,
    price: {
      monthly: 199990,
      annual: 2159892, // 10% descuento anual
      currency: "CLP",
      discount: 10,
    },
    limits: {
      maxUsers: 100,
      maxProducts: 50000,
      maxMonthlyTransactions: 100000,
      storageGB: 50,
      maxApiCalls: 100000,
      maxBranches: 20,
    },
    features: {
      inventoryManagement: true,
      accounting: true,
      hrm: true,
      crm: true,
      projectManagement: true,
      reports: true,
      multiCurrency: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
      advancedAnalytics: true,
      auditLog: true,
      customIntegrations: true,
      dedicatedAccount: true,
    },
    displayOrder: 5,
    isRecommended: false,
    isPublic: true,
  },
];

// ============ UTILIDADES DE LOGGING ============

const logInfo = (message: string): void =>
  console.log(colors.green(`✅ ${message}`));

const logWarning = (message: string): void =>
  console.log(colors.yellow(`⚠️  ${message}`));

const logError = (message: string): void =>
  console.log(colors.red(`❌ ${message}`));

const logProcess = (message: string): void =>
  console.log(colors.cyan(`ℹ️  ${message}`));

// ============ FUNCIÓN PRINCIPAL DE SEED ============

/**
 * Crear planes en la base de datos
 * @returns Map con tipo de plan → ObjectId
 */
export async function seedPlans(): Promise<
  Map<PlanType, mongoose.Types.ObjectId>
> {
  logProcess("Iniciando seed de planes...");

  const planMap = new Map<PlanType, mongoose.Types.ObjectId>();

  try {
    // Verificar si ya existen planes
    const existingPlansCount = await Plan.countDocuments();

    if (existingPlansCount > 0) {
      logWarning(`Ya existen ${existingPlansCount} planes en la base de datos`);

      // Cargar planes existentes al mapa
      const existingPlans = await Plan.find({ status: PlanStatus.ACTIVE });
      for (const plan of existingPlans) {
        planMap.set(plan.type, plan._id as mongoose.Types.ObjectId);
      }

      logInfo(`Planes existentes cargados: ${planMap.size}`);
      return planMap;
    }

    // Crear planes nuevos
    for (const planData of PLAN_SEEDS) {
      try {
        const newPlan = await Plan.create(planData);
        planMap.set(planData.type, newPlan._id as mongoose.Types.ObjectId);

        logInfo(
          `Plan "${planData.name}" creado - ${planData.type} (${
            planData.price.currency
          } $${planData.price.monthly.toLocaleString()}/mes)`
        );
      } catch (error) {
        if (error instanceof Error) {
          logError(`Error creando plan ${planData.name}: ${error.message}`);
        } else {
          logError(`Error desconocido creando plan ${planData.name}`);
        }
        throw error;
      }
    }

    logInfo(`✨ Seed de planes completado: ${planMap.size} planes creados`);

    // Mostrar resumen
    console.log(colors.blue("\n📊 Resumen de planes creados:"));
    for (const [type, id] of planMap.entries()) {
      const plan = PLAN_SEEDS.find((p) => p.type === type);
      if (plan) {
        console.log(
          colors.white(
            `  ${plan.isRecommended ? "⭐" : "  "} ${plan.name} (${type}) - ${
              plan.limits.maxUsers
            } usuarios`
          )
        );
      }
    }

    return planMap;
  } catch (error) {
    if (error instanceof Error) {
      logError(`Error en seed de planes: ${error.message}`);
    } else {
      logError("Error desconocido en seed de planes");
    }
    throw error;
  }
}

/**
 * Obtener plan por tipo
 * @param planType Tipo de plan a buscar
 * @returns Documento del plan o null
 */
export async function getPlanByType(
  planType: PlanType
): Promise<(IPlan & { _id: mongoose.Types.ObjectId }) | null> {
  try {
    const plan = await Plan.findOne({
      type: planType,
      status: PlanStatus.ACTIVE,
    });

    return plan as (IPlan & { _id: mongoose.Types.ObjectId }) | null;
  } catch (error) {
    if (error instanceof Error) {
      logError(`Error obteniendo plan ${planType}: ${error.message}`);
    }
    return null;
  }
}

/**
 * Verificar integridad de planes
 * @returns true si todos los planes están presentes
 */
export async function verifyPlans(): Promise<boolean> {
  try {
    logProcess("Verificando integridad de planes...");

    const requiredPlans = Object.values(PlanType);
    const existingPlans = await Plan.find({ status: PlanStatus.ACTIVE });

    const existingTypes = new Set(existingPlans.map((p) => p.type));
    const missingPlans = requiredPlans.filter(
      (type) => !existingTypes.has(type)
    );

    if (missingPlans.length > 0) {
      logWarning(`Planes faltantes: ${missingPlans.join(", ")}`);
      return false;
    }

    logInfo("✅ Todos los planes están presentes y activos");
    return true;
  } catch (error) {
    if (error instanceof Error) {
      logError(`Error verificando planes: ${error.message}`);
    }
    return false;
  }
}

// ============ EXPORTACIONES ============

export default seedPlans;
