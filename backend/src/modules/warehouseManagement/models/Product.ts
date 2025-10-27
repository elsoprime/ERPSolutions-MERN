/** Autor: @elsoprimeDev */

import {Schema, model} from 'mongoose'
import {IProduct, ProductStatus, ProductTypeEnum} from '../types'

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
      enum: Object.values(ProductTypeEnum),
      required: false
    },
    sku: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE
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
