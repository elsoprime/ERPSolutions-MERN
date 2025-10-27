import {z} from 'zod'

/**
 * @description Definir Schema para la Autenticación y los Usuarios
 */
export const authSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  passwordConfirmation: z.string().min(6).max(100),
  token: z.string()
})

/** Definir Schema para Listar los Usuarios */
export const listUserSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive()
})

/** @description Definir Types Diferidos
 * @typedef Auth
 * @typedef UserFormData
 */
export type Auth = z.infer<typeof authSchema>
export type UserLoginForm = Pick<Auth, 'email' | 'password'>
export type UserRegistrationForm = Pick<
  Auth,
  'name' | 'email' | 'password' | 'passwordConfirmation'
>
export type RequestConfirmationCodeForm = Pick<Auth, 'email'>
export type ForgotPasswordForm = Pick<Auth, 'email'>
export type ChangePasswordForm = Pick<Auth, 'password' | 'passwordConfirmation'>
export type ConfirmToken = Pick<Auth, 'token'>
