import {IMenu} from '@/interfaces/IComponents'
import {UserRole} from '@/interfaces/EnhanchedCompany/MultiCompany'
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
 * @updated: Sistema de menús reorganizado por roles (Super Admin vs Empresa)
 */

// ====== MENÚ PARA SUPER ADMINISTRADOR ======
export const SuperAdminMenuItems: IMenu[] = [
  {
    id: 1,
    title: 'Dashboard Super Admin',
    icon: React.createElement(Squares2X2Icon, {className: 'h-5 w-5'}),
    link: '/dashboard',
    isActive: false,
    requiredRoles: [UserRole.SUPER_ADMIN]
  },
  {
    id: 2,
    title: 'Gestión de Empresas',
    icon: React.createElement(BuildingOffice2Icon, {className: 'h-5 w-5'}),
    link: '/dashboard/companies',
    isActive: false,
    requiredRoles: [UserRole.SUPER_ADMIN]
  },
  {
    id: 3,
    title: 'Gestión de Usuarios',
    icon: React.createElement(UserGroupIcon, {className: 'h-5 w-5'}),
    link: '/dashboard/users',
    isActive: false,
    requiredRoles: [UserRole.SUPER_ADMIN]
  },
  {
    id: 4,
    title: 'Configuración del Sistema',
    icon: React.createElement(CogIcon, {className: 'h-5 w-5'}),
    requiredRoles: [UserRole.SUPER_ADMIN],
    ISubMenu: [
      {
        id: 41,
        title: 'Configuración Global',
        link: '/dashboard/settings',
        icon: React.createElement(WrenchScrewdriverIcon, {
          className: 'h-5 w-5'
        }),
        requiredRoles: [UserRole.SUPER_ADMIN]
      },
      {
        id: 42,
        title: 'Gestión de Roles',
        link: '/dashboard/roles',
        icon: React.createElement(ShieldCheckIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.SUPER_ADMIN]
      },
      {
        id: 43,
        title: 'Analytics del Sistema',
        link: '/dashboard/analytics',
        icon: React.createElement(CalculatorIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.SUPER_ADMIN]
      }
    ]
  },
  {
    id: 5,
    title: 'Cerrar Sesión',
    link: '/',
    icon: React.createElement(ArrowRightOnRectangleIcon, {
      className: 'h-5 w-5'
    }),
    requiredRoles: [UserRole.SUPER_ADMIN]
  }
]

// ====== MENÚ PARA ADMINISTRADOR DE EMPRESA ======
export const CompanyAdminMenuItems: IMenu[] = [
  {
    id: 1,
    title: 'Dashboard',
    icon: React.createElement(Squares2X2Icon, {className: 'h-5 w-5'}),
    link: '/home/miempresa',
    isActive: false,
    requiredRoles: [UserRole.ADMIN_EMPRESA]
  },
  {
    id: 2,
    title: 'Gestión de Usuarios',
    icon: React.createElement(UserGroupIcon, {className: 'h-5 w-5'}),
    link: '/users',
    isActive: false,
    requiredRoles: [UserRole.ADMIN_EMPRESA, UserRole.MANAGER]
  },
  {
    id: 3,
    title: 'Centro de Costos',
    icon: React.createElement(CurrencyDollarIcon, {className: 'h-5 w-5'}),
    requiredRoles: [UserRole.ADMIN_EMPRESA, UserRole.MANAGER],
    ISubMenu: [
      {
        id: 31,
        title: 'Control de Gastos',
        link: '/home/cost-center/expenses',
        icon: React.createElement(BanknotesIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.ADMIN_EMPRESA, UserRole.MANAGER]
      },
      {
        id: 32,
        title: 'Control de Nóminas',
        link: '/home/cost-center/payroll',
        icon: React.createElement(DocumentTextIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.ADMIN_EMPRESA, UserRole.MANAGER]
      },
      {
        id: 33,
        title: 'Presupuesto y Facturación',
        link: '/home/cost-center/budget-billing',
        icon: React.createElement(CalculatorIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.ADMIN_EMPRESA, UserRole.MANAGER]
      }
    ]
  },
  {
    id: 4,
    title: 'Gestión de Almacén',
    icon: React.createElement(BuildingStorefrontIcon, {className: 'h-5 w-5'}),
    requiredRoles: [
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE
    ],
    ISubMenu: [
      {
        id: 41,
        title: 'Administrar Almacenes',
        link: '/home/warehouse',
        icon: React.createElement(BuildingOfficeIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.ADMIN_EMPRESA, UserRole.MANAGER]
      },
      {
        id: 42,
        title: 'Administrar Productos',
        link: '/home/warehouse/products',
        icon: React.createElement(CubeIcon, {className: 'h-5 w-5'}),
        requiredRoles: [
          UserRole.ADMIN_EMPRESA,
          UserRole.MANAGER,
          UserRole.EMPLOYEE
        ]
      },
      {
        id: 43,
        title: 'Administrar Inventario',
        link: '/home/warehouse-inventory',
        icon: React.createElement(ArchiveBoxIcon, {className: 'h-5 w-5'}),
        requiredRoles: [
          UserRole.ADMIN_EMPRESA,
          UserRole.MANAGER,
          UserRole.EMPLOYEE
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'Configuración',
    icon: React.createElement(CogIcon, {className: 'h-5 w-5'}),
    requiredRoles: [UserRole.ADMIN_EMPRESA],
    ISubMenu: [
      {
        id: 51,
        title: 'Configuración de Empresa',
        link: '/home/company-settings',
        icon: React.createElement(WrenchScrewdriverIcon, {
          className: 'h-5 w-5'
        }),
        requiredRoles: [UserRole.ADMIN_EMPRESA]
      },
      {
        id: 52,
        title: 'Gestión de Roles',
        link: '/home/roles-management',
        icon: React.createElement(ShieldCheckIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.ADMIN_EMPRESA]
      }
    ]
  },
  {
    id: 6,
    title: 'Cerrar Sesión',
    link: '/',
    icon: React.createElement(ArrowRightOnRectangleIcon, {
      className: 'h-5 w-5'
    }),
    requiredRoles: [
      UserRole.ADMIN_EMPRESA,
      UserRole.MANAGER,
      UserRole.EMPLOYEE,
      UserRole.VIEWER
    ]
  }
]

// ====== MENÚ PARA MANAGER ======
export const ManagerMenuItems: IMenu[] = [
  {
    id: 1,
    title: 'Dashboard',
    icon: React.createElement(Squares2X2Icon, {className: 'h-5 w-5'}),
    link: '/home',
    isActive: false,
    requiredRoles: [UserRole.MANAGER]
  },
  {
    id: 2,
    title: 'Gestión de Usuarios',
    icon: React.createElement(UserGroupIcon, {className: 'h-5 w-5'}),
    link: '/users',
    isActive: false,
    requiredRoles: [UserRole.MANAGER]
  },
  {
    id: 3,
    title: 'Centro de Costos',
    icon: React.createElement(CurrencyDollarIcon, {className: 'h-5 w-5'}),
    requiredRoles: [UserRole.MANAGER],
    ISubMenu: [
      {
        id: 31,
        title: 'Control de Gastos',
        link: '/home/cost-center/expenses',
        icon: React.createElement(BanknotesIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.MANAGER]
      },
      {
        id: 32,
        title: 'Control de Nóminas',
        link: '/home/cost-center/payroll',
        icon: React.createElement(DocumentTextIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.MANAGER]
      },
      {
        id: 33,
        title: 'Presupuesto y Facturación',
        link: '/home/cost-center/budget-billing',
        icon: React.createElement(CalculatorIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.MANAGER]
      }
    ]
  },
  {
    id: 4,
    title: 'Gestión de Almacén',
    icon: React.createElement(BuildingStorefrontIcon, {className: 'h-5 w-5'}),
    requiredRoles: [UserRole.MANAGER, UserRole.EMPLOYEE],
    ISubMenu: [
      {
        id: 41,
        title: 'Administrar Almacenes',
        link: '/home/warehouse',
        icon: React.createElement(BuildingOfficeIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.MANAGER]
      },
      {
        id: 42,
        title: 'Administrar Productos',
        link: '/home/warehouse/products',
        icon: React.createElement(CubeIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.MANAGER, UserRole.EMPLOYEE]
      },
      {
        id: 43,
        title: 'Administrar Inventario',
        link: '/home/warehouse-inventory',
        icon: React.createElement(ArchiveBoxIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.MANAGER, UserRole.EMPLOYEE]
      }
    ]
  },
  {
    id: 5,
    title: 'Cerrar Sesión',
    link: '/',
    icon: React.createElement(ArrowRightOnRectangleIcon, {
      className: 'h-5 w-5'
    }),
    requiredRoles: [UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.VIEWER]
  }
]

// ====== MENÚ PARA EMPLEADO ======
export const EmployeeMenuItems: IMenu[] = [
  {
    id: 1,
    title: 'Dashboard',
    icon: React.createElement(Squares2X2Icon, {className: 'h-5 w-5'}),
    link: '/home',
    isActive: false,
    requiredRoles: [UserRole.EMPLOYEE]
  },
  {
    id: 2,
    title: 'Gestión de Almacén',
    icon: React.createElement(BuildingStorefrontIcon, {className: 'h-5 w-5'}),
    requiredRoles: [UserRole.EMPLOYEE],
    ISubMenu: [
      {
        id: 21,
        title: 'Administrar Productos',
        link: '/home/warehouse/products',
        icon: React.createElement(CubeIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.EMPLOYEE]
      },
      {
        id: 22,
        title: 'Administrar Inventario',
        link: '/home/warehouse-inventory',
        icon: React.createElement(ArchiveBoxIcon, {className: 'h-5 w-5'}),
        requiredRoles: [UserRole.EMPLOYEE]
      }
    ]
  },
  {
    id: 3,
    title: 'Cerrar Sesión',
    link: '/',
    icon: React.createElement(ArrowRightOnRectangleIcon, {
      className: 'h-5 w-5'
    }),
    requiredRoles: [UserRole.EMPLOYEE, UserRole.VIEWER]
  }
]

// ====== MENÚ PARA VIEWER ======
export const ViewerMenuItems: IMenu[] = [
  {
    id: 1,
    title: 'Dashboard',
    icon: React.createElement(Squares2X2Icon, {className: 'h-5 w-5'}),
    link: '/home',
    isActive: false,
    requiredRoles: [UserRole.VIEWER]
  },
  {
    id: 2,
    title: 'Ver Reportes',
    icon: React.createElement(DocumentTextIcon, {className: 'h-5 w-5'}),
    link: '/reports',
    isActive: false,
    requiredRoles: [UserRole.VIEWER]
  },
  {
    id: 3,
    title: 'Cerrar Sesión',
    link: '/',
    icon: React.createElement(ArrowRightOnRectangleIcon, {
      className: 'h-5 w-5'
    }),
    requiredRoles: [UserRole.VIEWER]
  }
]

// ====== FUNCIÓN PARA OBTENER EL MENÚ SEGÚN EL ROL ======
/**
 * Obtiene el menú apropiado según el rol del usuario
 * @param role - Rol del usuario
 * @returns Array de items de menú correspondiente al rol
 */
export const getMenuByRole = (role: UserRole): IMenu[] => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return SuperAdminMenuItems
    case UserRole.ADMIN_EMPRESA:
      return CompanyAdminMenuItems
    case UserRole.MANAGER:
      return ManagerMenuItems
    case UserRole.EMPLOYEE:
      return EmployeeMenuItems
    case UserRole.VIEWER:
      return ViewerMenuItems
    default:
      return ViewerMenuItems // Fallback seguro
  }
}

// ====== MENÚ LEGACY (Para compatibilidad hacia atrás) ======
/**
 * @deprecated Usar getMenuByRole() en su lugar
 * Menú combinado mantenido para compatibilidad con código existente
 * Por defecto devuelve el menú de VIEWER (más restrictivo)
 */
export const MenuItems: IMenu[] = ViewerMenuItems

export default MenuItems
