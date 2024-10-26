/** Autor: @elsoprimeDev */

import {Document, Schema, Types, model} from 'mongoose'

const status = {
  INACTIVE: 'inactive',
  ACTIVE: 'active'
} as const

export type statusProduct = (typeof status)[keyof typeof status]

// Enum para el tipo de producto (opcional)
const productType = {
  PHYSICAL: 'physical',
  DIGITAL: 'digital',
  SERVICE: 'service'
} as const

export type productTypeType = (typeof productType)[keyof typeof productType]

export interface IProduct extends Document {
  name: string
  slug: string // Para SEO y URL amigables
  price: number
  description: string
  brand: string
  image: string
  stock: number
  status: statusProduct
  category: Types.ObjectId
  subcategory?: Types.ObjectId // Opcional, para categorías anidadas
  type?: productTypeType // Opcional, para distinguir tipos de productos
  sku: string // Para identificar productos únicos
}

export const productSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: false
    },
    brand: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: false
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: false
    },
    type: {
      type: String,
      enum: Object.values(productType),
      required: false
    },
    sku: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: status.ACTIVE
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {timestamps: true}
)

export default model<IProduct>('Product', productSchema)
