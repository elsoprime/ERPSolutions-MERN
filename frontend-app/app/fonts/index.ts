/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

import localFont from 'next/font/local'

/** Definiendo Fuentes Google Fonts para el Proyecto */

const notoSans = localFont({
  src: '/NotoSansDisplay_Condensed-Regular.ttf',
  weight: '100 200 300 400 700 900',
  variable: '--font-noto-sans'
})

const robotoLight = localFont({
  src: '/Roboto-Light.ttf',
  weight: '200 300 400 700 900',
  variable: '--font-roboto-light'
})

const robotoRegular = localFont({
  src: '/Roboto-Regular.ttf',
  weight: '200 300 400 700 900',
  variable: '--font-roboto-regular'
})

const robotoBold = localFont({
  src: '/Roboto-Bold.ttf',
  weight: '300 400 700 900',
  variable: '--font-roboto-bold'
})

const poppins = localFont({
  src: '/Poppins-Bold.ttf',
  weight: '300 400 700 900',
  variable: '--font-poppins'
})

export const globalFonts = [
  notoSans,
  robotoLight,
  robotoRegular,
  robotoBold,
  poppins
]
