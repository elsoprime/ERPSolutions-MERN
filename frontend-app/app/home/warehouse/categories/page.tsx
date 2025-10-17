/**
 * @description: Página principal de Categorías del Almacén
 * @version: 1.0.0
 * @created: 2024-06-15
 * @author: Esteban Soto @elsoprimeDev
 */

'use client'
import React, { useState } from 'react'
import HeaderSection from '@/components/UI/HeaderSection'
import { useParams, useRouter } from 'next/navigation'
import CategoryManagement from '@/components/Warehouse/Views/CategoryManagement'

export default function Categories() {
  const params = useParams()
  const router = useRouter()
  const category = params.id as string

  // El paginado y la carga de datos se manejan internamente en CategoryList

  /**
   * Definiendo la Vista de la página de Categorías
   */

  return (
    <>
      <HeaderSection
        link={'/home/warehouse'}
        nameLink={'Mi Almacen'}
        sectionTitle={'Sección Categorias'}
      />

      {/* <!-- Sección de Busqueda de Productos --> */}
      <div className='mx-auto -mt-32 xl:-mt-40 relative z-10 flex flex-col md:flex-row justify-center gap-4 '>
        <CategoryManagement />
      </div>


    </>
  )
}
