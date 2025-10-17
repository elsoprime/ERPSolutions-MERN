import React from "react";
import { DataListProps } from "../../interfaces/DataList";
import Pagination from "./Pagination";

export function DataList<T>({ data, columns, loading, onRowClick, pagination }: DataListProps<T>) {
    if (loading) return (
        <div className="flex justify-center items-center py-8">
            <span className="text-purple-500 font-semibold animate-pulse">Cargando...</span>
        </div>
    );
    if (!data.length) return (
        <div className="flex justify-center items-center py-8">
            <span className="text-gray-400">No hay datos para mostrar.</span>
        </div>
    );
    return (
        <div className="overflow-hidden rounded-lg shadow border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                    <tr>
                        {columns.map(col => (
                            <th
                                key={String(col.key)}
                                className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider border-b border-gray-100"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                    {data.map((item, idx) => (
                        <tr
                            key={idx}
                            onClick={() => onRowClick?.(item)}
                            className="transition-colors duration-150 hover:bg-purple-50 cursor-pointer group"
                        >
                            {columns.map(col => (
                                <td
                                    key={String(col.key)}
                                    className="px-6 py-2 text-xs font-normal text-gray-700 group-hover:text-purple-700 hover:font-semibold transition-colors duration-150 border-b border-gray-100"
                                >
                                    {col.render ? col.render(item) : String(item[col.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {pagination && (
                <Pagination
                    total={pagination.total}
                    limit={pagination.limit}
                    page={pagination.page}
                    totalPages={Math.ceil(pagination.total / pagination.limit)}
                    setPage={pagination.setPage}
                />
            )}
        </div>
    );
}
