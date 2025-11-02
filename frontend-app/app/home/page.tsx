/**
 * Home Page with Smart Routing
 * @description: Página home que redirige automáticamente según el rol del usuario
 * @author: Esteban Soto @elsoprimeDev
 */

'use client'

import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from '@/hooks/useAuth'
import {getHighestRole} from '@/utils/roleRouting'
import {UserRole} from '@/interfaces/EnhanchedCompany/MultiCompany'

export default function HomePage() {
  const router = useRouter()
  const {getUserData} = useAuth()

  useEffect(() => {
    const userData = getUserData()
    const userRole = getHighestRole(userData)

    // Si es Super Admin, redirigir a /dashboard
    if (userRole === UserRole.SUPER_ADMIN) {
      router.push('/dashboard')
    }
  }, [router, getUserData])

  return (
    <>
      <h1>Este es el Modulo Home</h1>
    </>
  )
}
