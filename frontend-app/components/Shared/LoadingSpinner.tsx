/**
 * Autor: Esteban Soto @elsoprimeDev
 */

export const LoagingSpinner = () => {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='relative'>
        {/* Outer circle with pulsating animation */}
        <div className='fixed inset-0 flex items-centerrounded-full border-4 border-blue-500 opacity-25 animate-pulse'></div>

        {/* Spinning inner circle */}
        <div className='animate-spin rounded-full h-16 w-16 border-4 border-solid border-blue-500 border-t-transparent'></div>

        {/* Inner pulsating dot */}
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <div className='h-4 w-4 bg-blue-500 rounded-full animate-ping mb-2'></div>
        </div>
      </div>
    </div>
  )
}
