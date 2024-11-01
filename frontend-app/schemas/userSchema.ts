/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

import {create} from 'domain'
import {z} from 'zod'

/** Definido mis Schemas de Zod para Usuarios */
export const userSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'El correo electrónico no es válido'
  }),
  password: z.string().min(6),
  name: z
    .string()
    .min(3, {message: 'El nombre debe tener al menos 3 caracteres'})
    .optional(),
  createAt: z.string().optional()
})

/** Definir Schema para Listar los Usuarios */
export const listUserSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive()
})

/** Definir Types Diferidos */
export type User = z.infer<typeof userSchema>
export type UserFormData = Pick<User, 'email' | 'password' | 'name'>
