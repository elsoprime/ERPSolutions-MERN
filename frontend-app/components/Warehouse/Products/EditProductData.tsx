/**
 * Autor: Esteban Soto @elsoprimeDev
 */
"use client";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/api/ProductApi";
import { LoagingSpinner } from "@/components/Shared/LoadingSpinner";
import { Product } from "@/schemas/productsSchema";
import EditProduct from "./EditProduct";
import { useParams, useRouter } from "next/navigation";
import Page404 from "@/components/Shared/404";

type EditProductDataProps = {
  data: Product;
  productId: Product["_id"];
  page?: number;
};

export default function EditProductData({ productId }: EditProductDataProps) {
  const params = useParams();
  const router = useRouter();


  productId = params.productId as string;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", productId], //Este QueryKey es para identificar el query en el cache de React Query y poder invalidarlo si es necesario (por ejemplo, cuando se edita un producto)
    queryFn: () => getProductById(productId),
    enabled: !!productId,
    retry: false,
  });
  //console.log('Datos desde EditProductData:', data)

  if (isLoading) return <LoagingSpinner />;
  // redirect to 404 page if product not found
  if (isError) return <Page404 description="Producto no encontrado" />;
  if (data) return <EditProduct data={data} productId={productId} />;
}