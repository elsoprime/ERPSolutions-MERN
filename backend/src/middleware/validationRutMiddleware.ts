/** Autor: @elsoprimeDev */

import {Request, Response, NextFunction} from 'express'
import {validateRut} from '../utils/validateRut'

/**
 * Middleware para validar el RUT en las solicitudes.
 * @param req Solicitud HTTP.
 * @param res Respuesta HTTP.
 * @param next Función para pasar al siguiente middleware.
 */
export function rutValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {rutOrDni} = req.body

  if (!validateRut(rutOrDni)) {
    console.log(rutOrDni)
    return res.status(400).json({message: 'RUT o DNI no válido'})
  }

  next() // Si el RUT es válido, pasa al siguiente middleware o controlador
}
