/**
 * Advanced Create Company Form Types
 * @description: Interfaces TypeScript avanzadas para el formulario de creación de empresas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0 - Refactorizado con sistema tipado avanzado
 */

import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";
import { FormValues } from "@/deprecated/interfaces/FormTypes";
import { EnhancedCompanyFormSchema } from "@/data/EnhancedCompanies";
import { CreateCompanyFormData } from "@/schemas/EnhancedCompanySchemas";
import {
  BuildingOfficeIcon,
  CogIcon,
  UserGroupIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

/**
 * Tipo inferido del schema avanzado para el formulario
 */
export type AdvancedCompanyFormValues = FormValues<
  typeof EnhancedCompanyFormSchema
>;

/**
 * Mapeo entre el schema Zod y el schema avanzado
 */
export type CompanyFormData = CreateCompanyFormData & {
  slug?: string; // Campo adicional para el slug generado
};

/**
 * Estados posibles del formulario multi-paso
 */
export type FormStep = 1 | 2 | 3 | 4;

/**
 * Estado de validación de un paso específico
 */
export interface StepValidationState {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
}

/**
 * Configuración de un paso del formulario
 */
export interface StepConfig {
  number: FormStep;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: (keyof CompanyFormData)[];
  isOptional?: boolean;
}

/**
 * Props del hook personalizado para el formulario
 */
export interface UseAdvancedCompanyFormProps {
  onSuccess: (company: any) => void;
  onError?: (error: Error) => void;
  initialValues?: Partial<CompanyFormData>;
}

/**
 * Resultado del hook personalizado
 */
export interface UseAdvancedCompanyFormResult {
  // Form state
  register: UseFormRegister<CompanyFormData>;
  errors: FieldErrors<CompanyFormData>;
  watch: UseFormWatch<CompanyFormData>;
  setValue: UseFormSetValue<CompanyFormData>;
  trigger: UseFormTrigger<CompanyFormData>;

  // Form submission
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;

  // Step management
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  nextStep: (e?: React.MouseEvent) => Promise<void>;
  prevStep: () => void;

  // Validation
  isCurrentStepValid: boolean;
  validateStep: (step: FormStep) => Promise<StepValidationState>;
  validationInProgress: boolean;

  // Slug management
  slugPreview: string;
  isSlugManuallyEdited: boolean;
  generateSlugFromName: (name: string) => string;

  // Form reset
  resetForm: () => void;
}

/**
 * Props del componente principal
 */
export interface CreateCompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (company: any) => void;
  initialValues?: Partial<CompanyFormData>;
}

/**
 * Props para componentes de campo reutilizables
 */
export interface FormFieldProps<T extends keyof CompanyFormData> {
  name: T;
  label: string;
  register: UseFormRegister<CompanyFormData>;
  errors: FieldErrors<CompanyFormData>;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

/**
 * Props específicas para campos de texto
 */
export interface TextFieldProps extends FormFieldProps<any> {
  type?: "text" | "email" | "url" | "tel";
  maxLength?: number;
  minLength?: number;
}

/**
 * Props específicas para campos select
 */
export interface SelectFieldProps extends FormFieldProps<any> {
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  defaultOption?: string;
}

/**
 * Props específicas para campos checkbox
 */
export interface CheckboxFieldProps extends FormFieldProps<any> {
  description?: string;
}

/**
 * Props específicas para campos de color
 */
export interface ColorFieldProps extends FormFieldProps<any> {
  showPreview?: boolean;
}

/**
 * Props del componente de indicador de pasos
 */
export interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: FormStep;
  isCurrentStepValid: boolean;
  completedSteps: FormStep[];
}

/**
 * Props del componente de navegación entre pasos
 */
export interface StepNavigationProps {
  currentStep: FormStep;
  totalSteps: number;
  isCurrentStepValid: boolean;
  validationInProgress: boolean;
  isSubmitting: boolean;
  onPrevStep: () => void;
  onNextStep: (e?: React.MouseEvent) => Promise<void>;
  onSubmit: (e?: React.FormEvent) => Promise<void>;
}

/**
 * Props del componente de resumen del formulario
 */
export interface FormSummaryProps {
  formData: CompanyFormData;
  watch: UseFormWatch<CompanyFormData>;
}

/**
 * Estado del diálogo de confirmación/error
 */
export interface DialogState {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * Configuración de los pasos del formulario
 */
export const FORM_STEPS: StepConfig[] = [
  {
    number: 1,
    title: "Información Básica",
    description: "Datos principales de la empresa",
    icon: BuildingOfficeIcon,
    fields: ["name", "email", "phone", "website", "description", "address"],
  },
  {
    number: 2,
    title: "Configuración de Negocio",
    description: "Configuraciones específicas del negocio",
    icon: CogIcon,
    fields: ["settings"],
  },
  {
    number: 3,
    title: "Plan y Características",
    description: "Configuración del plan y módulos",
    icon: UserGroupIcon,
    fields: ["subscription", "features"],
  },
  {
    number: 4,
    title: "Personalización",
    description: "Colores y marca de la empresa",
    icon: PaintBrushIcon,
    fields: ["branding"],
  },
] as const;

/**
 * Utilidades de validación para campos específicos
 */
export const FieldValidationUtils = {
  /**
   * Valida formato de email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida formato de URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Valida formato de color hexadecimal
   */
  isValidHexColor: (color: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  },

  /**
   * Valida formato de RUT chileno básico
   */
  isValidChileanRUT: (rut: string): boolean => {
    const rutRegex = /^[\d\.\-kK]+$/;
    return rutRegex.test(rut) && rut.length >= 8;
  },

  /**
   * Genera slug válido desde un string
   */
  generateSlug: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .substring(0, 50);
  },
};

export default {
  FORM_STEPS,
  FieldValidationUtils,
};
