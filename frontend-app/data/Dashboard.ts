/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {IModuleCard, IDashboard} from '@/interfaces/IPageComponents'

/** Definiendo Estructura de la Vista */
export const DashboardViews: IDashboard[] = []

/** Definiendo Estructura de la Vista "Modulos" */
export const ModuleCardViews: IModuleCard[] = [
  {
    id: 1,
    title: 'Gestión de Usuarios',
    subtitle: 'Administra tus Usuarios',
    description:
      'Permite administrar los usuarios de la aplicación, crear, editar y eliminar usuarios, ademas de asignar roles y permisos.',
    background: '/images/box-user.webp',
    image: `/iconfinder-whoisprivacy.svg`,
    DataAOS: 'fade-up',
    IAction: [
      {
        title: 'Ver Almacenes',
        href: '/home/usersManagement'
      }
    ]
  },
  {
    id: 2,
    title: 'Gestión de Almacenes',
    subtitle: 'Administra tus Almacenes',
    description:
      'Este módulo permite gestionar los almacenes de la empresa, asi como definir Categorias, Productos, Proveedores y Clientes.',
    background: '/images/box-warehouse.webp',
    image: `/Forklift-Containers.png`,
    DataAOS: 'fade-up',
    IAction: [
      {
        title: 'Ver Almacenes',
        href: '/home/warehouse'
      }
    ]
  },
  {
    id: 3,
    title: 'Gestión de Personas',
    subtitle: 'Administra tus personas',
    description:
      'Este módulo permite gestionar las personas de la empresa, asi como definir Permisos, Vacaciones, Horarios y Roles.',
    background: '/images/box-people.webp',
    image: `/iconfinder-social-media-work.svg`,
    DataAOS: 'fade-down',
    IAction: [
      {
        title: 'Acceder al Modulo',
        href: '/home/resources-peoples'
      }
    ]
  },
  {
    id: 4,
    title: 'Gestión de Activos',
    subtitle: 'Administra tus Activos',
    description:
      'Este módulo permite gestionar los activos de la empresa, asi como definir Empresas, Instalaciones e implementos.',
    background: '/images/box-asset-manager.webp',
    image: `/iconfinder-infographic-management.svg`,
    DataAOS: 'fade-up',
    IAction: [
      {
        title: 'Acceder al Modulo',
        href: '/home/assets-management'
      }
    ]
  },

  {
    id: 5,
    title: 'Gestión de Operaciones',
    subtitle: 'Administra tus Operaciones',
    description:
      'Este módulo permite gestionar los mantenimientos correspondiente al area de operaciones de tu empresa.',
    background: '/images/box-maintenance.webp',
    image: `/administrative_tools.png`,
    DataAOS: 'fade-up',
    IAction: [
      {
        title: 'Acceder al Modulo',
        href: '/home/inventory'
      }
    ]
  }
]
