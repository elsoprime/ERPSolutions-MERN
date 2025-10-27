import {BUSINESS_TYPES, INDUSTRIES} from '@/interfaces/EnhancedCompany'
import {z} from 'zod'

// Schema de validación con Zod
export const createCompanySchema = z.object({
  // Información básica
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  description: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  phone: z.string().optional(),

  // Ubicación
  address: z.object({
    street: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
    city: z.string().min(2, 'Ciudad requerida'),
    state: z.string().min(2, 'Estado/Región requerida'),
    country: z.string().min(2, 'País requerido'),
    postalCode: z.string().min(3, 'Código postal requerido')
  }),

  // Configuraciones de negocio
  settings: z.object({
    businessType: z.enum(BUSINESS_TYPES),
    industry: z.enum(INDUSTRIES),
    taxId: z.string().min(8, 'RUT/Tax ID debe tener al menos 8 caracteres'),
    currency: z.string().min(3, 'Moneda requerida'),
    fiscalYear: z.object({
      startMonth: z.number().min(1).max(12),
      endMonth: z.number().min(1).max(12)
    })
  }),

  // Plan de suscripción
  subscription: z.object({
    plan: z.enum(['free', 'basic', 'professional', 'enterprise']),
    autoRenew: z.boolean()
  }),

  // Características habilitadas
  features: z.object({
    inventory: z.boolean(),
    accounting: z.boolean(),
    hrm: z.boolean(),
    crm: z.boolean(),
    projects: z.boolean()
  }),

  // Personalización
  branding: z.object({
    primaryColor: z.string().min(4, 'Color primario requerido'),
    secondaryColor: z.string().min(4, 'Color secundario requerido')
  })
})

export type CreateCompanyFormData = z.infer<typeof createCompanySchema>
