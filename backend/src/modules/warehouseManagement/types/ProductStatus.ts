/** Autor: @elsoprimeDev */

/**
 * Enum para los estados del producto
 */
export const ProductStatus = {
  INACTIVE: 'inactive',
  ACTIVE: 'active'
} as const

export type ProductStatusType =
  (typeof ProductStatus)[keyof typeof ProductStatus]
