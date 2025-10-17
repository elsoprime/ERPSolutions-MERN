/**
 * @description Interfaces para el componente DataList
 * Autor: Esteban Soto @elsoprimeDev
 * Fecha: 2024-10-01
 * Versión: 1.0.0
 */


export interface DataListColumn<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode; // Para celdas personalizadas
}

export interface DataListPagination {
  page: number;
  total: number;
  limit: number;
  setPage: (page: number) => void;
}

export interface DataListProps<T> {
  data: T[];
  columns: DataListColumn<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  pagination?: DataListPagination;
}