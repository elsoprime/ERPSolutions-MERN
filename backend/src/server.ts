import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import {corsConfig} from './config/cors'
import appRoutes from './routes/appRoutes'
import settingsRoutes from './routes/settingsRoutes'
import locationRoutes from './routes/locationRoutes'
import servicesRoutes from './routes/servicesRoutes'
import companyRoutes from './routes/companyRoutes'
import userManagementRoutes from './modules/userManagement/routes'
import {connectDB} from './config/database'
import {globalErrorHandler} from './middleware/global'

dotenv.config()

connectDB()

const app = express()
app.use(cors(corsConfig))

// Middleware para parsear JSON
app.use(morgan('dev'))
//
app.use(express.json())

// 🧪 RUTAS DE TESTING JWT (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  try {
    const {registerTestingRoutes} = require('./scripts/registerTestingRoutes')
    registerTestingRoutes(app, {
      enabled: true,
      basePath: '/api/testing/auth',
      environment: process.env.NODE_ENV || 'development',
      logRequests: true
    })
    console.log('🧪 Rutas de testing JWT activadas en: /api/testing/auth')
  } catch (error) {
    console.log('⚠️ No se pudieron cargar las rutas de testing:', error.message)
  }
}

// Routes Privadas Ajustes de la aplicación
app.use('/api/settings', settingsRoutes)
app.use('/api/location', locationRoutes)
app.use('/api/services', servicesRoutes)

// Routes Enhanced Companies (Super Admin)
app.use('/api/enhanced-companies', companyRoutes)

// Rutas del Módulo de Gestión de Usuarios Multiempresa
app.use('/api/v2', userManagementRoutes)

// Rutas Globales de los Módulos de la aplicación
app.use('/api/', appRoutes)

// Middleware para manejar rutas no definidas
app.use('*', (req, res) => {
  res.status(404).json({message: 'Ruta no encontrada o Inexistente'})
})

// Middleware global de manejo de errores
app.use(globalErrorHandler)

export default app
