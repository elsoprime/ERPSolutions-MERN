/**
 * Autor: Esteban Soto @elsoprimeDev
 */
import {z} from 'zod'

/** Schema de Categorías */
export const categorySchema = z.object({
  _id: z.string(),
  name: z
    .string()
    .min(1, {message: 'El nombre de la categoría es obligatorio'}),
  description: z.string().optional(),
  subcategories: z.array(z.string()).optional(),
  products: z.array(z.string()).optional(),
  createdAt: z.string().optional()
})

/** Tipos Inferidos para utilizar en Formularios */
export type Category = z.infer<typeof categorySchema>
export type CategoryFormData = Pick<Category, 'name' | 'description'> & {
  subcategory?: string[]
  products?: string[]
}

/** Schema de Lista de Categorías */
export const categoriesListSchema = z.object({
  categories: z.array(categorySchema).optional().default([]),
  total: z.number().optional().default(0),
  limit: z.number().optional().default(10),
  page: z.number().optional().default(1)
})

export type CategoryList = z.infer<typeof categoriesListSchema>
