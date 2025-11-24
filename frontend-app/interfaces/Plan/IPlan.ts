/**
 * @description Interface para los planes de suscripción
 * @author Esteban Soto (@elsoprimeDev)
 */

export interface IPlanFeatures {
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
}

export interface IPlanLimits {
  maxUsers: number;
  maxProducts: number;
  maxMonthlyTransactions: number;
  storageGB: number;
  maxApiCalls: number;
  maxBranches: number;
}

export interface IPlanPrice {
  monthly: number;
  annual: number;
  currency: string;
  discount?: number;
}

export interface IPlan {
  _id: string;
  name: string;
  description: string;
  type: "trial" | "free" | "basic" | "professional" | "enterprise";
  status: "active" | "inactive" | "archived";
  limits: IPlanLimits;
  features: IPlanFeatures;
  price: IPlanPrice;
  displayOrder: number;
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
}
