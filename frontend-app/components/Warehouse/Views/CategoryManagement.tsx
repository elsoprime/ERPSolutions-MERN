'use client'
/**
 *  @description Vista para Agregar nuevos Productos
 * @version 1.0.0
 * @created 2024-06-15
 * @author Esteban Soto @elsoprimeDev
 */

import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import CategoryForm from '../Forms/CategoryForm'
import CategoryList from '../UI/CategoryList'

import { createCategory, updateCategory, getCategoryById, deleteCategory } from '@/api/CategoryApi';
import { Category, CategoryFormData } from '@/schemas/categorySchema';
import { useState } from 'react';
import ConfirmModal from '../../Shared/ConfirmModal';

type FormMode = 'create' | 'edit' | null;


export default function CategoryManagement() {
  // Estado de paginación y control de registros en página actual
  const [page, setPage] = useState(1);
  const limit = 7;
  const [lastPageCount, setLastPageCount] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const params = useParams()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>();



  // Mutación para crear
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Categoría creada correctamente')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      reset()
      setFormMode(null);
    },
    onError: error => toast.error(error.message)
  })

  /**
     * Maneja la creación de una nueva categoría
     */
  const handleCreate = () => {
    setSelectedCategory(null);
    setFormMode('create');
    // Resetea el formulario con valores vacíos
    reset({
      name: '',
      description: ''
    });
  };

  /**
   * Cierra el formulario y limpia el estado
   */
  const handleCloseForm = () => {
    setFormMode(null);
    setSelectedCategory(null);
    reset(); // Limpia todos los campos del formulario
  };

  /**
     * Maneja el envío del formulario (crear o actualizar)
     * @param data - Datos del formulario validados
     */

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success('Categoría actualizada correctamente')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      reset()
      setFormMode(null);
      setSelectedCategory(null);
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
      toast.error('Error: ID de categoría no disponible');
      return;
    }

    setSelectedCategory(category);
    setFormMode('edit');
    reset({
      name: category.name,
      description: category.description
    });
  };

  /**
   * Manejar la Eliminación de una categoría
   * @param categoryId - ID de la categoría a eliminar
   */

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Categoría eliminada correctamente');
      // Invalidar todas las queries de categorías (incluyendo paginación)
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
      // Si la página actual queda vacía y no es la primera, retrocede una página
      setTimeout(() => {
        if (lastPageCount <= 1 && page > 1) {
          setPage(page - 1);
        }
      }, 100);
      reset();
      setFormMode(null);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleDelete = (categoryId: Category["_id"]) => {
    if (!categoryId) {
      toast.error('Error: ID de categoría no disponible');
      return;
    }
    deleteMutation.mutate(categoryId);
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
      });
    } else if (formMode === 'create') {
      // Crear nueva categoría
      createMutation.mutate({ formData: data });
    }
  };


  return (
    <div className='relative z-10 -mt-72'>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mx-auto px-4">
        <div className='bg-white col-span-1 lg:col-span-2 shadow-lg px-8 py-6 border border-gray-200 rounded-lg'>
          {/* Portada de sección profesional y llamativa */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-400 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-white">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m-5 4h18" />
                </svg>
                <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-lg">Gestión de Categorías</h1>
              </div>
              <p className="text-base font-medium opacity-90 mb-2">Administra, crea y edita las categorías de productos de tu almacén de forma eficiente y profesional.</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide mt-2 shadow">Panel de administración</span>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-2 bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-300 rounded-full blur-sm opacity-60"></div>
          </div>
          <div className="space-y-6">
            {/* Botón para crear nueva categoría */}
            {formMode === null && (
              <div className="flex flex-col items-center lg:rounded-md xl:rounded-none shadow-sm p-4">
                <h3 className=' text-xl font-bold text-gray-600 py-4 '>Formularios para Categorías</h3>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 w-full bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors duration-150"
                >
                  + Nueva Categoría
                </button>
              </div>
            )}

            {/* Formulario dinámico (Create/Edit) */}
            {formMode !== null && (
              <div className="bg-white rounded-sm lg:rounded-md xl:rounded-none">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {formMode === 'create' ? '📝 Crear Nueva Categoría' : '✏️ Editar Categoría'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <CategoryForm
                    register={register}
                    errors={errors}
                    initialValues={selectedCategory ? {
                      name: selectedCategory.name,
                      description: selectedCategory.description
                    } : undefined}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                    mode={formMode}
                    onCancel={handleCloseForm}
                  />
                </form>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-1 lg:col-span-4 bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Lista de categorías - Pasa handleEdit como prop */}
          <CategoryList
            onEdit={handleEdit}
            onDelete={(category) => {
              setCategoryIdToDelete(category._id);
              setIsDeleteModalOpen(true);
            }}
            onView={(category) => console.log('Ver:', category)}
            page={page}
            setPage={setPage}
            limit={limit}
            setLastPageCount={setLastPageCount}
          />
          <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => {
              if (categoryIdToDelete) handleDelete(categoryIdToDelete);
              setIsDeleteModalOpen(false);
              setCategoryIdToDelete(null);
            }}
            title="¿Eliminar categoría?"
            description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
          />
        </div>
      </div>
    </div>
  )
}