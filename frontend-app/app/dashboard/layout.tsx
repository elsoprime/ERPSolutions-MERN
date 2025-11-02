/** Autor: @elsoprimeDev */

'use client'

import Header from '@/components/UI/Header'
import HeaderNavigation from '@/components/UI/HeaderNavigation'
import Sidebar from '@/components/UI/Sidebar'
import AuthGuard from '@/components/Modules/Auth/Protected/AuthGuard'
import TokenRefreshProvider from '@/components/Modules/Auth/Protected/TokenRefreshProvider'
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
      <AuthGuard
        requireAuth={true}
        fallback={
          <div className='min-h-screen flex items-center justify-center'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>Verificando autenticación...</p>
            </div>
          </div>
        }
      >
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
