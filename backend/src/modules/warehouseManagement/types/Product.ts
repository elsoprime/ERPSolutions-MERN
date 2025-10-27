/** Autor: @elsoprimeDev */

import {Document, Types} from 'mongoose'
import {ProductStatusType} from './ProductStatus'
import {ProductTypeEnumType} from './ProductType'

/**
 * Interface para el documento Product en MongoDB
 */
export interface IProduct extends Document {
  name: string
  slug: string // Para SEO y URL amigables
  price: number
  description: string
  brand: string
  image: string
  stock: number
  status: ProductStatusType
  category: Types.ObjectId
  subcategory?: Types.ObjectId // Opcional, para categorías anidadas
  type?: ProductTypeEnumType // Opcional, para distinguir tipos de productos
  sku: string // Para identificar productos únicos
}

/**
 * Interface para crear un nuevo producto (sin campos de Document)
 */
export interface ICreateProduct {
  name: string
  slug: string
  price: number
  description?: string
  brand: string
  image?: string
  stock: number
  status?: ProductStatusType
  category: string | Types.ObjectId
  subcategory?: string | Types.ObjectId
  type?: ProductTypeEnumType
  sku: string
}

/**
 * Interface para actualizar un producto (todos los campos opcionales)
 */
export interface IUpdateProduct {
  name?: string
  slug?: string
  price?: number
  description?: string
  brand?: string
  image?: string
  stock?: number
  status?: ProductStatusType
  category?: string | Types.ObjectId
  subcategory?: string | Types.ObjectId
  type?: ProductTypeEnumType
  sku?: string
}
