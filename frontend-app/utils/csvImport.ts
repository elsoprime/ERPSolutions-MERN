/**
 * Utilidades para importación de datos desde CSV
 */

export interface ParsedCsvData<T = Record<string, string>> {
  data: T[]
  headers: string[]
  errors: string[]
}

export interface ImportOptions {
  requiredHeaders?: string[]
  skipEmptyLines?: boolean
  trimValues?: boolean
  validateRow?: (row: any, index: number) => string | null // Retorna mensaje de error o null si es válido
}

/**
 * Parsea un valor CSV considerando comillas y escapes
 */
const parseCsvValue = (value: string): string => {
  let result = value.trim()

  // Si está entre comillas, removerlas y desescapar comillas dobles
  if (result.startsWith('"') && result.endsWith('"')) {
    result = result.slice(1, -1).replace(/""/g, '"')
  }

  return result
}

/**
 * Divide una línea CSV respetando comillas
 */
const splitCsvLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Comilla escapada
        current += '"'
        i++ // Saltar la siguiente comilla
      } else {
        // Toggle del estado de comillas
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Separador encontrado fuera de comillas
      result.push(parseCsvValue(current))
      current = ''
    } else {
      current += char
    }
  }

  // Agregar el último valor
  result.push(parseCsvValue(current))

  return result
}

/**
 * Valida que los headers requeridos estén presentes
 */
const validateHeaders = (
  headers: string[],
  requiredHeaders: string[]
): string | null => {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  const missingHeaders = requiredHeaders.filter(
    required => !normalizedHeaders.includes(required.toLowerCase())
  )

  if (missingHeaders.length > 0) {
    return `Faltan las siguientes columnas requeridas: ${missingHeaders.join(
      ', '
    )}`
  }

  return null
}

/**
 * Parsea un archivo CSV a un array de objetos
 */
export const parseCsv = <T extends Record<string, string>>(
  csvContent: string,
  options: ImportOptions = {}
): ParsedCsvData<T> => {
  const {
    requiredHeaders = [],
    skipEmptyLines = true,
    trimValues = true,
    validateRow
  } = options

  const errors: string[] = []
  const data: T[] = []

  try {
    // Dividir por líneas
    const lines = csvContent.split(/\r?\n/)

    if (lines.length === 0) {
      errors.push('El archivo está vacío')
      return {data, headers: [], errors}
    }

    // Parsear headers
    const headerLine = lines[0]
    if (!headerLine || headerLine.trim() === '') {
      errors.push('El archivo no contiene encabezados')
      return {data, headers: [], errors}
    }

    const headers = splitCsvLine(headerLine).map(h =>
      trimValues ? h.trim() : h
    )

    // Validar headers requeridos
    if (requiredHeaders.length > 0) {
      const headerError = validateHeaders(headers, requiredHeaders)
      if (headerError) {
        errors.push(headerError)
        return {data, headers, errors}
      }
    }

    // Parsear datos
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]

      // Saltar líneas vacías si está configurado
      if (skipEmptyLines && (!line || line.trim() === '')) {
        continue
      }

      const values = splitCsvLine(line)

      // Validar que tenga el número correcto de columnas
      if (values.length !== headers.length) {
        errors.push(
          `Línea ${i + 1}: Número incorrecto de columnas (esperado: ${
            headers.length
          }, encontrado: ${values.length})`
        )
        continue
      }

      // Crear objeto
      const row: any = {}
      headers.forEach((header, index) => {
        const value = trimValues ? values[index].trim() : values[index]
        row[header.toLowerCase()] = value
      })

      // Validación personalizada
      if (validateRow) {
        const validationError = validateRow(row, i)
        if (validationError) {
          errors.push(`Línea ${i + 1}: ${validationError}`)
          continue
        }
      }

      data.push(row as T)
    }

    return {data, headers, errors}
  } catch (error) {
    errors.push(
      `Error al parsear el archivo: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    )
    return {data, headers: [], errors}
  }
}

/**
 * Lee un archivo y retorna su contenido como texto
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = event => {
      const result = event.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('El archivo no pudo ser leído como texto'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * Importa y parsea un archivo CSV
 */
export const importCsvFile = async <T extends Record<string, string>>(
  file: File,
  options: ImportOptions = {}
): Promise<ParsedCsvData<T>> => {
  try {
    // Validar que sea un archivo CSV
    if (!file.name.endsWith('.csv')) {
      return {
        data: [],
        headers: [],
        errors: ['El archivo debe ser un CSV (.csv)']
      }
    }

    // Leer el archivo
    const content = await readFileAsText(file)

    // Parsear el contenido
    return parseCsv<T>(content, options)
  } catch (error) {
    return {
      data: [],
      headers: [],
      errors: [
        `Error al procesar el archivo: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      ]
    }
  }
}

/**
 * Valida datos antes de importar a la base de datos
 */
export const validateImportData = <T extends Record<string, any>>(
  data: T[],
  validators: {
    [K in keyof T]?: (value: T[K], row: T, index: number) => string | null
  }
): {valid: T[]; invalid: Array<{row: T; index: number; errors: string[]}>} => {
  const valid: T[] = []
  const invalid: Array<{row: T; index: number; errors: string[]}> = []

  data.forEach((row, index) => {
    const rowErrors: string[] = []

    // Validar cada campo
    Object.keys(validators).forEach(key => {
      const validator = validators[key]
      if (validator) {
        const error = validator(row[key], row, index)
        if (error) {
          rowErrors.push(error)
        }
      }
    })

    if (rowErrors.length > 0) {
      invalid.push({row, index: index + 1, errors: rowErrors})
    } else {
      valid.push(row)
    }
  })

  return {valid, invalid}
}

/**
 * Función helper para importar categorías específicamente
 * @description Extiende el tipo Record<string, string> para permitir cualquier campo adicional
 * pero requiere 'nombre' y 'descripción'.
 *
 */
export interface CategoryImport extends Record<string, string> {
  nombre: string
  descripción: string
}

export const importCategories = async (
  file: File
): Promise<ParsedCsvData<CategoryImport>> => {
  return importCsvFile<CategoryImport>(file, {
    requiredHeaders: ['nombre', 'descripción'],
    skipEmptyLines: true,
    trimValues: true,
    validateRow: (row, index) => {
      if (!row.nombre || row.nombre.trim() === '') {
        return 'El nombre es requerido'
      }
      if (!row.descripción || row.descripción.trim() === '') {
        return 'La descripción es requerida'
      }
      if (row.nombre.length > 100) {
        return 'El nombre no puede exceder 100 caracteres'
      }
      if (row.descripción.length > 500) {
        return 'La descripción no puede exceder 500 caracteres'
      }
      return null
    }
  })
}
