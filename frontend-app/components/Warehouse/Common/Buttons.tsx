/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

type ButtonProps = {
  href: string
  value: string
}

export default function Buttons({ href, value }: ButtonProps) {
  return (
    <Link
      className='bg-purple-500 w-full md:w-40 py-2 px-4 flex space-x-3 items-center justify-center rounded-lg text-xs text-white hover:contrast-150 transition-all'
      href={href}
    >
      <PlusIcon className='w-5 h-5' />
      {value}
    </Link>
  )
}
