/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {Category} from '@/schemas/categorySchema'
import axiosInstance from './axios'
import {isAxiosError} from 'axios'

/** Definiendo Metodos y Funciones Async para las Categorías de Productos */

export type ICategoryApi = {
  _id: Category['_id']
  name: Category['name']
}

export async function getCategories(): Promise<ICategoryApi[]> {
  try {
    const {data} = await axiosInstance.get(`/warehouse/category`)
    if (!data) {
      throw new Error('Error inesperado al obtener las categorias.')
    }
    console.log('categorias desde CategoryApi', data)
    return data
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          'Error inesperado al obtener las categorias.'
        throw new Error(errorMessage)
      }
    }
    throw new Error('Error inesperado al obtener las categorias.')
  }
}
