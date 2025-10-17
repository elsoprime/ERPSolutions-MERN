/**
 * @description: Archivo API para las Categorías de Productos
 * Fecha: 2024-10-01
 * Versión: 1.0.0
 * @author: Esteban Soto @elsoprimeDev
 */

import {
  categoriesListSchema,
  Category,
  CategoryFormData,
} from "@/schemas/categorySchema";
import axiosInstance from "./axios";
import { isAxiosError } from "axios";

/** Definiendo Metodos y Funciones Async para las Categorías de Productos */

export type ICategoryApi = {
  _id: Category["_id"];
  name: Category["name"];
  description?: Category["description"];
};

export type CategoryApi = {
  formData: CategoryFormData;
  categoryId?: Category["_id"];
};

export type CategoriesResponse = {
  categories: Category[];
  total: number;
  limit: number;
  page: number;
};

export async function createCategory({ formData }: CategoryApi) {
  try {
    const { data } = await axiosInstance.post(`/warehouse/category`, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          "Error inesperado al crear la categoría.";
        throw new Error(errorMessage);
      }
    } else {
      throw new Error("Error inesperado. Inténtalo de nuevo más tarde.");
    }
  }
}

export async function getAllCategories(
  page: number,
  limit: number
): Promise<CategoriesResponse> {
  try {
    const { data } = await axiosInstance.get(`/warehouse/categories`, {
      params: { page, limit },
    });
    const response = categoriesListSchema.safeParse({
      categories: data.categories,
      total: data.total,
      limit: data.limit,
      page: data.page,
    });

    if (!response.success) {
      console.error("Error de validación:", response.error);
      throw new Error("Error inesperado al validar las categorias.");
    }
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          "Error inesperado al obtener las categorias.";
        throw new Error(errorMessage);
      }
    }
    throw new Error("Error inesperado al obtener las categorias.");
  }
}

export async function getCategoryById(categoryId: Category["_id"]) {
  try {
    const { data } = await axiosInstance.get<Category>(
      `/warehouse/categories/${categoryId}`
    );
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          "Error inesperado al obtener la categoría.";
        throw new Error(errorMessage);
      }
    } else {
      throw new Error("Error inesperado. Inténtalo de nuevo más tarde.");
    }
  }
}

/**
 * Definiendo Metodo para Actualizar una Categoría
 * Autor: Esteban Soto @elsoprimeDev
 * Fecha: 2024-10-01
 * Versión: 1.0.0
 */
export async function updateCategory({ categoryId, formData }: CategoryApi) {
  /**
   * Logs para depuración
   * Fecha: 2024-10-01
   * Versión: 1.0.0
   * Autor: Esteban Soto @elsoprimeDev
   *  console.log("🌐 API UPDATE - CategoryId:", categoryId);
  console.log("🌐 API UPDATE - FormData:", formData);
  console.log("🌐 URL completa:", `/warehouse/categories/${categoryId}`);
   */

  try {
    const { data } = await axiosInstance.put<string>(
      `/warehouse/categories/${categoryId}`,
      formData
    );
    return data;
  } catch (error) {
    // Captura y manejo de errores de Axios
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          "Error inesperado al actualizar el Categoria.";
        throw new Error(errorMessage);
      }
    }
    // Para cualquier otro tipo de error
    console.error("Error desconocido:", error);
    throw new Error("Error inesperado al actualizar el Categoria.");
  }
}

/** Definiendo Metodo para Eliminar una Categoría
 * Autor: Esteban Soto @elsoprimeDev
 * Fecha: 2024-10-01
 * Versión: 1.0.0
 * */
export async function deleteCategory(categoryId: Category["_id"]) {
  try {
    const { data } = await axiosInstance.delete<string>(
      `/warehouse/categories/${categoryId}`
    );
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          "Error inesperado al eliminar la categoría.";
        throw new Error(errorMessage);
      }
    } else {
      throw new Error("Error inesperado. Inténtalo de nuevo más tarde.");
    }
  }
}
