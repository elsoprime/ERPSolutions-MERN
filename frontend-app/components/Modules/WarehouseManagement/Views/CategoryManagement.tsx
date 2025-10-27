'use client'
/**
 *  @description Vista para Agregar nuevos Productos
 * @version 1.0.0
 * @created 2024-06-15
 * @author Esteban Soto @elsoprimeDev
 */

import {useForm} from 'react-hook-form'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {toast} from 'react-toastify'
import CategoryForm from '../Forms/CategoryForm'
import CategoryList from '../UI/CategoryList'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  bulkCreateCategories
} from '@/api/CategoryApi'
import {Category, CategoryFormData} from '@/schemas/categorySchema'
import {useState} from 'react'
import AlertDialog from '../../../Shared/AlertDialog'
import Navbar from '../UI/Navbar'
import Dialog from '@/components/Shared/DialogComponent'
import {exportArrayToCsv} from '@/utils/csvExport'
import {LoadingSpinner} from '@/components/Shared/LoadingSpinner'
import {CategoryImport} from '@/utils/csvImport'

type FormMode = 'create' | 'edit' | null

export default function CategoryManagement() {
  // Estado de paginación y control de registros en página actual
  const [page, setPage] = useState(1)
  const limit = 7
  const [lastPageCount, setLastPageCount] = useState(0)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<string | null>(
    null
  )

  const [formMode, setFormMode] = useState<FormMode>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: {errors},
    reset
  } = useForm<CategoryFormData>()

  // Mutación para crear
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Categoría creada correctamente')
      queryClient.invalidateQueries({queryKey: ['categories']})
      reset()
      setFormMode(null)
    },
    onError: error => toast.error(error.message)
  })

  /**
   * Maneja la creación de una nueva categoría
   */
  const handleCreate = () => {
    setSelectedCategory(null)
    setFormMode('create')
    // Resetea el formulario con valores vacíos
    reset({
      name: '',
      description: ''
    })
  }

  // Mutación para carga masiva
  const bulkImportMutation = useMutation({
    mutationFn: bulkCreateCategories,
    onSuccess: data => {
      const {imported, duplicateCount, errorCount, duplicates, errors} = data

      // Mensaje principal de éxito
      if (imported > 0) {
        toast.success(
          `✅ ${imported} ${
            imported === 1 ? 'categoría importada' : 'categorías importadas'
          } correctamente`
        )
      }

      // Mensaje sobre duplicados
      if (duplicateCount > 0) {
        toast.warning(
          `⚠️ ${duplicateCount} ${
            duplicateCount === 1 ? 'categoría omitida' : 'categorías omitidas'
          } por estar duplicadas`,
          {autoClose: 5000}
        )
        console.log('Categorías duplicadas omitidas:', duplicates)
      }

      // Mensaje sobre errores
      if (errorCount > 0) {
        toast.error(
          `❌ ${errorCount} ${
            errorCount === 1
              ? 'categoría con errores'
              : 'categorías con errores'
          }`,
          {autoClose: 5000}
        )
        console.error('Errores de validación:', errors)
      }

      // Si no se importó nada
      if (imported === 0) {
        toast.info('ℹ️ No se importó ninguna categoría nueva')
      }

      queryClient.invalidateQueries({queryKey: ['categories']})
      setIsInfoModalOpen(false)
    },
    onError: (error: any) => {
      const errorData = error.response?.data

      if (errorData?.duplicates || errorData?.errors) {
        const {duplicateCount = 0, errorCount = 0, imported = 0} = errorData

        if (imported > 0) {
          toast.success(`✅ ${imported} categorías importadas`)
        }

        if (duplicateCount > 0) {
          toast.warning(`⚠️ ${duplicateCount} duplicadas omitidas`)
        }

        if (errorCount > 0) {
          toast.error(`❌ ${errorCount} con errores`)
        }

        console.error('Detalles:', errorData)
      } else {
        toast.error('Error al importar categorías')
      }
    }
  })

  /**
   * Cierra el formulario y limpia el estado
   */
  const handleCloseForm = () => {
    setFormMode(null)
    setSelectedCategory(null)
    reset() // Limpia todos los campos del formulario
  }

  /**
   * Maneja el envío del formulario (crear o actualizar)
   * @param data - Datos del formulario validados
   */

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success('Categoría actualizada correctamente')
      queryClient.invalidateQueries({queryKey: ['categories']})
      reset()
      setFormMode(null)
      setSelectedCategory(null)
    },
    onError: error => toast.error(error.message)
  })

  /**
   * Maneja la edición de una categoría
   * @param category - Categoría seleccionada para editar
   */
  const handleEdit = (category: Category) => {
    // console.log('Categoría completa recibida:', category); // Para debug
    // console.log('ID de categoría:', category._id); // Para debug

    if (!category._id) {
      toast.error('Error: ID de categoría no disponible')
      return
    }

    setSelectedCategory(category)
    setFormMode('edit')
    reset({
      name: category.name,
      description: category.description
    })
  }

  /**
   * Manejar la Eliminación de una categoría
   * @param categoryId - ID de la categoría a eliminar
   */

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Categoría eliminada correctamente')
      // Invalidar todas las queries de categorías (incluyendo paginación)
      queryClient.invalidateQueries({queryKey: ['categories'], exact: false})
      // Si la página actual queda vacía y no es la primera, retrocede una página
      setTimeout(() => {
        if (lastPageCount <= 1 && page > 1) {
          setPage(page - 1)
        }
      }, 100)
      reset()
      setFormMode(null)
      setSelectedCategory(null)
    },
    onError: error => {
      toast.error(error.message)
    }
  })

  const handleDelete = (categoryId: Category['_id']) => {
    if (!categoryId) {
      toast.error('Error: ID de categoría no disponible')
      return
    }
    deleteMutation.mutate(categoryId)
  }

  /**
   * Maneja el envío del formulario (crear o actualizar)
   * @param data - Datos del formulario validados
   */
  const onSubmit = (data: CategoryFormData) => {
    if (formMode === 'edit' && selectedCategory) {
      // Actualizar categoría existente
      updateMutation.mutate({
        categoryId: selectedCategory._id,
        formData: data
      })
    } else if (formMode === 'create') {
      // Crear nueva categoría
      createMutation.mutate({formData: data})
    }
  }

  /**
   * Manejar el Modal para la Importación de Datos
   */

  const handleOpenInfoModal = () => {
    setIsInfoModalOpen(true)
  }

  const handleImport = async (data?: CategoryImport[]) => {
    console.log('📦 Datos recibidos en handleImport:', data)
    console.log('📊 Cantidad de elementos:', data?.length)
    console.log('📝 Primer elemento:', data?.[0])

    if (!data || data.length === 0) {
      toast.error('No hay datos para importar')
      return
    }

    // Transformar datos del CSV al formato del backend
    const categories = data.map(item => ({
      name: item.nombre,
      description: item.descripción
    }))

    console.log('🔄 Categorías transformadas:', categories)

    // Una sola llamada al backend
    bulkImportMutation.mutate(categories)
  }

  const handleExport = async () => {
    try {
      // Refetch para obtener datos frescos
      const result = await queryClient.fetchQuery({
        queryKey: ['categories-all'],
        queryFn: () => getAllCategories(1, 9999)
      })

      const categories = result?.categories || []

      if (categories.length === 0) {
        toast.error('No hay categorías para exportar')
        return
      }

      const data = [
        ['Nombre', 'Descripción'],
        ...categories.map(cat => [cat.name, cat.description])
      ]

      exportArrayToCsv(data, 'categorias', true)
      toast.success('Archivo exportado correctamente')
    } catch (error) {
      console.error('Error al exportar:', error)
      toast.error('Error al exportar el archivo')
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <Navbar
        title='Gestión de Categorías'
        description='Administra las categorías de productos en tu almacén'
        importData={() => handleOpenInfoModal()}
        exportData={() => handleExport()}
        newAction={() => handleCreate()}
        labelNewAction='Nueva Categoría'
      />
      <div className='grid grid-cols-1 lg:grid-cols-6 gap-6 mx-auto'>
        <div className='bg-white col-span-1 lg:col-span-2 shadow-lg px-8 py-6 border border-gray-200 rounded-lg'>
          <div className='space-y-6'>
            {formMode === null && (
              <div className='flex flex-col items-center lg:rounded-md xl:rounded-none shadow-sm p-4'>
                <h2 className='text-2xl font-bold text-gray-800 mb-4'>
                  🗂️ Formulario de Categoría
                </h2>
                <p className='mb-4 text-gray-600'>
                  Aquí puedes crear, editar o eliminar categorías de productos
                  para organizar tu inventario de manera eficiente.
                </p>
                <button
                  onClick={handleCreate}
                  className='px-4 py-2 w-full bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors duration-150'
                >
                  + Nueva Categoría
                </button>
              </div>
            )}

            {/* Formulario dinámico (Create/Edit) */}
            {formMode !== null && (
              <div className='bg-white rounded-sm lg:rounded-md xl:rounded-none'>
                <h2 className='text-xl font-bold text-gray-800 mb-4'>
                  {formMode === 'create'
                    ? '📝 Crear Nueva Categoría'
                    : '✏️ Editar Categoría'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <CategoryForm
                    register={register}
                    errors={errors}
                    initialValues={
                      selectedCategory
                        ? {
                            name: selectedCategory.name,
                            description: selectedCategory.description
                          }
                        : undefined
                    }
                    isLoading={
                      createMutation.isPending || updateMutation.isPending
                    }
                    mode={formMode}
                    onCancel={handleCloseForm}
                  />
                </form>
              </div>
            )}
          </div>
        </div>
        <div className='col-span-1 lg:col-span-4 bg-white rounded-lg shadow-lg border border-gray-200'>
          {/* Lista de categorías - Pasa handleEdit como prop */}
          <CategoryList
            onEdit={handleEdit}
            onDelete={category => {
              setCategoryIdToDelete(category._id)
              setSelectedCategory(category)
              setIsDeleteModalOpen(true)
            }}
            onView={category => console.log('Ver:', category)}
            page={page}
            setPage={setPage}
            limit={limit}
            setLastPageCount={setLastPageCount}
          />
          <AlertDialog
            type='error'
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => {
              if (categoryIdToDelete) handleDelete(categoryIdToDelete)
              setIsDeleteModalOpen(false)
              setCategoryIdToDelete(null)
            }}
            title='¿Estás Seguro?'
            description={`Esta acción eliminará permanentemente la categoría ${
              selectedCategory?.name || 'seleccionada'
            }. Esta acción no se puede deshacer. ¿Deseas continuar?`}
            buttonActionText='Eliminar'
            buttonCancelText='Cancelar'
          />
          <Dialog
            type='upload'
            isOpen={isInfoModalOpen}
            onClose={() => setIsInfoModalOpen(false)}
            onConfirm={handleImport}
            title='Información'
            description='Importa múltiples categorías desde un archivo CSV. El archivo debe contener las columnas: Nombre, Descripción'
            buttonActionText='Importar'
            buttonCancelText='Cancelar'
            enableCSVImport={true}
            csvHeaders={['nombre', 'descripción']}
          />
          {/* Indicador de carga mientras importa */}
          {bulkImportMutation.isPending && (
            <div className='flex items-center mt-4'>
              <LoadingSpinner />
              <span className='ml-2'>Importando categorías...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
