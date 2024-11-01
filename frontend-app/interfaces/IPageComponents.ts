/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {IFormField, IPageBody} from './IComponents'

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

/**  Definiendo la Interface para el Form Login de la Aplicación */
export interface ILoginUser {
  userForm: IFormField[]
  forget?: string
  register?: string
}

/** Definiendo la Interface para el Form Register de la Aplicación */
export interface IRegisterUser {
  registerForm: IFormField[]
  login?: string
}

/** Definiendo la Interface para el Form Forget de la Aplicación */
export interface IForgetPassword {
  forgetForm: IFormField[]
  login?: string
}

/** Definiendo la Interface para el Background */
export interface ILoginBackground {
  id: string
  backgroundImage: IBackgroundImage[]
  textContent: ITextContent[]
}

/**Definiendo la Interface para las Imagenes de fondo */
interface IBackgroundImage {
  image: string
  alt?: string
}

/** Definiendo la Interface para el Contenido del Background */
interface ITextContent {
  title: string
  description: string
  dataAOS?: string
  icon?: JSX.Element
}
