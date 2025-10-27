/**
 * @description Ejemplo de integración para server.ts existente
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @note Copia y pega estas líneas en tu server.ts
 */

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'

import {corsConfig} from './src/config/cors'
import appRoutes from './src/routes/appRoutes'
import settingsRoutes from './src/routes/settingsRoutes'
import locationRoutes from './src/routes/locationRoutes'
import servicesRoutes from './src/routes/servicesRoutes'
import {connectDB} from './src/config/database'
import {globalErrorHandler} from './src/middleware/global'

// 🧪 NUEVA IMPORTACIÓN: Rutas de testing JWT
import {
  registerTestingRoutes,
  TestingConfigs
} from './src/scripts/registerTestingRoutes'

dotenv.config()

connectDB()

const app = express()
app.use(cors(corsConfig))

// Middleware para parsear JSON
app.use(morgan('dev'))
app.use(express.json())

// ====================================
// 🧪 AGREGAR DESPUÉS DE LOS MIDDLEWARES BÁSICOS
// ====================================

// Registrar rutas de testing (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  registerTestingRoutes(app, {
    enabled: true,
    basePath: '/api/testing/auth',
    environment: (process.env.NODE_ENV as any) || 'development',
    logRequests: true
  })

  console.log('🧪 Rutas de testing JWT activadas')
  console.log(
    '📝 Ver documentación en: http://localhost:3000/api/testing/auth/help'
  )
}

// ====================================
// TUS RUTAS EXISTENTES (sin cambios)
// ====================================

// Routes Privadas Ajustes de la aplicación
app.use('/api/settings', settingsRoutes)
app.use('/api/location', locationRoutes)
app.use('/api/services', servicesRoutes)

// Rutas Globales de los Módulos de la aplicación
app.use('/api/', appRoutes)

// Middleware para manejar rutas no definidas
app.use('*', (req, res) => {
  res.status(404).json({message: 'Ruta no encontrada'})
})

// Middleware global de manejo de errores
app.use(globalErrorHandler)

export default app

/*
🎯 INSTRUCCIONES DE USO:

1. Copia las líneas marcadas con 🧪 en tu server.ts actual
2. Las rutas de testing estarán disponibles en: http://localhost:3000/api/testing/auth/
3. Para ver todas las rutas: http://localhost:3000/api/testing/auth/help

🔧 CONFIGURACIÓN OPCIONAL EN .env:
TESTING_ROUTES_ENABLED=true
TESTING_BASE_PATH=/api/testing/auth
NODE_ENV=development

⚠️ NOTA DE SEGURIDAD:
- Las rutas se deshabilitan automáticamente en producción
- Solo se activan cuando NODE_ENV !== 'production'
- Incluyen logging completo para debugging

🚀 EJEMPLOS DE TESTING:
- GET /api/testing/auth/basic-auth
- GET /api/testing/auth/admin-only  
- GET /api/testing/auth/system-status
- GET /api/testing/auth/my-permissions

📚 Más información en: INTEGRATION_GUIDE.md y TESTING_GUIDE.md
*/
