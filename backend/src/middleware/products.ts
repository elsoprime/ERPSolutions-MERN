/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import type {Request, Response, NextFunction} from 'express'
import Product from '@/modules/warehouseManagement/models/Product'
import {IProduct} from '@/modules/warehouseManagement/types/Product'
import mongoose from 'mongoose'

declare global {
  namespace Express {
    interface Request {
      product: IProduct
    }
  }
}

// Middleware para verificar la existencia del producto

export async function validateProductExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {id} = req.params

    // Verificar si el ID del producto es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'ID de producto no válido'})
    }

    // Verificar si el producto existe
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({error: 'Producto no encontrado'})
    }
    req.product = product // Almacena el producto en el request

    // Verificar si el nombre del producto ya está registrado
    const existingProduct = await Product.findOne({
      name: req.body.name,
      _id: {$ne: id}
    })

    if (existingProduct) {
      return res.status(400).json({
        error: `El nombre del producto '${req.body.name}' ya está registrado.`
      })
    }

    next()
  } catch (error) {
    console.error('Error en el middleware validateProductExists:', error)
    res.status(500).json({
      error: 'Error en el middleware validateProductExists',
      details: error.message
    })
  }
}
