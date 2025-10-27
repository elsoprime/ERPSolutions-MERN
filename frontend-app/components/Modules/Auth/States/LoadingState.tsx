export function LoadingState() {
  return (
    <div className='max-w-md w-full'>
      <div className='flex flex-col items-center justify-center'>
        {/* Spinner animado mejorado */}
        <div className='mb-6'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600'></div>
        </div>
        <h2 className='text-xl font-semibold text-gray-700 mb-2 text-center'>
          Verificando token...
        </h2>
        <p className='text-gray-500 text-center'>
          Por favor, espera mientras validamos tu información
        </p>

        {/* Puntos animados adicionales */}
        <div className='flex space-x-1 mt-4'>
          <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'></div>
          <div
            className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'
            style={{animationDelay: '0.1s'}}
          ></div>
          <div
            className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'
            style={{animationDelay: '0.2s'}}
          ></div>
        </div>
      </div>
    </div>
  )
}
