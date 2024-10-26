/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import Page404 from '@/components/Shared/404'

export default function notFound() {
  const description = ' Lo sentimos, la página que estás buscando no existe o ha sido movida.'
  return <Page404 description={description} />
}
