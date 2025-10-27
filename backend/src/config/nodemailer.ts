import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const config = () => {
  return {
    host: process.env.EMAIL_HOST || 'tu_smtp_host.com',
    port: +process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER || '542e5212e4d2e5',
      pass: process.env.EMAIL_PASS || '6e6365d5058bc2'
    }
  }
}
export const transporter = nodemailer.createTransport(config())
