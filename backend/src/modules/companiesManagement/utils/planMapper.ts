/**
 * Utilidades para mapeo entre Plan y Company sin usar 'any'
 */
import { Types } from "mongoose";
import { IPlan } from "@/interfaces/IPlan";
import {
  ICompanyFeatures,
  ICompanyLimits,
  ICompanyPricing,
} from "../types/EnhandedCompanyTypes";
import { PlanType } from "@/interfaces/IPlan";

/**
 * Mapea IPlanFeatures → ICompanyFeatures (tipado completo)
 */
export function mapPlanFeaturesToCompanyFeatures(
  planFeatures: IPlan["features"]
): ICompanyFeatures {
  return {
    inventoryManagement: planFeatures.inventoryManagement,
    accounting: planFeatures.accounting,
    hrm: planFeatures.hrm,
    crm: planFeatures.crm,
    projectManagement: planFeatures.projectManagement,
    reports: planFeatures.reports,
    multiCurrency: planFeatures.multiCurrency,
    apiAccess: planFeatures.apiAccess,
    customBranding: planFeatures.customBranding,
    prioritySupport: planFeatures.prioritySupport,
    advancedAnalytics: planFeatures.advancedAnalytics,
    auditLog: planFeatures.auditLog,
    customIntegrations: planFeatures.customIntegrations,
    dedicatedAccount: planFeatures.dedicatedAccount,
  };
}

/**
 * Mapea IPlanLimits → ICompanyLimits (tipado completo)
 */
export function mapPlanLimitsToCompanyLimits(
  planLimits: IPlan["limits"]
): ICompanyLimits {
  return {
    maxUsers: planLimits.maxUsers,
    maxProducts: planLimits.maxProducts,
    maxMonthlyTransactions: planLimits.maxMonthlyTransactions,
    storageGB: planLimits.storageGB,
    maxApiCalls: planLimits.maxApiCalls,
    maxBranches: planLimits.maxBranches,
  };
}

/**
 * Extrae información de pricing del plan
 */
export function extractPricingFromPlan(
  plan: IPlan,
  billingCycle: "monthly" | "annual" = "monthly"
): ICompanyPricing {
  return {
    planId: plan._id as Types.ObjectId,
    planName: plan.name,
    planType: plan.type,
    monthlyPrice: plan.price.monthly,
    annualPrice: plan.price.annual,
    currency: plan.price.currency,
    discount: plan.price.discount,
    billingCycle,
    nextBillingDate: undefined,
    lastPaymentDate: undefined,
  };
}

/**
 * Valida si una empresa puede cambiar a un plan específico
 */
export interface IPlanChangeValidation {
  canChange: boolean;
  violations: string[];
  warnings: string[];
}

export function validatePlanChange(
  currentStats: {
    totalUsers: number;
    totalProducts: number;
    storageUsed: number;
  },
  newPlanLimits: ICompanyLimits
): IPlanChangeValidation {
  const violations: string[] = [];
  const warnings: string[] = [];

  // Validar usuarios
  if (currentStats.totalUsers > newPlanLimits.maxUsers) {
    violations.push(
      `La empresa tiene ${currentStats.totalUsers} usuarios activos pero el nuevo plan solo permite ${newPlanLimits.maxUsers}`
    );
  } else if (currentStats.totalUsers >= newPlanLimits.maxUsers * 0.9) {
    warnings.push(
      `La empresa está usando el 90% del límite de usuarios del nuevo plan`
    );
  }

  // Validar productos
  if (currentStats.totalProducts > newPlanLimits.maxProducts) {
    violations.push(
      `La empresa tiene ${currentStats.totalProducts} productos pero el nuevo plan solo permite ${newPlanLimits.maxProducts}`
    );
  }

  // Validar almacenamiento
  const storageGB = currentStats.storageUsed / 1024;
  if (storageGB > newPlanLimits.storageGB) {
    violations.push(
      `La empresa usa ${storageGB.toFixed(
        2
      )}GB pero el nuevo plan solo permite ${newPlanLimits.storageGB}GB`
    );
  }

  return {
    canChange: violations.length === 0,
    violations,
    warnings,
  };
}
