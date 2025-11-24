/**
 * @fileoverview Plan TypeScript Interfaces
 * @description Interfaces para planes de suscripción
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import { Document } from "mongoose";

/**
 * Tipos de planes disponibles
 * @description Alineado con SubscriptionPlan del módulo de empresas
 */
export enum PlanType {
  TRIAL = "trial",
  FREE = "free",
  BASIC = "basic",
  PROFESSIONAL = "professional",
  ENTERPRISE = "enterprise",
}

/**
 * Estados del plan
 */
export enum PlanStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DEPRECATED = "deprecated",
}

/**
 * Características del plan
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

/**
 * Límites del plan
 */
export interface IPlanLimits {
  maxUsers: number;
  maxProducts: number;
  maxMonthlyTransactions: number;
  storageGB: number;
  maxApiCalls: number;
  maxBranches: number;
}

/**
 * Precios del plan
 */
export interface IPlanPrice {
  monthly: number;
  annual: number;
  currency: string;
  discount: number;
}

/**
 * Interfaz principal del Plan
 */
export interface IPlan extends Document {
  name: string;
  description: string;
  type: PlanType;
  status: PlanStatus;
  price: IPlanPrice;
  limits: IPlanLimits;
  features: IPlanFeatures;
  isRecommended: boolean;
  isPublic: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
