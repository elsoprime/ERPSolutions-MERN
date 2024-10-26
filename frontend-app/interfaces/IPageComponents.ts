/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {IPageBody} from './IComponents'

/** Interface para la Pagina de Warehouse */
export interface IWareHouse {
  id: number
  body: IPageBody[]
}

/** Interface para los Modulos de la Warehouse */
export interface IWareHouseCard {
  id: number
  title: string
  description: string
  image: string
  DataAOS: string
  IAction: {
    title: string
    href: string
    onClick?: () => void // Acción cuando se hace clic en la tarjeta
  }[]
}
