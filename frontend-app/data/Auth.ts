/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {IFormField} from '@/interfaces/IComponents'
import {
  ILoginBackground,
  ILoginUser,
  IRegisterUser
} from '@/interfaces/IPageComponents'
import {title} from 'process'

/** Definiendo Formulario Inicio de Sección */
export const AuthForm: ILoginUser[] = [
  {
    userForm: [
      {
        id: 'email',
        label: 'Correo Electrónico',
        type: 'email',
        placeholder: 'Correo Electrónico...',
        required: true
      },
      {
        id: 'password',
        label: 'Contraseña',
        type: 'password',
        placeholder: 'Contraseña...',
        required: true
      }
    ],
    forget: '¿Olvidaste tu contraseña?',
    register: '¿No tienes una cuenta?'
  }
]

/** Definiendo Formulario de Registro de Usuarios */
export const AuthRegisterForm: IRegisterUser[] = [
  {
    registerForm: [
      {
        id: 'name',
        label: 'Nombre',
        type: 'text',
        placeholder: 'Nombre...',
        required: true
      },
      {
        id: 'email',
        label: 'Correo Electrónico',
        type: 'email',
        placeholder: 'Correo Electrónico...',
        required: true
      },
      {
        id: 'password',
        label: 'Contraseña',
        type: 'password',
        placeholder: 'Contraseña...',
        required: true
      },
      {
        id: 'confirmPassword',
        label: 'Confirmar Contraseña',
        type: 'password',
        placeholder: 'Confirmar Contraseña...',
        required: true
      }
    ]
  }
]

/** Definiendo Formulario para Recuperar Password  */
export const RecoverPasswordForm: IFormField[] = [
  {
    id: 'email',
    label: 'Correo Electrónico',
    type: 'email',
    placeholder: 'Correo Electrónico...',
    required: true
  }
]

/** Definiendo Array de Imagenes para Background de Auth */
export const AuthBackgroundImages: ILoginBackground[] = [
  {
    id: 'auth-1',
    backgroundImage: [
      {
        image: '/images/BG001.webp',
        alt: 'Background Image 1'
      },
      {
        image: '/images/BG002.webp',
        alt: 'Background Image 2'
      },
      {
        image: '/images/BG003.webp',
        alt: 'Background Image 3'
      },
      {
        image: '/images/BG004.webp',
        alt: 'Background Image 4'
      }
    ],
    textContent: [
      {
        title: 'Plataforma Integral de Gestión Administrativa',
        description:
          'Una solución completa para la administración eficiente de procesos y recursos, optimizando la gestión operativa y financiera.',
        dataAOS: 'fade-right'
      },
      {
        title: 'Plataforma de Gestión de Datos en la Nube',
        description:
          'Facilita la gestión de datos en la nube, permitiendo el acceso a la información de forma segura y eficiente.',
        dataAOS: 'fade-left'
      },
      {
        title: 'Plataforma de Gestión de Proyectos',
        description:
          'Administra de forma eficiente los proyectos de tu empresa, optimizando los recursos y mejorando la productividad.',
        dataAOS: 'fade-down'
      },
      {
        title: 'Plataforma de Gestión de Recursos Humanos',
        description:
          'Gestiona de forma eficiente los recursos humanos de tu empresa, mejorando la productividad y el clima laboral.',
        dataAOS: 'fade-up'
      }
    ]
  }
]
