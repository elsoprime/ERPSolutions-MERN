/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import Image from 'next/image'
import myLogo from '@/public/LogoSolutions.webp'

interface LogoProps {
  // Puedes agregar props si es necesario
  width?: number
  height?: number
  className?: string
}

export default function Logo(props: LogoProps) {
  return (
    <div className={props.className || 'flex items-center justify-center'}>
      <Image
        src={myLogo}
        alt='Logo'
        width={props.width || 150}
        height={props.height || 90}
      />
    </div>
  )
}
