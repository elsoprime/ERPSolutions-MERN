/** Autor: @elsoprimeDev */

import type {Request, Response} from 'express'
import mongoose from 'mongoose'
import Company from '../models/Company'
import Facility from '../models/Facility'

export class CompanyController {
  // Crear las compañías
  static createCompany = async (req: Request, res: Response) => {
    const company = new Company(req.body)
    try {
      const isRutExist = await Company.findOne({
        rutOrDni: req.body.rutOrDni
      })
      if (isRutExist) {
        return res
          .status(400)
          .json({message: 'Este RUT ya se encuentra registrado'})
      }
      await company.save()
      console.log(company)
      res.status(201).json({message: 'Empresa creada correctamente'})
    } catch (error) {
      res.status(500).json({error: error.message}) // Devolver el mensaje de error directamente
    }
  }

  // Obtener todas las compañías con paginación
  static getAllCompany = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1 // Página actual
    const limit = parseInt(req.query.limit as string) || 5 // Límite de registros por página
    const skip = (page - 1) * limit // Registros a omitir

    try {
      const [companies, total] = await Promise.all([
        Company.find({}).skip(skip).limit(limit), // Aplicar la paginación
        Company.countDocuments() // Contar el total de documentos
      ])

      res.json({companies, total}) // Devolver las compañías y el total
    } catch (error) {
      console.error(error)

      // Manejo específico de errores de validación de Mongoose
      if (error instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .json({error: 'Error de validación: ' + error.message})
      }

      // Error general del servidor
      res
        .status(500)
        .json({error: 'Error al obtener las compañías desde el Servidor'})
    }
  }

  static getCompanyById = async (req: Request, res: Response) => {
    const {id} = req.params

    try {
      // Buscar la compañía por ID y obtener las instalaciones asociadas con paginación
      const company = await Company.findById(id)
      if (!company) {
        const error = new Error('Empresa no Encontrada')
        return res.status(404).json({error: error.message})
      }

      res.json(company)

      //console.log(company.facilities)
    } catch (error) {
      console.error('Error al obtener la compañía:', error)

      // Manejo específico de errores de Mongoose
      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({error: 'ID de compañía inválido'})
      }

      // Error general del servidor
      res
        .status(500)
        .json({error: 'Error al obtener la compañía desde el Servidor'})
    }
  }

  // Obtener una empresa por ID y sus instalaciones con paginación
  static getCompanyWithFacilities = async (req: Request, res: Response) => {
    const {id} = req.params
    const page = parseInt(req.query.page as string) || 1 // Página actual
    const limit = parseInt(req.query.limit as string) || 7 // Límite de registros por página
    const skip = (page - 1) * limit // Registros a omitir para la paginación

    try {
      // Obtener la empresa por ID
      const company = await Company.findById(id)

      if (!company) {
        return res.status(404).json({error: 'Empresa no encontrada'})
      }

      // Obtener las instalaciones asociadas con paginación
      const facilities = await Facility.find({company: id}) // Filtrar instalaciones por ID de empresa
        .skip(skip)
        .limit(limit)

      // Contar el total de instalaciones para esta empresa
      const totalFacilities = await Facility.countDocuments({company: id})

      // Devolver la empresa junto con las instalaciones paginadas
      res.json({
        company,
        facilities,
        totalFacilities,
        page,
        limit,
        totalPages: Math.ceil(totalFacilities / limit)
      })
    } catch (error) {
      console.error(error)

      // Manejo específico de errores de validación de Mongoose
      if (error instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .json({error: 'Error de validación: ' + error.message})
      }

      // Error general del servidor
      res
        .status(500)
        .json({error: 'Error al obtener la empresa y sus instalaciones'})
    }
  }

  // Actualizar una Compañía por su Id
  static updateCompany = async (req: Request, res: Response) => {
    const {id} = req.params

    // Validar si el ID es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'ID inválido'})
    }

    try {
      // Buscar si existe otra compañía con el mismo nombre
      const isCompanyExist = await Company.findOne({
        rutOrDni: req.body.rutOrDni,
        _id: {$ne: id} // Excluir la compañía actual de la búsqueda
      })

      if (isCompanyExist) {
        return res.status(400).json({
          message: 'Este Rut ya se encuentra registrado en la plataforma'
        })
      }

      // Intentar encontrar y actualizar la compañía por ID
      const company = await Company.findByIdAndUpdate(id, req.body)

      // Si no se encuentra la compañía, responder con un error 404
      if (!company) {
        return res.status(404).json({error: 'Empresa no encontrada'})
      }

      res.json('Empresa Actualizada Correctamente')
    } catch (error) {
      // Manejar cualquier error inesperado
      console.error('Error al actualizar la compañía:', error)
      res.status(500).json({error: 'Error al actualizar la compañía'})
    }
  }
  // Eliminar una Compañía por su Id
  static deleteCompany = async (req: Request, res: Response) => {
    const {id} = req.params

    // Validar si el ID es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'ID inválido'})
    }

    try {
      // Intentar encontrar la compañía por ID
      const company = await Company.findById(id)

      // Si no se encuentra la compañía, responder con un error 404
      if (!company) {
        return res
          .status(404)
          .json({error: 'La compañía o empresa no encontrada'})
      }

      // Si la compañía existe, proceder a eliminarla
      await company.deleteOne()
      res.json('Empresa Eliminada Correctamente')
    } catch (error) {
      // Manejar cualquier error inesperado
      console.error('Error al eliminar la compañía:', error)
      res.status(500).json({error: 'Error al eliminar la compañía'})
    }
  }
}
