/** Autor: @elsoprime */

/** Middleware Facility */
import type {Request, Response, NextFunction} from 'express'
import Facility, {IFacility} from '../models/Facility'
import mongoose from 'mongoose'

declare global {
  namespace Express {
    interface Request {
      facility: IFacility
    }
  }
}

// Middleware para verificar la existencia de la instalación y la unicidad del nombre
export const validateFacilitiesExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {facilityId} = req.params

  // Verificar si el ID de la instalación es válido cuando se actualiza un registro
  if (!mongoose.Types.ObjectId.isValid(facilityId)) {
    return res.status(400).json({error: 'ID de instalación no válido'})
  }

  const facility = await Facility.findById(facilityId)
  if (!facility) {
    const error = new Error('Instalación no encontrada')
    return res.status(404).json({error: error.message})
  }

  req.facility = facility

  next() // Continuar al siguiente middleware o ruta
}

export function facilitylongsToCompany(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {facilityId} = req.params

  // Verificar si el ID de la instalación es válido cuando se actualiza un registro
  if (!mongoose.Types.ObjectId.isValid(facilityId)) {
    return res.status(400).json({error: 'ID de instalación no válido'})
  }
  if (req.facility.company.toString() !== req.company.id.toString()) {
    const error = new Error('Acción no válida')
    return res.status(404).json({error: error.message})
  }
  next() // Continuar al siguiente middleware o ruta
}
