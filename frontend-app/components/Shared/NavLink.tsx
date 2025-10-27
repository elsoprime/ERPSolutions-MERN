/**
 * Autor: Esteban Soto @elsoprimeDev
 */
import { ArchiveBoxIcon, HomeIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

type NavLinkProps = {
  link: string
  backLink: string
  sectionTitle: string
}

export default function NavLink({ link, backLink, sectionTitle }: NavLinkProps) {

  return (
    <nav className='absolute top-0 z-10'>
      <ul className='flex space-x-4 px-6'>
        <li className='flex flex-row space-x-4 items-center'>
          <HomeIcon className='h-6 w-6 text-purple-500' />
          <Link
            href={link}
            className='py-4 text-purple-500 hover:text-purple-700 transition-colors'
          >
            {backLink}
          </Link>
        </li>
        <li className='flex flex-row space-x-4 items-center'>
          <ArchiveBoxIcon className='h-6 w-6' />{' '}
          <p className='py-4 text-gray-700 font-bold'>{sectionTitle}</p>
        </li>
      </ul>
    </nav>
  )
}
