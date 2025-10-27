import { Product, ProductsFormData } from '@/schemas/productsSchema'
import React from 'react'

type ProductCardProps = {
    infoData?: Product | ProductsFormData
    children: React.ReactNode
}

export default function ProductCard({ infoData, children }: ProductCardProps) {
    return (
        <div className="bg-white flex flex-col p-4 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative group">
                {/* Componente de carga de imágenes */}
                <div className="flex justify-center items-center">
                    <div className="absolute top-0 right-12 ">
                        <div className="">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}