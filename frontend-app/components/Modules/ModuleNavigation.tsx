'use client'

import React from 'react'
import {
  BuildingOfficeIcon,
  UsersIcon,
  ArchiveBoxIcon,
  CubeIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export interface ModuleNavigationProps {
  userRole?: string
  onModuleSelect?: (module: string) => void
}

/**
 * Module Navigation Component
 * @description Navegación entre módulos del sistema basada en roles
 * @author Esteban Soto Ojeda @elsoprimeDev
 */
export default function ModuleNavigation({
  userRole = 'SUPER_ADMIN',
  onModuleSelect
}: ModuleNavigationProps) {
  const modules = [
    {
      id: 'companies',
      name: 'Gestión de Empresas',
      description: 'Administrar empresas del sistema',
      icon: BuildingOfficeIcon,
      color: 'blue',
      allowedRoles: ['SUPER_ADMIN']
    },
    {
      id: 'users',
      name: 'Gestión de Usuarios',
      description: 'Administrar usuarios y roles',
      icon: UsersIcon,
      color: 'green',
      allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN']
    },
    {
      id: 'warehouse',
      name: 'Almacén',
      description: 'Control de inventario y almacén',
      icon: ArchiveBoxIcon,
      color: 'orange',
      allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'WAREHOUSE_MANAGER']
    },
    {
      id: 'products',
      name: 'Productos',
      description: 'Catálogo de productos y servicios',
      icon: CubeIcon,
      color: 'purple',
      allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'WAREHOUSE_MANAGER']
    },
    {
      id: 'reports',
      name: 'Reportes',
      description: 'Análisis y reportes del sistema',
      icon: ChartBarIcon,
      color: 'indigo',
      allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'ACCOUNTANT']
    },
    {
      id: 'settings',
      name: 'Configuración',
      description: 'Configuración del sistema',
      icon: CogIcon,
      color: 'gray',
      allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN']
    },
    {
      id: 'documents',
      name: 'Documentos',
      description: 'Gestión de documentos',
      icon: DocumentTextIcon,
      color: 'red',
      allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'ACCOUNTANT']
    },
    {
      id: 'teams',
      name: 'Equipos',
      description: 'Gestión de equipos de trabajo',
      icon: UserGroupIcon,
      color: 'teal',
      allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'TEAM_LEADER']
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
      green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
      orange:
        'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700',
      purple:
        'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
      indigo:
        'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700',
      gray: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700',
      red: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700',
      teal: 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const availableModules = modules.filter(module =>
    module.allowedRoles.includes(userRole)
  )

  const handleModuleClick = (moduleId: string) => {
    onModuleSelect?.(moduleId)
    console.log(`📋 Navegando al módulo: ${moduleId}`)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>
          Módulos del Sistema
        </h2>
        <p className='text-sm text-gray-600'>
          Selecciona un módulo para acceder a sus funcionalidades
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {availableModules.map(module => {
          const IconComponent = module.icon
          return (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              className={`
                p-6 rounded-lg border-2 transition-all duration-200 text-left
                transform hover:scale-105 hover:shadow-lg
                ${getColorClasses(module.color)}
              `}
            >
              <div className='flex items-center justify-between mb-4'>
                <IconComponent className='h-8 w-8' />
                <div className='text-xs font-medium uppercase tracking-wide opacity-75'>
                  {module.id}
                </div>
              </div>

              <h3 className='font-semibold text-lg mb-2'>{module.name}</h3>

              <p className='text-sm opacity-80 leading-relaxed'>
                {module.description}
              </p>

              <div className='mt-4 flex items-center justify-between'>
                <span className='text-xs opacity-60'>
                  Hacer clic para acceder
                </span>
                <div className='w-6 h-6 rounded-full bg-white bg-opacity-50 flex items-center justify-center'>
                  <span className='text-xs'>→</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Role Info */}
      <div className='bg-gray-50 p-4 rounded-lg'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
          <span className='text-sm text-gray-600'>
            Conectado como: <strong>{userRole}</strong>
          </span>
        </div>
        <p className='text-xs text-gray-500 mt-1'>
          Mostrando {availableModules.length} de {modules.length} módulos
          disponibles
        </p>
      </div>
    </div>
  )
}
