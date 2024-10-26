/**
 * Autor: Esteban Soto @elsoprimeDev
 */

/** Generar SKU para los Productos */
export const generateSKU = (name: string, totalRecords: number): string => {
  const normalizedCategory = name.trim().toUpperCase().replace(/\s+/g, '')
  const categoryCode = normalizedCategory.slice(0, 3)
  const sequenceNumber = (totalRecords + 1).toString().padStart(3, '0')
  return `${categoryCode}-${sequenceNumber}`
}
