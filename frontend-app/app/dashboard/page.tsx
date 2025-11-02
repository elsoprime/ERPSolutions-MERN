/**
 * Home Page with Smart Routing
 * @description: Página home que redirige automáticamente según el rol del usuario
 * @author: Esteban Soto @elsoprimeDev
 */

import SmartHomeRouter from '@/components/Routing/SmartHomeRouter'

export default function HomePage() {
  return <SmartHomeRouter />
}
export const metadata = {
  title: 'Home - ERP Solutions',
  description:
    'Página principal con redirección inteligente según el rol del Super Administrador'
}
