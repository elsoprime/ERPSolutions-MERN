import {IMenu} from '@/interfaces/IComponents'
import {UserRole} from '@/interfaces/MultiCompany'
import {
  Squares2X2Icon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  CogIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalculatorIcon,
  BuildingOfficeIcon,
  CubeIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon
} from '@heroicons/react/20/solid'
import React from 'react'

/**
 * @description: Definición de Menús de la Aplicación con Control de Roles
 * @requires: React
 * @exports: IMenu
 * @Author Esteban Soto Ojeda [elsoprimeDev]
 */

export const MenuItems: IMenu[] = [
  {
    id: 1,
    title: 'Dashboard',
    icon: React.createElement(Squares2X2Icon, {className: 'h-5 w-5'}),
    link: '/home',
    isActive: false,
    requiredRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE,
      UserRole.VIEWER
    ]
  },
  {
    id: 2,
    title: 'Gestión de Usuarios',
    icon: React.createElement(UserGroupIcon, {className: 'h-5 w-5'}),
    link: '/users',
    isActive: false,
    requiredRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER
    ]
  },
  {
    id: 3,
    title: 'Gestión de Empresas',
    icon: React.createElement(BuildingOffice2Icon, {className: 'h-5 w-5'}),
    link: '/companies',
    isActive: false,
    requiredRoles: [UserRole.SUPER_ADMIN]
  },
  {
    id: 4,
    title: 'Centro de Costos',
    icon: React.createElement(CurrencyDollarIcon, {className: 'h-5 w-5'}),
    requiredRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER
    ],
    ISubMenu: [
      {
        id: 41,
        title: 'Control de Gastos',
        link: '/home/cost-center/expenses',
        icon: React.createElement(BanknotesIcon, {className: 'h-5 w-5'}),
        requiredRoles: [
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN_EMPRESA,
          UserRole.MANAGER
        ]
      },
      {
        id: 42,
        title: 'Control de Nóminas',
        link: '/home/cost-center/payroll',
        icon: React.createElement(DocumentTextIcon, {className: 'h-5 w-5'}),
        requiredRoles: [
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN_EMPRESA,
          UserRole.MANAGER
        ]
      },
      {
        id: 43,
        title: 'Presupuesto y Facturación',
        link: '/home/cost-center/budget-billing',
        icon: React.createElement(CalculatorIcon, {className: 'h-5 w-5'}),
        requiredRoles: [
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN_EMPRESA,
          UserRole.MANAGER
        ]
      }
    ]
  },

  {
    id: 5,
    title: 'Gestión de Almacén',
    icon: React.createElement(BuildingStorefrontIcon, {className: 'h-5 w-5'}),
    requiredRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE
    ],
    ISubMenu: [
      {
        id: 51,
        title: 'Administrar Almacenes',
        link: '/home/warehouse',
        icon: React.createElement(BuildingOfficeIcon, {className: 'h-5 w-5'}),
        requiredRoles: [
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN_EMPRESA,
          UserRole.MANAGER
        ]
      },
      {
        id: 52,
        title: 'Administrar Productos',
        link: '/home/warehouse/products',
        icon: React.createElement(CubeIcon, {className: 'h-5 w-5'}),
        requiredRoles: [
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN_EMPRESA,
          UserRole.MANAGER,
          UserRole.EMPLOYEE
        ]
      },
      {
        id: 53,
        title: 'Administrar Inventario',
        link: '/home/warehouse-inventory',
        icon: React.createElement(ArchiveBoxIcon, {className: 'h-5 w-5'}),
        requiredRoles: [
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN_EMPRESA,
          UserRole.MANAGER,
          UserRole.EMPLOYEE
        ]
      }
    ]
  },

  {
    id: 6,
    title: 'Configuración',
    icon: React.createElement(CogIcon, {className: 'h-5 w-5'}),
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA],
    ISubMenu: [
      {
        id: 61,
        title: 'Gestión de Roles',
        link: '/home/roles-management',
        icon: React.createElement(ShieldCheckIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA]
      },
      {
        id: 62,
        title: 'Configuración General',
        link: '/home/activity-log',
        icon: React.createElement(WrenchScrewdriverIcon, {
          className: 'h-5 w-5'
        }),
        requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPRESA]
      }
    ]
  },
  {
    id: 7,
    title: 'Cerrar Sesión',
    link: '/',
    icon: React.createElement(ArrowRightOnRectangleIcon, {
      className: 'h-5 w-5'
    }),
    requiredRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE,
      UserRole.VIEWER
    ]
  }
]
