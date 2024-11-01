import type {Metadata} from 'next'
import './globals.css'
import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import {ToastContainer} from 'react-toastify'
import {globalFonts} from './fonts'

export const metadata: Metadata = {
  title: 'Plataforma de gestión de Procesos de Desarrollo',
  description:
    'Descubre una manera más fácil de gestionar tus procesos de desarrollo de empresa'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${globalFonts.map(font => font.variable).join(' ')}`}>
        {children}
        <ToastContainer
          pauseOnFocusLoss={false}
          autoClose={2000}
          pauseOnHover={false}
        />
      </body>
    </html>
  )
}
