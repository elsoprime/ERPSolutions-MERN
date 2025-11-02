import {
  BUSINESS_TYPES,
  INDUSTRIES
} from '@/interfaces/EnhanchedCompany/EnhancedCompany'
import {z} from 'zod'

// Schema base para campos comunes entre creación y edición
const baseCompanySchema = z.object({
  // Información básica
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  description: z.string().optional(),
  website: z
    .string()
    .optional()
    .transform(val => val?.trim() || '')
    .pipe(z.union([z.literal(''), z.string().url('URL inválida')])),
  phone: z.string().optional(),

  // Ubicación
  address: z.object({
    street: z
      .string()
      .min(1, 'La dirección es requerida')
      .min(5, 'Dirección debe tener al menos 5 caracteres'),

    city: z
      .string()
      .min(1, 'La ciudad es requerida')
      .min(2, 'Ciudad debe tener al menos 2 caracteres'),

    state: z
      .string()
      .min(1, 'El estado/región es requerido')
      .min(2, 'Estado/Región debe tener al menos 2 caracteres'),

    country: z
      .string()
      .min(1, 'El país es requerido')
      .min(2, 'País debe tener al menos 2 caracteres'),

    postalCode: z
      .string()
      .min(1, 'El código postal es requerido')
      .min(3, 'Código postal debe tener al menos 3 caracteres')
  }),

  // Configuraciones de negocio
  settings: z.object({
    businessType: z.enum(BUSINESS_TYPES, {
      errorMap: () => ({message: 'Tipo de negocio requerido'})
    }),

    industry: z.enum(INDUSTRIES, {
      errorMap: () => ({message: 'Industria requerida'})
    }),

    taxId: z
      .string()
      .min(1, 'RUT/Tax ID es requerido')
      .min(8, 'RUT/Tax ID debe tener al menos 8 caracteres'),

    currency: z
      .string()
      .min(1, 'La moneda es requerida')
      .min(3, 'Código de moneda inválido'),

    fiscalYear: z.object({
      startMonth: z
        .number()
        .min(1, 'Mes de inicio debe estar entre 1 y 12')
        .max(12, 'Mes de inicio debe estar entre 1 y 12'),

      endMonth: z
        .number()
        .min(1, 'Mes de fin debe estar entre 1 y 12')
        .max(12, 'Mes de fin debe estar entre 1 y 12')
    })
  }),

  // Plan de suscripción (estructura para crear empresa)
  subscription: z.object({
    plan: z.enum(['trial', 'free', 'basic', 'professional', 'enterprise'], {
      errorMap: () => ({message: 'Plan de suscripción requerido'})
    }),
    autoRenew: z.boolean().default(true)
  }),

  // Características habilitadas
  features: z.object({
    inventory: z.boolean().default(false),
    accounting: z.boolean().default(false),
    hrm: z.boolean().default(false),
    crm: z.boolean().default(false),
    projects: z.boolean().default(false)
  }),

  // Personalización
  branding: z.object({
    primaryColor: z
      .string()
      .min(1, 'Color primario requerido')
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Formato de color hexadecimal inválido'
      ),

    secondaryColor: z
      .string()
      .min(1, 'Color secundario requerido')
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Formato de color hexadecimal inválido'
      )
  })
})

// Schema para crear empresas (sin _id y sin status)
export const createCompanySchema = baseCompanySchema

// Schema para actualizar empresas (incluye _id y status opcional)
export const updateCompanySchema = baseCompanySchema.extend({
  _id: z.string().min(1, 'ID de empresa requerido'),
  // Status para evitar que se pierda al actualizar (solo valores válidos de status operacional)
  status: z.enum(['active', 'inactive', 'suspended']).optional()
})

// Tipos inferidos de los esquemas
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>

// Valores por defecto para el formulario de creación
export const defaultCompanyFormValues: Partial<CreateCompanyFormData> = {
  name: '',
  email: '',
  description: '',
  website: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  },
  settings: {
    businessType: 'consulting',
    industry: 'Manufactura',
    taxId: '',
    currency: 'CLP',
    fiscalYear: {
      startMonth: 1,
      endMonth: 12
    }
  },
  subscription: {
    plan: 'free',
    autoRenew: true
  },
  features: {
    inventory: false,
    accounting: false,
    hrm: false,
    crm: false,
    projects: false
  },
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981'
  }
}

// Función helper para convertir datos de empresa existente a formato de formulario de edición
export const convertCompanyToUpdateFormData = (
  company: any
): UpdateCompanyFormData => {
  return {
    _id: company._id,
    name: company.name,
    email: company.email,
    description: company.description || '',
    website: company.website || '',
    phone: company.phone || '',
    address: company.address,
    settings: {
      businessType: company.settings.businessType,
      industry: company.settings.industry,
      taxId: company.settings.taxId,
      currency: company.settings.currency,
      fiscalYear: company.settings.fiscalYear
    },
    // Mantener status original (ya no puede ser 'trial' por la interfaz corregida)
    status: company.status,
    subscription: {
      plan: company.plan,
      autoRenew: company.subscription?.autoRenew || false
    },
    features: company.settings.features,
    branding: {
      primaryColor: company.settings.branding.primaryColor,
      secondaryColor: company.settings.branding.secondaryColor
    }
  }
}

// Función helper para sanitizar datos antes del envío (usado en EditCompanyForm)
export const sanitizeCompanyUpdateData = (
  data: UpdateCompanyFormData,
  originalCompany: any
) => {
  return {
    ...data,
    // Forzar status correcto: mantener el original si es válido, sino 'active'
    status: ['active', 'inactive', 'suspended'].includes(originalCompany.status)
      ? originalCompany.status
      : 'active'
  }
}
