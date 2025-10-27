/**
 * @fileoverview Middleware para gestionar las rutas y sus permisos.
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import {Request, Response, NextFunction} from 'express'
import Token from '@/modules/userManagement/models/Token'

/**
 * Middleware para validar y adjuntar un token a la request.
 * @param req - La solicitud HTTP.
 * @param res - La respuesta HTTP.
 * @param next - La función para pasar al siguiente middleware.
 * @returns
 */
export const routesMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener el token de req.body o req.params
    const token = req.body.token || req.params.token
    console.log('Token recibido:', token)

    if (!token) {
      return res.status(400).json({
        error: {
          message: 'Token no proporcionado',
          code: 'TOKEN_REQUIRED'
        }
      })
    }

    const currentDate = new Date()
    console.log('Fecha actual:', currentDate)

    // Buscar el token en la base de datos (ambos tipos: confirmation y recovery)
    const foundToken = await Token.findOne({
      token,
      type: {$in: ['confirmation', 'recovery']},
      expiresAt: {$gt: currentDate},
      used: false
    })

    if (!foundToken) {
      // Buscar el token sin restricciones para diagnóstico
      const tokenInfo = await Token.findOne({token})
      if (tokenInfo) {
        console.log('Token encontrado pero inválido:', {
          expirado: tokenInfo.expiresAt < currentDate,
          tipo: tokenInfo.type,
          usado: tokenInfo.used,
          fechaExpiracion: tokenInfo.expiresAt
        })
      } else {
        console.log('Token no encontrado en la base de datos')
      }

      return res.status(400).json({
        error: {
          message: 'El enlace ha expirado o no es válido',
          code: 'INVALID_TOKEN'
        }
      })
    }

    // Si el token es válido, adjuntarlo a la request para uso posterior
    req.body.validToken = foundToken
    next()
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Error al validar el token',
        code: 'TOKEN_VALIDATION_ERROR'
      }
    })
  }
}
