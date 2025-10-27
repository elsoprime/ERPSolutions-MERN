import {transporter} from '@/config/nodemailer'
import fs from 'fs'
import path from 'path'

interface IEmail {
  email: string
  name: string
  token: string
}

/**
 * Clase para manejar el envío de correos electrónicos relacionados con la autenticación
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @version 1.0.0
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
    return transporter.sendMail({
      from: 'ERPSolutions <noreply@erpsolutions.com>',
      to: user.email,
      subject: `${user.name}, confirma tu cuenta en ERPSolutions`,
      text: `ERPSolutions - Confirma tu Cuenta`,
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
    return transporter.sendMail({
      from: 'ERPSolutions <noreply@erpsolutions.com>',
      to: user.email,
      subject: `${user.name}, restablece tu contraseña en ERPSolutions`,
      text: `ERPSolutions - Restablece tu Contraseña`,
      html
    })
  }
}
