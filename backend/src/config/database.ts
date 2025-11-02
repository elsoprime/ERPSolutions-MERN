/** Autor: @elsoprimeDEV */

import mongoose from 'mongoose'
import colors from 'colors'
import {
  getOrCreateCompany,
  initializeAdminUser
} from '@/scripts/initialization/initializeEnhancedNew'

import {initializeApplication} from '@/scripts/initialization/initializeSettings'

export const connectDB = async () => {
  try {
    // Conectar a la base de datos usando Mongoose
    const DATABASE = process.env.DATABASE_URL
    if (!DATABASE) {
      console.log(
        colors.bgBlack.bgRed.bold(
          `La URL de la base de datos no está definida.`
        )
      )
      return
    }
    const connection = await mongoose.connect(DATABASE)
    const results = await Promise.allSettled([
      getOrCreateCompany(),
      initializeAdminUser(),
      initializeApplication()
    ])
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.log(
          colors.bgRed(`Error en la inicialización ${index + 1}:`),
          result.reason
        )
      }
    })
    console.log(colors.bgBlue.white(`Conectado a la base de datos`))
  } catch (error) {
    console.log(
      colors.bgBlack.bgYellow.red.bold(
        `Ha ocurrido un error al conectar con la base de datos `
      ),
      error
    )
  }
}
