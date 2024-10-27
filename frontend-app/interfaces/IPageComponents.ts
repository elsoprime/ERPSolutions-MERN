/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {IPageBody} from './IComponents'

/** Interface para la Pagina de Warehouse */
export interface IWareHouse {
  id: number
  body: IPageBody[]
}

/** Definir Interface para el Dashbord de la Aplicacion */
export interface IDashboard {
  mainContent?: IPageBody[]
}

/** Interface Card para los Modulos del Sistema */
export interface IModuleCard {
  id: number
  title: string
  subtitle?: string
  description: string
  image: string
  background?: string
  DataAOS: string
  IAction: {
    title: string
    href: string
    onClick?: () => void // Acción cuando se hace clic en la tarjeta
  }[]
}

/** Interface para el Menu de la Aplicacion */
