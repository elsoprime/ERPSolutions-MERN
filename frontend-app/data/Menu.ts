import { IMenu } from "@/interfaces/IComponents";
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
} from "@heroicons/react/20/solid";
import React from "react";

/**
 * @description: Definición de Menús de la Aplicación
 * @requires: React
 * @exports: IMenu
 * @Author Esteban Soto Ojeda [elsoprimeDev]
 */
/** Definiendo Estructura para los Menus del Sidebar */

export const MenuItems: IMenu[] = [
  {
    id: 1,
    title: "Dashboard",
    icon: React.createElement(Squares2X2Icon, { className: "h-5 w-5" }),
    link: "/home",
    isActive: false,      
  },
  {
    id: 2,
    title: "Centro de Costos",
    icon: React.createElement(CurrencyDollarIcon, { className: "h-5 w-5" }),
    ISubMenu: [
      {
        id: 1,
        title: "Control de Gastos",
        link: "/home/cost-center/expenses",
        icon: React.createElement(BanknotesIcon, { className: "h-5 w-5" }),
        
      },
      {
        id: 2,
        title: "Control de Nóminas",
        link: "/home/cost-center/payroll",
        icon: React.createElement(DocumentTextIcon, { className: "h-5 w-5" }),
      },
      {
        id: 3,
        title: "Presupuesto y Facturación",
        link: "/home/cost-center/budget-billing",
        icon: React.createElement(CalculatorIcon, { className: "h-5 w-5" }),
      },
    ],
  },

{
  id: 3,
  title: "Gestión de Almacen",
  icon: React.createElement(BuildingStorefrontIcon, { className: "h-5 w-5" }),
  ISubMenu: [
    {
      id: 1,
      title: "Administrar Almacenes",
      link: "/home/warehouse",
      icon: React.createElement(BuildingOfficeIcon, { className: "h-5 w-5" }),
      
    },
    {
      id: 2,
      title: "Administrar Productos",
      link: "/home/warehouse/products",
      icon: React.createElement(CubeIcon, { className: "h-5 w-5" }),
    },
    {
      id: 3,
      title: "Administrar Inventario",
      link: "/home/warehouse-inventory",
      icon: React.createElement(ArchiveBoxIcon, { className: "h-5 w-5" }),
    },
  ],
},

  {
    id: 4, // Changed this id to 3 for uniqueness
    title: "Configuración",
    icon: React.createElement(CogIcon, { className: "h-5 w-5" }),
    ISubMenu: [
      {
        id: 1, // Changed this id to 4 for uniqueness
        title: "Gestion de Usuarios",
        link: "/home/usersManagement",
        icon: React.createElement(UserGroupIcon, { className: "h-5 w-5" }),
      },    
      {
        id: 2, // Changed this id to 6 for uniqueness
        title: "Gestion de Roles",
        link: "/home/roles-management",
        icon: React.createElement(ShieldCheckIcon, { className: "h-5 w-5" }),
      },
      {
        id: 3, // Changed this id to 7 for uniqueness
        title: "Configuración General",
        link: "/home/activity-log",
        icon: React.createElement(WrenchScrewdriverIcon, { className: "h-5 w-5" }),
      }      
    ],
  },
  {
        id: 5, 
        title: "Cerrar Sesión",
        link: "/",
        icon: React.createElement(ArrowRightOnRectangleIcon, { className: "h-5 w-5" }),
      }
];
