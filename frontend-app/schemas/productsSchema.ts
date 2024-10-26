/**
 * Autor: Esteban Soto @elsoprimeDev
 */

/**
 * Definiendo el esquema de Categorias con Zod
 */

import {z} from 'zod'
import {categorySchema} from './categorySchema'

export const ProductSchema = z.object({
  _id: z.string(),
  name: z.string().min(3, 'El nombre del producto es obligatorio'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser un número no negativo'),
  stock: z
    .number()
    .int()
    .nonnegative('El stock debe ser un número entero no negativo'),
  image: z.string().url().optional(),
  category: z.union([z.string(), categorySchema]),
  type: z.enum(['physical', 'digital', 'service']).optional(),
  sku: z.string().min(3, 'El SKU debe tener al menos 3 caracteres').optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  createdAt: z.string().optional()
})

export type Product = z.infer<typeof ProductSchema>
/**
 * Represents the form data for a product.
 *
 * This type is a subset of the `Product` type, including only the following properties:
 * - `name`: The name of the product.
 * - `description`: A brief description of the product.
 * - `brand`: The brand of the product.
 * - `price`: The price of the product.
 * - `stock`: The stock quantity of the product.
 * - `category`: The category to which the product belongs.
 *
 * Additionally, it includes optional properties:
 * - `image`: An optional image URL or path for the product.
 * - `status`: An optional status of the product.
 */
export type ProductsFormData = Pick<
  Product,
  | 'name'
  | 'slug'
  | 'description'
  | 'brand'
  | 'price'
  | 'stock'
  | 'category'
  | 'type'
  | 'sku'
  | 'image'
> & {status?: string}

/** Schema de Lista de Productos */
export const ProductsListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number().optional().default(0),
  limit: z.number().optional().default(10),
  page: z.number().optional().default(1)
})

export type ProductsList = z.infer<typeof ProductsListSchema>
export type ProductsListFormData = Pick<
  ProductsList,
  'products' | 'total' | 'limit' | 'page'
>
