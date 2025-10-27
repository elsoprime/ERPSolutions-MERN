/**
 * Utilidades para exportación de datos a CSV
 *
 */

export interface ExportOptions {
  filename?: string
  headers?: string[]
  dateInFilename?: boolean
}

/**
 * Escapa valores CSV que contengan comas, comillas o saltos de línea
 */
const escapeCsvValue = (value: string): string => {
  if (value == null) return ''

  const stringValue = String(value)

  // Si contiene coma, comilla doble o salto de línea, envolver en comillas
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    // Escapar comillas dobles duplicándolas
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Convierte un array de objetos a formato CSV
 */
export const objectArrayToCsv = <T extends Record<string, any>>(
  data: T[],
  headers: string[]
): string => {
  if (!data || data.length === 0) {
    return headers.join(',')
  }

  const headerRow = headers.map(escapeCsvValue).join(',')

  const dataRows = data.map(item => {
    return Object.keys(item)
      .filter(key => key !== 'id') // Excluir el ID por defecto
      .map(key => escapeCsvValue(item[key]))
      .join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Convierte un array de arrays a formato CSV
 */
export const arrayToCsv = (data: any[][]): string => {
  return data.map(row => row.map(escapeCsvValue).join(',')).join('\n')
}

/**
 * Descarga un string CSV como archivo
 */
export const downloadCsv = (csvContent: string, filename: string): void => {
  // Agregar BOM para correcta visualización en Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], {type: 'text/csv;charset=utf-8;'})
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  // Limpiar
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Genera un nombre de archivo con fecha opcional
 */
export const generateFilename = (
  baseName: string,
  includeDate: boolean = true
): string => {
  if (!includeDate) {
    return `${baseName}.csv`
  }

  const date = new Date().toISOString().split('T')[0]
  return `${baseName}-${date}.csv`
}

/**
 * Exporta un array de objetos a CSV y descarga el archivo
 */
export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): void => {
  const {filename = 'export', headers, dateInFilename = true} = options

  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  // Si no se proporcionan headers, usar las keys del primer objeto
  const csvHeaders = headers || Object.keys(data[0]).filter(key => key !== 'id')

  const csvContent = objectArrayToCsv(data, csvHeaders)
  const fileName = generateFilename(filename, dateInFilename)

  downloadCsv(csvContent, fileName)
}

/**
 * Exporta un array de arrays a CSV y descarga el archivo
 */
export const exportArrayToCsv = (
  data: any[][],
  filename: string = 'export',
  dateInFilename: boolean = true
): void => {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  const csvContent = arrayToCsv(data)
  const fileName = generateFilename(filename, dateInFilename)

  downloadCsv(csvContent, fileName)
}

// Función legacy para compatibilidad con código existente
export const exportCategoriesToCsv = (
  categories: Array<{name: string; description: string}>
): void => {
  const data = [
    ['Nombre', 'Descripción'],
    ...categories.map(cat => [cat.name, cat.description])
  ]

  exportArrayToCsv(data, 'categorias', true)
}
