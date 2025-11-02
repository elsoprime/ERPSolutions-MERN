/**
 * Configuración de Resend para envío de emails
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import {Resend} from 'resend'

if (!process.env.API_KEY_RESEND) {
  throw new Error(
    'API_KEY_RESEND no está configurada en las variables de entorno'
  )
}

export const resend = new Resend(process.env.API_KEY_RESEND)

// Configuración por defecto para los emails
export const EMAIL_CONFIG = {
  from: 'ERPSolutions <onboarding@resend.dev>', // Usar el dominio verificado de Resend
  replyTo: 'noreply@erpsolutions.com'
}
