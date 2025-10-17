/**
 * Autor: Esteban Soto @elsoprimeDev
 */

type PaginationProps = {
  total: number // Total de elementos
  limit: number // Número de elementos por página
  page: number // Página actual
  totalPages: number // Total de páginas
  setPage: (page: number) => void // Función para cambiar de página
}

export default function Pagination({
  total,
  limit,
  page,
  totalPages,
  setPage
}: PaginationProps) {
  const handlePrevious = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1)
  }

  return (
    <div className='flex justify-center my-6 text-xs'>
      <nav className='inline-flex rounded-md shadow-sm space-x-1'>
        {/* Botón Anterior */}
        <button
          onClick={handlePrevious}
          disabled={page === 1}
          className={`px-3 py-2 rounded-md border border-gray-200 bg-white ${page === 1
            ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          &lt;
        </button>

        {/* Botones de número de página */}
        {[...Array(Math.max(1, totalPages))].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-2 border border-gray-200 bg-white ${i + 1 === page
              ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            {i + 1}
          </button>
        ))}

        {/* Botón Siguiente */}
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className={`px-3 py-2 rounded-md border border-gray-200 bg-white ${page === totalPages
            ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          &gt;
        </button>
      </nav>
    </div>
  )
}
