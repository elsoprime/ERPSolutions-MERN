import jwt from 'jsonwebtoken'
import {Types} from 'mongoose'

/**
 * @description Generate a JSON Web Token (JWT) with the given payload and expiration time.
 * Traducedido: Genera un JSON Web Token (JWT) con la carga útil y el tiempo de expiración dados.
 * @param payload
 * @param expiresIn
 * @returns
 */

type UserPayload = {
  id: Types.ObjectId | string
  email: string
  name: string
  role?: string
  company?: string
  companyId?: Types.ObjectId | string | null // 🔥 CORREGIDO: Más flexible para compatibilidad
}

export const generateJWT = (payload: UserPayload) => {
  const data = process.env.JWT_SECRET
  if (!data) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno')
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '10d'
  })
  return token
}
