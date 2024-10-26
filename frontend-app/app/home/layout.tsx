/** Autor: @elsoprimeDev */

'use client'

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
      <div className='min-h-screen grid grid-col-1 md:grid-cols-6 lg:grid-cols-6'>
        <div className='col-span-5 md:col-span-6 lg:col-span-6 xl:col-span-5 bg-gray-50'>
          <div className='container mx-auto p-4 lg:max-w-none lg:px-8'>
            {children}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}
