/**
 * Protected Layout Component
 * @description: Layout unificado para páginas protegidas basado en el diseño de /home
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'

import React from 'react'
import {useAuth} from '@/hooks/useAuth'
import Header from '@/components/UI/Header'
import Sidebar from '@/components/UI/Sidebar'
import AuthGuard from '@/components/Modules/Auth/Protected/AuthGuard'
import TokenRefreshProvider from '@/components/Modules/Auth/Protected/TokenRefreshProvider'
import AuthLoadingScreen from '@/components/Shared/AuthLoadingScreen'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({children}) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <AuthGuard requireAuth={true} fallback={<AuthLoadingScreen />}>
        <TokenRefreshProvider>
          <div className='min-h-screen grid grid-cols-1 xl:grid-cols-6'>
            <Sidebar />
            <div className='col-span-1 xl:col-span-5 bg-gray-50'>
              <Header />
              <div className='container mx-auto p-4 lg:max-w-none lg:px-8'>
                {children}
              </div>
            </div>
          </div>
        </TokenRefreshProvider>
      </AuthGuard>
    </QueryClientProvider>
  )
}

export default ProtectedLayout
