/**
 * Autor: Esteban Soto @elsoprimeDev
 */

/** Definiendo Interface para los Campos del Formulario */
export interface IFormField {
  id: string
  label?: string
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'checkbox'
    | 'date'
    | 'select'
    | 'number'
    | 'file'
    | 'textarea'
    | 'image'
    | 'radio'
    | 'hidden'
  placeholder?: string
  required?: boolean
  isChecked?: boolean
  validation?: (value: string | FileList) => string | null // Aceptar tanto string como archivos
  accept?: string // Para definir los tipos de archivos permitidos, e.g., 'image/*' para solo imágenes
  multiple?: boolean // Permitir múltiples archivos
  maxSize?: number // Tamaño máximo permitido en bytes
  maxLength?: number // Longitud máxima permitida
}

/** Definiendo Interface para los Cuerpo de la Pagina */
export interface IPageBody {
  title: string
  subtitle?: string
  description?: string
  className?: string
  image?: string
  icon?: JSX.Element[]
  iconColor?: string
  DataAOS?: string
  Link?: string
  IAction?: IAction[]
}

/** Definiendo Interface para Actions */
interface IAction {
  title?: string
  href?: string
  onClick?: () => void // Puedes agregar una función opcional para manejar el clic
}

/** Definiendo Inferface para Cards */
export interface ICard {
  id: string // Identificador único de la tarjeta
  title: string // Título de la tarjeta
  description?: string // Descripción opcional
  body?: IPageBody[] // Cuerpo de la tarjeta
  image?: string // URL de la imagen opcional
  content?: JSX.Element | string // Contenido adicional de la tarjeta
  onClick?: () => void // Acción cuando se hace clic en la tarjeta
  footer?: JSX.Element // Pie de tarjeta opcional
  IAction?: IAction[] // Acciones adicionales (botones, enlaces, etc.)
  style?: React.CSSProperties // Estilos personalizados
  className?: string // Clases CSS adicionales
  isFeatured?: boolean // Indica si es una tarjeta destacada
  badge?: string // Pequeño indicador de texto
  isLoading?: boolean // Estado de carga opcional
  link?: string // Enlace opcional
  DataAOS?: string // Atributo de animación AOS
}

/**
 * @description: Definición de Interfaces el Menu de la Aplicación
 * @requires: React
 * @exports: IMenu
 * @Author Esteban Soto Ojeda [elsoprimeDev]
 */

export interface ISubMenu {
  id: number;
  title: string;
  icon: React.ReactNode;
  link: string;
  isExternal?: boolean;
  isActive?: boolean;
}

export interface IMenu {
  id: number;
  title: string;
  icon?: React.ReactNode;
  link?: string;
  isExternal?: boolean;
  isActive?: boolean;
  ISubMenu?: ISubMenu[];
}

/** Interface para el perfil de usuario en el Header */
export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isAuthenticated: boolean;
}

/** Interface para las opciones del menú de usuario */
export interface IUserMenuOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  divider?: boolean;
}

/** Interface para el componente de navegación del Header */
export interface IHeaderNavigation {
  menuItems: IMenu[];
  userProfile: IUserProfile;
  userMenuOptions: IUserMenuOption[];
  onMenuItemClick?: (item: IMenu) => void;
  onUserMenuClick?: (option: IUserMenuOption) => void;
}