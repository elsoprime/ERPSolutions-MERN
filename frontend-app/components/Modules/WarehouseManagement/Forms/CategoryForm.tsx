/**
 * Category Form Component
 * @description: Formulario de categorías con configuración basada en datos y buenas prácticas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { CategoryFormData } from "@/schemas/categorySchema"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { categoryFormFields, categoryFormStyles, categoryValidationMessages } from "@/data/CategoryForm"
import { IFormField } from "@/interfaces/IComponents"
import { ExclamationCircleIcon } from "@heroicons/react/20/solid"

type CategoryFormMode = 'create' | 'edit';

type PropsCategoryForm = {
    register: UseFormRegister<CategoryFormData>;
    errors: FieldErrors<CategoryFormData>;
    initialValues?: CategoryFormData;
    isLoading?: boolean;
    mode?: CategoryFormMode;
    onCancel?: () => void;
};

export default function CategoryForm({
    register,
    errors,
    initialValues,
    isLoading = false,
    mode = 'create',
    onCancel
}: PropsCategoryForm) {

    /**
     * Renderiza un campo de entrada de texto
     */
    const renderTextField = (field: IFormField) => {
        const fieldKey = field.id as keyof CategoryFormData
        const hasError = !!errors[fieldKey]

        return (
            <input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                disabled={isLoading}
                defaultValue={initialValues?.[fieldKey] || ''}
                className={`
                    ${categoryFormStyles.input.base}
                    ${hasError ? categoryFormStyles.input.error : categoryFormStyles.input.normal}
                    ${isLoading ? categoryFormStyles.input.disabled : ''}
                `}
                {...register(fieldKey, {
                    required: field.required ? categoryValidationMessages.name.required : false,
                    minLength: field.required ? {
                        value: 2,
                        message: categoryValidationMessages.name.minLength
                    } : undefined,
                    maxLength: {
                        value: field.maxLength || 50,
                        message: categoryValidationMessages.name.maxLength
                    }
                })}
            />
        )
    }

    /**
     * Renderiza un campo de área de texto
     */
    const renderTextAreaField = (field: IFormField) => {
        const fieldKey = field.id as keyof CategoryFormData
        const hasError = !!errors[fieldKey]

        return (
            <textarea
                id={field.id}
                placeholder={field.placeholder}
                disabled={isLoading}
                defaultValue={initialValues?.[fieldKey] || ''}
                rows={4}
                className={`
                    ${categoryFormStyles.textarea.base}
                    ${hasError ? categoryFormStyles.textarea.error : categoryFormStyles.textarea.normal}
                    ${isLoading ? categoryFormStyles.input.disabled : ''}
                `}
                {...register(fieldKey, {
                    required: field.required ? 'Este campo es obligatorio' : false,
                    maxLength: {
                        value: field.maxLength || 200,
                        message: categoryValidationMessages.description.maxLength
                    }
                })}
            />
        )
    }

    /**
     * Renderiza el mensaje de error para un campo
     */
    const renderFieldError = (fieldKey: keyof CategoryFormData) => {
        const error = errors[fieldKey]

        if (!error) return null

        return (
            <div className={categoryFormStyles.error}>
                <ExclamationCircleIcon className="w-4 h-4" />
                <span>{error.message}</span>
            </div>
        )
    }

    /**
     * Renderiza un campo completo con label, input y error
     */
    const renderField = (field: IFormField) => {
        const fieldKey = field.id as keyof CategoryFormData

        return (
            <div key={field.id} className={categoryFormStyles.fieldWrapper}>
                <label
                    htmlFor={field.id}
                    className={categoryFormStyles.label}
                >
                    {field.label}
                    {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </label>

                {field.type === 'textarea' ? (
                    renderTextAreaField(field)
                ) : (
                    renderTextField(field)
                )}

                {renderFieldError(fieldKey)}
            </div>
        )
    }

    return (
        <div className={categoryFormStyles.container}>
            {/* Campos del formulario */}
            {categoryFormFields.map(renderField)}

            {/* Botones de acción */}
            <div className="flex flex-col gap-3 justify-end mt-6">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-medium transition-colors duration-150 order-2"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                        px-5 py-2 rounded-md text-white font-medium transition-colors duration-150 order-1
                        ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }
                    `}
                >
                    {isLoading
                        ? (mode === 'edit' ? 'Actualizando...' : 'Creando...')
                        : (mode === 'edit' ? '💾 Actualizar Categoría' : '✨ Crear Categoría')
                    }
                </button>
            </div>

            {/* Información adicional solo en modo creación */}
            {mode === 'create' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        💡 Consejos para crear categorías
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1.5">
                        <li>• Usa nombres descriptivos y únicos</li>
                        <li>• La descripción ayuda a otros usuarios a entender el propósito</li>
                        <li>• Evita crear categorías muy específicas o muy generales</li>
                    </ul>
                </div>
            )}

            {/* Información adicional en modo edición */}
            {mode === 'edit' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                    <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                        ⚠️ Ten en cuenta
                    </h3>
                    <p className="text-sm text-amber-700">
                        Los cambios en esta categoría afectarán a todos los productos asociados.
                    </p>
                </div>
            )}
        </div>
    );
}