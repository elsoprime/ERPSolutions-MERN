/** Autor: @elsoprimeDev */
/** Facility Controller */

import type {Request, Response} from 'express'
import Facility from '../models/Facility'
import mongoose from 'mongoose'

export class FacilityController {
  // Creamos una nueva Instalación
  static createFacility = async (req: Request, res: Response) => {
    try {
      const facility = new Facility(req.body)
      facility.company = req.company.id
      req.company.facilities.push(facility.id)
      await Promise.allSettled([facility.save(), req.company.save()])
      res.send('Instalación creada correctamente')
    } catch (error) {
      console.error(error)
      res.status(500).json({error: 'Error al crear una instalación'})
    }
  }

  // Get All Facilities
  static getCompanyFacilities = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 2
    const skip = (page - 1) * limit

    try {
      const [facilities, total] = await Promise.all([
        Facility.find({company: req.company.id})
          .skip(skip)
          .limit(limit)
          .populate('company'),
        Facility.countDocuments({company: req.company.id})
      ])
      res.json({facilities, total})
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .json({error: 'Error de validación: ' + error.message})
      }
      console.error(error)
      res.status(500).json({error: 'Error al obtener las instalaciones'})
    }
  }

  // Get for Facility for ID
  static getFacilityById = async (req: Request, res: Response) => {
    try {
      res.json(req.facility)
    } catch (error) {
      res.status(500).json({error: 'Error al obtener la Instalación'})
    }
  }

  // Update Facility for ID
  static updateFacility = async (req: Request, res: Response) => {
    try {
      // Actualiza todos los campos de req.facility con los valores de req.body
      Object.assign(req.facility, req.body)
      await req.facility.save()
      res.send('Instalación actualizada correctamente')
    } catch (error) {
      console.error(error)
      res.status(500).json({error: 'Error al actualizar la instalación'})
    }
  }

  static deleteFacility = async (req: Request, res: Response) => {
    try {
      req.company.facilities = req.company.facilities.filter(
        facility => facility.toString() !== req.facility.id.toString()
      )
      await Promise.allSettled([req.facility.deleteOne(), req.company.save()])
      res.send('Instalación eliminada correctamente')
    } catch (error) {
      return res
        .status(500)
        .json({error: 'Hubo un error al eliminar la instalación'})
    }
  }
}
