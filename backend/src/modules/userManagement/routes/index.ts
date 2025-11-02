/**
 * Multi-Company User Management Router
 * @description: Router principal para el módulo de gestión de usuarios multiempresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {Router} from 'express'
import userRoutes from './userRoutes'
import companyRoutes from '@/modules/companiesManagement/routes/enhancedCompanyRoutes'

const router = Router()

// Rutas de gestión de usuarios
router.use('/users', userRoutes)

// Rutas de gestión de empresas
router.use('/companies', companyRoutes)

// Endpoint de información del módulo
router.get('/', (req, res) => {
  res.json({
    module: 'User Management Module',
    version: '1.0.0',
    description:
      'Módulo de gestión de usuarios multiempresa para ERP Solutions',
    features: [
      'Gestión multiempresa',
      'Roles jerárquicos',
      'Permisos granulares',
      'Autenticación y autorización',
      'Gestión de empresas',
      'Configuración por empresa'
    ],
    endpoints: {
      users: '/users',
      companies: '/companies'
    },
    architecture: 'Multi-Company',
    created: new Date('2024-01-01'),
    lastUpdated: new Date()
  })
})

export default router
