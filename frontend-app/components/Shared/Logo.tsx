/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import Image from "next/image";

interface LogoProps {
  // Puedes agregar props si es necesario
  width?: number;
  height?: number;
}

export default function Logo(props: LogoProps) {
  return (
    <div className="flex items-center justify-center">
      <Image src='/LogoERP.webp' alt='Logo' width={props.width || 150} height={props.height || 90} />
    </div>
  )
}
