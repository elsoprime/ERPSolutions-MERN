/** Autor: @elsoprimeDev */

/**
 * Enum para el tipo de producto
 */
export const ProductTypeEnum = {
  PHYSICAL: 'physical',
  DIGITAL: 'digital',
  SERVICE: 'service'
} as const

export type ProductTypeEnumType =
  (typeof ProductTypeEnum)[keyof typeof ProductTypeEnum]
