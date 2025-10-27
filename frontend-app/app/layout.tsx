import type {Metadata} from 'next'
import './globals.css'
import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import {ToastContainer} from 'react-toastify'
import {globalFonts} from './fonts'
import ReactQueryProvider from '@/components/ReactQueryProvider'

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
    <html lang='es'>
      <body className={`${globalFonts.map(font => font.variable).join(' ')}`}>
        <ReactQueryProvider>
          {children}
          <ToastContainer
            pauseOnFocusLoss={false}
            autoClose={2000}
            pauseOnHover={false}
          />
        </ReactQueryProvider>
      </body>
    </html>
  )
}
