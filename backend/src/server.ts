import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import {corsConfig} from './config/cors'
import companyRoutes from './routes/companyRoutes'
import warehouseRoutes from './routes/warehouseRoutes'
import settingsRoutes from './routes/settingsRoutes'
import locationRoutes from './routes/locationRoutes'
import servicesRoutes from './routes/servicesRoutes'
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

// Routes Ajustes de la aplicación
app.use('/api/settings', settingsRoutes)
app.use('/api/location', locationRoutes)
app.use('/api/services', servicesRoutes)

// Routes Private de la aplicación
app.use('/api/company', companyRoutes)
app.use('/api/warehouse', warehouseRoutes)

// Middleware para manejar rutas no definidas
app.use('*', (req, res) => {
  res.status(404).json({message: 'Ruta no encontrada'})
})

// Middleware global de manejo de errores
app.use(globalErrorHandler)

export default app
