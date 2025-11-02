/**
 * Autor: Esteban Soto @elsoprimeDev
 */

type LoadingSpinnerProps = {
  size?: number
  text?: string
  fullScreen?: boolean
}

export const LoadingSpinner = ({
  size = 16,
  text = 'Cargando...',
  fullScreen = true
}: LoadingSpinnerProps) => {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClass}>
      <div className='relative flex flex-col items-center gap-4'>
        {/* Container for spinner animations */}
        <div className='relative w-20 h-20 flex items-center justify-center'>
          {/* Outer circle with pulsating animation */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='rounded-full border-4 border-blue-500 opacity-25 animate-pulse h-20 w-20'></div>
          </div>

          {/* Spinning inner circle */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-solid border-blue-500 border-t-transparent'></div>
          </div>

          {/* Inner pulsating dot */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='h-4 w-4 bg-blue-500 rounded-full animate-ping'></div>
          </div>
        </div>

        {/* Loading text */}
        {text && <p className='text-sm font-medium text-gray-600'>{text}</p>}
      </div>
    </div>
  )
}
