/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import { useEffect, useState } from 'react'
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import ErrorMessage from '@/components/Shared/ErrorMessage'
import { ProductFormField, typeProductData } from '@/data/Warehouse'
import { IFormField } from '@/interfaces/IComponents'
import { ProductsFormData } from '@/schemas/productsSchema'
import { typeProductTranslate } from '@/locale/es'
import { getCategories, ICategoryApi } from '@/api/CategoryApi'
import ImageUpload from '@/components/Shared/ImageUpload'
import { getImagePath } from '@/utils/imagesUtils'
import ProductCard from '../../Common/ProductCard'

type ProductFormProps = {
  register: UseFormRegister<ProductsFormData>
  errors: FieldErrors<ProductsFormData>
  setValue: UseFormSetValue<ProductsFormData>
  initialValues?: ProductsFormData
}

export default function ProductForm({
  register,
  errors,
  setValue,
  initialValues
}: ProductFormProps) {
  const [categories, setCategories] = useState<ICategoryApi[]>([])
  const [selection, setSelection] = useState({
    categories: initialValues?.category || ''
  })
  const [imageUrl, setImageUrl] = useState<string>(initialValues?.image || '') // Estado de la imagen del producto (si existe)
  const imagePath = getImagePath(imageUrl) // Ruta de la imagen en Cloudinary (si existe)

  useEffect(() => {
    getCategories().then(data => {
      setCategories(data)
    })
  }, [])


  // Callback para actualizar el estado de la imagen y el valor del formulario
  const handleImageUpload = (url: string) => {
    setImageUrl(url)
    setValue('image', url) // Actualiza el valor del campo 'image' en el formulario
  }


  const renderSelectOptions = (fieldId: string) => {
    switch (fieldId) {
      case 'category':
        return (
          <select
            id={fieldId}
            className={`w-full p-2 border font-light rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors[fieldId as keyof ProductsFormData]
              ? 'border-red-500'
              : 'border-gray-300'
              }`}
            {...register(fieldId as keyof ProductsFormData, {
              required: true ? 'Categoría es requerida' : false
            })}
            value={
              typeof selection.categories === 'string'
                ? selection.categories
                : selection.categories._id
            }
            onChange={e => {
              setSelection({
                ...selection,
                categories: e.target.value
              })
            }}
          >
            <option value=''> ---Selecciona una opción---</option>
            {Array.isArray(categories) ? (
              categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value=''>Cargando categorías...</option>
            )}
          </select>
        )
      case 'type':
        return (
          <select
            id={fieldId}
            className={`w-full p-2 border font-light rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors[fieldId as keyof ProductsFormData]
              ? 'border-red-500'
              : 'border-gray-300'
              }`}
            {...register(fieldId as keyof ProductsFormData, {
              required: true ? 'Tipo de Producto es requerido' : false
            })}
          >
            <option value=''> ---Selecciona una opción---</option>
            {typeProductData.map(type => (
              <option key={type.id} value={type.name}>
                {typeProductTranslate[type.name]}
              </option>
            ))}
          </select>
        )
    }
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {ProductFormField.filter(
            (field: IFormField) =>
              field.id !== 'status'
          ).map((field: IFormField) => (
            <div key={field.id} className='mb-4'>
              <label
                htmlFor={field.id}
                className=' py-2 block text-sm font-medium text-gray-700'
              >
                {field.label}
              </label>

              {field.type === 'text' ? (
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={`w-full p-2 border font-light rounded-md placeholder-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors[field.id as keyof ProductsFormData]
                    ? 'border-red-500'
                    : 'border-gray-300'
                    }`}
                  maxLength={50}
                  {...register(field.id as keyof ProductsFormData, {
                    required: field.id ? `${field.label} es requerido` : false,
                    minLength: {
                      value: field.maxLength as number,
                      message: `Mínimo ${field.maxLength} caracteres`
                    },
                    validate: value =>
                      (typeof value === 'string' && value.length >= 3) ||
                      'El valor debe tener al menos 3 caracteres'
                  })}
                />
              ) : field.id === 'description' ? (
                <textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  className={`w-full p-2 border font-light rounded-md placeholder-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors[field.id as keyof ProductsFormData]
                    ? 'border-red-500'
                    : 'border-gray-300'
                    }`}
                  {...register(field.id as keyof ProductsFormData, {
                    required: field.required ? `${field.label} es requerido` : false
                  })}
                />
              ) : field.type === 'number' ? (
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={`w-full p-2 border font-light rounded-md placeholder-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors[field.id as keyof ProductsFormData]
                    ? 'border-red-500'
                    : 'border-gray-300'
                    }`}
                  {...register(field.id as keyof ProductsFormData, {
                    required: field.required
                      ? `${field.label} es requerido`
                      : false,
                    valueAsNumber: true,
                    // Validar si es positivo
                    validate: value =>
                      typeof value === 'number' && value > 0
                        ? true
                        : 'El valor debe ser mayor a 0'
                  })}
                />
              ) : field.type === 'hidden' ? (
                <input
                  id={field.id}
                  type={field.type}
                  value={imageUrl}
                  {...register(field.id as keyof ProductsFormData)}
                />
              ) : (
                field.type === 'select' && renderSelectOptions(field.id)
              )}

              {errors[field.id as keyof ProductsFormData] && (
                <ErrorMessage>
                  {errors[field.id as keyof ProductsFormData]?.message}
                </ErrorMessage>
              )}
            </div>
          ))}
        </div>
        {/* <!-- Sección de Card e Imagen del Producto --> */}
        <ProductCard infoData={initialValues} >
          <ImageUpload
            label='Imagen del Producto'
            valueImageURL={imagePath}
            name='image'
            alt='Imagen del Producto'
            onUpload={handleImageUpload}
          />
        </ProductCard>
      </div>
    </>
  )
}
