/**
 * Autor: Esteban Soto @elsoprimeDev
 */

// Definiendo Vadlidaciones para la URL
export function isValidURL(url: string): boolean {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocolo
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // dominio
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // IP (v4) dirección
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // puerto y ruta
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // cadena de consulta
      '(\\#[-a-z\\d_]*)?$',
    'i' // fragmento de anclaje
  )
  return !!urlPattern.test(url)
}

// Definiendo la Función para Crear un Slug
export function createSlug(productName: string): string {
  return productName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Reemplaza los caracteres no permitidos por guiones
    .replace(/^-+|-+$/g, '') // Elimina guiones al principio o al final
}

// Definiendo la Función para Generar SKU
/** Generar SKU para los Productos */
export const generateSKU = (
  categoryCode: number, // Asumimos que el código de categoría es un número
  brand: string,
  totalRecords: number
): string => {
  // Normalizar y extraer los primeros caracteres de la marca
  const normalizedBrand = brand.trim().toUpperCase().replace(/\s+/g, '')
  const brandCode = normalizedBrand.slice(0, 3) // Primeros 3 caracteres de la marca

  // Agregar un número secuencial
  const sequenceNumber = (totalRecords + 1).toString().padStart(3, '0') // Rellena con ceros si es necesario

  // Generar SKU con formato ###-ABC-###
  const SKU = `${categoryCode}-${brandCode}-${sequenceNumber}`

  return SKU
}
