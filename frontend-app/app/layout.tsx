import type {Metadata} from 'next'
import localFont from 'next/font/local'
import './globals.css'
import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import {ToastContainer} from 'react-toastify'

const notoSans = localFont({
  src: '/fonts/NotoSansDisplay_Condensed-Regular.ttf',
  weight: '300 400 700 900'
})

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
      <body className={`${notoSans.className}`}>
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
