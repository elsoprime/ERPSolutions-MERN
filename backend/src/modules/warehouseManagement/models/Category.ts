/** Autor: @elsoprimeDev */

import mongoose, {Document, PopulatedDoc, Schema, Types, model} from 'mongoose'
import {IProduct} from '../types/Product'

// Definimos el Interface de Category y Schema de Category
export interface ICategory extends Document {
  name: string
  description: string
  subCategories?: [] // Array de subcategorías como strings
  products?: PopulatedDoc<IProduct & Document>[] // Referencias a productos
}

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    description: {
      type: String,
      required: false
    },

    subCategories: [
      {
        type: String,
        required: false
      }
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {timestamps: true}
)

export const Category = model<ICategory>('Category', categorySchema)
