import {
  BUSINESS_TYPES,
  INDUSTRIES
} from '@/interfaces/EnhanchedCompany/EnhancedCompany'
import {businessTypeTranslate} from '@/locale/es'

/**
 * Opciones para selects en formularios Empresas
 * @returns Array de opciones traducidas
 */

export interface SelectOption {
  value: string
  label: string
  key: string
}

export const getTranslatedBusinessTypes = (): SelectOption[] => {
  return BUSINESS_TYPES.map(type => ({
    value: type,
    label: businessTypeTranslate[type] || type,
    key: type
  }))
}

export const getTranslatedIndustries = (): SelectOption[] => {
  return INDUSTRIES.map(industry => ({
    value: industry,
    label: industry, // Ya están en español
    key: industry
  }))
}
