/**
 * @fileoverview Plan Model
 * @description Modelo de planes de suscripción con Mongoose
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import mongoose, { Schema } from "mongoose";
import {
  IPlan,
  PlanType,
  PlanStatus,
  IPlanFeatures,
  IPlanLimits,
} from "../interfaces/IPlan";

/**
 * Schema para características del plan
 */
const planFeaturesSchema = new Schema<IPlanFeatures>(
  {
    inventoryManagement: { type: Boolean, default: false },
    accounting: { type: Boolean, default: false },
    hrm: { type: Boolean, default: false },
    crm: { type: Boolean, default: false },
    projectManagement: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    multiCurrency: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    auditLog: { type: Boolean, default: false },
    customIntegrations: { type: Boolean, default: false },
    dedicatedAccount: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Schema para límites del plan
 */
const planLimitsSchema = new Schema<IPlanLimits>(
  {
    maxUsers: { type: Number, required: true, min: 1, default: 1 },
    maxProducts: { type: Number, required: true, min: 1, default: 100 },
    maxMonthlyTransactions: {
      type: Number,
      required: true,
      min: 1,
      default: 100,
    },
    storageGB: { type: Number, required: true, min: 0.1, default: 1 },
    maxApiCalls: { type: Number, required: true, min: 0, default: 1000 },
    maxBranches: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

/**
 * Schema para precios del plan
 */
const planPriceSchema = new Schema(
  {
    monthly: { type: Number, required: true, min: 0, default: 0 },
    annual: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, required: true, default: "USD" },
    annualDiscount: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false }
);

/**
 * Schema principal del Plan
 */
const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: [true, "El nombre del plan es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    description: {
      type: String,
      required: [true, "La descripción del plan es requerida"],
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    type: {
      type: String,
      enum: Object.values(PlanType),
      required: [true, "El tipo de plan es requerido"],
      default: PlanType.FREE,
    },
    status: {
      type: String,
      enum: Object.values(PlanStatus),
      default: PlanStatus.ACTIVE,
    },
    price: {
      type: planPriceSchema,
      required: true,
      default: () => ({
        monthly: 0,
        annual: 0,
        currency: "USD",
        annualDiscount: 0,
      }),
    },
    limits: {
      type: planLimitsSchema,
      required: true,
      default: () => ({
        maxUsers: 1,
        maxCompanies: 1,
        storageLimit: 100,
        monthlyTransactions: 100,
        monthlyDocuments: 50,
        maxProducts: 100,
      }),
    },
    features: {
      type: planFeaturesSchema,
      required: true,
      default: () => ({
        userManagement: false,
        customRoles: false,
        inventory: false,
        sales: false,
        purchases: false,
        accounting: false,
        advancedReports: false,
        apiAccess: false,
        prioritySupport: false,
        cloudStorage: false,
        autoBackup: false,
        multiCurrency: false,
        thirdPartyIntegrations: false,
        advancedAudit: false,
      }),
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Índices para optimizar búsquedas
 */
planSchema.index({ type: 1 });
planSchema.index({ status: 1 });
planSchema.index({ displayOrder: 1 });
planSchema.index({ isRecommended: 1 });

/**
 * Middleware para asegurar solo un plan recomendado por tipo
 */
planSchema.pre("save", async function (next) {
  if (this.isRecommended && this.isModified("isRecommended")) {
    // Desmarcar otros planes recomendados del mismo tipo
    await mongoose
      .model("Plan")
      .updateMany(
        { type: this.type, _id: { $ne: this._id } },
        { $set: { isRecommended: false } }
      );
  }
  next();
});

/**
 * Método para verificar si un plan está activo
 */
planSchema.methods.isActive = function (): boolean {
  return this.status === PlanStatus.ACTIVE;
};

export default mongoose.model<IPlan>("Plan", planSchema);
