import React, {useState} from 'react'
import {DataList} from '@/components/Shared/DataList'
import {getAllCategories} from '@/api/CategoryApi'
import {Category} from '@/interfaces/Category'
import {DataListColumn} from '@/interfaces/DataList'
import {useQuery} from '@tanstack/react-query'
import {EyeIcon, PencilIcon, TrashIcon} from '@heroicons/react/20/solid'

type CategoryListProps = {
  onEdit: (category: Category) => void
  onDelete?: (category: Category) => void // Agregado para eliminación opcional
  onView?: (category: Category) => void // Agregado para vista opcional
  onFind?: (category: Category) => void // Agregado para búsqueda opcional
  onExport?: (category: Category) => void // Agregado para exportar opcional
  page: number
  setPage: (page: number) => void
  limit: number
  setLastPageCount: (count: number) => void
}

export default function CategoryList({
  onEdit,
  onDelete,
  onView,
  onFind,
  page,
  setPage,
  limit
}: CategoryListProps) {
  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['categories', page, limit],
    queryFn: () => getAllCategories(page, limit)
  })

  const columns: DataListColumn<Category>[] = [
    {key: 'name', label: 'Nombre de la Categoría'},
    {key: 'description', label: 'Descripción'},
    {
      key: '_id',
      label: 'Acciones',
      render: item => (
        <div className='flex gap-2 justify-center'>
          <button
            className='px-2 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors duration-150 border border-purple-200'
            title='Ver'
            onClick={() => onView && onView(item)}
          >
            <EyeIcon className='h-4 w-4 inline-block' />
          </button>
          <button
            className='px-2 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors duration-150 border border-blue-200'
            title='Editar'
            onClick={() => {
              console.log('ID de categoría:', item._id)
              onEdit && onEdit(item)
            }}
          >
            <PencilIcon className='h-4 w-4 inline-block' />
          </button>
          <button
            className='px-2 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors duration-150 border border-red-200'
            title='Eliminar'
            onClick={() => onDelete && onDelete(item)}
          >
            <TrashIcon className='h-4 w-4 inline-block' />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className='flex flex-col h-full min-h-[500px] bg-gray-50 lg:rounded-md p-6'>
      <div className='flex flex-col md:flex-row items-center justify-between mb-4'>
        <h2 className='text-2xl font-bold text-purple-500 mb-4'>
          Lista de Categorías
        </h2>
        <input
          type='text'
          placeholder='Buscar...'
          className='px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent lg:w-64'
          onChange={e => {
            const value = e.target.value
            if (value) {
              onFind && onFind({name: value} as Category)
            }
            //console.log('Valor de búsqueda:', value)
          }}
        />
      </div>
      <div className='flex-1 flex flex-col overflow-hidden'>
        {isError && (
          <div className='text-red-500 mb-2'>
            {(error as Error)?.message || 'Error al cargar categorías'}
          </div>
        )}
        <div className='flex-1 overflow-auto'>
          <DataList<Category>
            data={data?.categories || []}
            columns={columns}
            loading={isLoading}
            pagination={{
              page,
              total: data?.total || 0,
              limit,
              setPage
            }}
          />
          {/** Leyenda de Registros */}
          <div className='mt-4 text-xs text-gray-500 flex justify-end'>
            <p>
              {' '}
              Mostrando {data?.categories.length || 0} de{' '}
              <span className=' font-bold'>{data?.total || 0} categorías.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
