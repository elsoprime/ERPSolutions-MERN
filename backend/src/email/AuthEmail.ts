import {resend, EMAIL_CONFIG} from '@/config/resend'
import fs from 'fs'
import path from 'path'

interface IEmail {
  email: string
  name: string
  token: string
}

interface IWelcomeEmail {
  email: string
  name: string
  companyName?: string
  role: string
}

/**
 * Clase para manejar el envío de correos electrónicos relacionados con la autenticación
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @version 2.0.0 - Migrado a Resend
 * @description Clase para manejar el envío de correos electrónicos relacionados con la autenticación
 */
export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    // Leer la plantilla HTML
    const templatePath = path.join(__dirname, 'templates', 'verification.html')
    let html = fs.readFileSync(templatePath, 'utf8')
    // Reemplazar variables dinámicas
    html = html
      .replace('{{name}}', user.name)
      .replace('{{token}}', user.token)
      .replace(
        '{{confirmUrl}}',
        `${process.env.FRONTEND_URL}/auth/confirm-account`
      )

    return resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: user.email,
      subject: `${user.name}, confirma tu cuenta en ERPSolutions`,
      html
    })
  }

  /**
   * @description Método para enviar un correo de recuperación de contraseña
   * @param user Objeto que contiene el email, nombre y token del usuario
   * @returns Promesa que resuelve cuando el correo ha sido enviado
   */
  static sendPasswordResetEmail = async (user: IEmail) => {
    // Leer la plantilla HTML
    const templatePath = path.join(
      __dirname,
      'templates',
      'password-reset.html'
    )
    let html = fs.readFileSync(templatePath, 'utf8')
    // Reemplazar variables dinámicas
    html = html
      .replace('{{name}}', user.name)
      .replace('{{token}}', user.token)
      .replace(
        '{{confirmUrl}}',
        `${process.env.FRONTEND_URL}/auth/new-password`
      )

    return resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: user.email,
      subject: `${user.name}, restablece tu contraseña en ERPSolutions`,
      html
    })
  }

  /**
   * @description Método para enviar un correo de bienvenida cuando un admin crea una cuenta
   * @param user Objeto que contiene el email, nombre, empresa y rol del usuario
   * @returns Promesa que resuelve cuando el correo ha sido enviado
   */
  static sendWelcomeEmail = async (user: IWelcomeEmail) => {
    // Leer la plantilla HTML
    const templatePath = path.join(__dirname, 'templates', 'welcome.html')
    let html = fs.readFileSync(templatePath, 'utf8')

    // Formatear el nombre del rol
    const roleName = user.role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    // Reemplazar variables dinámicas
    html = html
      .replace(/{{name}}/g, user.name)
      .replace(/{{email}}/g, user.email)
      .replace(/{{role}}/g, roleName)
      .replace(/{{companyName}}/g, user.companyName || 'ERPSolutions Platform')
      .replace(/{{loginUrl}}/g, `${process.env.FRONTEND_URL}/auth/login`)

    return resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: user.email,
      subject: `¡Bienvenido a ERPSolutions, ${user.name}!`,
      html
    })
  }
}
