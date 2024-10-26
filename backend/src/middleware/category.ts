/** Autor: @elsoprimeDev */

import {Request, Response, NextFunction} from 'express'
import {Category, ICategory} from '../models/Category'
import mongoose from 'mongoose'

declare global {
  namespace Express {
    interface Request {
      category: ICategory
    }
  }
}

export const validateExistCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {id} = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({message: 'Categoria no encontrada'})
  }

  const category = await Category.findById(id)

  // Verificar si la categoría existe
  if (!category) {
    const error = new Error('Categoria no encontrada')
    return res.status(404).json({error: error.message})
  }
  // Mantenemos la categoría en el objeto request
  req.category = category

  // Verificar si la categoría esta duplicada cuando se ejecuta una solicitud PUT
  if (req.method === 'PUT') {
    const {name} = req.body
    const existingCategory = await Category.findOne({
      name,
      _id: {$ne: id}
    })
    if (existingCategory) {
      return res.status(400).json({message: 'La Categoria ya existe'})
    }
  }
  // Continuar con la ejecución
  next()
}
