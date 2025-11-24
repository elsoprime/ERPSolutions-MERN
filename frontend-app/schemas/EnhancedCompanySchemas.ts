import {
  BUSINESS_TYPES,
  INDUSTRIES,
} from "@/interfaces/EnhanchedCompany/EnhancedCompany";
import { IPlanFeatures } from "@/interfaces/Plan/IPlan";
import { I } from "node_modules/framer-motion/dist/types.d-BJcRxCew";
import { z } from "zod";

// Schema base para campos comunes entre creación y edición
const baseCompanySchema = z.object({
  // Información básica
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  description: z.string().optional(),
  website: z
    .string()
    .optional()
    .transform((val) => val?.trim() || "")
    .pipe(z.union([z.literal(""), z.string().url("URL inválida")])),
  phone: z.string().optional(),

  // Ubicación
  address: z.object({
    street: z
      .string()
      .min(1, "La dirección es requerida")
      .min(5, "Dirección debe tener al menos 5 caracteres"),

    city: z
      .string()
      .min(1, "La ciudad es requerida")
      .min(2, "Ciudad debe tener al menos 2 caracteres"),

    state: z
      .string()
      .min(1, "El estado/región es requerido")
      .min(2, "Estado/Región debe tener al menos 2 caracteres"),

    country: z
      .string()
      .min(1, "El país es requerido")
      .min(2, "País debe tener al menos 2 caracteres"),

    postalCode: z
      .string()
      .min(1, "El código postal es requerido")
      .min(3, "Código postal debe tener al menos 3 caracteres"),
  }),

  // Configuraciones de negocio
  settings: z.object({
    businessType: z.enum(BUSINESS_TYPES, {
      errorMap: () => ({ message: "Tipo de negocio requerido" }),
    }),

    industry: z.enum(INDUSTRIES, {
      errorMap: () => ({ message: "Industria requerida" }),
    }),

    taxId: z
      .string()
      .min(1, "RUT/Tax ID es requerido")
      .min(8, "RUT/Tax ID debe tener al menos 8 caracteres"),

    currency: z
      .string()
      .min(1, "La moneda es requerida")
      .min(3, "Código de moneda inválido"),

    fiscalYear: z.object({
      startMonth: z
        .number()
        .min(1, "Mes de inicio debe estar entre 1 y 12")
        .max(12, "Mes de inicio debe estar entre 1 y 12"),

      endMonth: z
        .number()
        .min(1, "Mes de fin debe estar entre 1 y 12")
        .max(12, "Mes de fin debe estar entre 1 y 12"),
    }),
  }),

  // Plan de suscripción (estructura para crear empresa)
  subscription: z.object({
    planId: z.string().min(1, "Plan requerido"), // ✅ ObjectId
    autoRenew: z.boolean().default(true),
  }),

  // Características habilitadas
  features: z.object({
    inventoryManagement: z.boolean().default(false),
    accounting: z.boolean().default(false),
    hrm: z.boolean().default(false),
    crm: z.boolean().default(false),
    projectManagement: z.boolean().default(false),
    reports: z.boolean().default(false),
    multiCurrency: z.boolean().default(false),
    apiAccess: z.boolean().default(false),
    customBranding: z.boolean().default(false),
    prioritySupport: z.boolean().default(false),
    advancedAnalytics: z.boolean().default(false),
    auditLog: z.boolean().default(false),
    customIntegrations: z.boolean().default(false),
    dedicatedAccount: z.boolean().default(false),
  }) as z.ZodType<IPlanFeatures>,

  // Personalización
  branding: z.object({
    primaryColor: z
      .string()
      .min(1, "Color primario requerido")
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Formato de color hexadecimal inválido"
      ),

    secondaryColor: z
      .string()
      .min(1, "Color secundario requerido")
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Formato de color hexadecimal inválido"
      ),
  }),
});

// Schema para crear empresas (sin _id y sin status)
export const createCompanySchema = baseCompanySchema;

// Schema para actualizar empresas (incluye _id y status opcional)
export const updateCompanySchema = baseCompanySchema.extend({
  _id: z.string().min(1, "ID de empresa requerido"),
  // Status para evitar que se pierda al actualizar (incluye 'trial' para empresas en período de prueba)
  status: z.enum(["active", "inactive", "suspended", "trial"]).optional(),
});

// Schema para la estructura completa de empresa (como viene del backend)
export const companySchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  description: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }),
  settings: z.object({
    businessType: z.enum(BUSINESS_TYPES),
    industry: z.enum(INDUSTRIES),
    taxId: z.string(),
    currency: z.string(),
    fiscalYear: z.object({
      startMonth: z.number(),
      endMonth: z.number(),
    }),
    features: z.object({
      inventoryManagement: z.boolean(),
      accounting: z.boolean(),
      hrm: z.boolean(),
      crm: z.boolean(),
      projectManagement: z.boolean(),
      reports: z.boolean(),
      multiCurrency: z.boolean(),
      apiAccess: z.boolean(),
      customBranding: z.boolean(),
      prioritySupport: z.boolean(),
      advancedAnalytics: z.boolean(),
      auditLog: z.boolean(),
      customIntegrations: z.boolean(),
      dedicatedAccount: z.boolean(),
    }),
    branding: z.object({
      primaryColor: z.string(),
      secondaryColor: z.string(),
    }),
  }),
  plan: z.enum(["trial", "free", "basic", "professional", "enterprise"]),
  status: z.enum(["active", "inactive", "suspended"]),
  subscription: z
    .object({
      planId: z.string().min(1).min(1, "Plan requerido"),
      autoRenew: z.boolean(),
    })
    .optional(),
});

// Tipos inferidos de los esquemas
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>;
export type Company = z.infer<typeof companySchema>;

// Valores por defecto para el formulario de creación
export const defaultCompanyFormValues: Partial<CreateCompanyFormData> = {
  name: "",
  email: "",
  description: "",
  website: "",
  phone: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  },
  settings: {
    businessType: "" as any, // Vacío para forzar selección del usuario
    industry: "" as any, // Vacío para forzar selección del usuario
    taxId: "",
    currency: "CLP",
    fiscalYear: {
      startMonth: 1,
      endMonth: 12,
    },
  },
  subscription: {
    planId: "",
    autoRenew: true,
  },
  features: {
    inventoryManagement: false,
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

  branding: {
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
  },
};

// Función helper para convertir datos de empresa existente a formato de formulario de edición
export const convertCompanyToUpdateFormData = (
  company: Company
): UpdateCompanyFormData => {
  return {
    _id: company._id,
    name: company.name,
    email: company.email,
    description: company.description || "",
    website: company.website || "",
    phone: company.phone || "",
    address: company.address,
    settings: {
      businessType: company.settings.businessType,
      industry: company.settings.industry,
      taxId: company.settings.taxId,
      currency: company.settings.currency,
      fiscalYear: company.settings.fiscalYear,
    },
    // Mantener status original
    status: company.status,
    subscription: {
      planId: company.subscription ? company.subscription.planId : "",
      autoRenew: company.subscription?.autoRenew ?? false,
    },
    features: {
      inventoryManagement:
        company.settings?.features?.inventoryManagement ?? false,
      accounting: company.settings?.features?.accounting ?? false,
      hrm: company.settings?.features?.hrm ?? false,
      crm: company.settings?.features?.crm ?? false,
      projectManagement: company.settings?.features?.projectManagement ?? false,
      reports: company.settings?.features?.reports ?? false,
      multiCurrency: company.settings?.features?.multiCurrency ?? false,
      apiAccess: company.settings?.features?.apiAccess ?? false,
      customBranding: company.settings?.features?.customBranding ?? false,
      prioritySupport: company.settings?.features?.prioritySupport ?? false,
      advancedAnalytics: company.settings?.features?.advancedAnalytics ?? false,
      auditLog: company.settings?.features?.auditLog ?? false,
      customIntegrations:
        company.settings?.features?.customIntegrations ?? false,
      dedicatedAccount: company.settings?.features?.dedicatedAccount ?? false,
    },
    branding: {
      primaryColor: company.settings?.branding?.primaryColor || "#3B82F6",
      secondaryColor: company.settings?.branding?.secondaryColor || "#10B981",
    },
  };
};

// Función helper para sanitizar datos antes del envío (usado en EditCompanyForm)
export const sanitizeCompanyUpdateData = (
  data: UpdateCompanyFormData,
  originalCompany: Company
): UpdateCompanyFormData => {
  return {
    ...data,
    // Forzar status correcto: mantener el original si es válido, sino 'active'
    status: (["active", "inactive", "suspended"] as const).includes(
      originalCompany.status
    )
      ? originalCompany.status
      : "active",
  };
};
