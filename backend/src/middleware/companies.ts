/** Autor: @elsoprimeDev */
/** Middleware Company  */

import type {Request, Response, NextFunction} from 'express'
import Company, {ICompany} from '../models/Company' // Importa tu modelo Company
import mongoose from 'mongoose'
import Facility from '../models/Facility'

declare global {
  namespace Express {
    interface Request {
      company: ICompany
    }
  }
}

// Middleware para verificar la existencia de la empresa y la unicidad del nombre de la instalación
export async function validateCompaniesExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {companyId, facilityId} = req.params
  const {nameFacility} = req.body

  // Verificar si el ID de la empresa es válido
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({error: 'ID de empresa no válido'})
  }

  // Verificar si la empresa existe
  const company = await Company.findById(companyId)
  if (!company) {
    return res.status(404).json({error: `Empresa no encontrada con ID`})
  }
  req.company = company // Almacena la empresa en el request

  // Verificar si es una solicitud de actualización (PUT)
  if (req.method === 'PUT') {
    // Verificar si el ID de la instalación es válido cuando se actualiza un registro
    if (!mongoose.Types.ObjectId.isValid(facilityId)) {
      return res.status(400).json({error: 'ID de instalación no válido'})
    }
    // Verificar si el nombre de la instalación ya está registrado en la misma empresa
    const existingFacilityInCompany = await Facility.findOne({
      nameFacility: req.body.nameFacility,
      _id: {$ne: req.params.facilityId}
    })
    if (existingFacilityInCompany) {
      return res.status(400).json({
        error: `El nombre de la instalación '${nameFacility}' ya está registrado en esta empresa.`
      })
    }
  } else {
    // Verificar si el nombre de la instalación ya está registrado en la misma empresa
    const existingFacilityInCompany = await Facility.findOne({
      nameFacility
    })
    if (existingFacilityInCompany) {
      return res.status(400).json({
        error: `El nombre de la instalación '${nameFacility}' ya está registrado en esta empresa.`
      })
    }
  }

  if (req.company.incorporationDate) {
    const incorporationDate = new Date(req.company.incorporationDate)
    incorporationDate.setUTCHours(0, 0, 0, 0) // Establecer la hora a medianoche UTC
    req.company.incorporationDate = incorporationDate
  }

  console.log('Fecha UTC:', req.company.incorporationDate)

  next() // Continuar al siguiente middleware o ruta
}
