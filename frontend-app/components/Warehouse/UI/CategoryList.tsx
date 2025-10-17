
import React, { useState } from "react";
import { DataList } from "@/components/Shared/DataList";
import { getAllCategories } from "@/api/CategoryApi";
import { Category } from "@/interfaces/Category";
import { DataListColumn } from "@/interfaces/DataList";
import { useQuery } from "@tanstack/react-query";

type CategoryListProps = {
    onEdit: (category: Category) => void;
    onDelete?: (category: Category) => void;
    onView?: (category: Category) => void;
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLastPageCount: (count: number) => void;
};

export default function CategoryList({ onEdit, onDelete, onView, page, setPage, limit }: CategoryListProps) {

    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["categories", page, limit],
        queryFn: () => getAllCategories(page, limit),
    });

    const columns: DataListColumn<Category>[] = [
        { key: "name", label: "Nombre de la Categoría" },
        { key: "description", label: "Descripción" },
        {
            key: "_id",
            label: "Acciones",
            render: (item) => (
                <div className="flex gap-2 justify-center">
                    <button
                        className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors duration-150 border border-purple-200"
                        title="Ver"
                        onClick={() => onView && onView(item)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Ver
                    </button>
                    <button
                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors duration-150 border border-blue-200"
                        title="Editar"
                        onClick={() => {
                            console.log('ID de categoría:', item._id);
                            onEdit && onEdit(item);
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" /></svg>
                        Editar
                    </button>
                    <button
                        className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors duration-150 border border-red-200"
                        title="Eliminar"
                        onClick={() => onDelete && onDelete(item)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full min-h-[500px] bg-gray-50 lg:rounded-md p-6">
            <h2 className="text-2xl font-bold text-purple-500 mb-4">Lista de Categorías</h2>
            <div className="flex-1 flex flex-col overflow-hidden">
                {isError && <div className="text-red-500 mb-2">{(error as Error)?.message || 'Error al cargar categorías'}</div>}
                <div className="flex-1 overflow-auto">
                    <DataList<Category>
                        data={data?.categories || []}
                        columns={columns}
                        loading={isLoading}
                        pagination={{
                            page,
                            total: data?.total || 0,
                            limit,
                            setPage,
                        }}
                    />
                    {/** Leyenda de Registros */}
                    <div className="mt-4 text-xs text-gray-500 flex justify-end">
                        <p> Mostrando {data?.categories.length || 0} de <span className=" font-bold">{data?.total || 0}  categorías.</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
