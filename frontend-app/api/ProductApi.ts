/**
 * Autor: Esteban Soto @elsoprimeDev
 */

/**
 * Definiendo la API de productos
 */

import {
  ProductsFormData,
  Product,
  ProductsListSchema
} from '@/schemas/productsSchema'
import axiosInstance from './axios'
import {isAxiosError} from 'axios'
import {createSlug, generateSKU, isValidURL} from '@/utils/utilsProducts'

/**
 * Definiendo los Types para Productos
 */
export type ProductApi = {
  formData: ProductsFormData
  productId?: Product['_id']
}

export type ProductsResponse = {
  products: Product[]
  total: number
  limit: number
  page: number
}

/**
 * Definiendo Metodo Async para Crear un Nuevo Producto
 */
export async function createProduct({formData}: ProductApi) {
  try {
    //Implementar Slug
    formData.slug = createSlug(formData.name)

    // Obtener el total de productos en la misma Categoría para generar el SKU

    // Obtener el total de productos en la misma categoría para generar el SKU
    const totalProductsResponse = await axiosInstance.get(
      `/warehouse/products?category=${formData.category}`
    )
    const totalProducts = totalProductsResponse.data.total || 0 // Asegúrate de que total tenga un valor por defecto

    // Asegúrate de que category sea un número
    const category =
      typeof formData.category === 'number'
        ? formData.category
        : parseInt(formData.category.toString(), 10) // Convertir a número

    // Generar el SKU del producto
    formData.sku = generateSKU(
      category,
      formData.brand || '', // Usar cadena vacía si no hay marca
      totalProducts + 1 // Se agrega uno para el nuevo producto
    )

    const {data} = await axiosInstance.post(`/warehouse/product`, formData)
    console.log('Datos del Producto:', data)
    return data
  }   catch (error) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          'Error inesperado al crear el producto.'
        throw new Error(errorMessage)
      }
    } else {
      throw new Error('Error inesperado. Inténtalo de nuevo más tarde.')
    }
  }

}

/**
 *  Definiendo Metodo para Obtener los Productos
 */
export async function getAllProducts(
  page: number,
  limit: number
): Promise<ProductsResponse> {
  try {
    // Solicitud a la API con axios
    const {data} = await axiosInstance.get<ProductsResponse>(
      `/warehouse/products`,
      {
        params: {
          page,
          limit
        }
      }
    )

    // Validar la respuesta usando Zod
    const response = ProductsListSchema.safeParse({
      products: data.products,
      total: data.total,
      limit: data.limit, // Usamos los datos de la API para asegurar la consistencia
      page: data.page
    })

    // Comprobamos si la validación de Zod fue exitosa
    if (!response.success) {
      console.error('Error de validación:', response.error)
      throw new Error('Error inesperado al validar los productos.')
    }

    // Retornamos los datos validados
    return response.data
  } catch (error) {
    // Captura y manejo de errores de Axios
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          'Error inesperado al obtener los Productos.'
        throw new Error(errorMessage)
      }
    }
    // Para cualquier otro tipo de error
    console.error('Error desconocido:', error)
    throw new Error('Error inesperado al obtener los productos.')
  }
}

/** Definiendo Función Async para Obtener Producto por su ID */
export async function getProductById(productId: Product['_id']) {
  try {
    const {data} = await axiosInstance.get<Product>(
      `/warehouse/product/${productId}`
    )
    console.log('Datos del Producto:', data)
    return data
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          'Error inesperado al obtener el producto.'
        throw new Error(errorMessage)
      }
    }
  }
}

/** Definiendo Funcion Async para Actualizar un Producto */
export async function updateProduct({productId, formData}: ProductApi) {
  try {
    // Implementar Slug
    formData.slug = createSlug(formData.name)

    // Validar URL de la Imagen
    if (!formData.image || !isValidURL(formData.image)) {
      formData.image = 'https://example.com/default-image.jpg' // URL predeterminada
    }

    const {data} = await axiosInstance.put<string>(
      `/warehouse/product/${productId}`,
      formData
    )
    return data
  } catch (error) {
    // Captura y manejo de errores de Axios
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          'Error inesperado al actualizar el producto.'
        throw new Error(errorMessage)
      }
    }
    // Para cualquier otro tipo de error
    console.error('Error desconocido:', error)
    throw new Error('Error inesperado al actualizar el producto.')
  }
}

/** Definiendo Funcion Async para Eliminar Producto */
export async function deleteProduct(productId: Product['_id']) {
  try {
    const {data} = await axiosInstance.delete(`/warehouse/product/${productId}`)
    return data
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          'Error inesperado al eliminar el producto.'
        throw new Error(errorMessage)
      }
    }
  }
}
