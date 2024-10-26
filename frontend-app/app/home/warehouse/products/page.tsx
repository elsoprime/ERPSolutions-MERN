/**
 * Autor: Esteban Soto @elsoprimeDev
 */

'use client'
import React, { useState } from 'react'
import Header from '@/components/Warehouse/Common/Header'
import ListProduct from '@/components/Warehouse/Products/ListProduct'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { getAllProducts } from '@/api/ProductApi'
import { LoagingSpinner } from '@/components/Shared/LoadingSpinner'
import Pagination from '@/components/Shared/Pagination'
import Buttons from '@/components/Warehouse/Common/Buttons'
import SearchForm from '@/components/Warehouse/Products/SearchForm'
import Page404 from '@/components/Shared/404'

export default function Products() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  //variables de estado para el paginado
  const [page, setPage] = useState(1)
  const limit = 7

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['products', page],
    queryFn: () => getAllProducts(page, limit),
    retry: false
  })

  /*   console.log(data)
  console.log('Pagina Actual:', page)
  console.log('Error:', error) */

  if (isLoading) return <LoagingSpinner />
  if (isError) return <Page404 description='Lo sentimos, la página que estás buscando no existe o ha sido movida.' />

  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  /**
   * Definiendo la Vista de la página de productos
   */

  return (
    <>
      <Header
        link={'/home/warehouse'}
        nameLink={'Mi Almacen'}
        sectionTitle={'Sección Productos'}
      />

      {/* <!-- Sección de Busqueda de Productos --> */}
      <div className='max-w-7xl mx-auto -mt-40 relative z-10 flex flex-col md:flex-row md:justify-between gap-4 bg-gray-50 py-6 px-4 rounded-lg'>
        <Buttons href='/home/warehouse/products/add' value='Crear Producto' />
        <SearchForm value='Buscar' placeholder='Buscar...' />
      </div>

      {/* <!-- Sección de Tabla de Productos --> */}
      {isFetching && <LoagingSpinner />}
      {data?.products && (
        <ListProduct products={data.products} productId={productId} />
      )}

      {/* <!-- Paginación de Tabla de Productos --> */}
      {totalPages >= 1 && (
        <Pagination
          total={totalPages}
          limit={limit}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
