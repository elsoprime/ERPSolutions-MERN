import {Resend} from 'resend'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Configurar dotenv con path específico
dotenv.config({path: path.resolve(__dirname, '../../.env')})

interface IEmail {
  email: string
  name: string
  token: string
}

/**
 * Clase para manejar el envío de correos electrónicos relacionados con la autenticación usando Resend
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @version 1.0.0
 * @description Clase para manejar el envío de correos electrónicos relacionados con la autenticación
 *
 * NOTA IMPORTANTE PARA DESARROLLO:
 * - Resend en modo sandbox solo permite enviar emails desde dominios verificados
 * - Actualmente usa direcciones de prueba: from='Acme <onboarding@resend.dev>' to=['delivered@resend.dev']
 * - Para producción: verificar dominio en https://resend.com/domains
 * - Los emails se envían a 'delivered@resend.dev' pero muestran el destinatario original en el contenido
 */

// Obtener la API key - fallback directo si la variable de entorno no está disponible
const API_KEY =
  process.env.API_KEY_RESEND || 're_Jg7GSLZY_4BbtWcTNkjQWyL4jUqA9XarV'

const resend = new Resend(API_KEY)

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    try {
      // Leer la plantilla HTML
      const templatePath = path.join(
        __dirname,
        'templates',
        'verification.html'
      )
      let html = fs.readFileSync(templatePath, 'utf8')

      // Reemplazar variables dinámicas
      html = html
        .replace('{{name}}', user.name)
        .replace('{{token}}', user.token)
        .replace(
          '{{confirmUrl}}',
          `${process.env.FRONTEND_URL}/auth/confirm-account`
        )

      // En modo desarrollo, usar la dirección de prueba de Resend
      // En producción, deberás verificar tu dominio en resend.com/domains
      const {data, error} = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['delivered@resend.dev'], // Dirección de prueba de Resend
        subject: `${user.name}, confirma tu cuenta en ERPSolutions - [Original: ${user.email}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>📧 Email de Prueba - Confirmación de Cuenta</h2>
            <p><strong>Email original destinatario:</strong> ${user.email}</p>
            <p><strong>Nombre:</strong> ${user.name}</p>
            <hr>
            ${html}
          </div>
        `
      })

      if (error) {
        console.error('Error al enviar email de confirmación:', error)
        throw new Error(`Error al enviar email: ${error.message}`)
      }

      console.log('Email de confirmación enviado exitosamente:', data)
      return data
    } catch (error) {
      console.error('Error en sendConfirmationEmail:', error)
      throw error
    }
  }

  static sendPasswordResetToken = async (user: IEmail) => {
    try {
      // Leer la plantilla HTML para reset de contraseña
      const templatePath = path.join(
        __dirname,
        'templates',
        'reset-password.html'
      )
      let html = fs.readFileSync(templatePath, 'utf8')

      // Reemplazar variables dinámicas
      html = html
        .replace('{{name}}', user.name)
        .replace('{{token}}', user.token)
        .replace(
          '{{resetUrl}}',
          `${process.env.FRONTEND_URL}/auth/new-password`
        )

      // En modo desarrollo, usar la dirección de prueba de Resend
      // En producción, deberás verificar tu dominio en resend.com/domains
      const {data, error} = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['delivered@resend.dev'], // Dirección de prueba de Resend
        subject: `${user.name}, restablece tu contraseña en ERPSolutions - [Original: ${user.email}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🔐 Email de Prueba - Reset de Contraseña</h2>
            <p><strong>Email original destinatario:</strong> ${user.email}</p>
            <p><strong>Nombre:</strong> ${user.name}</p>
            <hr>
            ${html}
          </div>
        `
      })

      if (error) {
        console.error('Error al enviar email de reset de contraseña:', error)
        throw new Error(`Error al enviar email: ${error.message}`)
      }

      console.log('Email de reset de contraseña enviado exitosamente:', data)
      return data
    } catch (error) {
      console.error('Error en sendPasswordResetToken:', error)
      throw error
    }
  }
}
