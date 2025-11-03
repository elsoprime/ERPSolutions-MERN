/** Autor: @elsoprimeDev */

'use client'

import Header from '@/components/UI/Header'
import HeaderNavigation from '@/components/UI/HeaderNavigation'
import Sidebar from '@/components/UI/Sidebar'
import AuthGuard from '@/components/Modules/Auth/Protected/AuthGuard'
import TokenRefreshProvider from '@/components/Modules/Auth/Protected/TokenRefreshProvider'
import AuthLoadingScreen from '@/components/Shared/AuthLoadingScreen'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'

export default function HomeLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
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
