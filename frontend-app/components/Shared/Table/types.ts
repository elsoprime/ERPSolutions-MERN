/**
 * Table Components - Shared Types
 * @description Tipos TypeScript compartidos para componentes de tabla
 * @author Esteban Soto Ojeda @elsoprimeDev
 * @version 1.0.0
 * @created 10/11/2025
 */

import { ComponentType } from "react";

/**
 * =============================================================================
 * ACTIONS & BUTTONS
 * =============================================================================
 */

/**
 * Variantes de estilo para acciones/botones
 */
export type ActionVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

/**
 * Configuración de una acción de tabla
 */
export interface TableAction {
  /** Etiqueta del botón */
  label: string;
  /** Icono del botón (componente Heroicons) */
  icon?: ComponentType<{ className?: string }>;
  /** Callback al hacer click */
  onClick: () => void;
  /** Variante de estilo */
  variant?: ActionVariant;
  /** Solo mostrar cuando hay elementos seleccionados */
  showOnSelection?: boolean;
  /** Ocultar condicionalmente */
  hidden?: boolean;
  /** Deshabilitar botón */
  disabled?: boolean;
  /** Tooltip/title del botón */
  title?: string;
  /** Mostrar contador de seleccionados en el label */
  showCount?: boolean;
}

/**
 * =============================================================================
 * FILTERS
 * =============================================================================
 */

/**
 * Tipos de filtro soportados
 */
export type FilterType =
  | "select"
  | "text"
  | "date"
  | "checkbox"
  | "multiselect";

/**
 * Opción para filtros de tipo select
 */
export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Configuración de un filtro
 */
export interface TableFilter {
  /** Identificador único del filtro */
  key: string;
  /** Etiqueta del filtro */
  label: string;
  /** Tipo de filtro */
  type: FilterType;
  /** Valor actual del filtro */
  value: string | string[];
  /** Callback al cambiar el valor */
  onChange: (value: string) => void;
  /** Opciones para filtros de tipo select */
  options?: FilterOption[];
  /** Placeholder para inputs */
  placeholder?: string;
  /** Ocultar condicionalmente */
  hidden?: boolean;
  /** Deshabilitar filtro */
  disabled?: boolean;
  /** Ancho personalizado (1-12 para grid cols) */
  colSpan?: 1 | 2 | 3 | 4;
}

/**
 * =============================================================================
 * BANNERS
 * =============================================================================
 */

/**
 * Tipos de banner informativo
 */
export type BannerType = "info" | "warning" | "error" | "success";

/**
 * Configuración de banner informativo
 */
export interface BannerConfig {
  /** Tipo de banner (define colores) */
  type: BannerType;
  /** Título del banner */
  title: string;
  /** Mensaje del banner */
  message: string;
  /** Icono personalizado */
  icon?: ComponentType<{ className?: string }>;
  /** Permitir cerrar el banner */
  dismissible?: boolean;
  /** Callback al cerrar */
  onDismiss?: () => void;
}

/**
 * =============================================================================
 * PAGINATION
 * =============================================================================
 */

/**
 * Opciones de tamaño de página
 */
export type PageSizeOption = 5 | 10 | 15 | 20 | 25 | 50 | 100;

/**
 * =============================================================================
 * MAIN COMPONENT PROPS
 * =============================================================================
 */

/**
 * Props para TableControlsHeader
 */
export interface TableControlsHeaderProps {
  // ========== HEADER ==========
  /** Título principal */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Total de registros */
  totalCount: number;
  /** Tamaño de página actual */
  pageSize: number;
  /** Cantidad de elementos seleccionados */
  selectedCount?: number;
  /** Estado de carga */
  loading?: boolean;

  // ========== PAGINACIÓN ==========
  /** Callback al cambiar tamaño de página */
  onPageSizeChange: (size: number) => void;
  /** Opciones de tamaño de página disponibles */
  pageSizeOptions?: PageSizeOption[];

  // ========== BÚSQUEDA ==========
  /** Placeholder para búsqueda */
  searchPlaceholder?: string;
  /** Valor actual de búsqueda */
  searchValue: string;
  /** Callback al cambiar búsqueda */
  onSearchChange: (value: string) => void;
  /** Ocultar barra de búsqueda */
  hideSearch?: boolean;

  // ========== FILTROS ==========
  /** Estado del panel de filtros (abierto/cerrado) */
  showFilters?: boolean;
  /** Callback al toggle de filtros */
  onToggleFilters?: () => void;
  /** Configuración de filtros */
  filters?: TableFilter[];
  /** Callback para limpiar todos los filtros */
  onClearFilters?: () => void;
  /** Número de columnas del grid de filtros */
  filterGridCols?: 2 | 3 | 4;

  // ========== ACCIONES ==========
  /** Acción principal (ej: Crear/Nuevo) */
  primaryAction?: TableAction;
  /** Acciones masivas (aparecen con selección) */
  bulkActions?: TableAction[];
  /** Acciones secundarias (ej: Exportar) */
  secondaryActions?: TableAction[];

  // ========== BANNERS ==========
  /** Banner informativo */
  banner?: BannerConfig;

  // ========== CUSTOMIZACIÓN ==========
  /** Clases CSS adicionales */
  className?: string;
  /** Modo compacto (menos padding) */
  compact?: boolean;
  /** Ocultar contador de elementos */
  hideCount?: boolean;
  /** Ocultar selector de tamaño de página */
  hidePageSize?: boolean;
}
